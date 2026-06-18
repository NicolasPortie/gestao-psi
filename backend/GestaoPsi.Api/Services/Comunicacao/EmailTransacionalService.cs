using GestaoPsi.Api.Configuracoes;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace GestaoPsi.Api.Services.Comunicacao;

public sealed class EmailTransacionalService(
    IOptions<EmailConfiguracao> configuracao,
    ILogger<EmailTransacionalService> logger)
    : IEmailTransacionalService
{
    private readonly EmailConfiguracao _configuracao = configuracao.Value;

    public async Task<bool> EnviarRecuperacaoSenhaAsync(
        string destinatario,
        string nome,
        string token,
        CancellationToken cancellationToken)
    {
        if (!_configuracao.Ativo)
        {
            logger.LogWarning("Envio de e-mail transacional está desabilitado.");
            return false;
        }

        var link = $"{_configuracao.UrlFrontend.TrimEnd('/')}/redefinir-senha?token={Uri.EscapeDataString(token)}";
        var mensagem = new MimeMessage();
        mensagem.From.Add(new MailboxAddress(
            _configuracao.NomeRemetente,
            _configuracao.EmailRemetente));
        mensagem.To.Add(MailboxAddress.Parse(destinatario));
        mensagem.Subject = "Recuperação de acesso ao GestãoPsi";
        mensagem.Body = new TextPart("plain")
        {
            Text = $"""
                Olá, {nome}.

                Recebemos uma solicitação para redefinir sua senha no GestãoPsi.
                Use o link abaixo. Ele expira em poucos minutos e pode ser utilizado uma única vez.

                {link}

                Se você não solicitou esta alteração, ignore esta mensagem.
                """
        };

        try
        {
            using var cliente = new SmtpClient();
            var opcaoSsl = _configuracao.UsarSsl
                ? SecureSocketOptions.SslOnConnect
                : SecureSocketOptions.StartTls;

            await cliente.ConnectAsync(
                _configuracao.ServidorSmtp,
                _configuracao.Porta,
                opcaoSsl,
                cancellationToken);

            if (!string.IsNullOrWhiteSpace(_configuracao.Usuario))
            {
                await cliente.AuthenticateAsync(
                    _configuracao.Usuario,
                    _configuracao.Senha,
                    cancellationToken);
            }

            await cliente.SendAsync(mensagem, cancellationToken);
            await cliente.DisconnectAsync(true, cancellationToken);
            return true;
        }
        catch (Exception excecao)
        {
            logger.LogError(excecao, "Falha no envio de e-mail transacional.");
            return false;
        }
    }
}
