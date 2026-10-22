using System.ComponentModel.DataAnnotations;

namespace Psique.Api.DTOs.Autenticacao;

public sealed class CriarContaRequest
{
    [Required(ErrorMessage = "Confirme seu e-mail antes de criar a conta."), RegularExpression(@"^[a-f0-9]{64}$", ErrorMessage = "A confirmação de e-mail é inválida.")]
    public string TokenEmail { get; init; } = string.Empty;

    [Required, EmailAddress, MaxLength(180)]
    public string Email { get; init; } = string.Empty;

    [Required, MinLength(8), MaxLength(200)]
    public string Senha { get; init; } = string.Empty;

    [Range(typeof(bool), "true", "true", ErrorMessage = "É necessário aceitar os termos.")]
    public bool AceitouTermos { get; init; }
}
