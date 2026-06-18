using System.ComponentModel.DataAnnotations;

namespace GestaoPsi.Api.DTOs.Autenticacao;

public sealed class RedefinirSenhaRequest
{
    [Required, MaxLength(500)]
    public string Token { get; init; } = string.Empty;

    [Required, MinLength(8), MaxLength(200)]
    public string NovaSenha { get; init; } = string.Empty;
}
