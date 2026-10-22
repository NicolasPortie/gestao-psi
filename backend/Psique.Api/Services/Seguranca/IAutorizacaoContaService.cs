using Psique.Api.Models;

namespace Psique.Api.Services.Seguranca;

public interface IAutorizacaoContaService
{
    Task<Usuario> ObterUsuarioAtivoAsync(
        Guid usuarioId,
        Guid contaPsicologoId,
        CancellationToken cancellationToken);
}
