using System.Text;
using System.Text.RegularExpressions;
using GestaoPsi.Api.Shared.Excecoes;

namespace GestaoPsi.Api.Services.Comunicacao;

public sealed partial class ModeloMensagemTemplateService : IModeloMensagemTemplateService
{
    public IReadOnlyCollection<(string Chave, string Descricao)> ListarVariaveisPermitidas() =>
        VariaveisModeloMensagem.Catalogo
            .Select(item => (item.Key, item.Value))
            .OrderBy(item => item.Key, StringComparer.OrdinalIgnoreCase)
            .ToArray();

    public void ValidarConteudo(string? conteudo, string? assunto = null)
    {
        if (string.IsNullOrWhiteSpace(conteudo))
            throw new RegraNegocioException("O conteúdo do modelo é obrigatório.");

        ValidarTexto(conteudo, "conteúdo");
        if (!string.IsNullOrWhiteSpace(assunto))
            ValidarTexto(assunto, "assunto");
    }

    public string Renderizar(string template, IReadOnlyDictionary<string, string?> valores)
    {
        ArgumentNullException.ThrowIfNull(template);
        ArgumentNullException.ThrowIfNull(valores);
        ValidarTexto(template, "conteúdo");
        return Substituir(template, valores);
    }

    public string RenderizarAssunto(string? assunto, IReadOnlyDictionary<string, string?> valores)
    {
        ArgumentNullException.ThrowIfNull(valores);
        if (string.IsNullOrWhiteSpace(assunto))
            return string.Empty;

        ValidarTexto(assunto, "assunto");
        return Substituir(assunto, valores);
    }

    private static void ValidarTexto(string texto, string campo)
    {
        var desconhecidas = ExtrairChaves(texto)
            .Where(chave => !VariaveisModeloMensagem.Catalogo.ContainsKey(chave))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(chave => chave, StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (desconhecidas.Length > 0)
        {
            throw new RegraNegocioException(
                $"O {campo} contém variáveis não permitidas: {string.Join(", ", desconhecidas.Select(chave => $"{{{{{chave}}}}}"))}.");
        }
    }

    private static string Substituir(string template, IReadOnlyDictionary<string, string?> valores)
    {
        var mapa = new Dictionary<string, string?>(valores, StringComparer.OrdinalIgnoreCase);

        return VariavelRegex().Replace(template, match =>
        {
            var chave = match.Groups["chave"].Value;
            if (!mapa.TryGetValue(chave, out var valor) || string.IsNullOrWhiteSpace(valor))
                return string.Empty;

            return CodificarValorAdministrativo(valor);
        });
    }

    /// <summary>
    /// Codifica valores administrativos para texto puro: remove controles e normaliza espaços.
    /// Não interpreta HTML do valor e não expõe dados clínicos.
    /// </summary>
    private static string CodificarValorAdministrativo(string valor)
    {
        var limpo = valor.Trim();
        var builder = new StringBuilder(limpo.Length);
        foreach (var caractere in limpo)
        {
            if (caractere is '\r' or '\n' or '\t')
            {
                builder.Append(caractere);
                continue;
            }

            if (char.IsControl(caractere))
                continue;

            builder.Append(caractere);
        }

        return builder.ToString();
    }

    private static IEnumerable<string> ExtrairChaves(string texto) =>
        VariavelRegex().Matches(texto).Select(match => match.Groups["chave"].Value);

    [GeneratedRegex(@"\{\{\s*(?<chave>[a-zA-Z0-9_]+)\s*\}\}", RegexOptions.CultureInvariant)]
    private static partial Regex VariavelRegex();
}
