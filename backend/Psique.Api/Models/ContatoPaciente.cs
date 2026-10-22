using Psique.Api.Shared.Enums;

namespace Psique.Api.Models;

public class ContatoPaciente : EntidadeDaConta
{
    public Guid Id { get; set; }
    public Guid PacienteId { get; set; }
    public TipoContato TipoContato { get; set; }
    public string Valor { get; set; } = string.Empty;
    /// <summary>Nome de quem atende neste contato (responsável legal, contato de emergência). Guardado protegido.</summary>
    public string? Nome { get; set; }
    public string ValorHash { get; set; } = string.Empty;
    public bool Principal { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }

    public Paciente Paciente { get; set; } = null!;
}
