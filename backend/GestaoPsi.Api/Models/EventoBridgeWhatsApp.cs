namespace GestaoPsi.Api.Models;

public class EventoBridgeWhatsApp
{
    public Guid Id { get; set; }
    public Guid IntegracaoWhatsAppId { get; set; }
    public string? EventoExternoId { get; set; }
    public string TipoEvento { get; set; } = string.Empty;
    public string? PayloadHash { get; set; }
    public string PayloadJson { get; set; } = string.Empty;
    public bool Processado { get; set; }
    public DateTimeOffset? ProcessadoEm { get; set; }
    public string? ErroProcessamento { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;

    public IntegracaoWhatsApp IntegracaoWhatsApp { get; set; } = null!;
}
