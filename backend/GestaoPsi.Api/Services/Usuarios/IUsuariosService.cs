using GestaoPsi.Api.DTOs.Usuarios;

namespace GestaoPsi.Api.Services.Usuarios;

public interface IUsuariosService
{
    Task<IReadOnlyCollection<UsuarioResponse>> ListarAsync(Guid usuarioId, Guid contaId, CancellationToken ct);
    Task<UsuarioResponse> CriarAsync(Guid usuarioId, Guid contaId, CriarUsuarioRequest request, string? ip, string? userAgent, CancellationToken ct);
    Task<UsuarioResponse> AtualizarAsync(Guid usuarioId, Guid contaId, Guid id, AtualizarUsuarioRequest request, string? ip, string? userAgent, CancellationToken ct);
    Task<UsuarioResponse> AlterarPerfilAsync(Guid usuarioId, Guid contaId, Guid id, AlterarPerfilUsuarioRequest request, string? ip, string? userAgent, CancellationToken ct);
    Task RedefinirSenhaAsync(Guid usuarioId, Guid contaId, Guid id, RedefinirSenhaUsuarioRequest request, string? ip, string? userAgent, CancellationToken ct);
    Task<UsuarioResponse> AlterarStatusAsync(Guid usuarioId, Guid contaId, Guid id, AlterarStatusUsuarioRequest request, string? ip, string? userAgent, CancellationToken ct);
}
