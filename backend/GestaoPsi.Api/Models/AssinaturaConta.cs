using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.Models;

public class AssinaturaConta : EntidadeDaConta
{
    public Guid Id { get; set; }
    public Guid PlanoSaasId { get; set; }
    public StatusAssinaturaConta Status { get; set; } = StatusAssinaturaConta.Teste;
    public CicloAssinatura Ciclo { get; set; } = CicloAssinatura.Mensal;
    public DateTimeOffset InicioEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? TesteAte { get; set; }
    public DateTimeOffset? RenovacaoEm { get; set; }
    public DateTimeOffset? CanceladaEm { get; set; }
    public string? MotivoCancelamento { get; set; }
    public string? ProvedorPagamento { get; set; }
    public string? AssinaturaExternaId { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }

    public PlanoSaas PlanoSaas { get; set; } = null!;
    public ICollection<FaturaAssinatura> Faturas { get; set; } = [];
}
