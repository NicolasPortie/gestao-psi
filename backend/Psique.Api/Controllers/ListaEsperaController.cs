using Psique.Api.Shared;
using Psique.Api.DTOs.ListaEspera;
using Psique.Api.Services.ListaEspera;
using Psique.Api.Shared.Paginacao;
using Psique.Api.Shared.Respostas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Psique.Api.Controllers;

[ApiController]
[Authorize(Policy = Politicas.Agenda)]
[Route("api/v1/lista-espera")]
public sealed class ListaEsperaController(IListaEsperaService listaEsperaService) : ControllerAutenticadoBase
{
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] FiltroListaEsperaRequest filtro, CancellationToken cancellationToken) =>
        Ok(RespostaApi<ResultadoPaginado<ListaEsperaResponse>>.ComSucesso(
            await listaEsperaService.ListarAsync(ObterUsuarioId(), ObterContaPsicologoId(), filtro, cancellationToken)));

    [HttpPost]
    public async Task<IActionResult> Criar(CriarListaEsperaRequest request, CancellationToken cancellationToken) =>
        Ok(RespostaApi<ListaEsperaResponse>.ComSucesso(
            await listaEsperaService.CriarAsync(ObterUsuarioId(), ObterContaPsicologoId(), request, ObterIp(), ObterUserAgent(), cancellationToken)));

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> AlterarStatus(Guid id, AlterarStatusListaEsperaRequest request, CancellationToken cancellationToken) =>
        Ok(RespostaApi<ListaEsperaResponse>.ComSucesso(
            await listaEsperaService.AlterarStatusAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, request, ObterIp(), ObterUserAgent(), cancellationToken)));
}
