namespace GestaoPsi.Api.DTOs.Auditoria;
public sealed record LogAuditoriaResponse(Guid Id, DateTimeOffset CriadoEm, string TipoAcao, string Entidade, Guid? EntidadeId, string? Descricao, string? Ip, string? UserAgent, string? Usuario);
