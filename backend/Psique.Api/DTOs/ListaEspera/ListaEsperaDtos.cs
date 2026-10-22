using System.ComponentModel.DataAnnotations;
using Psique.Api.Shared.Enums;

namespace Psique.Api.DTOs.ListaEspera;

public sealed record ListaEsperaResponse(
    Guid Id,
    Guid PacienteId,
    string Paciente,
    Guid? TipoAtendimentoId,
    string? TipoAtendimento,
    DiaSemana? PreferenciaDiaSemana,
    TimeOnly? PreferenciaHorarioInicio,
    TimeOnly? PreferenciaHorarioFim,
    int Prioridade,
    StatusListaEspera Status,
    OrigemConsulta Origem,
    string? ObservacaoAdministrativa,
    DateTimeOffset CriadoEm,
    DateTimeOffset? AtualizadoEm);

public sealed class FiltroListaEsperaRequest
{
    public StatusListaEspera? Status { get; init; }
    public Guid? TipoAtendimentoId { get; init; }
    [Range(1, 3)] public int? Prioridade { get; init; }
    public OrigemConsulta? Origem { get; init; }
    public int Pagina { get; init; } = 1;
    public int TamanhoPagina { get; init; } = 20;
}

public sealed class CriarListaEsperaRequest
{
    public Guid PacienteId { get; init; }
    public Guid? TipoAtendimentoId { get; init; }
    public DiaSemana? PreferenciaDiaSemana { get; init; }
    public TimeOnly? PreferenciaHorarioInicio { get; init; }
    public TimeOnly? PreferenciaHorarioFim { get; init; }
    [Range(1, 3)] public int Prioridade { get; init; } = 2;
    [StringLength(1000)] public string? ObservacaoAdministrativa { get; init; }
}

public sealed class AlterarStatusListaEsperaRequest
{
    public StatusListaEspera Status { get; init; }
}
