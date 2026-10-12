using System.ComponentModel.DataAnnotations;
using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.DTOs.Pagamentos;

public sealed record PagamentoResponse(Guid Id, Guid PacienteId, string Paciente, Guid? ConsultaId, decimal Valor, StatusPagamento Status, FormaPagamento FormaPagamento, DateTimeOffset? VencimentoEm, DateTimeOffset? PagoEm, string? Observacao);
public sealed record PagamentosResumoResponse(decimal Recebido, decimal Pendente, decimal Reembolsado, int Quantidade);
public sealed record PagamentosListagemResponse(IReadOnlyCollection<PagamentoResponse> Itens, PagamentosResumoResponse Resumo, int Total, int Pagina, int TamanhoPagina);
public sealed class CriarPagamentoRequest
{
    public Guid PacienteId { get; init; }
    public Guid? ConsultaId { get; init; }
    [Range(typeof(decimal), "0.01", "999999.99", ParseLimitsInInvariantCulture = true)] public decimal Valor { get; init; }
    public FormaPagamento FormaPagamento { get; init; }
    public DateTimeOffset? VencimentoEm { get; init; }
    [StringLength(1000)] public string? Observacao { get; init; }
}
public sealed class AlterarStatusPagamentoRequest
{
    public StatusPagamento Status { get; init; }
    public DateTimeOffset? PagoEm { get; init; }
}
