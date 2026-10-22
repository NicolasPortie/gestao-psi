namespace Psique.Api.Models;

/// <summary>Perfil criado pela própria conta: um nome e o conjunto de permissões administrativas que ele concede.</summary>
public class PerfilAcesso : EntidadeDaConta
{
    public Guid Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }

    /// <summary>Nomes de <see cref="Shared.Enums.PermissaoAcesso"/> separados por vírgula.</summary>
    public string Permissoes { get; set; } = string.Empty;

    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }

    public ICollection<Usuario> Usuarios { get; set; } = [];
}
