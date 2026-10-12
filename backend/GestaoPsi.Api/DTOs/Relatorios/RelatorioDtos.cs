using System.ComponentModel.DataAnnotations;

namespace GestaoPsi.Api.DTOs.Relatorios;

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
