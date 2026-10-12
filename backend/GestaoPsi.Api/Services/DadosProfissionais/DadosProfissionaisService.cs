using GestaoPsi.Api.Data;
using GestaoPsi.Api.DTOs.DadosProfissionais;
using GestaoPsi.Api.Models;
using GestaoPsi.Api.Services.Seguranca;
using GestaoPsi.Api.Shared.Enums;
using Microsoft.EntityFrameworkCore;

namespace GestaoPsi.Api.Services.DadosProfissionais;

public sealed class DadosProfissionaisService(
    AppDbContext dbContext,
    IAutorizacaoContaService autorizacao,
    IAuditoriaService auditoria,
    IProtecaoDadosService protecao) : IDadosProfissionaisService
{
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
        var crpNormalizado = new string(request.Crp.Where(char.IsLetterOrDigit).ToArray()).ToUpperInvariant();
        var dados = await dbContext.DadosProfissionaisPsicologo
            .SingleOrDefaultAsync(x => x.ContaPsicologoId == contaId && x.Status == StatusUsuario.Ativo, ct);

        if (dados is null)
        {
            dados = new DadosProfissionaisPsicologo
            {
                Id = Guid.NewGuid(),
                ContaPsicologoId = contaId,
                UsuarioId = usuarioId,
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
