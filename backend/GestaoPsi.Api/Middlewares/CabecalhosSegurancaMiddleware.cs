namespace GestaoPsi.Api.Middlewares;

/// <summary>
/// Cabeçalhos de defesa em profundidade para uma API que devolve dados de saúde:
/// nada de cache em navegadores ou intermediários e nenhuma página renderizável a partir da API.
/// </summary>
public sealed class CabecalhosSegurancaMiddleware(RequestDelegate proximo)
{
    public Task InvokeAsync(HttpContext contexto)
    {
        var cabecalhos = contexto.Response.Headers;
        cabecalhos["X-Content-Type-Options"] = "nosniff";
        cabecalhos["X-Frame-Options"] = "DENY";
        cabecalhos["Referrer-Policy"] = "no-referrer";
        cabecalhos["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'";
        cabecalhos["Cache-Control"] = "no-store";
        cabecalhos["Pragma"] = "no-cache";

        return proximo(contexto);
    }
}
