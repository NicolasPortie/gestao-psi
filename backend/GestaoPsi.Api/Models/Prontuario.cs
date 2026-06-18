using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.Models;

public class Prontuario : EntidadeDaConta
{
    public Guid Id { get; set; }
    public Guid PacienteId { get; set; }
    public StatusProntuario Status { get; set; } = StatusProntuario.Ativo;
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }
    public DateTimeOffset? ArquivadoEm { get; set; }

    public Paciente Paciente { get; set; } = null!;
    public ICollection<RegistroSessao> RegistrosSessao { get; set; } = [];
    public ICollection<EvolucaoProntuario> Evolucoes { get; set; } = [];
    public ICollection<DocumentoProntuario> Documentos { get; set; } = [];
}
