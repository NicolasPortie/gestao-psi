using System.ComponentModel.DataAnnotations;

namespace GestaoPsi.Api.DTOs.Autenticacao;

public sealed class SolicitarRecuperacaoSenhaRequest
{
    [Required, EmailAddress, MaxLength(180)]
    public string Email { get; init; } = string.Empty;
}
