using Psique.Api.DTOs.Sessoes;
using Psique.Api.Shared.Paginacao;

namespace Psique.Api.Services.Sessoes;

public interface ISessoesService
{
    Task<RegistroSessaoResponse> CriarAsync(Guid usuarioId, Guid contaId, CriarRegistroSessaoRequest request, string? ip, string? userAgent, CancellationToken ct);
    Task<ResultadoPaginado<EvolucaoProntuarioResponse>> ListarEvolucoesAsync(Guid usuarioId, Guid contaId, Guid pacienteId, int pagina, int tamanhoPagina, CancellationToken ct);
    Task<ResultadoPaginado<RegistroSessaoResponse>> ListarRegistrosAsync(Guid usuarioId, Guid contaId, Guid pacienteId, int pagina, int tamanhoPagina, CancellationToken ct);
    Task<EvolucaoProntuarioResponse> CriarEvolucaoAsync(Guid usuarioId, Guid contaId, CriarEvolucaoProntuarioRequest request, string? ip, string? userAgent, CancellationToken ct);
}
