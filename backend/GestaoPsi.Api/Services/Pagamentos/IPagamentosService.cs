using GestaoPsi.Api.DTOs.Pagamentos;
using GestaoPsi.Api.Shared.Enums;
namespace GestaoPsi.Api.Services.Pagamentos;
public interface IPagamentosService
{
    Task<PagamentosListagemResponse> ListarAsync(Guid usuarioId, Guid contaId, StatusPagamento? status, int pagina, int tamanhoPagina, CancellationToken ct);
    Task<PagamentoResponse> CriarAsync(Guid usuarioId, Guid contaId, CriarPagamentoRequest request, string? ip, string? userAgent, CancellationToken ct);
    Task<PagamentoResponse> AlterarStatusAsync(Guid usuarioId, Guid contaId, Guid id, AlterarStatusPagamentoRequest request, string? ip, string? userAgent, CancellationToken ct);
}
