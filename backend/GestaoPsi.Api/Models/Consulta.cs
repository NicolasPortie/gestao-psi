using GestaoPsi.Api.Data.Cifra;
using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.Models;

public class Consulta : EntidadeDaConta
{
    public Guid Id { get; set; }
    public Guid PacienteId { get; set; }
    public Guid TipoAtendimentoId { get; set; }
    public DateTimeOffset InicioEm { get; set; }
    public DateTimeOffset FimEm { get; set; }
    public StatusConsulta Status { get; set; } = StatusConsulta.AguardandoConfirmacao;
    public ModalidadeAtendimento Modalidade { get; set; }
    public OrigemConsulta Origem { get; set; } = OrigemConsulta.Painel;
    [Cifrado]
    public string? LinkOnline { get; set; }
    [Cifrado]
    public string? EnderecoAtendimento { get; set; }
    [Cifrado]
    public string? ObservacaoAdministrativa { get; set; }
    [Cifrado]
    public string? JustificativaCancelamento { get; set; }
    /// <summary>Consultas criadas juntas como uma série (semanal ou quinzenal) compartilham este identificador.</summary>
    public Guid? SerieId { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }

    public Paciente Paciente { get; set; } = null!;
    public TipoAtendimento TipoAtendimento { get; set; } = null!;
    public RegistroSessao? RegistroSessao { get; set; }
    public ICollection<HistoricoConsulta> Historicos { get; set; } = [];
    public ICollection<Pagamento> Pagamentos { get; set; } = [];
    public ICollection<Lembrete> Lembretes { get; set; } = [];
}
