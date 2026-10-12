using GestaoPsi.Api.DTOs.Relatorios;
using GestaoPsi.Api.Services.Relatorios;
using GestaoPsi.Api.Shared.Respostas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestaoPsi.Api.Controllers;

[ApiController]
[Authorize(Policy = "GestaoAdministrativa")]
[Route("api/v1/relatorios")]
public sealed class RelatoriosController(IRelatoriosAdministrativosService relatoriosService) : ControllerAutenticadoBase
{
    [HttpGet("catalogo")]
    public async Task<IActionResult> Catalogo(CancellationToken cancellationToken) =>
        Ok(RespostaApi<IReadOnlyCollection<RelatorioCatalogoItemResponse>>.ComSucesso(
            await relatoriosService.ListarCatalogoAsync(ObterUsuarioId(), ObterContaPsicologoId(), cancellationToken)));

    [HttpPost("{codigo}/gerar")]
    public async Task<IActionResult> Gerar(string codigo, GerarRelatorioRequest request, CancellationToken cancellationToken) =>
        Ok(RespostaApi<RelatorioGeradoResponse>.ComSucesso(
            await relatoriosService.GerarAsync(
                ObterUsuarioId(),
                ObterContaPsicologoId(),
                codigo,
                request,
                HttpContext.Connection.RemoteIpAddress?.ToString(),
                Request.Headers.UserAgent.ToString(),
                cancellationToken)));
}
