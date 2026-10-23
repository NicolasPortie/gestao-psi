using Psique.Api.Shared;
using Psique.Api.DTOs.Relatorios;
using Psique.Api.Services.Relatorios;
using Psique.Api.Shared.Respostas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Psique.Api.Controllers;

[ApiController]
[Authorize(Policy = Politicas.Relatorios)]
[Route("api/v1/relatorios")]
public sealed class RelatoriosController(IRelatoriosAdministrativosService relatoriosService) : ControllerAutenticadoBase
{
    [HttpGet("catalogo")]
    public async Task<IActionResult> Catalogo(CancellationToken cancellationToken) =>
        Ok(RespostaApi<IReadOnlyCollection<RelatorioCatalogoItemResponse>>.ComSucesso(
            await relatoriosService.ListarCatalogoAsync(ObterUsuarioId(), ObterContaPsicologoId(), cancellationToken)));

    [HttpGet("mes-em-numeros")]
    public async Task<IActionResult> MesEmNumeros([FromQuery] int ano, [FromQuery] int mes, CancellationToken cancellationToken) =>
        Ok(RespostaApi<MesEmNumerosResponse>.ComSucesso(
            await relatoriosService.ObterMesEmNumerosAsync(ObterUsuarioId(), ObterContaPsicologoId(), ano, mes, cancellationToken)));

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
