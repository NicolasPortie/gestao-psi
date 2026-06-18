namespace GestaoPsi.Api.Models;

public class BloqueioAgenda : EntidadeDaConta
{
    public Guid Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public DateTimeOffset InicioEm { get; set; }
    public DateTimeOffset FimEm { get; set; }
    public bool DiaInteiro { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }
}
