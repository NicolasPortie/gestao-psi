using Psique.Api.Shared.Enums;

namespace Psique.Api.Models;

public class RegraDocumentoPsicologico
{
    public Guid Id { get; set; }
    public TipoDocumentoPsicologico Tipo { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public string RegraJson { get; set; } = string.Empty;
    public bool Obrigatoria { get; set; } = true;
    public bool Ativa { get; set; } = true;
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }
}
