using System.ComponentModel.DataAnnotations;
using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.DTOs.Usuarios;

public sealed record UsuarioResponse(
    Guid Id,
    string NomeCompleto,
    string Email,
    string? Telefone,
    PerfilUsuario Perfil,
    StatusUsuario Status,
    DateTimeOffset? UltimoAcessoEm);

public sealed class CriarUsuarioRequest
{
    [Required, StringLength(180, MinimumLength = 3)]
    public string NomeCompleto { get; init; } = string.Empty;

    [Required, EmailAddress, StringLength(180)]
    public string Email { get; init; } = string.Empty;

    [Required, StringLength(100, MinimumLength = 8)]
    public string Senha { get; init; } = string.Empty;

    [StringLength(30)]
    public string? Telefone { get; init; }

    public PerfilUsuario Perfil { get; init; } = PerfilUsuario.Recepcionista;
}

public sealed class AlterarStatusUsuarioRequest
{
    public StatusUsuario Status { get; init; }
}

public sealed class AtualizarUsuarioRequest
{
    [Required, StringLength(180, MinimumLength = 3)]
    public string NomeCompleto { get; init; } = string.Empty;

    [StringLength(30)]
    public string? Telefone { get; init; }
}

public sealed class RedefinirSenhaUsuarioRequest
{
    [Required, StringLength(100, MinimumLength = 8)]
    public string NovaSenha { get; init; } = string.Empty;
}
