namespace GestaoPsi.Api.Configuracoes;

public sealed class SegurancaConfiguracao
{
    public const string Secao = "Seguranca";

    public string ChaveHashDados { get; set; } = string.Empty;
    public int MaximoTentativasLogin { get; set; } = 5;
    public int DuracaoBloqueioLoginMinutos { get; set; } = 15;
    public int MaximoSolicitacoesRecuperacao { get; set; } = 3;
    public int MaximoCadastrosPorHora { get; set; } = 5;
    public int DuracaoTokenRecuperacaoMinutos { get; set; } = 30;
    public string VersaoTermosUso { get; set; } = "1.0";
}
