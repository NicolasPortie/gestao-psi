using System.Security.Claims;
using GestaoPsi.Api.Shared.Excecoes;

namespace GestaoPsi.Api.Services.Seguranca;

public sealed class ValidacaoSessaoJwtService(IAutorizacaoContaService autorizacao)
{
    public async Task<bool> ValidarAsync(ClaimsPrincipal principal, CancellationToken ct)
    {
        if (!Guid.TryParse(principal.FindFirstValue(ClaimTypes.NameIdentifier), out var usuarioId) ||
            !Guid.TryParse(principal.FindFirstValue("conta_psicologo_id"), out var contaId) ||
            !int.TryParse(principal.FindFirstValue("versao_autenticacao"), out var versao))
            return false;

        try
        {
            var usuario = await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
            return usuario.VersaoAutenticacao == versao &&
                principal.FindFirstValue(ClaimTypes.Role) == usuario.Perfil.ToString();
        }
        catch (RegraNegocioException)
        {
            return false;
        }
    }
}
