using GestaoPsi.Api.Models;

namespace GestaoPsi.Api.Services.Seguranca;

public interface IAutorizacaoContaService
{
    Task<Usuario> ObterUsuarioAtivoAsync(
        Guid usuarioId,
        Guid contaPsicologoId,
        CancellationToken cancellationToken);
}
