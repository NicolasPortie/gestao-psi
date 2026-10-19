using GestaoPsi.Api.Data;
using GestaoPsi.Api.DTOs.Usuarios;
using GestaoPsi.Api.Models;
using GestaoPsi.Api.Services.Seguranca;
using GestaoPsi.Api.Services.Autenticacao;
using GestaoPsi.Api.Shared.Enums;
using GestaoPsi.Api.Shared.Excecoes;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace GestaoPsi.Api.Services.Usuarios;

public sealed class UsuariosService(
    AppDbContext dbContext,
    IAutorizacaoContaService autorizacao,
    IAuditoriaService auditoria,
    IPasswordHasher<Usuario> passwordHasher,
    IEstadoAutenticacao estadoAutenticacao) : IUsuariosService
{
    public async Task<IReadOnlyCollection<UsuarioResponse>> ListarAsync(Guid usuarioId, Guid contaId, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var usuarios = await dbContext.Usuarios.AsNoTracking()
            .Include(x => x.PerfilAcesso)
            .Where(x => x.ContaPsicologoId == contaId)
            .ToArrayAsync(ct);
        // Nome cifrado: a ordem alfabética só existe depois de decifrar.
        return usuarios.OrderBy(x => x.NomeCompleto, StringComparer.Create(new System.Globalization.CultureInfo("pt-BR"), ignoreCase: true)).Select(Mapear).ToArray();
    }

    public async Task<UsuarioResponse> CriarAsync(Guid usuarioId, Guid contaId, CriarUsuarioRequest request, string? ip, string? userAgent, CancellationToken ct)
    {
        var ator = await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var perfilAcesso = await ValidarPerfilAsync(ator, contaId, request.Perfil, request.PerfilAcessoId, ct);
        var email = request.Email.Trim().ToLowerInvariant();
        var emailHash = Data.Cifra.CifraDeColuna.HashEmail(email);
        if (await dbContext.Usuarios.AnyAsync(x => x.EmailHash == emailHash, ct))
            throw new RegraNegocioException("Já existe um usuário com este e-mail.");

        var novo = new Usuario
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = contaId,
            NomeCompleto = request.NomeCompleto.Trim(),
            Email = email,
            Telefone = string.IsNullOrWhiteSpace(request.Telefone) ? null : request.Telefone.Trim(),
            Perfil = request.Perfil,
            PerfilAcessoId = perfilAcesso?.Id,
            PerfilAcesso = perfilAcesso,
            Status = StatusUsuario.Ativo
        };
        novo.SenhaHash = passwordHasher.HashPassword(novo, request.Senha);
        dbContext.Usuarios.Add(novo);
        auditoria.Registrar(contaId, usuarioId, "UsuarioCriado", nameof(Usuario), novo.Id,
            $"{novo.NomeCompleto} entrou na equipe como {DescreverPerfil(novo)}.", null,
            new { novo.Email, novo.Perfil, PerfilAcesso = perfilAcesso?.Nome }, ip, userAgent);
        await dbContext.SaveChangesAsync(ct);
        return Mapear(novo);
    }

    public async Task<UsuarioResponse> AtualizarAsync(Guid usuarioId, Guid contaId, Guid id, AtualizarUsuarioRequest request, string? ip, string? userAgent, CancellationToken ct)
    {
        var ator = await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var alvo = await ObterAlvoAsync(ator, contaId, id, ct);
        var antes = new { alvo.NomeCompleto, alvo.Telefone };
        alvo.NomeCompleto = request.NomeCompleto.Trim();
        alvo.Telefone = string.IsNullOrWhiteSpace(request.Telefone) ? null : request.Telefone.Trim();
        alvo.AtualizadoEm = DateTimeOffset.UtcNow;
        auditoria.Registrar(contaId, usuarioId, "UsuarioAtualizado", nameof(Usuario), alvo.Id,
            $"Dados de {alvo.NomeCompleto} alterados.", antes, new { alvo.NomeCompleto, alvo.Telefone }, ip, userAgent);
        await dbContext.SaveChangesAsync(ct);
        return Mapear(alvo);
    }

    public async Task<UsuarioResponse> AlterarPerfilAsync(Guid usuarioId, Guid contaId, Guid id, AlterarPerfilUsuarioRequest request, string? ip, string? userAgent, CancellationToken ct)
    {
        var ator = await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        if (id == usuarioId)
            throw new RegraNegocioException("Você não pode alterar o seu próprio perfil.");
        var alvo = await ObterAlvoAsync(ator, contaId, id, ct);
        if (alvo.Perfil == PerfilUsuario.Psicologo)
            throw new RegraNegocioException("O perfil do psicólogo responsável pela conta não pode ser alterado.");

        var perfilAcesso = await ValidarPerfilAsync(ator, contaId, request.Perfil, request.PerfilAcessoId, ct);
        var antes = new { alvo.Perfil, PerfilAcesso = alvo.PerfilAcesso?.Nome };
        alvo.Perfil = request.Perfil;
        alvo.PerfilAcessoId = perfilAcesso?.Id;
        alvo.PerfilAcesso = perfilAcesso;
        alvo.AtualizadoEm = DateTimeOffset.UtcNow;

        // O papel vai dentro do token: quem trocou de perfil precisa entrar de novo para receber o novo.
        alvo.VersaoAutenticacao++;
        await estadoAutenticacao.RevogarRefreshTokensUsuarioAsync(alvo.Id, ct);

        auditoria.Registrar(contaId, usuarioId, "UsuarioPerfilAlterado", nameof(Usuario), alvo.Id,
            $"{alvo.NomeCompleto} passou a ser {DescreverPerfil(alvo)}.", antes,
            new { alvo.Perfil, PerfilAcesso = perfilAcesso?.Nome }, ip, userAgent);
        await dbContext.SaveChangesAsync(ct);
        return Mapear(alvo);
    }

    public async Task RedefinirSenhaAsync(Guid usuarioId, Guid contaId, Guid id, RedefinirSenhaUsuarioRequest request, string? ip, string? userAgent, CancellationToken ct)
    {
        var ator = await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var alvo = await ObterAlvoAsync(ator, contaId, id, ct);
        alvo.SenhaHash = passwordHasher.HashPassword(alvo, request.NovaSenha);
        alvo.VersaoAutenticacao++;
        await estadoAutenticacao.RevogarRefreshTokensUsuarioAsync(alvo.Id, ct);
        alvo.AtualizadoEm = DateTimeOffset.UtcNow;
        auditoria.Registrar(contaId, usuarioId, "SenhaUsuarioRedefinida", nameof(Usuario), alvo.Id,
            $"Senha de {alvo.NomeCompleto} redefinida por quem gerencia a equipe.", null, null, ip, userAgent);
        await dbContext.SaveChangesAsync(ct);
    }

    public async Task<UsuarioResponse> AlterarStatusAsync(Guid usuarioId, Guid contaId, Guid id, AlterarStatusUsuarioRequest request, string? ip, string? userAgent, CancellationToken ct)
    {
        var ator = await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        if (id == usuarioId)
            throw new RegraNegocioException("Você não pode alterar o próprio status.");
        var alvo = await ObterAlvoAsync(ator, contaId, id, ct);
        if (request.Status == StatusUsuario.Pendente)
            throw new RegraNegocioException("Transição de status inválida.");

        var anterior = alvo.Status;
        alvo.Status = request.Status;
        if (anterior != request.Status)
        {
            alvo.VersaoAutenticacao++;
            await estadoAutenticacao.RevogarRefreshTokensUsuarioAsync(alvo.Id, ct);
        }
        alvo.AtualizadoEm = DateTimeOffset.UtcNow;
        auditoria.Registrar(contaId, usuarioId, "StatusUsuarioAlterado", nameof(Usuario), alvo.Id,
            $"Acesso de {alvo.NomeCompleto} alterado.", new { Status = anterior }, new { Status = alvo.Status }, ip, userAgent);
        await dbContext.SaveChangesAsync(ct);
        return Mapear(alvo);
    }

    /// <summary>Carrega a pessoa da mesma conta e confirma que quem pede pode gerenciá-la.</summary>
    private async Task<Usuario> ObterAlvoAsync(Usuario ator, Guid contaId, Guid id, CancellationToken ct)
    {
        var alvo = await dbContext.Usuarios
            .Include(x => x.PerfilAcesso)
            .SingleOrDefaultAsync(x => x.Id == id && x.ContaPsicologoId == contaId, ct)
            ?? throw new RegraNegocioException("Usuário não encontrado.", StatusCodes.Status404NotFound);
        if (!PermissoesEfetivas.PodeGerenciar(ator, alvo))
            throw new RegraNegocioException("Você não pode gerenciar uma pessoa que tem mais acessos do que você.", StatusCodes.Status403Forbidden);
        return alvo;
    }

    /// <summary>
    /// Perfil que pode ser dado pela tela de equipe. O de psicólogo nunca é dado aqui, e ninguém
    /// dá a outra pessoa mais acessos do que tem.
    /// </summary>
    private async Task<PerfilAcesso?> ValidarPerfilAsync(Usuario ator, Guid contaId, PerfilUsuario perfil, Guid? perfilAcessoId, CancellationToken ct)
    {
        if (perfil is not (PerfilUsuario.Recepcionista or PerfilUsuario.Administrador or PerfilUsuario.Personalizado))
            throw new RegraNegocioException("Escolha Recepcionista, Administrador ou um perfil criado pela conta.");

        PerfilAcesso? perfilAcesso = null;
        if (perfil == PerfilUsuario.Personalizado)
        {
            if (perfilAcessoId is null)
                throw new RegraNegocioException("Escolha o perfil de acesso desta pessoa.");
            perfilAcesso = await dbContext.PerfisAcesso.SingleOrDefaultAsync(x => x.Id == perfilAcessoId && x.ContaPsicologoId == contaId, ct)
                ?? throw new RegraNegocioException("Perfil não encontrado.", StatusCodes.Status404NotFound);
        }
        else if (perfilAcessoId is not null)
        {
            throw new RegraNegocioException("Este perfil não usa um perfil de acesso criado pela conta.");
        }

        var candidato = new Usuario { Perfil = perfil, PerfilAcesso = perfilAcesso };
        if (!PermissoesEfetivas.Para(candidato).IsSubsetOf(PermissoesEfetivas.Para(ator)))
            throw new RegraNegocioException("Você não pode dar a alguém mais acessos do que você tem.", StatusCodes.Status403Forbidden);
        return perfilAcesso;
    }

    private static string DescreverPerfil(Usuario usuario) => usuario.Perfil switch
    {
        PerfilUsuario.Personalizado => usuario.PerfilAcesso?.Nome ?? "perfil personalizado",
        PerfilUsuario.Recepcionista => "recepcionista",
        PerfilUsuario.Administrador => "administrador",
        PerfilUsuario.Psicologo => "psicólogo",
        _ => usuario.Perfil.ToString()
    };

    private static UsuarioResponse Mapear(Usuario usuario) => new(
        usuario.Id,
        usuario.NomeCompleto,
        usuario.Email,
        usuario.Telefone,
        usuario.Perfil,
        usuario.Status,
        usuario.UltimoAcessoEm,
        usuario.PerfilAcessoId,
        usuario.PerfilAcesso?.Nome);
}
