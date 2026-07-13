using GestaoPsi.Api.DTOs.Pagamentos;
namespace GestaoPsi.Api.Services.Pagamentos;
public interface IPagamentosService
{
    Task<IReadOnlyCollection<PagamentoResponse>> ListarAsync(Guid usuarioId, Guid contaId, CancellationToken ct);
    Task<PagamentoResponse> CriarAsync(Guid usuarioId, Guid contaId, CriarPagamentoRequest request, string? ip, string? userAgent, CancellationToken ct);
    Task<PagamentoResponse> AlterarStatusAsync(Guid usuarioId, Guid contaId, Guid id, AlterarStatusPagamentoRequest request, string? ip, string? userAgent, CancellationToken ct);
}
