using Psique.Api.DTOs.ListaEspera;
using Psique.Api.Shared.Paginacao;

namespace Psique.Api.Services.ListaEspera;

public interface IListaEsperaService
{
    Task<ResultadoPaginado<ListaEsperaResponse>> ListarAsync(Guid usuarioId, Guid contaId, FiltroListaEsperaRequest filtro, CancellationToken cancellationToken);
    Task<ListaEsperaResponse> CriarAsync(Guid usuarioId, Guid contaId, CriarListaEsperaRequest request, string? ip, string? userAgent, CancellationToken cancellationToken);
    Task<ListaEsperaResponse> AlterarStatusAsync(Guid usuarioId, Guid contaId, Guid id, AlterarStatusListaEsperaRequest request, string? ip, string? userAgent, CancellationToken cancellationToken);
}
