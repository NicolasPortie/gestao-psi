using Psique.Api.Data;
using Psique.Api.DTOs.DadosProfissionais;
using Psique.Api.Models;
using Psique.Api.Services.Seguranca;
using Psique.Api.Shared.Enums;
using Psique.Api.Shared.Excecoes;
using Microsoft.EntityFrameworkCore;

namespace Psique.Api.Services.DadosProfissionais;

public sealed class DadosProfissionaisService(
    AppDbContext dbContext,
    IAutorizacaoContaService autorizacao,
    IAuditoriaService auditoria,
    IProtecaoDadosService protecao) : IDadosProfissionaisService
{
    public async Task<SituacaoPerfilProfissionalResponse> ObterSituacaoAsync(Guid usuarioId, Guid contaId, CancellationToken ct)
    {
        var usuario = await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        if (usuario.Perfil != PerfilUsuario.Psicologo) return new(false, false);
        var completo = await dbContext.DadosProfissionaisPsicologo.AnyAsync(x => x.ContaPsicologoId == contaId && x.UsuarioId == usuarioId && x.Status == StatusUsuario.Ativo && x.NomeProfissional != "" && x.CrpHash != "", ct);
        var conta = await dbContext.ContasPsicologo.SingleAsync(x => x.Id == contaId, ct);
        return new(!completo, !completo && conta.PerfilProfissionalAdiadoEm is null);
    }

    public async Task AdiarAsync(Guid usuarioId, Guid contaId, CancellationToken ct)
    {
        var usuario = await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        if (usuario.Perfil != PerfilUsuario.Psicologo) throw new RegraNegocioException("Apenas o psicólogo pode adiar seu perfil profissional.", StatusCodes.Status403Forbidden);
        var conta = await dbContext.ContasPsicologo.SingleAsync(x => x.Id == contaId, ct);
        conta.PerfilProfissionalAdiadoEm ??= DateTimeOffset.UtcNow;
        await dbContext.SaveChangesAsync(ct);
    }

    public async Task<DadosProfissionaisResponse?> ObterAsync(Guid usuarioId, Guid contaId, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var dados = await dbContext.DadosProfissionaisPsicologo.AsNoTracking()
            .SingleOrDefaultAsync(x => x.ContaPsicologoId == contaId && x.Status == StatusUsuario.Ativo, ct);
        return dados is null ? null : Mapear(dados);
    }

    public async Task<DadosProfissionaisResponse> SalvarAsync(Guid usuarioId, Guid contaId, SalvarDadosProfissionaisRequest request, string? ip, string? userAgent, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        if (string.IsNullOrWhiteSpace(request.NomeProfissional) || request.NomeProfissional.Trim().Length < 3 || request.NomeProfissional.Trim().Length > 180 || string.IsNullOrWhiteSpace(request.Crp) || !System.Text.RegularExpressions.Regex.IsMatch(request.Crp, @"^\d{2}/\d{4,6}$"))
            throw new RegraNegocioException("Informe o nome completo e um CRP válido, como 06/123456.");
        var psicologo = await dbContext.Usuarios.SingleAsync(x => x.ContaPsicologoId == contaId && x.Perfil == PerfilUsuario.Psicologo && x.Status == StatusUsuario.Ativo, ct);
        var crpNormalizado = new string(request.Crp.Where(char.IsLetterOrDigit).ToArray()).ToUpperInvariant();
        var dados = await dbContext.DadosProfissionaisPsicologo
            .SingleOrDefaultAsync(x => x.ContaPsicologoId == contaId && x.Status == StatusUsuario.Ativo, ct);

        if (dados is null)
        {
            dados = new DadosProfissionaisPsicologo
            {
                Id = Guid.NewGuid(),
                ContaPsicologoId = contaId,
                UsuarioId = psicologo.Id,
                Crp = protecao.Proteger(crpNormalizado),
                CrpHash = protecao.HashDeterministico(crpNormalizado),
                NomeProfissional = request.NomeProfissional.Trim(),
                Bio = Limpar(request.Bio),
                EmailProfissional = Limpar(request.EmailProfissional)?.ToLowerInvariant(),
                TelefoneProfissional = Limpar(request.TelefoneProfissional),
                Status = StatusUsuario.Ativo
            };
            dbContext.DadosProfissionaisPsicologo.Add(dados);
            auditoria.Registrar(contaId, usuarioId, "DadosProfissionaisCriados", nameof(DadosProfissionaisPsicologo),
                dados.Id, "Dados profissionais cadastrados.", null, new { dados.NomeProfissional }, ip, userAgent);
        }
        else
        {
            dados.NomeProfissional = request.NomeProfissional.Trim();
            dados.Crp = protecao.Proteger(crpNormalizado);
            dados.CrpHash = protecao.HashDeterministico(crpNormalizado);
            dados.Bio = Limpar(request.Bio);
            dados.EmailProfissional = Limpar(request.EmailProfissional)?.ToLowerInvariant();
            dados.TelefoneProfissional = Limpar(request.TelefoneProfissional);
            dados.AtualizadoEm = DateTimeOffset.UtcNow;
            auditoria.Registrar(contaId, usuarioId, "DadosProfissionaisAtualizados", nameof(DadosProfissionaisPsicologo),
                dados.Id, "Dados profissionais atualizados.", null, new { dados.NomeProfissional }, ip, userAgent);
        }

        psicologo.NomeCompleto = request.NomeProfissional.Trim();
        var conta = await dbContext.ContasPsicologo.SingleAsync(x => x.Id == contaId, ct);
        conta.NomeConta = psicologo.NomeCompleto;
        await dbContext.SaveChangesAsync(ct);
        return Mapear(dados);
    }

    private DadosProfissionaisResponse Mapear(DadosProfissionaisPsicologo dados)
    {
        string mascarado;
        try
        {
            var crp = protecao.Desproteger(dados.Crp);
            mascarado = crp.Length > 4 ? $"{new string('*', crp.Length - 4)}{crp[^4..]}" : "****";
        }
        catch
        {
            mascarado = "****";
        }
        return new(dados.Id, dados.NomeProfissional, mascarado, dados.Bio, dados.EmailProfissional, dados.TelefoneProfissional);
    }

    private static string? Limpar(string? valor) => string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();
}
