namespace GestaoPsi.Api.Models;

public class ConfiguracaoSegurancaConta : EntidadeDaConta
{
    public Guid Id { get; set; }
    public bool CriptografiaAplicacaoAtiva { get; set; } = true;
    public bool ExigeMfaUsuariosAdministrativos { get; set; } = true;
    public bool BloqueiaAcessoAposTentativasInvalidas { get; set; } = true;
    public int MaximoTentativasInvalidas { get; set; } = 5;
    public int RetencaoLogsAuditoriaDias { get; set; } = 3650;
    public int RetencaoProntuarioAnos { get; set; } = 5;
    public bool PermiteExportacaoCompletaDados { get; set; } = true;
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }
}
