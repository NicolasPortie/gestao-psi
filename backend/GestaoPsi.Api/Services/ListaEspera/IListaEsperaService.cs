using GestaoPsi.Api.DTOs.ListaEspera;

namespace GestaoPsi.Api.Services.ListaEspera;

public interface IListaEsperaService
{
    Task<IReadOnlyCollection<ListaEsperaResponse>> ListarAsync(Guid usuarioId, Guid contaId, FiltroListaEsperaRequest filtro, CancellationToken cancellationToken);
    Task<ListaEsperaResponse> CriarAsync(Guid usuarioId, Guid contaId, CriarListaEsperaRequest request, string? ip, string? userAgent, CancellationToken cancellationToken);
    Task<ListaEsperaResponse> AlterarStatusAsync(Guid usuarioId, Guid contaId, Guid id, AlterarStatusListaEsperaRequest request, string? ip, string? userAgent, CancellationToken cancellationToken);
}
