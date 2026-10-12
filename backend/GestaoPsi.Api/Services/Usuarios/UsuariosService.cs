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
        return await dbContext.Usuarios.AsNoTracking()
            .Where(x => x.ContaPsicologoId == contaId)
            .OrderBy(x => x.NomeCompleto)
            .Select(x => new UsuarioResponse(x.Id, x.NomeCompleto, x.Email, x.Telefone, x.Perfil, x.Status, x.UltimoAcessoEm))
            .ToArrayAsync(ct);
    }

    public async Task<UsuarioResponse> CriarAsync(Guid usuarioId, Guid contaId, CriarUsuarioRequest request, string? ip, string? userAgent, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        if (request.Perfil is not (PerfilUsuario.Recepcionista or PerfilUsuario.Administrador))
            throw new RegraNegocioException("Somente perfis Recepcionista ou Administrador podem ser criados por aqui.");
        var email = request.Email.Trim().ToLowerInvariant();
        if (await dbContext.Usuarios.AnyAsync(x => x.Email == email, ct))
            throw new RegraNegocioException("Já existe um usuário com este e-mail.");

        var novo = new Usuario
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = contaId,
            NomeCompleto = request.NomeCompleto.Trim(),
            Email = email,
            Telefone = string.IsNullOrWhiteSpace(request.Telefone) ? null : request.Telefone.Trim(),
            Perfil = request.Perfil,
            Status = StatusUsuario.Ativo
        };
        novo.SenhaHash = passwordHasher.HashPassword(novo, request.Senha);
        dbContext.Usuarios.Add(novo);
        auditoria.Registrar(contaId, usuarioId, "UsuarioCriado", nameof(Usuario), novo.Id,
            "Usuário da conta criado.", null, new { novo.Email, novo.Perfil }, ip, userAgent);
        await dbContext.SaveChangesAsync(ct);
        return new UsuarioResponse(novo.Id, novo.NomeCompleto, novo.Email, novo.Telefone, novo.Perfil, novo.Status, novo.UltimoAcessoEm);
    }

    public async Task<UsuarioResponse> AtualizarAsync(Guid usuarioId, Guid contaId, Guid id, AtualizarUsuarioRequest request, string? ip, string? userAgent, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var alvo = await dbContext.Usuarios
            .SingleOrDefaultAsync(x => x.Id == id && x.ContaPsicologoId == contaId, ct)
            ?? throw new RegraNegocioException("Usuário não encontrado.", StatusCodes.Status404NotFound);
        var antes = new { alvo.NomeCompleto, alvo.Telefone };
        alvo.NomeCompleto = request.NomeCompleto.Trim();
        alvo.Telefone = string.IsNullOrWhiteSpace(request.Telefone) ? null : request.Telefone.Trim();
        alvo.AtualizadoEm = DateTimeOffset.UtcNow;
        auditoria.Registrar(contaId, usuarioId, "UsuarioAtualizado", nameof(Usuario), alvo.Id,
            "Dados do usuário atualizados.", antes, new { alvo.NomeCompleto, alvo.Telefone }, ip, userAgent);
        await dbContext.SaveChangesAsync(ct);
        return new UsuarioResponse(alvo.Id, alvo.NomeCompleto, alvo.Email, alvo.Telefone, alvo.Perfil, alvo.Status, alvo.UltimoAcessoEm);
    }

    public async Task RedefinirSenhaAsync(Guid usuarioId, Guid contaId, Guid id, RedefinirSenhaUsuarioRequest request, string? ip, string? userAgent, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var alvo = await dbContext.Usuarios
            .SingleOrDefaultAsync(x => x.Id == id && x.ContaPsicologoId == contaId, ct)
            ?? throw new RegraNegocioException("Usuário não encontrado.", StatusCodes.Status404NotFound);
        alvo.SenhaHash = passwordHasher.HashPassword(alvo, request.NovaSenha);
        alvo.VersaoAutenticacao++;
        await estadoAutenticacao.RevogarRefreshTokensUsuarioAsync(alvo.Id, ct);
        alvo.AtualizadoEm = DateTimeOffset.UtcNow;
        auditoria.Registrar(contaId, usuarioId, "SenhaUsuarioRedefinida", nameof(Usuario), alvo.Id,
            "Senha do usuário redefinida por um gestor da conta.", null, null, ip, userAgent);
        await dbContext.SaveChangesAsync(ct);
    }

    public async Task<UsuarioResponse> AlterarStatusAsync(Guid usuarioId, Guid contaId, Guid id, AlterarStatusUsuarioRequest request, string? ip, string? userAgent, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        if (id == usuarioId)
            throw new RegraNegocioException("Você não pode alterar o próprio status.");
        var alvo = await dbContext.Usuarios
            .SingleOrDefaultAsync(x => x.Id == id && x.ContaPsicologoId == contaId, ct)
            ?? throw new RegraNegocioException("Usuário não encontrado.", StatusCodes.Status404NotFound);
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
            "Status do usuário atualizado.", new { Status = anterior }, new { Status = alvo.Status }, ip, userAgent);
        await dbContext.SaveChangesAsync(ct);
        return new UsuarioResponse(alvo.Id, alvo.NomeCompleto, alvo.Email, alvo.Telefone, alvo.Perfil, alvo.Status, alvo.UltimoAcessoEm);
    }
}
