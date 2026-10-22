using Psique.Api.DTOs.PerfisAcesso;

namespace Psique.Api.Services.PerfisAcesso;

public interface IPerfisAcessoService
{
    IReadOnlyCollection<PermissaoCatalogoResponse> ListarPermissoes();
    Task<IReadOnlyCollection<PerfilAcessoResponse>> ListarAsync(Guid usuarioId, Guid contaId, CancellationToken ct);
    Task<PerfilAcessoResponse> CriarAsync(Guid usuarioId, Guid contaId, SalvarPerfilAcessoRequest request, string? ip, string? userAgent, CancellationToken ct);
    Task<PerfilAcessoResponse> AtualizarAsync(Guid usuarioId, Guid contaId, Guid id, SalvarPerfilAcessoRequest request, string? ip, string? userAgent, CancellationToken ct);
    Task RemoverAsync(Guid usuarioId, Guid contaId, Guid id, string? ip, string? userAgent, CancellationToken ct);
}
