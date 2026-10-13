namespace GestaoPsi.Api.Configuracoes;

public sealed class EmailConfiguracao
{
    public const string Secao = "Email";

    public bool Ativo { get; set; }
    public string ServidorSmtp { get; set; } = string.Empty;
    public int Porta { get; set; } = 587;
    public bool UsarSsl { get; set; }
    public string Usuario { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
    public string EmailRemetente { get; set; } = string.Empty;
    public string NomeRemetente { get; set; } = "Vínculo";
    public string UrlFrontend { get; set; } = "http://localhost:4200";
}
