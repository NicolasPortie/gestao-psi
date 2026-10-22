using Psique.Api.Shared.Enums;

namespace Psique.Api.Models;

public class EvolucaoProntuario : EntidadeDaConta
{
    public Guid Id { get; set; }
    public Guid ProntuarioId { get; set; }
    public Guid PacienteId { get; set; }
    public Guid? RegistroSessaoId { get; set; }
    public Guid CriadoPorUsuarioId { get; set; }
    public TipoEvolucaoProntuario Tipo { get; set; } = TipoEvolucaoProntuario.ObservacaoClinica;
    public string Conteudo { get; set; } = string.Empty;
    public DateTimeOffset DataEvolucao { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;

    public Prontuario Prontuario { get; set; } = null!;
    public Paciente Paciente { get; set; } = null!;
    public RegistroSessao? RegistroSessao { get; set; }
    public Usuario CriadoPorUsuario { get; set; } = null!;
}
