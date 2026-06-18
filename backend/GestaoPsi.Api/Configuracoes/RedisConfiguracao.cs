namespace GestaoPsi.Api.Configuracoes;

public sealed class RedisConfiguracao
{
    public const string Secao = "Redis";

    public string Prefixo { get; set; } = "GestaoPsi:";
}
