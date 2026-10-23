using Psique.Api.Configuracoes;
using Psique.Api.Data;
using Psique.Api.DTOs.Autenticacao;
using Psique.Api.Models;
using Psique.Api.Services.Autenticacao;
using Psique.Api.Services.Comunicacao;
using Psique.Api.Services.Seguranca;
using Psique.Api.Shared.Enums;
using Psique.Api.Shared.Excecoes;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Psique.Api.Tests;

public sealed class AutenticacaoServiceTests
{
    [Fact]
    public async Task CriarConta_SemEmailConfirmado_NaoCriaContaNemUsuario()
    {
        await using var contexto = CriarContexto();
        var service = CriarService(contexto, new EstadoAutenticacaoFake(), new ProtecaoDadosFake(), new PasswordHasher<Usuario>());
        var erro = await Assert.ThrowsAsync<RegraNegocioException>(() => service.CriarContaAsync(new()
        {
            Email = "ana@exemplo.com", Senha = "senha-segura", AceitouTermos = true,
        }, "127.0.0.1", CancellationToken.None));
        Assert.Equal(422, erro.StatusCode);
        Assert.Empty(contexto.ContasPsicologo);
        Assert.Empty(contexto.Usuarios);
    }

    [Fact]
    public async Task CriarConta_SemComprovante_NaoRevelaQueOEmailJaTemConta()
    {
        await using var contexto = CriarContexto();
        var passwordHasher = new PasswordHasher<Usuario>();
        var existente = await AdicionarUsuarioAsync(contexto, passwordHasher, "correta-123");
        var service = CriarService(contexto, new EstadoAutenticacaoFake(), new ProtecaoDadosFake(), passwordHasher);

        var erro = await Assert.ThrowsAsync<RegraNegocioException>(() => service.CriarContaAsync(new()
        {
            Email = existente.Email, Senha = "senha-segura", AceitouTermos = true,
        }, "127.0.0.1", CancellationToken.None));

        Assert.Equal(422, erro.StatusCode);
        Assert.DoesNotContain("Já existe", erro.Message);
    }

    [Fact]
    public async Task CriarConta_DevePersistirEstruturaEProtegerCredenciais()
    {
        await using var contexto = CriarContexto();
        var estado = new EstadoAutenticacaoFake();
        var protecao = new ProtecaoDadosFake();
        var passwordHasher = new PasswordHasher<Usuario>();
        var email = new EmailTransacionalFake();
        var confirmacao = new ConfirmacaoEmailCadastroService(new EstadoConfirmacaoEmailMemoria(), estado, protecao, email);
        var envio = await confirmacao.SolicitarAsync(new() { Email = "ana@exemplo.com" }, "127.0.0.1", CancellationToken.None);
        var codigo = System.Text.RegularExpressions.Regex.Match(email.CorpoRecebido!, @"\b\d{6}\b").Value;
        var comprovante = await confirmacao.ConfirmarAsync(new() { Email = "ana@exemplo.com", Identificador = envio.Identificador, Codigo = codigo }, CancellationToken.None);
        var service = CriarService(contexto, estado, protecao, passwordHasher, email, confirmacao);

        var resposta = await service.CriarContaAsync(
            new CriarContaRequest
            {
                TokenEmail = comprovante.TokenEmail,
                Email = "ANA@EXEMPLO.COM",
                Senha = "senha-segura",
                AceitouTermos = true
            },
            "127.0.0.1",
            CancellationToken.None);

        var usuario = await contexto.Usuarios.SingleAsync();
        Assert.Empty(contexto.DadosProfissionaisPsicologo);

        Assert.Equal("ana@exemplo.com", usuario.Email);
        Assert.NotEqual("senha-segura", usuario.SenhaHash);
        Assert.Equal(
            PasswordVerificationResult.Success,
            passwordHasher.VerifyHashedPassword(
                usuario,
                usuario.SenhaHash,
                "senha-segura"));
        Assert.Empty(usuario.NomeCompleto);
        Assert.Empty((await contexto.ContasPsicologo.SingleAsync()).NomeConta);
        Assert.Single(contexto.ConfiguracoesAtendimento);
        Assert.Single(contexto.ConfiguracoesSegurancaConta);
        Assert.Single(contexto.LogsAuditoria);
        Assert.Equal(usuario.Id, resposta.Resposta.Usuario.Id);
        Assert.NotEmpty(resposta.RefreshToken);
        Assert.Equal("1.0", usuario.VersaoTermosAceitos);
        Assert.NotEqual(default, usuario.TermosAceitosEm);
    }

    [Fact]
    public async Task Login_ComSenhaInvalida_DeveRegistrarTentativaERetornarErroGenerico()
    {
        await using var contexto = CriarContexto();
        var estado = new EstadoAutenticacaoFake();
        var passwordHasher = new PasswordHasher<Usuario>();
        var usuario = await AdicionarUsuarioAsync(
            contexto,
            passwordHasher,
            "correta-123");
        var service = CriarService(
            contexto,
            estado,
            new ProtecaoDadosFake(),
            passwordHasher);

        var excecao = await Assert.ThrowsAsync<RegraNegocioException>(() =>
            service.LoginAsync(
                new LoginRequest
                {
                    Email = usuario.Email,
                    Senha = "incorreta"
                },
                "127.0.0.1",
                CancellationToken.None));

        Assert.Equal("E-mail ou senha inválidos.", excecao.Message);
        Assert.Equal(2, estado.TotalTentativasRegistradas);
    }

    [Fact]
    public async Task Login_Valido_DeveEmitirTokensELimparTentativas()
    {
        await using var contexto = CriarContexto();
        var estado = new EstadoAutenticacaoFake();
        var passwordHasher = new PasswordHasher<Usuario>();
        var usuario = await AdicionarUsuarioAsync(
            contexto,
            passwordHasher,
            "correta-123");
        var service = CriarService(
            contexto,
            estado,
            new ProtecaoDadosFake(),
            passwordHasher);

        var resposta = await service.LoginAsync(
            new LoginRequest
            {
                Email = usuario.Email,
                Senha = "correta-123"
            },
            "127.0.0.1",
            CancellationToken.None);

        Assert.Equal("access-token", resposta.Resposta.AccessToken);
        Assert.NotEmpty(resposta.RefreshToken);
        Assert.True(estado.TentativasForamLimpas);
        Assert.Single(estado.RefreshTokens);
    }

    [Fact]
    public async Task Recuperacao_DeveArmazenarSomenteHashEEnviarTokenBrutoPorEmail()
    {
        await using var contexto = CriarContexto();
        var estado = new EstadoAutenticacaoFake();
        var email = new EmailTransacionalFake();
        var passwordHasher = new PasswordHasher<Usuario>();
        var usuario = await AdicionarUsuarioAsync(
            contexto,
            passwordHasher,
            "correta-123");
        var service = CriarService(
            contexto,
            estado,
            new ProtecaoDadosFake(),
            passwordHasher,
            email);

        await service.SolicitarRecuperacaoSenhaAsync(
            new SolicitarRecuperacaoSenhaRequest { Email = usuario.Email },
            "127.0.0.1",
            CancellationToken.None);

        Assert.Equal(usuario.Id, estado.TokensRecuperacao["hash:token-seguro"]);
        Assert.Equal("token-seguro", email.TokenRecebido);
        Assert.DoesNotContain("token-seguro", estado.TokensRecuperacao.Keys);
    }

    [Fact]
    public async Task RedefinirSenha_DeveConsumirTokenERevogarSessoes()
    {
        await using var contexto = CriarContexto();
        var estado = new EstadoAutenticacaoFake();
        var passwordHasher = new PasswordHasher<Usuario>();
        var usuario = await AdicionarUsuarioAsync(
            contexto,
            passwordHasher,
            "senha-antiga");
        estado.TokensRecuperacao["hash:token-valido"] = usuario.Id;
        var service = CriarService(
            contexto,
            estado,
            new ProtecaoDadosFake(),
            passwordHasher);

        await service.RedefinirSenhaAsync(
            new RedefinirSenhaRequest
            {
                Token = "token-valido",
                NovaSenha = "senha-nova-segura"
            },
            CancellationToken.None);

        Assert.Equal(
            PasswordVerificationResult.Success,
            passwordHasher.VerifyHashedPassword(
                usuario,
                usuario.SenhaHash,
                "senha-nova-segura"));
        Assert.True(estado.RefreshTokensForamRevogados);
        Assert.Empty(estado.TokensRecuperacao);
    }

    private static AppDbContext CriarContexto()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task RenovarToken_ComSessaoAnteriorAAlteracaoDeSenha_DeveNegar()
    {
        await using var contexto = CriarContexto();
        var estado = new EstadoAutenticacaoFake();
        var hasher = new PasswordHasher<Usuario>();
        var usuario = await AdicionarUsuarioAsync(contexto, hasher, "senha-antiga");
        estado.RefreshTokens["hash:token-antigo"] = new EstadoRefreshToken(usuario.Id, usuario.ContaPsicologoId);
        // Simula token que escapou da limpeza do Redis durante uma renovacao concorrente.
        usuario.VersaoAutenticacao = 1;
        await contexto.SaveChangesAsync();
        var service = CriarService(contexto, estado, new ProtecaoDadosFake(), hasher);

        var erro = await Assert.ThrowsAsync<RegraNegocioException>(() =>
            service.RenovarTokenAsync("token-antigo", CancellationToken.None));
        Assert.Equal(401, erro.StatusCode);
    }

    [Fact]
    public async Task AlterarSenha_DeveTrocarSenhaRevogarOutrasSessoesEManterAtualConectado()
    {
        await using var contexto = CriarContexto();
        var estado = new EstadoAutenticacaoFake();
        var hasher = new PasswordHasher<Usuario>();
        var usuario = await AdicionarUsuarioAsync(contexto, hasher, "senha-antiga");
        var service = CriarService(contexto, estado, new ProtecaoDadosFake(), hasher);

        var resultado = await service.AlterarSenhaAsync(
            usuario.Id,
            usuario.ContaPsicologoId,
            new AlterarSenhaRequest { SenhaAtual = "senha-antiga", NovaSenha = "senha-nova-segura" },
            CancellationToken.None);

        Assert.Equal(
            PasswordVerificationResult.Success,
            hasher.VerifyHashedPassword(usuario, usuario.SenhaHash, "senha-nova-segura"));
        Assert.Equal(1, usuario.VersaoAutenticacao);
        Assert.True(estado.RefreshTokensForamRevogados);
        Assert.NotEmpty(resultado.RefreshToken);
        Assert.Contains(estado.RefreshTokens.Values, token => token.UsuarioId == usuario.Id && token.VersaoAutenticacao == 1);
        Assert.Contains(contexto.LogsAuditoria, log => log.TipoAcao == "AlteracaoSenha" && log.UsuarioId == usuario.Id);
    }

    [Fact]
    public async Task AlterarSenha_ComSenhaAtualIncorreta_DeveRecusarSemEncerrarSessao()
    {
        await using var contexto = CriarContexto();
        var estado = new EstadoAutenticacaoFake();
        var hasher = new PasswordHasher<Usuario>();
        var usuario = await AdicionarUsuarioAsync(contexto, hasher, "senha-antiga");
        var service = CriarService(contexto, estado, new ProtecaoDadosFake(), hasher);

        var erro = await Assert.ThrowsAsync<RegraNegocioException>(() => service.AlterarSenhaAsync(
            usuario.Id,
            usuario.ContaPsicologoId,
            new AlterarSenhaRequest { SenhaAtual = "errada", NovaSenha = "senha-nova-segura" },
            CancellationToken.None));

        // 400 e não 401: o front-end trata 401 como sessão expirada.
        Assert.Equal(StatusCodes.Status400BadRequest, erro.StatusCode);
        Assert.Equal(1, estado.TotalTentativasRegistradas);
        Assert.Equal(0, usuario.VersaoAutenticacao);
        Assert.False(estado.RefreshTokensForamRevogados);
        Assert.Equal(
            PasswordVerificationResult.Success,
            hasher.VerifyHashedPassword(usuario, usuario.SenhaHash, "senha-antiga"));
    }

    [Fact]
    public async Task AlterarSenha_ComNovaSenhaIgualAAtual_DeveRecusar()
    {
        await using var contexto = CriarContexto();
        var hasher = new PasswordHasher<Usuario>();
        var usuario = await AdicionarUsuarioAsync(contexto, hasher, "senha-antiga");
        var service = CriarService(contexto, new EstadoAutenticacaoFake(), new ProtecaoDadosFake(), hasher);

        var erro = await Assert.ThrowsAsync<RegraNegocioException>(() => service.AlterarSenhaAsync(
            usuario.Id,
            usuario.ContaPsicologoId,
            new AlterarSenhaRequest { SenhaAtual = "senha-antiga", NovaSenha = "senha-antiga" },
            CancellationToken.None));

        Assert.Contains("diferente", erro.Message);
        Assert.Equal(0, usuario.VersaoAutenticacao);
    }

    [Fact]
    public async Task AlterarSenha_AposLimiteDeTentativas_DeveBloquearMesmoComSenhaCorreta()
    {
        await using var contexto = CriarContexto();
        var estado = new EstadoAutenticacaoFake();
        var hasher = new PasswordHasher<Usuario>();
        var usuario = await AdicionarUsuarioAsync(contexto, hasher, "senha-antiga");
        var service = CriarService(contexto, estado, new ProtecaoDadosFake(), hasher);

        for (var tentativa = 0; tentativa < 5; tentativa++)
        {
            await Assert.ThrowsAsync<RegraNegocioException>(() => service.AlterarSenhaAsync(
                usuario.Id,
                usuario.ContaPsicologoId,
                new AlterarSenhaRequest { SenhaAtual = "errada", NovaSenha = "senha-nova-segura" },
                CancellationToken.None));
        }

        var erro = await Assert.ThrowsAsync<RegraNegocioException>(() => service.AlterarSenhaAsync(
            usuario.Id,
            usuario.ContaPsicologoId,
            new AlterarSenhaRequest { SenhaAtual = "senha-antiga", NovaSenha = "senha-nova-segura" },
            CancellationToken.None));

        Assert.Equal(StatusCodes.Status429TooManyRequests, erro.StatusCode);
        Assert.Equal(0, usuario.VersaoAutenticacao);
    }

    [Fact]
    public async Task AlterarSenha_ComUsuarioDeOutraConta_DeveNegarComoSessaoInvalida()
    {
        await using var contexto = CriarContexto();
        var hasher = new PasswordHasher<Usuario>();
        var usuario = await AdicionarUsuarioAsync(contexto, hasher, "senha-antiga");
        var service = CriarService(contexto, new EstadoAutenticacaoFake(), new ProtecaoDadosFake(), hasher);

        var erro = await Assert.ThrowsAsync<RegraNegocioException>(() => service.AlterarSenhaAsync(
            usuario.Id,
            Guid.NewGuid(),
            new AlterarSenhaRequest { SenhaAtual = "senha-antiga", NovaSenha = "senha-nova-segura" },
            CancellationToken.None));

        Assert.Equal(StatusCodes.Status401Unauthorized, erro.StatusCode);
        Assert.Equal(
            PasswordVerificationResult.Success,
            hasher.VerifyHashedPassword(usuario, usuario.SenhaHash, "senha-antiga"));
    }

    private static AutenticacaoService CriarService(
        AppDbContext contexto,
        EstadoAutenticacaoFake estado,
        IProtecaoDadosService protecao,
        IPasswordHasher<Usuario> passwordHasher,
        IEmailTransacionalService? email = null,
        IConfirmacaoEmailCadastroService? confirmacao = null) =>
        new(
            contexto,
            passwordHasher,
            new TokenServiceFake(),
            estado,
            protecao,
            email ?? new EmailTransacionalFake(),
            Options.Create(new JwtConfiguracao
            {
                DuracaoRefreshTokenDias = 14
            }),
            Options.Create(new SegurancaConfiguracao
            {
                MaximoTentativasLogin = 5,
                DuracaoBloqueioLoginMinutos = 15,
                MaximoSolicitacoesRecuperacao = 3,
                MaximoCadastrosPorHora = 5,
                DuracaoTokenRecuperacaoMinutos = 30,
                VersaoTermosUso = "1.0"
            }),
            confirmacao ?? new ConfirmacaoEmailCadastroService(new EstadoConfirmacaoEmailMemoria(), estado, protecao, email ?? new EmailTransacionalFake()));

    private static async Task<Usuario> AdicionarUsuarioAsync(
        AppDbContext contexto,
        IPasswordHasher<Usuario> passwordHasher,
        string senha)
    {
        var conta = new ContaPsicologo
        {
            Id = Guid.NewGuid(),
            NomeConta = "Consultório Teste",
            Status = StatusContaPsicologo.Ativa
        };
        var usuario = new Usuario
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = conta.Id,
            ContaPsicologo = conta,
            NomeCompleto = "Psicóloga Teste",
            Email = "teste@psique.local",
            Perfil = PerfilUsuario.Psicologo,
            Status = StatusUsuario.Ativo
        };
        usuario.SenhaHash = passwordHasher.HashPassword(usuario, senha);

        contexto.AddRange(conta, usuario);
        await contexto.SaveChangesAsync();
        return usuario;
    }

    private sealed class ProtecaoDadosFake : IProtecaoDadosService
    {
        public string Proteger(string valor) => $"protegido:{valor}";
        public string Desproteger(string valorProtegido) =>
            valorProtegido.Replace("protegido:", string.Empty);

        public string HashDeterministico(string valor) => $"hash:{valor}";
        public string HashToken(string token) => $"hash:{token}";
        public string GerarTokenSeguro() => "token-seguro";
    }

    private sealed class TokenServiceFake : ITokenService
    {
        public TokenGerado GerarAccessToken(Usuario usuario) =>
            new("access-token", DateTimeOffset.UtcNow.AddMinutes(15));
    }

    private sealed class EmailTransacionalFake : IEmailTransacionalService
    {
        public string? CorpoRecebido { get; private set; }
        public string? TokenRecebido { get; private set; }

        public Task<bool> EnviarRecuperacaoSenhaAsync(
            string destinatario,
            string nome,
            string token,
            CancellationToken cancellationToken)
        {
            TokenRecebido = token;
            return Task.FromResult(true);
        }

        public Task<bool> EnviarMensagemAdministrativaAsync(
            string destinatario,
            string nomeDestinatario,
            string assunto,
            string corpo,
            CancellationToken cancellationToken)
        {
            CorpoRecebido = corpo;
            return Task.FromResult(true);
        }
    }

    private sealed class EstadoAutenticacaoFake : IEstadoAutenticacao
    {
        public bool TentativasForamLimpas { get; private set; }
        public bool RefreshTokensForamRevogados { get; private set; }
        public Dictionary<string, long> Tentativas { get; } = [];
        public Dictionary<string, Guid> TokensRecuperacao { get; } = [];
        public Dictionary<string, EstadoRefreshToken> RefreshTokens { get; } = [];

        public int TotalTentativasRegistradas =>
            checked((int)Tentativas.Values.Sum());

        public Task<long> ObterTentativasLoginAsync(
            string identificador,
            CancellationToken cancellationToken) =>
            Task.FromResult(Tentativas.GetValueOrDefault(identificador));

        public Task<long> RegistrarTentativaLoginAsync(
            string identificador,
            TimeSpan expiracao,
            CancellationToken cancellationToken)
        {
            var total = Tentativas.GetValueOrDefault(identificador) + 1;
            Tentativas[identificador] = total;
            return Task.FromResult(total);
        }

        public Task LimparTentativasLoginAsync(
            string identificador,
            CancellationToken cancellationToken)
        {
            TentativasForamLimpas = true;
            Tentativas.Remove(identificador);
            return Task.CompletedTask;
        }

        public Task ArmazenarTokenRecuperacaoAsync(
            string tokenHash,
            Guid usuarioId,
            TimeSpan expiracao,
            CancellationToken cancellationToken)
        {
            TokensRecuperacao[tokenHash] = usuarioId;
            return Task.CompletedTask;
        }

        public Task<Guid?> ConsumirTokenRecuperacaoAsync(
            string tokenHash,
            CancellationToken cancellationToken)
        {
            if (!TokensRecuperacao.Remove(tokenHash, out var usuarioId))
            {
                return Task.FromResult<Guid?>(null);
            }

            return Task.FromResult<Guid?>(usuarioId);
        }

        public Task RemoverTokenRecuperacaoAsync(
            string tokenHash,
            CancellationToken cancellationToken)
        {
            TokensRecuperacao.Remove(tokenHash);
            return Task.CompletedTask;
        }

        public Task ArmazenarRefreshTokenAsync(
            string tokenHash,
            EstadoRefreshToken estado,
            TimeSpan expiracao,
            CancellationToken cancellationToken)
        {
            RefreshTokens[tokenHash] = estado;
            return Task.CompletedTask;
        }

        public Task<EstadoRefreshToken?> ConsumirRefreshTokenAsync(
            string tokenHash,
            CancellationToken cancellationToken)
        {
            if (!RefreshTokens.Remove(tokenHash, out var estado))
            {
                return Task.FromResult<EstadoRefreshToken?>(null);
            }

            return Task.FromResult<EstadoRefreshToken?>(estado);
        }

        public Task RevogarRefreshTokensUsuarioAsync(
            Guid usuarioId,
            CancellationToken cancellationToken)
        {
            RefreshTokensForamRevogados = true;
            foreach (var token in RefreshTokens
                         .Where(item => item.Value.UsuarioId == usuarioId)
                         .Select(item => item.Key)
                         .ToArray())
            {
                RefreshTokens.Remove(token);
            }

            return Task.CompletedTask;
        }
    }
}
