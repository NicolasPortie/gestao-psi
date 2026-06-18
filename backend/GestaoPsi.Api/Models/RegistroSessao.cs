using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.Models;

public class RegistroSessao : EntidadeDaConta
{
    public Guid Id { get; set; }
    public Guid ProntuarioId { get; set; }
    public Guid PacienteId { get; set; }
    public Guid ConsultaId { get; set; }
    public Guid TipoAtendimentoId { get; set; }
    public Guid CriadoPorUsuarioId { get; set; }
    public DateTimeOffset DataSessao { get; set; }
    public string? ObservacoesClinicas { get; set; }
    public string? Evolucao { get; set; }
    public string? Encaminhamentos { get; set; }
    public DateTimeOffset? ProximaSessaoSugeridaEm { get; set; }
    public StatusRegistroSessao Status { get; set; } = StatusRegistroSessao.Finalizado;
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }

    public Paciente Paciente { get; set; } = null!;
    public Prontuario Prontuario { get; set; } = null!;
    public Consulta Consulta { get; set; } = null!;
    public TipoAtendimento TipoAtendimento { get; set; } = null!;
    public Usuario CriadoPorUsuario { get; set; } = null!;
    public ICollection<RetificacaoRegistroSessao> Retificacoes { get; set; } = [];
    public ICollection<EvolucaoProntuario> Evolucoes { get; set; } = [];
}
