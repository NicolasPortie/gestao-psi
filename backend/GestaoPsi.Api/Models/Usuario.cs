using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.Models;

public class Usuario : EntidadeDaConta
{
    public Guid Id { get; set; }
    public string NomeCompleto { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
    public string? Telefone { get; set; }
    public PerfilUsuario Perfil { get; set; }
    public StatusUsuario Status { get; set; } = StatusUsuario.Ativo;
    public DateTimeOffset? TermosAceitosEm { get; set; }
    public string? VersaoTermosAceitos { get; set; }
    public DateTimeOffset? UltimoAcessoEm { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }

    public DadosProfissionaisPsicologo? DadosProfissionaisPsicologo { get; set; }
    public Paciente? Paciente { get; set; }
    public ICollection<HistoricoConsulta> HistoricosConsulta { get; set; } = [];
    public ICollection<RegistroSessao> RegistrosSessaoCriados { get; set; } = [];
    public ICollection<RetificacaoRegistroSessao> RetificacoesRegistroSessao { get; set; } = [];
    public ICollection<LogAuditoria> LogsAuditoria { get; set; } = [];
    public ICollection<Notificacao> Notificacoes { get; set; } = [];
}
