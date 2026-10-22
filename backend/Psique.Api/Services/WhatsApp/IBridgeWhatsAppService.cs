using Psique.Api.DTOs.WhatsApp;

namespace Psique.Api.Services.WhatsApp;

public interface IBridgeWhatsAppService
{
    Task<ReceberEventoBridgeResponse> ReceberEventoAsync(
        string tokenBridge,
        ReceberEventoBridgeRequest request,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken);
}
