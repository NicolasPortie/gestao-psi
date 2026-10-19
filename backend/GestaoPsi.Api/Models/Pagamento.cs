using GestaoPsi.Api.Data.Cifra;
using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.Models;

public class Pagamento : EntidadeDaConta
{
    public Guid Id { get; set; }
    public Guid PacienteId { get; set; }
    public Guid? ConsultaId { get; set; }
    public decimal Valor { get; set; }
    public StatusPagamento Status { get; set; } = StatusPagamento.Pendente;
    public FormaPagamento FormaPagamento { get; set; } = FormaPagamento.Manual;
    public DateTimeOffset? PagoEm { get; set; }
    public DateTimeOffset? VencimentoEm { get; set; }
    [Cifrado]
    public string? Observacao { get; set; }
    /// <summary>Mês de referência (dia 1) de uma mensalidade; nulo nas cobranças por sessão e avulsas.</summary>
    public DateOnly? Competencia { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }

    public Paciente Paciente { get; set; } = null!;
    public Consulta? Consulta { get; set; }
}
