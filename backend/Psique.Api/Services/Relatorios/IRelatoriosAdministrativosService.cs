using Psique.Api.DTOs.Relatorios;

namespace Psique.Api.Services.Relatorios;

public interface IRelatoriosAdministrativosService
{
    Task<IReadOnlyCollection<RelatorioCatalogoItemResponse>> ListarCatalogoAsync(
        Guid usuarioId,
        Guid contaId,
        CancellationToken cancellationToken);

    Task<RelatorioGeradoResponse> GerarAsync(
        Guid usuarioId,
        Guid contaId,
        string codigo,
        GerarRelatorioRequest request,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken);
}
