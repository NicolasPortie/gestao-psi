using GestaoPsi.Api.DTOs.ListaEspera;
using GestaoPsi.Api.Services.ListaEspera;
using GestaoPsi.Api.Shared.Respostas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestaoPsi.Api.Controllers;

[ApiController]
[Authorize(Policy = "GestaoAdministrativa")]
[Route("api/v1/lista-espera")]
public sealed class ListaEsperaController(IListaEsperaService listaEsperaService) : ControllerAutenticadoBase
{
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] FiltroListaEsperaRequest filtro, CancellationToken cancellationToken) =>
        Ok(RespostaApi<IReadOnlyCollection<ListaEsperaResponse>>.ComSucesso(
            await listaEsperaService.ListarAsync(ObterUsuarioId(), ObterContaPsicologoId(), filtro, cancellationToken)));

    [HttpPost]
    public async Task<IActionResult> Criar(CriarListaEsperaRequest request, CancellationToken cancellationToken) =>
        Ok(RespostaApi<ListaEsperaResponse>.ComSucesso(
            await listaEsperaService.CriarAsync(ObterUsuarioId(), ObterContaPsicologoId(), request, ObterIp(), ObterUserAgent(), cancellationToken)));

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> AlterarStatus(Guid id, AlterarStatusListaEsperaRequest request, CancellationToken cancellationToken) =>
        Ok(RespostaApi<ListaEsperaResponse>.ComSucesso(
            await listaEsperaService.AlterarStatusAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, request, ObterIp(), ObterUserAgent(), cancellationToken)));

    private string? ObterIp() => HttpContext.Connection.RemoteIpAddress?.ToString();
    private string? ObterUserAgent() => Request.Headers.UserAgent.ToString();
}
