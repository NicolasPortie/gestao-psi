using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.Models;

public class ProtocoloEntregaDocumento : EntidadeDaConta
{
    public Guid Id { get; set; }
    public Guid DocumentoProntuarioId { get; set; }
    public Guid RegistradoPorUsuarioId { get; set; }
    public TipoEntregaDocumento TipoEntrega { get; set; }
    public StatusEntregaDocumento Status { get; set; } = StatusEntregaDocumento.Registrada;
    public string? Destinatario { get; set; }
    public string? Observacao { get; set; }
    public DateTimeOffset EntregueEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;

    public DocumentoProntuario DocumentoProntuario { get; set; } = null!;
    public Usuario RegistradoPorUsuario { get; set; } = null!;
}
