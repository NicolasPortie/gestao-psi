using GestaoPsi.Api.DTOs.Documentos;
using GestaoPsi.Api.Shared.Paginacao;

namespace GestaoPsi.Api.Services.Documentos;

public interface IDocumentosService
{
    Task<ResultadoPaginado<DocumentoListaResponse>> ListarAsync(Guid usuarioId, Guid contaId, Guid? pacienteId, int pagina, int tamanhoPagina, CancellationToken ct);
    Task<DocumentoDetalheResponse> ObterAsync(Guid usuarioId, Guid contaId, Guid id, CancellationToken ct);
    Task<DocumentoDetalheResponse> CriarAsync(Guid usuarioId, Guid contaId, CriarDocumentoRequest request, string? ip, string? userAgent, CancellationToken ct);
    Task<DocumentoDetalheResponse> AtualizarAsync(Guid usuarioId, Guid contaId, Guid id, AtualizarDocumentoRequest request, string? ip, string? userAgent, CancellationToken ct);
    Task<DocumentoDetalheResponse> FinalizarAsync(Guid usuarioId, Guid contaId, Guid id, string? ip, string? userAgent, CancellationToken ct);
    Task<ProtocoloEntregaResponse> RegistrarEntregaAsync(Guid usuarioId, Guid contaId, Guid id, RegistrarEntregaDocumentoRequest request, string? ip, string? userAgent, CancellationToken ct);
}
