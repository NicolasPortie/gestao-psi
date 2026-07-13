using GestaoPsi.Api.DTOs.Sessoes;

namespace GestaoPsi.Api.Services.Sessoes;

public interface ISessoesService
{
    Task<RegistroSessaoResponse> CriarAsync(Guid usuarioId, Guid contaId, CriarRegistroSessaoRequest request, string? ip, string? userAgent, CancellationToken ct);
    Task<IReadOnlyCollection<EvolucaoProntuarioResponse>> ListarEvolucoesAsync(Guid usuarioId, Guid contaId, Guid pacienteId, CancellationToken ct);
    Task<EvolucaoProntuarioResponse> CriarEvolucaoAsync(Guid usuarioId, Guid contaId, CriarEvolucaoProntuarioRequest request, string? ip, string? userAgent, CancellationToken ct);
}
