using Psique.Api.Shared.Enums;

namespace Psique.Api.Models;

public class SessaoBot : EntidadeDaConta
{
    public Guid Id { get; set; }
    public Guid ConversaWhatsAppId { get; set; }
    public Guid? PacienteId { get; set; }
    public string IntencaoAtual { get; set; } = string.Empty;
    public string? EtapaAtual { get; set; }
    public string? DadosTemporariosJson { get; set; }
    public StatusSessaoBot Status { get; set; } = StatusSessaoBot.Aberta;
    public DateTimeOffset ExpiraEm { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }

    public ConversaWhatsApp ConversaWhatsApp { get; set; } = null!;
    public Paciente? Paciente { get; set; }
}
