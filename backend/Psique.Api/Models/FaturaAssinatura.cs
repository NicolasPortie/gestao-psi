using Psique.Api.Shared.Enums;

namespace Psique.Api.Models;

public class FaturaAssinatura : EntidadeDaConta
{
    public Guid Id { get; set; }
    public Guid AssinaturaContaId { get; set; }
    public decimal Valor { get; set; }
    public StatusFaturaAssinatura Status { get; set; } = StatusFaturaAssinatura.Aberta;
    public DateTimeOffset VencimentoEm { get; set; }
    public DateTimeOffset? PagoEm { get; set; }
    public string? ProvedorPagamento { get; set; }
    public string? FaturaExternaId { get; set; }
    public string? UrlPagamento { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }

    public AssinaturaConta AssinaturaConta { get; set; } = null!;
}
