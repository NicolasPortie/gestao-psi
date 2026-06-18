namespace GestaoPsi.Api.Services.Comunicacao;

public interface IEmailTransacionalService
{
    Task<bool> EnviarRecuperacaoSenhaAsync(
        string destinatario,
        string nome,
        string token,
        CancellationToken cancellationToken);
}
