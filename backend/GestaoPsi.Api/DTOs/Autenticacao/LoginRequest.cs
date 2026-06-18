using System.ComponentModel.DataAnnotations;

namespace GestaoPsi.Api.DTOs.Autenticacao;

public sealed class LoginRequest
{
    [Required, EmailAddress, MaxLength(180)]
    public string Email { get; init; } = string.Empty;

    [Required, MaxLength(200)]
    public string Senha { get; init; } = string.Empty;
}
