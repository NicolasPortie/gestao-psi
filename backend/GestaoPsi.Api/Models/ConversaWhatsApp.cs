using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.Models;

public class ConversaWhatsApp
{
    public Guid Id { get; set; }
    public Guid IntegracaoWhatsAppId { get; set; }
    public Guid? PacienteId { get; set; }
    public string Telefone { get; set; } = string.Empty;
    public string? NomeContato { get; set; }
    public StatusConversaWhatsApp Status { get; set; } = StatusConversaWhatsApp.Aberta;
    public DateTimeOffset? UltimaMensagemEm { get; set; }
    public bool AtendimentoHumanoNecessario { get; set; }
    public string? MotivoAtendimentoHumano { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }

    public IntegracaoWhatsApp IntegracaoWhatsApp { get; set; } = null!;
    public Paciente? Paciente { get; set; }
    public ICollection<MensagemWhatsApp> Mensagens { get; set; } = [];
    public ICollection<SessaoBot> SessoesBot { get; set; } = [];
}
