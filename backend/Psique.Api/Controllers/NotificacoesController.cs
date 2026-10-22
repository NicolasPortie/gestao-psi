using Psique.Api.DTOs.Notificacoes;
using Psique.Api.Services.Notificacoes;
using Psique.Api.Shared.Paginacao;
using Psique.Api.Shared.Respostas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Psique.Api.Controllers;

[ApiController]
[Authorize(Policy = "GestaoAdministrativa")]
[Route("api/v1/notificacoes")]
public sealed class NotificacoesController(INotificacoesService notificacoesService) : ControllerAutenticadoBase
{
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] FiltroNotificacaoRequest filtro, CancellationToken cancellationToken) =>
        Ok(RespostaApi<ResultadoPaginado<NotificacaoResponse>>.ComSucesso(
            await notificacoesService.ListarAsync(ObterUsuarioId(), ObterContaPsicologoId(), filtro, cancellationToken)));

    [HttpGet("nao-lidas/contagem")]
    public async Task<IActionResult> ContarNaoLidas(CancellationToken cancellationToken) =>
        Ok(RespostaApi<int>.ComSucesso(
            await notificacoesService.ContarNaoLidasAsync(ObterUsuarioId(), ObterContaPsicologoId(), cancellationToken)));

    [HttpPost("{id:guid}/lida")]
    public async Task<IActionResult> MarcarLida(Guid id, CancellationToken cancellationToken) =>
        Ok(RespostaApi<NotificacaoResponse>.ComSucesso(
            await notificacoesService.MarcarComoLidaAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, cancellationToken)));

    [HttpPost("marcar-todas-lidas")]
    public async Task<IActionResult> MarcarTodas(CancellationToken cancellationToken) =>
        Ok(RespostaApi<int>.ComSucesso(
            await notificacoesService.MarcarTodasComoLidasAsync(ObterUsuarioId(), ObterContaPsicologoId(), cancellationToken)));
}
