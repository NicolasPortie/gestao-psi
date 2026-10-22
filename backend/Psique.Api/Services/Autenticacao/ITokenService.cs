using Psique.Api.Models;

namespace Psique.Api.Services.Autenticacao;

public interface ITokenService
{
    TokenGerado GerarAccessToken(Usuario usuario);
}

public sealed record TokenGerado(string Token, DateTimeOffset ExpiraEm);
