using Psique.Api.DTOs.Painel;

namespace Psique.Api.Services.Painel;

public interface IPainelService
{
    Task<PainelResumoResponse> ObterResumoAsync(
        Guid usuarioId,
        Guid contaPsicologoId,
        CancellationToken cancellationToken);
}
