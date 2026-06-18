using GestaoPsi.Api.DTOs.Autenticacao;

namespace GestaoPsi.Api.Services.Autenticacao;

public sealed record ResultadoAutenticacao(
    AutenticacaoResponse Resposta,
    string RefreshToken,
    DateTimeOffset RefreshTokenExpiraEm);
