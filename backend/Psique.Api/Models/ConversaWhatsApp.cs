using Psique.Api.Data.Cifra;
using Psique.Api.Shared.Enums;

namespace Psique.Api.Models;

public class ConversaWhatsApp : EntidadeDaConta
{
    public Guid Id { get; set; }
    public Guid IntegracaoWhatsAppId { get; set; }
    public Guid? PacienteId { get; set; }
    [Cifrado]
    public string Telefone { get; set; } = string.Empty;
    /// <summary>HMAC dos dígitos do telefone: encontra a conversa sem decifrar. Preenchido pelo AppDbContext.</summary>
    public string? TelefoneHash { get; set; }
    [Cifrado]
    public string? NomeContato { get; set; }
    public StatusConversaWhatsApp Status { get; set; } = StatusConversaWhatsApp.Aberta;
    public DateTimeOffset? UltimaMensagemEm { get; set; }
    public bool AtendimentoHumanoNecessario { get; set; }
    [Cifrado]
    public string? MotivoAtendimentoHumano { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }

    public IntegracaoWhatsApp IntegracaoWhatsApp { get; set; } = null!;
    public Paciente? Paciente { get; set; }
    public ICollection<MensagemWhatsApp> Mensagens { get; set; } = [];
    public ICollection<SessaoBot> SessoesBot { get; set; } = [];
}
