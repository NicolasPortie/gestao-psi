using GestaoPsi.Api.DTOs.WhatsApp;

namespace GestaoPsi.Api.Services.WhatsApp;

public interface IBridgeWhatsAppService
{
    Task<ReceberEventoBridgeResponse> ReceberEventoAsync(
        string tokenBridge,
        ReceberEventoBridgeRequest request,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken);
}
