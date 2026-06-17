namespace GestaoPsi.Api.Models;

public class ConfiguracaoAtendimento
{
    public Guid Id { get; set; }
    public int DuracaoPadraoMinutos { get; set; } = 50;
    public bool ConfirmacaoAutomaticaConsulta { get; set; }
    public bool PermiteListaEspera { get; set; } = true;
    public bool PermiteAgendamentoWhatsApp { get; set; } = true;
    public int? AntecedenciaMinimaAgendamentoHoras { get; set; }
    public int? AntecedenciaCancelamentoHoras { get; set; }
    public int? AntecedenciaRemarcacaoHoras { get; set; }
    public bool ExigeJustificativaCancelamento { get; set; }
    public bool Ativo { get; set; } = true;
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }
}
