using GestaoPsi.Api.Data.Cifra;
using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.Models;

public class Usuario : EntidadeDaConta
{
    public Guid Id { get; set; }
    [Cifrado]
    public string NomeCompleto { get; set; } = string.Empty;
    [Cifrado]
    public string Email { get; set; } = string.Empty;
    /// <summary>HMAC do e-mail normalizado: localiza o usuário sem decifrar. Preenchido pelo AppDbContext.</summary>
    public string? EmailHash { get; set; }
    public string SenhaHash { get; set; } = string.Empty;
    public int VersaoAutenticacao { get; set; }
    [Cifrado]
    public string? Telefone { get; set; }
    public PerfilUsuario Perfil { get; set; }
    public Guid? PerfilAcessoId { get; set; }
    public StatusUsuario Status { get; set; } = StatusUsuario.Ativo;
    public DateTimeOffset? TermosAceitosEm { get; set; }
    public string? VersaoTermosAceitos { get; set; }
    public DateTimeOffset? UltimoAcessoEm { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }

    public PerfilAcesso? PerfilAcesso { get; set; }
    public DadosProfissionaisPsicologo? DadosProfissionaisPsicologo { get; set; }
    public Paciente? Paciente { get; set; }
    public ICollection<HistoricoConsulta> HistoricosConsulta { get; set; } = [];
    public ICollection<RegistroSessao> RegistrosSessaoCriados { get; set; } = [];
    public ICollection<RetificacaoRegistroSessao> RetificacoesRegistroSessao { get; set; } = [];
    public ICollection<LogAuditoria> LogsAuditoria { get; set; } = [];
    public ICollection<Notificacao> Notificacoes { get; set; } = [];
}
