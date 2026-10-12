using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Globalization;
using GestaoPsi.Api.Configuracoes;
using GestaoPsi.Api.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace GestaoPsi.Api.Services.Autenticacao;

public sealed class TokenService(IOptions<JwtConfiguracao> configuracao) : ITokenService
{
    private readonly JwtConfiguracao _configuracao = configuracao.Value;

    public TokenGerado GerarAccessToken(Usuario usuario)
    {
        var agora = DateTimeOffset.UtcNow;
        var expiracao = agora.AddMinutes(_configuracao.DuracaoAccessTokenMinutos);
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, usuario.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("conta_psicologo_id", usuario.ContaPsicologoId.ToString()),
            new Claim("versao_autenticacao", usuario.VersaoAutenticacao.ToString(CultureInfo.InvariantCulture)),
            new Claim(ClaimTypes.Role, usuario.Perfil.ToString())
        };

        var credenciais = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuracao.Chave)),
            SecurityAlgorithms.HmacSha256);

        var jwt = new JwtSecurityToken(
            issuer: _configuracao.Emissor,
            audience: _configuracao.Audiencia,
            claims: claims,
            notBefore: agora.UtcDateTime,
            expires: expiracao.UtcDateTime,
            signingCredentials: credenciais);

        return new TokenGerado(
            new JwtSecurityTokenHandler().WriteToken(jwt),
            expiracao);
    }
}
