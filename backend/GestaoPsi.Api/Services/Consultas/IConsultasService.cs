using GestaoPsi.Api.DTOs.Consultas;

namespace GestaoPsi.Api.Services.Consultas;

public interface IConsultasService
{
    Task<IReadOnlyCollection<ConsultaResponse>> ListarAsync(Guid usuarioId, Guid contaId, DateTimeOffset inicio, DateTimeOffset fim, CancellationToken ct);
    Task<ConsultaResponse> CriarAsync(Guid usuarioId, Guid contaId, CriarConsultaRequest request, string? ip, string? userAgent, CancellationToken ct);
    Task<ConsultaResponse> AlterarStatusAsync(Guid usuarioId, Guid contaId, Guid id, AlterarStatusConsultaRequest request, string? ip, string? userAgent, CancellationToken ct);
}
