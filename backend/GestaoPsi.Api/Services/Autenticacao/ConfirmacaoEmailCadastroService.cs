using System.Security.Cryptography;
using GestaoPsi.Api.DTOs.Autenticacao;
using GestaoPsi.Api.Services.Comunicacao;
using GestaoPsi.Api.Services.Seguranca;
using GestaoPsi.Api.Shared.Excecoes;

namespace GestaoPsi.Api.Services.Autenticacao;

public interface IConfirmacaoEmailCadastroService
{
    Task<CodigoCadastroResponse> SolicitarAsync(SolicitarCodigoCadastroRequest request, string? ip, CancellationToken cancellationToken);
    Task<EmailCadastroConfirmadoResponse> ConfirmarAsync(ConfirmarEmailCadastroRequest request, CancellationToken cancellationToken);
    Task ConsumirComprovanteAsync(string email, string token, CancellationToken cancellationToken);
}

public sealed class ConfirmacaoEmailCadastroService(
    IEstadoConfirmacaoEmail estado,
    IEstadoAutenticacao limites,
    IProtecaoDadosService protecao,
    IEmailTransacionalService emailTransacional) : IConfirmacaoEmailCadastroService
{
    private string Hash(string valor) => protecao.HashDeterministico(valor);
    private string ChaveCodigo(string email, string identificador) => Hash($"cadastro-codigo:{email.Trim().ToLowerInvariant()}:{identificador}");
    private string ChaveComprovante(string email, string token) => Hash($"cadastro-confirmado:{email.Trim().ToLowerInvariant()}:{token}");

    public async Task<CodigoCadastroResponse> SolicitarAsync(SolicitarCodigoCadastroRequest request, string? ip, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var resfriamento = Hash($"cadastro-email-pausa:{email}");
        // Incrementos atômicos: reenvios concorrentes também respeitam os limites.
        foreach (var (chave, maximo, janela) in new[] {
            (resfriamento, 1, TimeSpan.FromSeconds(60)),
            (Hash($"cadastro-email-envios:{email}"), 5, TimeSpan.FromHours(1)),
            (Hash($"cadastro-email-ip:{ip ?? "sem-ip"}"), 20, TimeSpan.FromHours(1)) })
        {
            if (await limites.RegistrarTentativaLoginAsync(chave, janela, cancellationToken) > maximo)
                throw new RegraNegocioException("Aguarde um minuto antes de pedir outro código. Se o limite persistir, tente mais tarde.", StatusCodes.Status429TooManyRequests);
        }

        var identificador = Convert.ToHexStringLower(RandomNumberGenerator.GetBytes(32));
        var codigo = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
        var chaveCodigo = ChaveCodigo(email, identificador);
        var validade = TimeSpan.FromMinutes(10);
        await estado.ArmazenarAsync(chaveCodigo, Hash($"{identificador}:{codigo}"), 5, validade, cancellationToken);
        var enviado = await emailTransacional.EnviarMensagemAdministrativaAsync(email, "", "Confirme seu e-mail no Vínculo",
            $"Seu código de confirmação é: {codigo}\n\nEle é válido por 10 minutos e pode ser usado uma única vez.\n\nSe você não iniciou este cadastro, ignore esta mensagem.", cancellationToken);
        if (!enviado)
        {
            await estado.RemoverAsync(chaveCodigo, cancellationToken);
            await limites.LimparTentativasLoginAsync(resfriamento, cancellationToken);
            throw new RegraNegocioException("Não foi possível enviar o código agora. Tente novamente em instantes.", StatusCodes.Status503ServiceUnavailable);
        }
        if (!string.IsNullOrEmpty(request.IdentificadorAnterior))
            await estado.RemoverAsync(ChaveCodigo(email, request.IdentificadorAnterior), cancellationToken);
        return new(identificador, DateTimeOffset.UtcNow.Add(validade), 60);
    }

    public async Task<EmailCadastroConfirmadoResponse> ConfirmarAsync(ConfirmarEmailCadastroRequest request, CancellationToken cancellationToken)
    {
        if (!await estado.ConsumirAsync(ChaveCodigo(request.Email, request.Identificador), Hash($"{request.Identificador}:{request.Codigo}"), cancellationToken))
            throw new RegraNegocioException("Código inválido ou expirado. Confira o e-mail ou peça um novo código.");
        var token = Convert.ToHexStringLower(RandomNumberGenerator.GetBytes(32));
        var validade = TimeSpan.FromMinutes(30);
        await estado.ArmazenarAsync(ChaveComprovante(request.Email, token), "confirmado", 1, validade, cancellationToken);
        return new(token, DateTimeOffset.UtcNow.Add(validade));
    }

    public async Task ConsumirComprovanteAsync(string email, string token, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(token) || !await estado.ConsumirAsync(ChaveComprovante(email, token), "confirmado", cancellationToken))
            throw new RegraNegocioException("Confirme seu e-mail novamente para concluir o cadastro.", StatusCodes.Status422UnprocessableEntity);
    }
}
