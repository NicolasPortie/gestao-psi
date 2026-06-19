using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using GestaoPsi.Api.DTOs.Painel;
using GestaoPsi.Api.Services.Painel;
using GestaoPsi.Api.Shared.Excecoes;
using GestaoPsi.Api.Shared.Respostas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestaoPsi.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/painel")]
public sealed class PainelController(IPainelService painelService) : ControllerBase
{
    [HttpGet("resumo")]
    [ProducesResponseType<RespostaApi<PainelResumoResponse>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> ObterResumo(CancellationToken cancellationToken)
    {
        var usuarioId = ObterGuidClaim(
            JwtRegisteredClaimNames.Sub,
            ClaimTypes.NameIdentifier);
        var contaPsicologoId = ObterGuidClaim("conta_psicologo_id");

        var resumo = await painelService.ObterResumoAsync(
            usuarioId,
            contaPsicologoId,
            cancellationToken);

        return Ok(RespostaApi<PainelResumoResponse>.ComSucesso(resumo));
    }

    private Guid ObterGuidClaim(params string[] tipos)
    {
        var valor = tipos
            .Select(tipo => User.FindFirstValue(tipo))
            .FirstOrDefault(item => !string.IsNullOrWhiteSpace(item));
        if (!Guid.TryParse(valor, out var id))
        {
            throw new RegraNegocioException(
                "Sessao invalida ou expirada.",
                StatusCodes.Status401Unauthorized);
        }

        return id;
    }
}
