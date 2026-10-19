using GestaoPsi.Api.Shared;
using GestaoPsi.Api.DTOs.Lembretes;
using GestaoPsi.Api.Services.Lembretes;
using GestaoPsi.Api.Shared.Paginacao;
using GestaoPsi.Api.Shared.Respostas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestaoPsi.Api.Controllers;

[ApiController]
[Authorize(Policy = Politicas.Mensagens)]
[Route("api/v1/lembretes")]
public sealed class LembretesController(ILembretesService lembretesService) : ControllerAutenticadoBase
{
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] FiltroLembreteRequest filtro, CancellationToken cancellationToken) =>
        Ok(RespostaApi<ResultadoPaginado<LembreteResponse>>.ComSucesso(
            await lembretesService.ListarAsync(ObterUsuarioId(), ObterContaPsicologoId(), filtro, cancellationToken)));

    [HttpGet("indicadores")]
    public async Task<IActionResult> Indicadores([FromQuery] FiltroLembreteRequest filtro, CancellationToken cancellationToken) =>
        Ok(RespostaApi<LembreteIndicadoresResponse>.ComSucesso(
            await lembretesService.IndicadoresAsync(ObterUsuarioId(), ObterContaPsicologoId(), filtro, cancellationToken)));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Obter(Guid id, CancellationToken cancellationToken) =>
        Ok(RespostaApi<LembreteResponse>.ComSucesso(
            await lembretesService.ObterAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, cancellationToken)));

    [HttpPost]
    public async Task<IActionResult> Criar(CriarLembreteRequest request, CancellationToken cancellationToken) =>
        Ok(RespostaApi<LembreteResponse>.ComSucesso(
            await lembretesService.CriarAsync(ObterUsuarioId(), ObterContaPsicologoId(), request, ObterIp(), ObterUserAgent(), cancellationToken)));

    [HttpPost("previa")]
    public async Task<IActionResult> Previa(PreviaLembreteRequest request, CancellationToken cancellationToken) =>
        Ok(RespostaApi<PreviaLembreteResponse>.ComSucesso(
            await lembretesService.PreviaAsync(ObterUsuarioId(), ObterContaPsicologoId(), request, cancellationToken)));

    [HttpPost("{id:guid}/cancelar")]
    public async Task<IActionResult> Cancelar(Guid id, CancellationToken cancellationToken) =>
        Ok(RespostaApi<LembreteResponse>.ComSucesso(
            await lembretesService.CancelarAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, ObterIp(), ObterUserAgent(), cancellationToken)));

    [HttpPost("{id:guid}/tentar-novamente")]
    public async Task<IActionResult> TentarNovamente(Guid id, CancellationToken cancellationToken) =>
        Ok(RespostaApi<LembreteResponse>.ComSucesso(
            await lembretesService.TentarNovamenteAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, ObterIp(), ObterUserAgent(), cancellationToken)));
}
