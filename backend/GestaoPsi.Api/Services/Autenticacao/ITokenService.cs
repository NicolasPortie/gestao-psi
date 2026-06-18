using GestaoPsi.Api.Models;

namespace GestaoPsi.Api.Services.Autenticacao;

public interface ITokenService
{
    TokenGerado GerarAccessToken(Usuario usuario);
}

public sealed record TokenGerado(string Token, DateTimeOffset ExpiraEm);
