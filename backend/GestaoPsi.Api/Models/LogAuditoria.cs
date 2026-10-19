using GestaoPsi.Api.Data.Cifra;
namespace GestaoPsi.Api.Models;

public class LogAuditoria : EntidadeDaConta
{
    public Guid Id { get; set; }
    public Guid? UsuarioId { get; set; }
    public string TipoAcao { get; set; } = string.Empty;
    public string Entidade { get; set; } = string.Empty;
    public Guid? EntidadeId { get; set; }
    [Cifrado]
    public string? Descricao { get; set; }
    [Cifrado]
    public string? Ip { get; set; }
    [Cifrado]
    public string? UserAgent { get; set; }
    public string? DadosAntesJson { get; set; }
    public string? DadosDepoisJson { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;

    public Usuario? Usuario { get; set; }
}
