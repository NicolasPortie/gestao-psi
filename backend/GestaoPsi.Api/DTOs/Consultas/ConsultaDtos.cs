using System.ComponentModel.DataAnnotations;
using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.DTOs.Consultas;

public sealed record ConsultaResponse(Guid Id, Guid PacienteId, string Paciente, Guid TipoAtendimentoId, string TipoAtendimento, DateTimeOffset InicioEm, DateTimeOffset FimEm, StatusConsulta Status, ModalidadeAtendimento Modalidade, string? LinkOnline, string? EnderecoAtendimento, string? ObservacaoAdministrativa);

public sealed class CriarConsultaRequest
{
    public Guid PacienteId { get; init; }
    public Guid TipoAtendimentoId { get; init; }
    public Guid? ListaEsperaId { get; init; }
    public DateTimeOffset InicioEm { get; init; }
    public DateTimeOffset FimEm { get; init; }
    public ModalidadeAtendimento Modalidade { get; init; }
    [Url, StringLength(500)] public string? LinkOnline { get; init; }
    [StringLength(500)] public string? EnderecoAtendimento { get; init; }
    [StringLength(2000)] public string? ObservacaoAdministrativa { get; init; }
}

public sealed class AlterarStatusConsultaRequest
{
    public StatusConsulta Status { get; init; }
    [StringLength(1000)] public string? Justificativa { get; init; }
}
