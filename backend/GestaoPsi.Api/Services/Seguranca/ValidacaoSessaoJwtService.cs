using System.Security.Claims;
using GestaoPsi.Api.Shared.Excecoes;

namespace GestaoPsi.Api.Services.Seguranca;

public sealed class ValidacaoSessaoJwtService(IAutorizacaoContaService autorizacao)
{
    public const string ClaimPermissao = "permissao";

    public async Task<bool> ValidarAsync(ClaimsPrincipal principal, CancellationToken ct)
    {
        if (!Guid.TryParse(principal.FindFirstValue(ClaimTypes.NameIdentifier), out var usuarioId) ||
            !Guid.TryParse(principal.FindFirstValue("conta_psicologo_id"), out var contaId) ||
            !int.TryParse(principal.FindFirstValue("versao_autenticacao"), out var versao))
            return false;

        try
        {
            var usuario = await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
            if (usuario.VersaoAutenticacao != versao ||
                principal.FindFirstValue(ClaimTypes.Role) != usuario.Perfil.ToString())
                return false;

            // As permissões são lidas do banco a cada requisição: mudar o perfil de alguém vale já na próxima ação.
            principal.AddIdentity(new ClaimsIdentity(
                PermissoesEfetivas.Para(usuario).Select(permissao => new Claim(ClaimPermissao, permissao.ToString())),
                "permissoes"));
            return true;
        }
        catch (RegraNegocioException)
        {
            return false;
        }
    }
}
