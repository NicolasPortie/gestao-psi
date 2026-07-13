using System.ComponentModel.DataAnnotations;
using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.DTOs.Sessoes;

public sealed record RegistroSessaoResponse(Guid Id, Guid ConsultaId, Guid PacienteId, DateTimeOffset DataSessao, StatusRegistroSessao Status, string? ObservacoesClinicas, string? Evolucao, string? Encaminhamentos, DateTimeOffset? ProximaSessaoSugeridaEm);
public sealed class CriarRegistroSessaoRequest
{
    public Guid ConsultaId { get; init; }
    [StringLength(8000)] public string? ObservacoesClinicas { get; init; }
    [StringLength(8000)] public string? Evolucao { get; init; }
    [StringLength(4000)] public string? Encaminhamentos { get; init; }
    public DateTimeOffset? ProximaSessaoSugeridaEm { get; init; }
}
public sealed record EvolucaoProntuarioResponse(Guid Id, Guid ProntuarioId, Guid PacienteId, TipoEvolucaoProntuario Tipo, string Conteudo, DateTimeOffset DataEvolucao);
public sealed class CriarEvolucaoProntuarioRequest
{
    public Guid PacienteId { get; init; }
    public Guid? RegistroSessaoId { get; init; }
    public TipoEvolucaoProntuario Tipo { get; init; }
    [Required, StringLength(8000, MinimumLength = 1)] public string Conteudo { get; init; } = string.Empty;
    public DateTimeOffset DataEvolucao { get; init; }
}
