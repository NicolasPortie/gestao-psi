namespace Psique.Api.DTOs.Notificacoes;

public sealed record NotificacaoResponse(
    Guid Id,
    string Titulo,
    string Mensagem,
    string Tipo,
    bool Lida,
    DateTimeOffset? LidaEm,
    DateTimeOffset CriadoEm,
    string? UrlOrigem);

public sealed class FiltroNotificacaoRequest
{
    public bool? Lida { get; init; }
    public string? Tipo { get; init; }
    public int Pagina { get; init; } = 1;
    public int TamanhoPagina { get; init; } = 20;
}
