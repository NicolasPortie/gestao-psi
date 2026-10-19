using GestaoPsi.Api.Data.Cifra;
namespace GestaoPsi.Api.Models;

public class Notificacao : EntidadeDaConta
{
    public Guid Id { get; set; }
    public Guid UsuarioId { get; set; }
    [Cifrado]
    public string Titulo { get; set; } = string.Empty;
    [Cifrado]
    public string Mensagem { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public bool Lida { get; set; }
    public DateTimeOffset? LidaEm { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;

    public Usuario Usuario { get; set; } = null!;
}
