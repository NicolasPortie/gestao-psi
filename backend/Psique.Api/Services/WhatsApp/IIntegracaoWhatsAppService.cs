using Psique.Api.DTOs.WhatsApp;

namespace Psique.Api.Services.WhatsApp;

public interface IIntegracaoWhatsAppService
{
    Task<IntegracaoWhatsAppResponse?> ObterAsync(Guid usuarioId, Guid contaId, CancellationToken cancellationToken);
    Task<IntegracaoWhatsAppResponse> SalvarAsync(Guid usuarioId, Guid contaId, SalvarIntegracaoWhatsAppRequest request, string? ip, string? userAgent, CancellationToken cancellationToken);
    Task<IntegracaoWhatsAppResponse> AlterarAtivoAsync(Guid usuarioId, Guid contaId, bool ativo, string? ip, string? userAgent, CancellationToken cancellationToken);
    Task<TesteConexaoBridgeResponse> TestarConexaoAsync(Guid usuarioId, Guid contaId, string? ip, string? userAgent, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<EventoBridgeResumoResponse>> ListarEventosAsync(Guid usuarioId, Guid contaId, CancellationToken cancellationToken);
}
