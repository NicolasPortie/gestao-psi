using GestaoPsi.Api.DTOs.Pagamentos;
namespace GestaoPsi.Api.Services.Pagamentos;
public interface IPagamentosService
{
    Task<PagamentosListagemResponse> ListarAsync(Guid usuarioId, Guid contaId, ListarPagamentosFiltro filtro, int pagina, int tamanhoPagina, CancellationToken ct);
    Task<PagamentoResponse> CriarAsync(Guid usuarioId, Guid contaId, CriarPagamentoRequest request, string? ip, string? userAgent, CancellationToken ct);
    Task<PagamentoResponse> AlterarStatusAsync(Guid usuarioId, Guid contaId, Guid id, AlterarStatusPagamentoRequest request, string? ip, string? userAgent, CancellationToken ct);
    Task<GerarMensalidadesResponse> GerarMensalidadesAsync(Guid usuarioId, Guid contaId, GerarMensalidadesRequest request, string? ip, string? userAgent, CancellationToken ct);
    Task<IReadOnlyCollection<RecebimentoExportadoResponse>> ExportarRecebimentosAsync(Guid usuarioId, Guid contaId, DateOnly de, DateOnly ate, string? ip, string? userAgent, CancellationToken ct);
    Task<ReciboMensalResponse> ObterReciboMensalAsync(Guid usuarioId, Guid contaId, Guid pacienteId, int ano, int mes, string? ip, string? userAgent, CancellationToken ct);
    Task<ReciboResponse> ObterReciboAsync(Guid usuarioId, Guid contaId, Guid id, string? ip, string? userAgent, CancellationToken ct);
}
