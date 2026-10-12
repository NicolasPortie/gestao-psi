using GestaoPsi.Api.DTOs.WhatsApp;
using GestaoPsi.Api.Services.WhatsApp;
using GestaoPsi.Api.Shared.Enums;
using GestaoPsi.Api.Shared.Paginacao;
using GestaoPsi.Api.Shared.Respostas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestaoPsi.Api.Controllers;

[ApiController]
[Authorize(Policy = "GestaoAdministrativa")]
[Route("api/v1/whatsapp/conversas")]
public sealed class WhatsAppConversasController(IConversasWhatsAppService conversasService) : ControllerAutenticadoBase
{
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] FiltroConversaWhatsAppRequest filtro, CancellationToken cancellationToken) =>
        Ok(RespostaApi<ResultadoPaginado<ConversaWhatsAppListaResponse>>.ComSucesso(
            await conversasService.ListarAsync(ObterUsuarioId(), ObterContaPsicologoId(), filtro, cancellationToken)));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Obter(Guid id, CancellationToken cancellationToken) =>
        Ok(RespostaApi<ConversaWhatsAppDetalheResponse>.ComSucesso(
            await conversasService.ObterAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, cancellationToken)));

    [HttpPost("{id:guid}/vincular-paciente")]
    public async Task<IActionResult> VincularPaciente(Guid id, VincularPacienteConversaRequest request, CancellationToken cancellationToken) =>
        Ok(RespostaApi<ConversaWhatsAppDetalheResponse>.ComSucesso(
            await conversasService.VincularPacienteAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, request, Ip(), Ua(), cancellationToken)));

    [HttpPost("{id:guid}/assumir-humano")]
    public async Task<IActionResult> AssumirHumano(Guid id, AssumirAtendimentoHumanoRequest request, CancellationToken cancellationToken) =>
        Ok(RespostaApi<ConversaWhatsAppDetalheResponse>.ComSucesso(
            await conversasService.AssumirAtendimentoHumanoAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, request, Ip(), Ua(), cancellationToken)));

    [HttpPost("{id:guid}/finalizar")]
    public async Task<IActionResult> Finalizar(Guid id, CancellationToken cancellationToken) =>
        Ok(RespostaApi<ConversaWhatsAppDetalheResponse>.ComSucesso(
            await conversasService.AlterarStatusAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, StatusConversaWhatsApp.Finalizada, Ip(), Ua(), cancellationToken)));

    [HttpPost("{id:guid}/bloquear")]
    public async Task<IActionResult> Bloquear(Guid id, CancellationToken cancellationToken) =>
        Ok(RespostaApi<ConversaWhatsAppDetalheResponse>.ComSucesso(
            await conversasService.AlterarStatusAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, StatusConversaWhatsApp.Bloqueada, Ip(), Ua(), cancellationToken)));

    [HttpPost("{id:guid}/mensagens")]
    public async Task<IActionResult> EnviarMensagem(Guid id, EnviarMensagemConversaRequest request, CancellationToken cancellationToken) =>
        Ok(RespostaApi<MensagemWhatsAppResponse>.ComSucesso(
            await conversasService.EnviarMensagemAdministrativaAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, request, Ip(), Ua(), cancellationToken)));

    private string? Ip() => HttpContext.Connection.RemoteIpAddress?.ToString();
    private string? Ua() => Request.Headers.UserAgent.ToString();
}
