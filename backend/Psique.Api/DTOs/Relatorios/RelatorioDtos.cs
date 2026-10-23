using System.ComponentModel.DataAnnotations;

namespace Psique.Api.DTOs.Relatorios;

public sealed record RelatorioCatalogoItemResponse(
    string Codigo,
    string Nome,
    string Descricao,
    bool ExigePaciente);

public sealed record RelatorioGeradoResponse(
    string Codigo,
    string Titulo,
    string Html,
    DateTimeOffset GeradoEm,
    DateTimeOffset PeriodoInicio,
    DateTimeOffset PeriodoFim);

public sealed class GerarRelatorioRequest
{
    public DateTimeOffset PeriodoInicio { get; init; }
    public DateTimeOffset PeriodoFim { get; init; }
    public Guid? PacienteId { get; init; }

    [StringLength(40)]
    public string? Status { get; init; }
}

/// <summary>
/// O mês num relance, calculado no fuso da conta. Campos de agenda ficam nulos sem a permissão Agenda;
/// os de dinheiro, sem a permissão Financeiro.
/// </summary>
public sealed record MesEmNumerosResponse(
    int Ano,
    int Mes,
    int? SessoesRealizadas,
    int? PacientesAtendidos,
    int? Faltas,
    int? PercentualFaltas,
    int? Cancelamentos,
    decimal? Recebido,
    decimal? AReceber,
    decimal? Vencido);
