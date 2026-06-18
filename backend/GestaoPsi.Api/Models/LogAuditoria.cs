namespace GestaoPsi.Api.Models;

public class LogAuditoria : EntidadeDaConta
{
    public Guid Id { get; set; }
    public Guid? UsuarioId { get; set; }
    public string TipoAcao { get; set; } = string.Empty;
    public string Entidade { get; set; } = string.Empty;
    public Guid? EntidadeId { get; set; }
    public string? Descricao { get; set; }
    public string? Ip { get; set; }
    public string? UserAgent { get; set; }
    public string? DadosAntesJson { get; set; }
    public string? DadosDepoisJson { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;

    public Usuario? Usuario { get; set; }
}
