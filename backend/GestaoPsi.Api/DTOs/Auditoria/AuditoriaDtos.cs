namespace GestaoPsi.Api.DTOs.Auditoria;
public sealed record LogAuditoriaResponse(Guid Id, DateTimeOffset CriadoEm, string TipoAcao, string Entidade, Guid? EntidadeId, string? Descricao, string? Ip, string? UserAgent, string? Usuario);

public sealed record LogAuditoriaDetalheResponse(
    Guid Id,
    DateTimeOffset CriadoEm,
    string TipoAcao,
    string Entidade,
    Guid? EntidadeId,
    string? Descricao,
    string? Ip,
    string? UserAgent,
    string? Usuario,
    string? DadosAntesJson,
    string? DadosDepoisJson);

public sealed class FiltroAuditoriaRequest
{
    public string? TipoAcao { get; init; }
    public string? Entidade { get; init; }
    public Guid? UsuarioId { get; init; }
    /// <summary>Inclui os eventos gerados pelo funcionamento do WhatsApp (uma linha por mensagem recebida).</summary>
    public bool IncluirTecnicos { get; init; }
    public DateTimeOffset? De { get; init; }
    public DateTimeOffset? Ate { get; init; }
    public int Pagina { get; init; } = 1;
    public int TamanhoPagina { get; init; } = 20;
}
