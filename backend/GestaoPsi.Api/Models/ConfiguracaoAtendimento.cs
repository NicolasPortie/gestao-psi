using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.Models;

public class ConfiguracaoAtendimento : EntidadeDaConta
{
    public Guid Id { get; set; }
    public string FusoHorario { get; set; } = "America/Sao_Paulo";
    public int DuracaoPadraoMinutos { get; set; } = 50;    public bool ConfirmacaoAutomaticaConsulta { get; set; }
    public bool PermiteListaEspera { get; set; } = true;
    public bool PermiteAgendamentoWhatsApp { get; set; } = true;
    public int? AntecedenciaMinimaAgendamentoHoras { get; set; }
    public int? AntecedenciaCancelamentoHoras { get; set; }
    public int? AntecedenciaRemarcacaoHoras { get; set; }
    public bool ExigeJustificativaCancelamento { get; set; }
    public bool LembretesAutomaticosAtivos { get; set; } = true;
    public bool ProgramarLembreteAoCriarConsulta { get; set; } = true;
    public bool ProgramarLembreteAoConfirmar { get; set; } = true;
    public int AntecedenciaLembreteHoras { get; set; } = 24;
    public CanalComunicacao CanalLembretePadrao { get; set; } = CanalComunicacao.Email;
    public bool Ativo { get; set; } = true;
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }
}
