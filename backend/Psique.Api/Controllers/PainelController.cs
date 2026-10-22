using Psique.Api.DTOs.Painel;
using Psique.Api.Services.Painel;
using Psique.Api.Shared.Excecoes;
using Psique.Api.Shared.Respostas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Psique.Api.Controllers;

[ApiController]
[Authorize(Policy = "GestaoAdministrativa")]
[Route("api/v1/painel")]
public sealed class PainelController(IPainelService painelService) : ControllerAutenticadoBase
{
    [HttpGet("resumo")]
    [ProducesResponseType<RespostaApi<PainelResumoResponse>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> ObterResumo(CancellationToken cancellationToken)
    {
        var usuarioId = ObterUsuarioId();
        var contaPsicologoId = ObterContaPsicologoId();

        var resumo = await painelService.ObterResumoAsync(
            usuarioId,
            contaPsicologoId,
            cancellationToken);

        return Ok(RespostaApi<PainelResumoResponse>.ComSucesso(resumo));
    }
}
