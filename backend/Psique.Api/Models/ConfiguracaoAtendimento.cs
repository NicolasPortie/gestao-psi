using Psique.Api.Shared.Enums;

namespace Psique.Api.Models;

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
    /// <summary>Cria a cobrança quando a sessão é marcada como realizada (paciente por sessão).</summary>
    public bool CobrarAoRealizar { get; set; } = true;
    /// <summary>Falta (não comparecimento) também gera cobrança.</summary>
    public bool CobrarFalta { get; set; }
    public bool Ativo { get; set; } = true;
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }
}
