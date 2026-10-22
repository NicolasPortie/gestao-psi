using Psique.Api.Data.Cifra;
namespace Psique.Api.Models;

public class VersaoDocumentoProntuario : EntidadeDaConta
{
    public Guid Id { get; set; }
    public Guid DocumentoProntuarioId { get; set; }
    public Guid CriadoPorUsuarioId { get; set; }
    public int NumeroVersao { get; set; }
    public string ConteudoJson { get; set; } = string.Empty;
    [Cifrado]
    public string? MotivoAlteracao { get; set; }
    public string HashConteudo { get; set; } = string.Empty;
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;

    public DocumentoProntuario DocumentoProntuario { get; set; } = null!;
    public Usuario CriadoPorUsuario { get; set; } = null!;
}
