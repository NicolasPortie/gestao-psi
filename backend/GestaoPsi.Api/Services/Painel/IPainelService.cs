using GestaoPsi.Api.DTOs.Painel;

namespace GestaoPsi.Api.Services.Painel;

public interface IPainelService
{
    Task<PainelResumoResponse> ObterResumoAsync(
        Guid usuarioId,
        Guid contaPsicologoId,
        CancellationToken cancellationToken);
}
