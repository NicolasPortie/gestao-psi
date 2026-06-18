using System.ComponentModel.DataAnnotations;

namespace GestaoPsi.Api.DTOs.Autenticacao;

public sealed class CriarContaRequest
{
    [Required, MinLength(3), MaxLength(180)]
    public string NomeCompleto { get; init; } = string.Empty;

    [Required, EmailAddress, MaxLength(180)]
    public string Email { get; init; } = string.Empty;

    [Required, RegularExpression(@"^\d{2}/\d{4,6}$")]
    public string Crp { get; init; } = string.Empty;

    [Required, MinLength(8), MaxLength(200)]
    public string Senha { get; init; } = string.Empty;

    [Range(typeof(bool), "true", "true", ErrorMessage = "É necessário aceitar os termos.")]
    public bool AceitouTermos { get; init; }
}
