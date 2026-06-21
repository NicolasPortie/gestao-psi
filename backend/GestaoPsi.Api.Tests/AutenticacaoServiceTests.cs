using GestaoPsi.Api.Configuracoes;
using GestaoPsi.Api.Data;
using GestaoPsi.Api.DTOs.Autenticacao;
using GestaoPsi.Api.Models;
using GestaoPsi.Api.Services.Autenticacao;
using GestaoPsi.Api.Services.Comunicacao;
using GestaoPsi.Api.Services.Seguranca;
using GestaoPsi.Api.Shared.Enums;
using GestaoPsi.Api.Shared.Excecoes;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace GestaoPsi.Api.Tests;

public sealed class AutenticacaoServiceTests
{
    [Fact]
    public async Task CriarConta_DevePersistirEstruturaEProtegerCredenciais()
    {
        await using var contexto = CriarContexto();
        var estado = new EstadoAutenticacaoFake();
        var protecao = new ProtecaoDadosFake();
        var passwordHasher = new PasswordHasher<Usuario>();
        var service = CriarService(contexto, estado, protecao, passwordHasher);

        var resposta = await service.CriarContaAsync(
            new CriarContaRequest
            {
                NomeCompleto = "Dra. Ana Souza",
                Email = "ANA@EXEMPLO.COM",
                Crp = "06/123456",
                Senha = "senha-segura",
                AceitouTermos = true
            },
            "127.0.0.1",
            CancellationToken.None);

        var usuario = await contexto.Usuarios.SingleAsync();
        var dados = await contexto.DadosProfissionaisPsicologo.SingleAsync();

        Assert.Equal("ana@exemplo.com", usuario.Email);
        Assert.NotEqual("senha-segura", usuario.SenhaHash);
        Assert.Equal(
            PasswordVerificationResult.Success,
            passwordHasher.VerifyHashedPassword(
                usuario,
                usuario.SenhaHash,
                "senha-segura"));
        Assert.Equal("protegido:06/123456", dados.Crp);
        Assert.Equal("hash:06/123456", dados.CrpHash);
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

    private static AutenticacaoService CriarService(
        AppDbContext contexto,
        EstadoAutenticacaoFake estado,
        IProtecaoDadosService protecao,
        IPasswordHasher<Usuario> passwordHasher,
        IEmailTransacionalService? email = null) =>
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
            }));

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
            Email = "teste@gestaopsi.local",
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
