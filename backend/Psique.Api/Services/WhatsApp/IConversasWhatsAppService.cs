using Psique.Api.DTOs.WhatsApp;
using Psique.Api.Shared.Enums;
using Psique.Api.Shared.Paginacao;

namespace Psique.Api.Services.WhatsApp;

public interface IConversasWhatsAppService
{
    Task<ResultadoPaginado<ConversaWhatsAppListaResponse>> ListarAsync(
        Guid usuarioId,
        Guid contaId,
        FiltroConversaWhatsAppRequest filtro,
        CancellationToken cancellationToken);

    Task<ConversaWhatsAppDetalheResponse> ObterAsync(
        Guid usuarioId,
        Guid contaId,
        Guid id,
        CancellationToken cancellationToken);

    Task<ConversaWhatsAppDetalheResponse> VincularPacienteAsync(
        Guid usuarioId,
        Guid contaId,
        Guid id,
        VincularPacienteConversaRequest request,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken);

    Task<ConversaWhatsAppDetalheResponse> AssumirAtendimentoHumanoAsync(
        Guid usuarioId,
        Guid contaId,
        Guid id,
        AssumirAtendimentoHumanoRequest request,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken);

    Task<ConversaWhatsAppDetalheResponse> DevolverAoAssistenteAsync(
        Guid usuarioId,
        Guid contaId,
        Guid id,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken);

    Task<ConversaWhatsAppDetalheResponse> AlterarStatusAsync(
        Guid usuarioId,
        Guid contaId,
        Guid id,
        StatusConversaWhatsApp status,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken);

    Task<MensagemWhatsAppResponse> EnviarMensagemAdministrativaAsync(
        Guid usuarioId,
        Guid contaId,
        Guid conversaId,
        EnviarMensagemConversaRequest request,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken);
}
