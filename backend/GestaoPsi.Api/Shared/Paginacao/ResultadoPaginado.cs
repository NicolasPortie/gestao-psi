namespace GestaoPsi.Api.Shared.Paginacao;

/// <summary>
/// Envelope padrao de listagem paginada server-side.
/// Segue o contrato estabelecido por Pacientes: itens da pagina atual,
/// total de registros do filtro, pagina atual e tamanho da pagina.
/// </summary>
public sealed record ResultadoPaginado<T>(
    IReadOnlyCollection<T> Itens,
    int Total,
    int Pagina,
    int TamanhoPagina);

/// <summary>
/// Normalizacao dos parametros de paginacao recebidos via query.
/// </summary>
public static class ParametrosPaginacao
{
    public const int PaginaPadrao = 1;
    public const int TamanhoPaginaPadrao = 20;
    public const int TamanhoPaginaMinimo = 5;
    public const int TamanhoPaginaMaximo = 100;

    public static (int Pagina, int TamanhoPagina) Normalizar(int pagina, int tamanhoPagina) =>
    (
        Math.Max(PaginaPadrao, pagina),
        Math.Clamp(tamanhoPagina, TamanhoPaginaMinimo, TamanhoPaginaMaximo)
    );
}
