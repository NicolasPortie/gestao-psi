using Psique.Api.Data.Cifra;
using Psique.Api.Shared.Enums;

namespace Psique.Api.Models;

public class ProtocoloEntregaDocumento : EntidadeDaConta
{
    public Guid Id { get; set; }
    public Guid DocumentoProntuarioId { get; set; }
    public Guid VersaoDocumentoProntuarioId { get; set; }
    public Guid RegistradoPorUsuarioId { get; set; }
    public TipoEntregaDocumento TipoEntrega { get; set; }
    public StatusEntregaDocumento Status { get; set; } = StatusEntregaDocumento.Registrada;
    [Cifrado]
    public string? Destinatario { get; set; }
    [Cifrado]
    public string? Observacao { get; set; }
    public DateTimeOffset EntregueEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;

    public DocumentoProntuario DocumentoProntuario { get; set; } = null!;
    public VersaoDocumentoProntuario VersaoDocumentoProntuario { get; set; } = null!;
    public Usuario RegistradoPorUsuario { get; set; } = null!;
}
