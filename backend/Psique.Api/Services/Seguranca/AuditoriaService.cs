using System.Text.Json;
using Psique.Api.Data;

namespace Psique.Api.Services.Seguranca;

public sealed class AuditoriaService(
    AppDbContext dbContext,
    IProtecaoDadosService protecaoDados) : IAuditoriaService
{
    public void Registrar(
        Guid contaPsicologoId,
        Guid? usuarioId,
        string tipoAcao,
        string entidade,
        Guid? entidadeId,
        string descricao,
        object? dadosAntes = null,
        object? dadosDepois = null,
        string? ip = null,
        string? userAgent = null)
    {
        dbContext.LogsAuditoria.Add(new()
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = contaPsicologoId,
            UsuarioId = usuarioId,
            TipoAcao = tipoAcao,
            Entidade = entidade,
            EntidadeId = entidadeId,
            Descricao = descricao,
            Ip = ip,
            UserAgent = userAgent,
            DadosAntesJson = ProtegerSnapshot(dadosAntes),
            DadosDepoisJson = ProtegerSnapshot(dadosDepois),
            CriadoEm = DateTimeOffset.UtcNow
        });
    }

    private string? ProtegerSnapshot(object? dados) =>
        dados is null ? null : protecaoDados.Proteger(JsonSerializer.Serialize(dados));
}
