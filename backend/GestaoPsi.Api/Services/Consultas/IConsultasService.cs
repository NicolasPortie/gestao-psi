using GestaoPsi.Api.DTOs.Consultas;

namespace GestaoPsi.Api.Services.Consultas;

public interface IConsultasService
{
    Task<IReadOnlyCollection<ConsultaResponse>> ListarAsync(Guid usuarioId, Guid contaId, DateTimeOffset inicio, DateTimeOffset fim, Guid? pacienteId, CancellationToken ct);
    Task<ConsultaDetalheResponse> ObterPorIdAsync(Guid usuarioId, Guid contaId, Guid id, CancellationToken ct);
    Task<ConsultaResponse> CriarAsync(Guid usuarioId, Guid contaId, CriarConsultaRequest request, string? ip, string? userAgent, CancellationToken ct);
    Task<SerieConsultasResponse> CriarSerieAsync(Guid usuarioId, Guid contaId, CriarConsultaRequest request, string? ip, string? userAgent, CancellationToken ct);
    Task<CancelamentoSerieResponse> CancelarSerieAsync(Guid usuarioId, Guid contaId, Guid id, CancelarSerieRequest request, string? ip, string? userAgent, CancellationToken ct);
    Task<ConsultaResponse> AlterarStatusAsync(Guid usuarioId, Guid contaId, Guid id, AlterarStatusConsultaRequest request, string? ip, string? userAgent, CancellationToken ct);
    Task<ConsultaResponse> RemarcarAsync(Guid usuarioId, Guid contaId, Guid id, RemarcarConsultaRequest request, string? ip, string? userAgent, CancellationToken ct);
}
