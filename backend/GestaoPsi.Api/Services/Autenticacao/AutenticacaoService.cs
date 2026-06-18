using System.Security.Cryptography;
using System.Text;
using GestaoPsi.Api.Configuracoes;
using GestaoPsi.Api.Data;
using GestaoPsi.Api.DTOs.Autenticacao;
using GestaoPsi.Api.Models;
using GestaoPsi.Api.Services.Comunicacao;
using GestaoPsi.Api.Services.Seguranca;
using GestaoPsi.Api.Shared.Enums;
using GestaoPsi.Api.Shared.Excecoes;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace GestaoPsi.Api.Services.Autenticacao;

public sealed class AutenticacaoService(
    AppDbContext dbContext,
    IPasswordHasher<Usuario> passwordHasher,
    ITokenService tokenService,
    IEstadoAutenticacao estadoAutenticacao,
    IProtecaoDadosService protecaoDados,
    IEmailTransacionalService emailTransacional,
    IOptions<JwtConfiguracao> jwtConfiguracao,
    IOptions<SegurancaConfiguracao> segurancaConfiguracao)
    : IAutenticacaoService
{
    private readonly JwtConfiguracao _jwtConfiguracao = jwtConfiguracao.Value;
    private readonly SegurancaConfiguracao _seguranca = segurancaConfiguracao.Value;
    private readonly Usuario _usuarioDummy = new();
    private readonly string _senhaDummyHash =
        passwordHasher.HashPassword(new Usuario(), "senha-dummy-nao-utilizada");

    public async Task<ResultadoAutenticacao> CriarContaAsync(
        CriarContaRequest request,
        string? ip,
        CancellationToken cancellationToken)
    {
        var identificadorCadastro = CriarIdentificador(
            "cadastro-ip",
            ip ?? "sem-ip");
        var cadastrosRecentes = await estadoAutenticacao.ObterTentativasLoginAsync(
            identificadorCadastro,
            cancellationToken);

        if (cadastrosRecentes >= _seguranca.MaximoCadastrosPorHora)
        {
            throw new RegraNegocioException(
                "Limite temporário de criação de contas atingido.",
                StatusCodes.Status429TooManyRequests);
        }

        var email = NormalizarEmail(request.Email);
        var nome = request.NomeCompleto.Trim();
        var crp = NormalizarCrp(request.Crp);

        if (await dbContext.Usuarios.AnyAsync(
                usuario => usuario.Email == email,
                cancellationToken))
        {
            throw new RegraNegocioException("Já existe uma conta associada a este e-mail.");
        }

        var contaId = Guid.NewGuid();
        var usuarioId = Guid.NewGuid();
        var conta = new ContaPsicologo
        {
            Id = contaId,
            NomeConta = nome,
            Status = StatusContaPsicologo.Ativa
        };

        var usuario = new Usuario
        {
            Id = usuarioId,
            ContaPsicologoId = contaId,
            NomeCompleto = nome,
            Email = email,
            Perfil = PerfilUsuario.Psicologo,
            Status = StatusUsuario.Ativo,
            TermosAceitosEm = DateTimeOffset.UtcNow,
            VersaoTermosAceitos = _seguranca.VersaoTermosUso
        };
        usuario.SenhaHash = passwordHasher.HashPassword(usuario, request.Senha);

        var dadosProfissionais = new DadosProfissionaisPsicologo
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = contaId,
            UsuarioId = usuarioId,
            Crp = protecaoDados.Proteger(crp),
            CrpHash = protecaoDados.HashDeterministico(crp),
            NomeProfissional = nome,
            EmailProfissional = email,
            Status = StatusUsuario.Ativo
        };

        var configuracaoAtendimento = new ConfiguracaoAtendimento
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = contaId
        };

        var configuracaoSeguranca = new ConfiguracaoSegurancaConta
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = contaId,
            MaximoTentativasInvalidas = _seguranca.MaximoTentativasLogin
        };

        var auditoria = new LogAuditoria
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = contaId,
            UsuarioId = usuarioId,
            TipoAcao = "CriacaoConta",
            Entidade = nameof(ContaPsicologo),
            EntidadeId = contaId,
            Descricao = "Conta profissional criada."
        };

        await using var transacao = dbContext.Database.IsRelational()
            ? await dbContext.Database.BeginTransactionAsync(cancellationToken)
            : null;
        dbContext.ContasPsicologo.Add(conta);
        dbContext.Usuarios.Add(usuario);
        dbContext.DadosProfissionaisPsicologo.Add(dadosProfissionais);
        dbContext.ConfiguracoesAtendimento.Add(configuracaoAtendimento);
        dbContext.ConfiguracoesSegurancaConta.Add(configuracaoSeguranca);
        dbContext.LogsAuditoria.Add(auditoria);
        await dbContext.SaveChangesAsync(cancellationToken);
        if (transacao is not null)
        {
            await transacao.CommitAsync(cancellationToken);
        }

        await estadoAutenticacao.RegistrarTentativaLoginAsync(
            identificadorCadastro,
            TimeSpan.FromHours(1),
            cancellationToken);

        return await GerarAutenticacaoAsync(usuario, cancellationToken);
    }

    public async Task<ResultadoAutenticacao> LoginAsync(
        LoginRequest request,
        string? ip,
        CancellationToken cancellationToken)
    {
        var email = NormalizarEmail(request.Email);
        var identificadores = CriarIdentificadoresLogin(email, ip);
        var tentativas = await Task.WhenAll(
            identificadores.Select(identificador =>
                estadoAutenticacao.ObterTentativasLoginAsync(
                    identificador,
                    cancellationToken)));

        if (tentativas.Any(valor => valor >= _seguranca.MaximoTentativasLogin))
        {
            throw new RegraNegocioException(
                "Muitas tentativas de acesso. Aguarde alguns minutos.",
                StatusCodes.Status429TooManyRequests);
        }

        var usuario = await dbContext.Usuarios
            .Include(item => item.ContaPsicologo)
            .SingleOrDefaultAsync(item => item.Email == email, cancellationToken);

        if (usuario is null)
        {
            _ = passwordHasher.VerifyHashedPassword(
                _usuarioDummy,
                _senhaDummyHash,
                request.Senha);
            await RegistrarFalhaLoginAsync(identificadores, cancellationToken);
            throw CredenciaisInvalidas();
        }

        var resultadoSenha = passwordHasher.VerifyHashedPassword(
            usuario,
            usuario.SenhaHash,
            request.Senha);

        if (resultadoSenha == PasswordVerificationResult.Failed)
        {
            await RegistrarFalhaLoginAsync(identificadores, cancellationToken);
            throw CredenciaisInvalidas();
        }

        if (usuario.Status != StatusUsuario.Ativo ||
            usuario.ContaPsicologo.Status != StatusContaPsicologo.Ativa)
        {
            throw new RegraNegocioException(
                "O acesso a esta conta não está disponível.",
                StatusCodes.Status403Forbidden);
        }

        if (resultadoSenha == PasswordVerificationResult.SuccessRehashNeeded)
        {
            usuario.SenhaHash = passwordHasher.HashPassword(usuario, request.Senha);
        }

        await Task.WhenAll(
            identificadores.Select(identificador =>
                estadoAutenticacao.LimparTentativasLoginAsync(
                    identificador,
                    cancellationToken)));

        usuario.UltimoAcessoEm = DateTimeOffset.UtcNow;
        dbContext.LogsAuditoria.Add(CriarLog(
            usuario,
            "Login",
            "Acesso autenticado."));
        await dbContext.SaveChangesAsync(cancellationToken);

        return await GerarAutenticacaoAsync(usuario, cancellationToken);
    }

    public async Task SolicitarRecuperacaoSenhaAsync(
        SolicitarRecuperacaoSenhaRequest request,
        string? ip,
        CancellationToken cancellationToken)
    {
        var email = NormalizarEmail(request.Email);
        var identificadores = new[]
        {
            CriarIdentificador("recuperacao-email", email),
            CriarIdentificador("recuperacao-ip", ip ?? "sem-ip")
        };
        var solicitacoes = await Task.WhenAll(
            identificadores.Select(identificador =>
                estadoAutenticacao.ObterTentativasLoginAsync(
                    identificador,
                    cancellationToken)));

        if (solicitacoes.Any(
                valor => valor >= _seguranca.MaximoSolicitacoesRecuperacao))
        {
            return;
        }

        await Task.WhenAll(
            identificadores.Select(identificador =>
                estadoAutenticacao.RegistrarTentativaLoginAsync(
                    identificador,
                    TimeSpan.FromMinutes(_seguranca.DuracaoBloqueioLoginMinutos),
                    cancellationToken)));

        var usuario = await dbContext.Usuarios
            .Include(item => item.ContaPsicologo)
            .SingleOrDefaultAsync(item => item.Email == email, cancellationToken);

        if (usuario is null ||
            usuario.Status != StatusUsuario.Ativo ||
            usuario.ContaPsicologo.Status != StatusContaPsicologo.Ativa)
        {
            return;
        }

        var token = protecaoDados.GerarTokenSeguro();
        var tokenHash = protecaoDados.HashToken(token);
        var expiracao = TimeSpan.FromMinutes(
            _seguranca.DuracaoTokenRecuperacaoMinutos);

        await estadoAutenticacao.ArmazenarTokenRecuperacaoAsync(
            tokenHash,
            usuario.Id,
            expiracao,
            cancellationToken);

        var enviado = await emailTransacional.EnviarRecuperacaoSenhaAsync(
            usuario.Email,
            usuario.NomeCompleto,
            token,
            cancellationToken);

        if (!enviado)
        {
            await estadoAutenticacao.RemoverTokenRecuperacaoAsync(
                tokenHash,
                cancellationToken);
            return;
        }

        dbContext.LogsAuditoria.Add(CriarLog(
            usuario,
            "SolicitacaoRecuperacaoSenha",
            "Recuperação de senha solicitada."));
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task RedefinirSenhaAsync(
        RedefinirSenhaRequest request,
        CancellationToken cancellationToken)
    {
        var tokenHash = protecaoDados.HashToken(request.Token);
        var usuarioId = await estadoAutenticacao.ConsumirTokenRecuperacaoAsync(
            tokenHash,
            cancellationToken);

        if (usuarioId is null)
        {
            throw TokenRecuperacaoInvalido();
        }

        var usuario = await dbContext.Usuarios
            .Include(item => item.ContaPsicologo)
            .SingleOrDefaultAsync(item => item.Id == usuarioId, cancellationToken);

        if (usuario is null ||
            usuario.Status != StatusUsuario.Ativo ||
            usuario.ContaPsicologo.Status != StatusContaPsicologo.Ativa)
        {
            throw TokenRecuperacaoInvalido();
        }

        usuario.SenhaHash = passwordHasher.HashPassword(usuario, request.NovaSenha);
        usuario.AtualizadoEm = DateTimeOffset.UtcNow;
        await estadoAutenticacao.RevogarRefreshTokensUsuarioAsync(
            usuario.Id,
            cancellationToken);

        dbContext.LogsAuditoria.Add(CriarLog(
            usuario,
            "RedefinicaoSenha",
            "Senha redefinida e sessões anteriores revogadas."));
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<ResultadoAutenticacao> RenovarTokenAsync(
        string refreshToken,
        CancellationToken cancellationToken)
    {
        var tokenHash = protecaoDados.HashToken(refreshToken);
        var estado = await estadoAutenticacao.ConsumirRefreshTokenAsync(
            tokenHash,
            cancellationToken);

        if (estado is null)
        {
            throw SessaoInvalida();
        }

        var usuario = await dbContext.Usuarios
            .Include(item => item.ContaPsicologo)
            .SingleOrDefaultAsync(
                item => item.Id == estado.UsuarioId &&
                        item.ContaPsicologoId == estado.ContaPsicologoId,
                cancellationToken);

        if (usuario is null ||
            usuario.Status != StatusUsuario.Ativo ||
            usuario.ContaPsicologo.Status != StatusContaPsicologo.Ativa)
        {
            throw SessaoInvalida();
        }

        return await GerarAutenticacaoAsync(usuario, cancellationToken);
    }

    public async Task EncerrarSessaoAsync(
        string refreshToken,
        CancellationToken cancellationToken)
    {
        var tokenHash = protecaoDados.HashToken(refreshToken);
        _ = await estadoAutenticacao.ConsumirRefreshTokenAsync(
            tokenHash,
            cancellationToken);
    }

    private async Task<ResultadoAutenticacao> GerarAutenticacaoAsync(
        Usuario usuario,
        CancellationToken cancellationToken)
    {
        var accessToken = tokenService.GerarAccessToken(usuario);
        var refreshToken = protecaoDados.GerarTokenSeguro();
        var refreshTokenHash = protecaoDados.HashToken(refreshToken);
        var expiracaoRefresh = TimeSpan.FromDays(
            _jwtConfiguracao.DuracaoRefreshTokenDias);

        await estadoAutenticacao.ArmazenarRefreshTokenAsync(
            refreshTokenHash,
            new EstadoRefreshToken(usuario.Id, usuario.ContaPsicologoId),
            expiracaoRefresh,
            cancellationToken);

        return new ResultadoAutenticacao(
            new AutenticacaoResponse(
                accessToken.Token,
                accessToken.ExpiraEm,
                new UsuarioAutenticadoResponse(
                    usuario.Id,
                    usuario.NomeCompleto,
                    usuario.Email,
                    usuario.Perfil.ToString())),
            refreshToken,
            DateTimeOffset.UtcNow.Add(expiracaoRefresh));
    }

    private async Task RegistrarFalhaLoginAsync(
        IEnumerable<string> identificadores,
        CancellationToken cancellationToken)
    {
        var expiracao = TimeSpan.FromMinutes(
            _seguranca.DuracaoBloqueioLoginMinutos);
        await Task.WhenAll(
            identificadores.Select(identificador =>
                estadoAutenticacao.RegistrarTentativaLoginAsync(
                    identificador,
                    expiracao,
                    cancellationToken)));
    }

    private static LogAuditoria CriarLog(
        Usuario usuario,
        string tipoAcao,
        string descricao) =>
        new()
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = usuario.ContaPsicologoId,
            UsuarioId = usuario.Id,
            TipoAcao = tipoAcao,
            Entidade = nameof(Usuario),
            EntidadeId = usuario.Id,
            Descricao = descricao
        };

    private static RegraNegocioException CredenciaisInvalidas() =>
        new("E-mail ou senha inválidos.", StatusCodes.Status401Unauthorized);

    private static RegraNegocioException TokenRecuperacaoInvalido() =>
        new("O link de recuperação é inválido ou expirou.");

    private static RegraNegocioException SessaoInvalida() =>
        new("Sessão inválida ou expirada.", StatusCodes.Status401Unauthorized);

    private static string NormalizarEmail(string email) =>
        email.Trim().ToLowerInvariant();

    private static string NormalizarCrp(string crp) =>
        crp.Trim().Replace(" ", string.Empty);

    private static string[] CriarIdentificadoresLogin(string email, string? ip) =>
    [
        CriarIdentificador("login-email", email),
        CriarIdentificador("login-ip", ip ?? "sem-ip")
    ];

    private static string CriarIdentificador(string finalidade, string valor)
    {
        return Convert.ToHexString(
            SHA256.HashData(
                Encoding.UTF8.GetBytes($"{finalidade}|{valor}")));
    }
}
