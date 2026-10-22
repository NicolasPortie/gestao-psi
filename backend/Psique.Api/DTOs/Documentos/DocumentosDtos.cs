using System.ComponentModel.DataAnnotations;
using Psique.Api.Shared.Enums;

namespace Psique.Api.DTOs.Documentos;

public sealed record DocumentoListaResponse(Guid Id, Guid PacienteId, string Paciente, TipoDocumentoPsicologico Tipo, StatusDocumentoProntuario Status, string Titulo, string? Finalidade, DateTimeOffset CriadoEm, DateTimeOffset? FinalizadoEm);
public sealed record DocumentoDetalheResponse(Guid Id, Guid PacienteId, string Paciente, TipoDocumentoPsicologico Tipo, StatusDocumentoProntuario Status, string Titulo, string? Finalidade, string? Solicitante, string Conteudo, DateTimeOffset CriadoEm, DateTimeOffset? FinalizadoEm, IReadOnlyCollection<VersaoDocumentoResponse> Versoes, IReadOnlyCollection<ProtocoloEntregaResponse> Entregas);
public sealed record VersaoDocumentoResponse(Guid Id, int NumeroVersao, string? MotivoAlteracao, DateTimeOffset CriadoEm);
public sealed record ProtocoloEntregaResponse(Guid Id, TipoEntregaDocumento TipoEntrega, StatusEntregaDocumento Status, string? Destinatario, DateTimeOffset EntregueEm);

public sealed class CriarDocumentoRequest
{
    public Guid PacienteId { get; init; }
    public TipoDocumentoPsicologico Tipo { get; init; }
    [Required, StringLength(180)] public string Titulo { get; init; } = string.Empty;
    [StringLength(1000)] public string? Finalidade { get; init; }
    [StringLength(180)] public string? Solicitante { get; init; }
    [Required, StringLength(10000)] public string Conteudo { get; init; } = string.Empty;
}

public sealed class AtualizarDocumentoRequest
{
    [Required, StringLength(180)] public string Titulo { get; init; } = string.Empty;
    [StringLength(1000)] public string? Finalidade { get; init; }
    [StringLength(180)] public string? Solicitante { get; init; }
    [Required, StringLength(10000)] public string Conteudo { get; init; } = string.Empty;
    [StringLength(1000)] public string? MotivoAlteracao { get; init; }
}

public sealed class RegistrarEntregaDocumentoRequest
{
    public TipoEntregaDocumento TipoEntrega { get; init; }
    [StringLength(180)] public string? Destinatario { get; init; }
    [StringLength(1000)] public string? Observacao { get; init; }
    public DateTimeOffset? EntregueEm { get; init; }
}
