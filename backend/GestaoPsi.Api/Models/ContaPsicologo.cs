using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.Models;

public class ContaPsicologo
{
    public Guid Id { get; set; }
    public string NomeConta { get; set; } = string.Empty;
    public StatusContaPsicologo Status { get; set; } = StatusContaPsicologo.Ativa;
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }
}
