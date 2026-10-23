using System.ComponentModel.DataAnnotations;
using Psique.Api.Shared.Enums;

namespace Psique.Api.DTOs.Pagamentos;

/// <summary><c>Vencido</c>: ainda em aberto e com vencimento anterior a hoje. Decidido aqui, com a mesma regra do resumo.</summary>
public sealed record PagamentoResponse(Guid Id, Guid PacienteId, string Paciente, Guid? ConsultaId, decimal Valor, StatusPagamento Status, FormaPagamento FormaPagamento, DateTimeOffset? VencimentoEm, DateTimeOffset? PagoEm, string? Observacao, DateTimeOffset? SessaoEm = null, DateOnly? Competencia = null, bool Vencido = false);
/// <summary>Totais do recorte filtrado (paciente, período e busca); <c>Vencido</c> é a parte do pendente com vencimento anterior a hoje.</summary>
public sealed record PagamentosResumoResponse(decimal Recebido, decimal Pendente, decimal Reembolsado, int Quantidade, decimal Vencido = 0);
public sealed record PagamentosListagemResponse(IReadOnlyCollection<PagamentoResponse> Itens, PagamentosResumoResponse Resumo, int Total, int Pagina, int TamanhoPagina);

/// <summary>Filtros da listagem. Período pelo vencimento (ou pagamento, quando pago).</summary>
public sealed record ListarPagamentosFiltro(
    StatusPagamento? Status,
    Guid? PacienteId,
    DateOnly? De,
    DateOnly? Ate,
    string? Busca,
    bool SomenteVencidos);

public sealed record ReciboResponse(
    Guid Id,
    string Numero,
    decimal Valor,
    DateTimeOffset PagoEm,
    FormaPagamento FormaPagamento,
    string Paciente,
    string? PacienteCpf,
    DateTimeOffset? SessaoEm,
    string? TipoAtendimento,
    string Profissional,
    string? Crp,
    string? EmailProfissional,
    string? TelefoneProfissional);

public sealed class GerarMensalidadesRequest
{
    [Range(2020, 2100)] public int Ano { get; init; }
    [Range(1, 12)] public int Mes { get; init; }
    [Range(1, 28)] public int DiaVencimento { get; init; } = 10;
}

public sealed record GerarMensalidadesResponse(int Criadas, int JaExistiam, IReadOnlyCollection<string> SemValor);

/// <summary>Recebimentos do período para o contador ou o Carnê-Leão: CPF do pagador incluso, por isso auditado.</summary>
public sealed record RecebimentoExportadoResponse(DateTimeOffset PagoEm, string Paciente, string? PacienteCpf, decimal Valor, FormaPagamento FormaPagamento, string Referencia);

public sealed record ReciboMensalItemResponse(DateTimeOffset PagoEm, string Referencia, decimal Valor, FormaPagamento FormaPagamento);

public sealed record ReciboMensalResponse(
    string Paciente,
    string? PacienteCpf,
    int Ano,
    int Mes,
    IReadOnlyCollection<ReciboMensalItemResponse> Itens,
    decimal Total,
    string Profissional,
    string? Crp,
    string? EmailProfissional,
    string? TelefoneProfissional);

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
    /// <summary>Forma usada no recebimento; quando nula, mantém a registrada.</summary>
    public FormaPagamento? FormaPagamento { get; init; }
}
