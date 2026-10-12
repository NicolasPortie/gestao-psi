using System.Net;
using System.Text;

namespace GestaoPsi.Api.Services.Relatorios;

public sealed class RelatorioHtmlRenderer(IHostEnvironment ambiente)
{
    private string? _layout;
    private string? _estilos;

    public string RenderLayout(IReadOnlyDictionary<string, string> tokens)
    {
        var layout = ObterLayout();
        var mapa = new Dictionary<string, string>(tokens, StringComparer.OrdinalIgnoreCase)
        {
            ["estilos"] = ObterEstilos()
        };
        return Substituir(layout, mapa, codificarValores: false);
    }

    public static string Codificar(string? valor) =>
        WebUtility.HtmlEncode(valor ?? string.Empty);

    public static string LinhaFiltro(string rotulo, string valor) =>
        $"<li><strong>{Codificar(rotulo)}:</strong> {Codificar(valor)}</li>";

    public static string Indicadores(params (string Rotulo, string Valor)[] itens)
    {
        if (itens.Length == 0)
            return string.Empty;

        var builder = new StringBuilder();
        builder.Append("<section class=\"indicadores\">");
        foreach (var (rotulo, valor) in itens)
        {
            builder.Append("<article class=\"indicador\">");
            builder.Append($"<div class=\"rotulo\">{Codificar(rotulo)}</div>");
            builder.Append($"<div class=\"valor\">{Codificar(valor)}</div>");
            builder.Append("</article>");
        }

        builder.Append("</section>");
        return builder.ToString();
    }

    public static string Tabela(IReadOnlyList<string> cabecalhos, IReadOnlyList<IReadOnlyList<string>> linhas)
    {
        if (linhas.Count == 0)
            return "<div class=\"vazio\">Nenhum registro no período selecionado.</div>";

        var builder = new StringBuilder();
        builder.Append("<div class=\"tabela-wrap\"><table><thead><tr>");
        foreach (var cabecalho in cabecalhos)
            builder.Append($"<th>{Codificar(cabecalho)}</th>");
        builder.Append("</tr></thead><tbody>");

        foreach (var linha in linhas)
        {
            builder.Append("<tr>");
            foreach (var celula in linha)
                builder.Append($"<td>{Codificar(celula)}</td>");
            builder.Append("</tr>");
        }

        builder.Append("</tbody></table></div>");
        return builder.ToString();
    }

    private string ObterLayout()
    {
        if (_layout is not null)
            return _layout;

        var caminho = Path.Combine(ObterDiretorioTemplates(), "_layout.html");
        _layout = File.ReadAllText(caminho, Encoding.UTF8);
        return _layout;
    }

    private string ObterEstilos()
    {
        if (_estilos is not null)
            return _estilos;

        var caminho = Path.Combine(ObterDiretorioTemplates(), "relatorio.css");
        _estilos = File.ReadAllText(caminho, Encoding.UTF8);
        return _estilos;
    }

    private string ObterDiretorioTemplates()
    {
        var candidatos = new[]
        {
            Path.Combine(AppContext.BaseDirectory, "Services", "Relatorios", "Templates"),
            Path.Combine(ambiente.ContentRootPath, "Services", "Relatorios", "Templates")
        };

        foreach (var caminho in candidatos)
        {
            if (Directory.Exists(caminho))
                return caminho;
        }

        throw new InvalidOperationException("Templates de relatório não encontrados.");
    }

    private static string Substituir(string template, IReadOnlyDictionary<string, string> tokens, bool codificarValores)
    {
        var resultado = template;
        foreach (var (chave, valor) in tokens)
        {
            var texto = codificarValores ? Codificar(valor) : valor ?? string.Empty;
            resultado = resultado.Replace("{{" + chave + "}}", texto, StringComparison.OrdinalIgnoreCase);
        }

        return resultado;
    }
}
