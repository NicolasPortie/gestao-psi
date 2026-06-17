using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.Models;

public class ContatoPaciente
{
    public Guid Id { get; set; }
    public Guid PacienteId { get; set; }
    public TipoContato TipoContato { get; set; }
    public string Valor { get; set; } = string.Empty;
    public bool Principal { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }

    public Paciente Paciente { get; set; } = null!;
}
