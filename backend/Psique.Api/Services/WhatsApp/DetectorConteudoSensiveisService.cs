using Psique.Api.Shared.Texto;

namespace Psique.Api.Services.WhatsApp;

/// <summary>
/// Detecta sinais de conteúdo sensível para encaminhar a humano.
/// Não interpreta clinicamente; apenas aciona salvaguarda administrativa.
/// </summary>
public sealed class DetectorConteudoSensiveisService
{
    private static readonly string[] ExpressoesSensiveis =
    [
        "suicidio", "me matar", "quero morrer", "autolesao",
        "abuso sexual", "violencia domestica", "estupro",
        "diagnostico", "crise de panico",
        "ideacao", "nao quero viver"
    ];

    public bool RequerAtendimentoHumano(string? conteudo, out string? motivo)
    {
        motivo = null;
        if (string.IsNullOrWhiteSpace(conteudo))
            return false;

        var normalizado = Normalizar(conteudo);
        foreach (var expressao in ExpressoesSensiveis)
        {
            if (normalizado.Contains(expressao, StringComparison.Ordinal))
            {
                motivo = "A mensagem pode tratar de um assunto delicado.";
                return true;
            }
        }

        return false;
    }

    private static string Normalizar(string valor) => TextoNormalizado.ParaComparacao(valor);
}
