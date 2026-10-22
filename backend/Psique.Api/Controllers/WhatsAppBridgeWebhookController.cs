using Psique.Api.DTOs.WhatsApp;
using Psique.Api.Services.WhatsApp;
using Psique.Api.Shared.Respostas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Psique.Api.Controllers;

/// <summary>
/// Endpoint público do Bridge. Autenticação por token de integração (header), não por JWT de usuário.
/// </summary>
[ApiController]
[AllowAnonymous]
[EnableRateLimiting("sem-sessao")]
[Route("api/v1/whatsapp/bridge")]
public sealed class WhatsAppBridgeWebhookController(IBridgeWhatsAppService bridgeService) : ControllerBase
{
    [HttpPost("eventos")]
    public async Task<IActionResult> ReceberEvento(
        [FromBody] ReceberEventoBridgeRequest request,
        CancellationToken cancellationToken)
    {
        var token = Request.Headers["X-Psique-Bridge-Token"].FirstOrDefault()
            ?? Request.Headers.Authorization.FirstOrDefault()?.Replace("Bearer ", "", StringComparison.OrdinalIgnoreCase);

        var resultado = await bridgeService.ReceberEventoAsync(
            token ?? string.Empty,
            request,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            Request.Headers.UserAgent.ToString(),
            cancellationToken);

        return Ok(RespostaApi<ReceberEventoBridgeResponse>.ComSucesso(resultado));
    }
}
