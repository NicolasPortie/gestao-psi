using GestaoPsi.Api.DTOs.DadosProfissionais;

namespace GestaoPsi.Api.Services.DadosProfissionais;

public interface IDadosProfissionaisService
{
    Task<SituacaoPerfilProfissionalResponse> ObterSituacaoAsync(Guid usuarioId, Guid contaId, CancellationToken ct);
    Task AdiarAsync(Guid usuarioId, Guid contaId, CancellationToken ct);
    Task<DadosProfissionaisResponse?> ObterAsync(Guid usuarioId, Guid contaId, CancellationToken ct);
    Task<DadosProfissionaisResponse> SalvarAsync(Guid usuarioId, Guid contaId, SalvarDadosProfissionaisRequest request, string? ip, string? userAgent, CancellationToken ct);
}
