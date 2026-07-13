using GestaoPsi.Api.DTOs.Painel;
using GestaoPsi.Api.Services.Painel;
using GestaoPsi.Api.Shared.Excecoes;
using GestaoPsi.Api.Shared.Respostas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestaoPsi.Api.Controllers;

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
