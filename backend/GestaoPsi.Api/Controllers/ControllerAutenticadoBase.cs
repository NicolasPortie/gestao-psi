using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using GestaoPsi.Api.Shared.Excecoes;
using Microsoft.AspNetCore.Mvc;

namespace GestaoPsi.Api.Controllers;

public abstract class ControllerAutenticadoBase : ControllerBase
{
    protected Guid ObterUsuarioId() =>
        ObterGuidClaim(JwtRegisteredClaimNames.Sub, ClaimTypes.NameIdentifier);

    protected Guid ObterContaPsicologoId() => ObterGuidClaim("conta_psicologo_id");

    private Guid ObterGuidClaim(params string[] tipos)
    {
        var valor = tipos
            .Select(tipo => User.FindFirstValue(tipo))
            .FirstOrDefault(item => !string.IsNullOrWhiteSpace(item));

        if (!Guid.TryParse(valor, out var id))
        {
            throw new RegraNegocioException(
                "Sessao invalida ou expirada.",
                StatusCodes.Status401Unauthorized);
        }

        return id;
    }
}
