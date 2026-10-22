using System.ComponentModel.DataAnnotations;

namespace Psique.Api.DTOs.Autenticacao;

public sealed class AlterarSenhaRequest
{
    [Required, MaxLength(200)]
    public string SenhaAtual { get; init; } = string.Empty;

    [Required, MinLength(8), MaxLength(200)]
    public string NovaSenha { get; init; } = string.Empty;
}
