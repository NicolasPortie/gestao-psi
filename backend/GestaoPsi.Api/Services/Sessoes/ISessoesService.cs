using GestaoPsi.Api.DTOs.Sessoes;
using GestaoPsi.Api.Shared.Paginacao;

namespace GestaoPsi.Api.Services.Sessoes;

public interface ISessoesService
{
    Task<RegistroSessaoResponse> CriarAsync(Guid usuarioId, Guid contaId, CriarRegistroSessaoRequest request, string? ip, string? userAgent, CancellationToken ct);
    Task<ResultadoPaginado<EvolucaoProntuarioResponse>> ListarEvolucoesAsync(Guid usuarioId, Guid contaId, Guid pacienteId, int pagina, int tamanhoPagina, CancellationToken ct);
    Task<EvolucaoProntuarioResponse> CriarEvolucaoAsync(Guid usuarioId, Guid contaId, CriarEvolucaoProntuarioRequest request, string? ip, string? userAgent, CancellationToken ct);
}
