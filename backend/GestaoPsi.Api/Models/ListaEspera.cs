using GestaoPsi.Api.Data.Cifra;
using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.Models;

public class ListaEspera : EntidadeDaConta
{
    public Guid Id { get; set; }
    public Guid PacienteId { get; set; }
    public Guid? TipoAtendimentoId { get; set; }
    public DiaSemana? PreferenciaDiaSemana { get; set; }
    public TimeOnly? PreferenciaHorarioInicio { get; set; }
    public TimeOnly? PreferenciaHorarioFim { get; set; }
    public int? Prioridade { get; set; }
    public StatusListaEspera Status { get; set; } = StatusListaEspera.Aguardando;
    public OrigemConsulta Origem { get; set; } = OrigemConsulta.Painel;
    [Cifrado]
    public string? ObservacaoAdministrativa { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }

    public Paciente Paciente { get; set; } = null!;
    public TipoAtendimento? TipoAtendimento { get; set; }
}
