using Psique.Api.DTOs.Autenticacao;

namespace Psique.Api.Services.Autenticacao;

public sealed record ResultadoAutenticacao(
    AutenticacaoResponse Resposta,
    string RefreshToken,
    DateTimeOffset RefreshTokenExpiraEm);
