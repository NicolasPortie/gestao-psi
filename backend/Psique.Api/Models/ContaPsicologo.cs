using Psique.Api.Data.Cifra;
using Psique.Api.Shared.Enums;

namespace Psique.Api.Models;

public class ContaPsicologo
{
    public Guid Id { get; set; }
    [Cifrado]
    public string NomeConta { get; set; } = string.Empty;
    public StatusContaPsicologo Status { get; set; } = StatusContaPsicologo.Ativa;
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }
    public DateTimeOffset? PerfilProfissionalAdiadoEm { get; set; }
}
