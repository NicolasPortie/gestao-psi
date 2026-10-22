using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace Psique.Api.Shared.Texto;

/// <summary>
/// Normalização de texto livre para comparação: minúsculas, sem acentos e com espaços colapsados.
/// Termos de busca e listas de palavras sensíveis devem ser escritos já normalizados (sem acento).
/// </summary>
public static partial class TextoNormalizado
{
    public static string ParaComparacao(string? valor)
    {
        if (string.IsNullOrWhiteSpace(valor)) return string.Empty;

        var semAcentos = new string(valor
            .Trim()
            .ToLowerInvariant()
            .Normalize(NormalizationForm.FormD)
            .Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
            .ToArray());

        return EspacosRegex().Replace(semAcentos.Normalize(NormalizationForm.FormC), " ");
    }

    /// <summary>Indica se o texto contém algum dos termos, ignorando caixa e acentuação.</summary>
    public static bool ContemAlgum(string? texto, IEnumerable<string> termosNormalizados)
    {
        var normalizado = ParaComparacao(texto);
        return termosNormalizados.Any(termo => normalizado.Contains(termo, StringComparison.Ordinal));
    }

    [GeneratedRegex(@"\s+")]
    private static partial Regex EspacosRegex();
}
