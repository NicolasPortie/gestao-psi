using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using GestaoPsi.Api.DTOs.Autenticacao;
using GestaoPsi.Api.Services.Autenticacao;
using GestaoPsi.Api.Services.Comunicacao;
using GestaoPsi.Api.Services.Seguranca;
using GestaoPsi.Api.Shared.Excecoes;

namespace GestaoPsi.Api.Tests;

public sealed class ConfirmacaoEmailCadastroTests
{
    private static readonly CancellationToken Ct = CancellationToken.None;
    private const string Email = "ana@exemplo.com";

    [Fact]
    public async Task CodigoEComprovante_SaoVinculadosAoEmailEDeUsoUnico()
    {
        var (service, _, email) = Criar();
        var envio = await service.SolicitarAsync(new() { Email = Email }, "ip", Ct);
        Assert.Matches("^[a-f0-9]{64}$", envio.Identificador);
        await Assert.ThrowsAsync<RegraNegocioException>(() => service.ConfirmarAsync(new() { Email = "outro@exemplo.com", Identificador = envio.Identificador, Codigo = email.Codigo }, Ct));
        var request = new ConfirmarEmailCadastroRequest { Email = Email, Identificador = envio.Identificador, Codigo = email.Codigo };
        var confirmado = await service.ConfirmarAsync(request, Ct);
        await Assert.ThrowsAsync<RegraNegocioException>(() => service.ConfirmarAsync(request, Ct));
        await Assert.ThrowsAsync<RegraNegocioException>(() => service.ConsumirComprovanteAsync("outro@exemplo.com", confirmado.TokenEmail, Ct));
        await service.ConsumirComprovanteAsync(" ANA@EXEMPLO.COM ", confirmado.TokenEmail, Ct);
        await Assert.ThrowsAsync<RegraNegocioException>(() => service.ConsumirComprovanteAsync(Email, confirmado.TokenEmail, Ct));
    }

    [Fact]
    public async Task CincoErros_InvalidamOCodigoMesmoQueDepoisSejaInformadoCorretamente()
    {
        var (service, _, email) = Criar();
        var envio = await service.SolicitarAsync(new() { Email = Email }, "ip", Ct);
        for (var tentativa = 0; tentativa < 5; tentativa++)
            await Assert.ThrowsAsync<RegraNegocioException>(() => service.ConfirmarAsync(new() { Email = Email, Identificador = envio.Identificador, Codigo = email.Codigo == "000000" ? "111111" : "000000" }, Ct));
        await Assert.ThrowsAsync<RegraNegocioException>(() => service.ConfirmarAsync(new() { Email = Email, Identificador = envio.Identificador, Codigo = email.Codigo }, Ct));
    }

    [Fact]
    public async Task Reenvio_ExigeIntervaloEInvalidaOCodigoAnterior()
    {
        var (service, limites, email) = Criar();
        var primeiro = await service.SolicitarAsync(new() { Email = Email }, "ip", Ct);
        var codigoAnterior = email.Codigo;
        var erro = await Assert.ThrowsAsync<RegraNegocioException>(() => service.SolicitarAsync(new() { Email = Email }, "ip", Ct));
        Assert.Equal(429, erro.StatusCode);
        await limites.LimparTentativasLoginAsync(new ProtecaoFake().HashDeterministico($"cadastro-email-pausa:{Email}"), Ct);
        var novo = await service.SolicitarAsync(new() { Email = Email, IdentificadorAnterior = primeiro.Identificador }, "ip", Ct);
        await Assert.ThrowsAsync<RegraNegocioException>(() => service.ConfirmarAsync(new() { Email = Email, Identificador = primeiro.Identificador, Codigo = codigoAnterior }, Ct));
        await service.ConfirmarAsync(new() { Email = Email, Identificador = novo.Identificador, Codigo = email.Codigo }, Ct);
    }

    [Fact]
    public async Task FalhaDeEnvio_NaoRetornaSucessoEPermiteTentarNovamente()
    {
        var (service, _, email) = Criar();
        email.Enviar = false;
        var erro = await Assert.ThrowsAsync<RegraNegocioException>(() => service.SolicitarAsync(new() { Email = Email }, "ip", Ct));
        Assert.Equal(503, erro.StatusCode);
        email.Enviar = true;
        await service.SolicitarAsync(new() { Email = Email }, "ip", Ct);
    }

    [Fact]
    public async Task Estado_RecusaExpiradoEConsomeApenasUmaVezSobConcorrencia()
    {
        var estado = new EstadoConfirmacaoEmailMemoria();
        await estado.ArmazenarAsync("expirado", "hash", 5, TimeSpan.FromSeconds(-1), Ct);
        Assert.False(await estado.ConsumirAsync("expirado", "hash", Ct));
        await estado.ArmazenarAsync("valido", "hash", 5, TimeSpan.FromMinutes(1), Ct);
        var resultados = await Task.WhenAll(Enumerable.Range(0, 20).Select(_ => Task.Run(() => estado.ConsumirAsync("valido", "hash", Ct))));
        Assert.Single(resultados, x => x);
    }

    private static (ConfirmacaoEmailCadastroService Service, EstadoAutenticacaoMemoria Limites, EmailFake Email) Criar()
    {
        var limites = new EstadoAutenticacaoMemoria();
        var email = new EmailFake();
        return (new(new EstadoConfirmacaoEmailMemoria(), limites, new ProtecaoFake(), email), limites, email);
    }

    private sealed class EmailFake : IEmailTransacionalService
    {
        public bool Enviar { get; set; } = true;
        public string Codigo { get; private set; } = "";
        public Task<bool> EnviarRecuperacaoSenhaAsync(string destinatario, string nome, string token, CancellationToken cancellationToken) => throw new NotSupportedException();
        public Task<bool> EnviarMensagemAdministrativaAsync(string destinatario, string nomeDestinatario, string assunto, string corpo, CancellationToken cancellationToken)
        {
            Codigo = Regex.Match(corpo, @"\b\d{6}\b").Value;
            Assert.Equal(6, Codigo.Length);
            return Task.FromResult(Enviar);
        }
    }

    private sealed class ProtecaoFake : IProtecaoDadosService
    {
        public string HashDeterministico(string valor) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(valor)));
        public string Proteger(string valor) => throw new NotSupportedException();
        public string Desproteger(string valorProtegido) => throw new NotSupportedException();
        public string HashToken(string token) => throw new NotSupportedException();
        public string GerarTokenSeguro() => throw new NotSupportedException();
    }
}
