using GestaoPsi.Api.DTOs.Notificacoes;
using GestaoPsi.Api.Shared.Paginacao;

namespace GestaoPsi.Api.Services.Notificacoes;

public interface INotificacoesService
{
    Task<ResultadoPaginado<NotificacaoResponse>> ListarAsync(
        Guid usuarioId,
        Guid contaId,
        FiltroNotificacaoRequest filtro,
        CancellationToken cancellationToken);

    Task<int> ContarNaoLidasAsync(Guid usuarioId, Guid contaId, CancellationToken cancellationToken);

    Task<NotificacaoResponse> MarcarComoLidaAsync(
        Guid usuarioId,
        Guid contaId,
        Guid id,
        CancellationToken cancellationToken);

    Task<int> MarcarTodasComoLidasAsync(Guid usuarioId, Guid contaId, CancellationToken cancellationToken);

    Task CriarAsync(
        Guid contaId,
        Guid usuarioId,
        string titulo,
        string mensagem,
        string tipo,
        CancellationToken cancellationToken);
}
