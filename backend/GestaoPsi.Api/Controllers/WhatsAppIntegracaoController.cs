using GestaoPsi.Api.DTOs.WhatsApp;
using GestaoPsi.Api.Services.WhatsApp;
using GestaoPsi.Api.Shared.Respostas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestaoPsi.Api.Controllers;

[ApiController]
[Authorize(Policy = "GestaoAdministrativa")]
[Route("api/v1/whatsapp/integracao")]
public sealed class WhatsAppIntegracaoController(IIntegracaoWhatsAppService integracaoService) : ControllerAutenticadoBase
{
    [HttpGet]
    public async Task<IActionResult> Obter(CancellationToken cancellationToken)
    {
        var dados = await integracaoService.ObterAsync(ObterUsuarioId(), ObterContaPsicologoId(), cancellationToken);
        return Ok(RespostaApi<IntegracaoWhatsAppResponse?>.ComSucesso(dados));
    }

    [HttpPut]
    public async Task<IActionResult> Salvar(SalvarIntegracaoWhatsAppRequest request, CancellationToken cancellationToken) =>
        Ok(RespostaApi<IntegracaoWhatsAppResponse>.ComSucesso(
            await integracaoService.SalvarAsync(ObterUsuarioId(), ObterContaPsicologoId(), request, Ip(), Ua(), cancellationToken)));

    [HttpPost("ativar")]
    public async Task<IActionResult> Ativar(CancellationToken cancellationToken) =>
        Ok(RespostaApi<IntegracaoWhatsAppResponse>.ComSucesso(
            await integracaoService.AlterarAtivoAsync(ObterUsuarioId(), ObterContaPsicologoId(), true, Ip(), Ua(), cancellationToken)));

    [HttpPost("inativar")]
    public async Task<IActionResult> Inativar(CancellationToken cancellationToken) =>
        Ok(RespostaApi<IntegracaoWhatsAppResponse>.ComSucesso(
            await integracaoService.AlterarAtivoAsync(ObterUsuarioId(), ObterContaPsicologoId(), false, Ip(), Ua(), cancellationToken)));

    [HttpPost("testar-conexao")]
    public async Task<IActionResult> Testar(CancellationToken cancellationToken) =>
        Ok(RespostaApi<TesteConexaoBridgeResponse>.ComSucesso(
            await integracaoService.TestarConexaoAsync(ObterUsuarioId(), ObterContaPsicologoId(), Ip(), Ua(), cancellationToken)));

    [HttpGet("eventos")]
    public async Task<IActionResult> Eventos(CancellationToken cancellationToken) =>
        Ok(RespostaApi<IReadOnlyCollection<EventoBridgeResumoResponse>>.ComSucesso(
            await integracaoService.ListarEventosAsync(ObterUsuarioId(), ObterContaPsicologoId(), cancellationToken)));

    private string? Ip() => HttpContext.Connection.RemoteIpAddress?.ToString();
    private string? Ua() => Request.Headers.UserAgent.ToString();
}
