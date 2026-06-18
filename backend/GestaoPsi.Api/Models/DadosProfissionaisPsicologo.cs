using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.Models;

public class DadosProfissionaisPsicologo : EntidadeDaConta
{
    public Guid Id { get; set; }
    public Guid UsuarioId { get; set; }
    public string Crp { get; set; } = string.Empty;
    public string CrpHash { get; set; } = string.Empty;
    public string NomeProfissional { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? EmailProfissional { get; set; }
    public string? TelefoneProfissional { get; set; }
    public StatusUsuario Status { get; set; } = StatusUsuario.Ativo;
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }

    public Usuario Usuario { get; set; } = null!;
}
