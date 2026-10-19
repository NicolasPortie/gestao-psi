using System.ComponentModel.DataAnnotations;

namespace GestaoPsi.Api.DTOs.Autenticacao;

public sealed class SolicitarCodigoCadastroRequest
{
    [Required(ErrorMessage = "Informe seu e-mail."), EmailAddress(ErrorMessage = "Informe um e-mail válido."), MaxLength(180, ErrorMessage = "O e-mail deve ter até 180 caracteres.")]
    public string Email { get; init; } = string.Empty;
    [MaxLength(64, ErrorMessage = "A identificação do envio anterior é inválida.")]
    public string? IdentificadorAnterior { get; init; }
}

public sealed class ConfirmarEmailCadastroRequest
{
    [Required(ErrorMessage = "Informe seu e-mail."), EmailAddress(ErrorMessage = "Informe um e-mail válido."), MaxLength(180, ErrorMessage = "O e-mail deve ter até 180 caracteres.")]
    public string Email { get; init; } = string.Empty;
    [Required(ErrorMessage = "Solicite um código para confirmar seu e-mail."), RegularExpression(@"^[a-f0-9]{64}$", ErrorMessage = "A identificação do envio é inválida. Peça um novo código.")]
    public string Identificador { get; init; } = string.Empty;
    [Required(ErrorMessage = "Digite o código recebido por e-mail."), RegularExpression(@"^\d{6}$", ErrorMessage = "O código deve ter seis números.")]
    public string Codigo { get; init; } = string.Empty;
}

public sealed record CodigoCadastroResponse(string Identificador, DateTimeOffset ExpiraEm, int ReenviarAposSegundos);
public sealed record EmailCadastroConfirmadoResponse(string TokenEmail, DateTimeOffset ExpiraEm);
