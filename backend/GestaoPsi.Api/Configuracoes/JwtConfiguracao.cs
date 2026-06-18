namespace GestaoPsi.Api.Configuracoes;

public sealed class JwtConfiguracao
{
    public const string Secao = "Jwt";

    public string Emissor { get; set; } = string.Empty;
    public string Audiencia { get; set; } = string.Empty;
    public string Chave { get; set; } = string.Empty;
    public int DuracaoAccessTokenMinutos { get; set; } = 15;
    public int DuracaoRefreshTokenDias { get; set; } = 14;
}
