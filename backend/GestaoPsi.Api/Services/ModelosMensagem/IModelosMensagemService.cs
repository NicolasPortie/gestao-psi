using GestaoPsi.Api.DTOs.ModelosMensagem;

namespace GestaoPsi.Api.Services.ModelosMensagem;

public interface IModelosMensagemService
{
    Task<IReadOnlyCollection<ModeloMensagemResponse>> ListarAsync(
        Guid usuarioId,
        Guid contaId,
        FiltroModeloMensagemRequest filtro,
        CancellationToken cancellationToken);

    Task<ModeloMensagemResponse> ObterAsync(
        Guid usuarioId,
        Guid contaId,
        Guid id,
        CancellationToken cancellationToken);

    Task<IReadOnlyCollection<VariavelModeloMensagemResponse>> ListarVariaveisAsync(
        Guid usuarioId,
        Guid contaId,
        CancellationToken cancellationToken);

    Task<ModeloMensagemResponse> CriarAsync(
        Guid usuarioId,
        Guid contaId,
        CriarModeloMensagemRequest request,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken);

    Task<ModeloMensagemResponse> AtualizarAsync(
        Guid usuarioId,
        Guid contaId,
        Guid id,
        AtualizarModeloMensagemRequest request,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken);

    Task<ModeloMensagemResponse> AlterarAtivoAsync(
        Guid usuarioId,
        Guid contaId,
        Guid id,
        AlterarAtivoModeloMensagemRequest request,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken);

    Task<PreviaModeloMensagemResponse> PreviaAsync(
        Guid usuarioId,
        Guid contaId,
        PreviaModeloMensagemRequest request,
        CancellationToken cancellationToken);
}
