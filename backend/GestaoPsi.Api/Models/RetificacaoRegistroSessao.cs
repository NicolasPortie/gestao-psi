namespace GestaoPsi.Api.Models;

public class RetificacaoRegistroSessao
{
    public Guid Id { get; set; }
    public Guid RegistroSessaoId { get; set; }
    public Guid UsuarioId { get; set; }
    public string CampoAlterado { get; set; } = string.Empty;
    public string? ValorAnterior { get; set; }
    public string? ValorNovo { get; set; }
    public string? Motivo { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;

    public RegistroSessao RegistroSessao { get; set; } = null!;
    public Usuario Usuario { get; set; } = null!;
}
