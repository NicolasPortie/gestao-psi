using System.Security.Claims;
using Psique.Api.Data;
using Psique.Api.DTOs.PerfisAcesso;
using Psique.Api.DTOs.Usuarios;
using Psique.Api.Models;
using Psique.Api.Services.Autenticacao;
using Psique.Api.Services.PerfisAcesso;
using Psique.Api.Services.Seguranca;
using Psique.Api.Services.Usuarios;
using Psique.Api.Shared.Enums;
using Psique.Api.Shared.Excecoes;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Psique.Api.Tests;

public sealed class PerfisAcessoTests
{
    [Fact]
    public void Recepcionista_NaoTemAuditoriaEquipeNemConexaoDoWhatsApp_ETemORestante()
    {
        var permissoes = PermissoesEfetivas.Para(new Usuario { Perfil = PerfilUsuario.Recepcionista });

        Assert.DoesNotContain(PermissaoAcesso.Auditoria, permissoes);
        Assert.DoesNotContain(PermissaoAcesso.Equipe, permissoes);
        Assert.DoesNotContain(PermissaoAcesso.IntegracaoWhatsApp, permissoes);
        Assert.Contains(PermissaoAcesso.Agenda, permissoes);
        Assert.Contains(PermissaoAcesso.Conversas, permissoes);
    }

    [Theory]
    [InlineData(PerfilUsuario.Psicologo)]
    [InlineData(PerfilUsuario.Administrador)]
    public void PsicologoEAdministrador_TemTodasAsPermissoes(PerfilUsuario perfil)
    {
        var permissoes = PermissoesEfetivas.Para(new Usuario { Perfil = perfil });

        Assert.Equal(Enum.GetValues<PermissaoAcesso>().Length, permissoes.Count);
    }

    [Fact]
    public void Personalizado_UsaSomenteOQueOPerfilConcede_ESemPerfilNaoTemNada()
    {
        var perfil = new PerfilAcesso { Permissoes = "Agenda,Pacientes" };

        var comPerfil = PermissoesEfetivas.Para(new Usuario { Perfil = PerfilUsuario.Personalizado, PerfilAcesso = perfil });
        var semPerfil = PermissoesEfetivas.Para(new Usuario { Perfil = PerfilUsuario.Personalizado });

        Assert.Equal(new[] { PermissaoAcesso.Agenda, PermissaoAcesso.Pacientes }, comPerfil.OrderBy(p => (int)p));
        Assert.Empty(semPerfil);
    }

    [Fact]
    public void PermissaoDesconhecidaNoBanco_EhIgnorada()
    {
        var lidas = PermissoesEfetivas.Ler("Agenda,Inexistente, 99 ,Financeiro");

        Assert.Equal(new[] { PermissaoAcesso.Agenda, PermissaoAcesso.Financeiro }, lidas.OrderBy(p => (int)p));
    }

    [Fact]
    public async Task Sessao_DeveReceberAsPermissoesAtuaisDoPerfil_AMudancaVaiNaProximaRequisicao()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var perfil = await CriarPerfilAsync(contexto, cenario.ContaId, "Secretária", "Agenda");
        var pessoa = await CriarPessoaAsync(contexto, cenario.ContaId, perfil);
        var validacao = new ValidacaoSessaoJwtService(new AutorizacaoContaService(contexto));

        var antes = PrincipalDe(pessoa);
        Assert.True(await validacao.ValidarAsync(antes, CancellationToken.None));
        Assert.Equal(new[] { "Agenda" }, antes.FindAll(ValidacaoSessaoJwtService.ClaimPermissao).Select(c => c.Value));

        perfil.Permissoes = "Agenda,Financeiro";
        await contexto.SaveChangesAsync();
        var depois = PrincipalDe(pessoa);
        Assert.True(await validacao.ValidarAsync(depois, CancellationToken.None));
        Assert.Equal(new[] { "Agenda", "Financeiro" }, depois.FindAll(ValidacaoSessaoJwtService.ClaimPermissao).Select(c => c.Value).Order());
    }

    [Fact]
    public async Task CriarPerfil_DeveSalvarENormalizarAsPermissoes()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);

        var criado = await CriarServicoPerfis(contexto).CriarAsync(cenario.PsicologoId, cenario.ContaId,
            new SalvarPerfilAcessoRequest { Nome = "  Secretária  ", Permissoes = [PermissaoAcesso.Pacientes, PermissaoAcesso.Agenda, PermissaoAcesso.Agenda] },
            null, null, CancellationToken.None);

        Assert.Equal("Secretária", criado.Nome);
        Assert.Equal(new[] { PermissaoAcesso.Agenda, PermissaoAcesso.Pacientes }, criado.Permissoes);
        Assert.Equal("Agenda,Pacientes", (await contexto.PerfisAcesso.SingleAsync()).Permissoes);
    }

    [Theory]
    [InlineData("Recepcionista")]
    [InlineData("psicóloga")]
    [InlineData("ADMINISTRADOR")]
    public async Task CriarPerfil_ComNomeDeUmPerfilDoSistema_DeveBloquear(string nome)
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);

        await Assert.ThrowsAsync<RegraNegocioException>(() => CriarServicoPerfis(contexto).CriarAsync(cenario.PsicologoId, cenario.ContaId,
            new SalvarPerfilAcessoRequest { Nome = nome, Permissoes = [PermissaoAcesso.Agenda] }, null, null, CancellationToken.None));
    }

    [Fact]
    public async Task CriarPerfil_ComNomeRepetido_DeveBloquear()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        await CriarPerfilAsync(contexto, cenario.ContaId, "Secretária", "Agenda");

        await Assert.ThrowsAsync<RegraNegocioException>(() => CriarServicoPerfis(contexto).CriarAsync(cenario.PsicologoId, cenario.ContaId,
            new SalvarPerfilAcessoRequest { Nome = "secretária", Permissoes = [PermissaoAcesso.Agenda] }, null, null, CancellationToken.None));
    }

    [Fact]
    public async Task CriarPerfil_SemNenhumAcesso_DeveBloquear()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);

        await Assert.ThrowsAsync<RegraNegocioException>(() => CriarServicoPerfis(contexto).CriarAsync(cenario.PsicologoId, cenario.ContaId,
            new SalvarPerfilAcessoRequest { Nome = "Vazio", Permissoes = [] }, null, null, CancellationToken.None));
    }

    [Fact]
    public async Task QuemGerenciaEquipe_NaoConcedeAcessoQueNaoTem()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var gerente = await CriarPerfilAsync(contexto, cenario.ContaId, "Gerente", "Agenda,Equipe");
        var pessoa = await CriarPessoaAsync(contexto, cenario.ContaId, gerente);

        var erro = await Assert.ThrowsAsync<RegraNegocioException>(() => CriarServicoPerfis(contexto).CriarAsync(pessoa.Id, cenario.ContaId,
            new SalvarPerfilAcessoRequest { Nome = "Auditor", Permissoes = [PermissaoAcesso.Auditoria] }, null, null, CancellationToken.None));

        Assert.Equal(StatusCodes.Status403Forbidden, erro.StatusCode);
        Assert.Empty(contexto.PerfisAcesso.Where(p => p.Nome == "Auditor"));
    }

    [Fact]
    public async Task QuemGerenciaEquipe_NaoEditaPerfilQueTemMaisAcessosQueEle()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var gerente = await CriarPerfilAsync(contexto, cenario.ContaId, "Gerente", "Agenda,Equipe");
        var auditor = await CriarPerfilAsync(contexto, cenario.ContaId, "Auditor", "Agenda,Auditoria");
        var pessoa = await CriarPessoaAsync(contexto, cenario.ContaId, gerente);

        await Assert.ThrowsAsync<RegraNegocioException>(() => CriarServicoPerfis(contexto).AtualizarAsync(pessoa.Id, cenario.ContaId, auditor.Id,
            new SalvarPerfilAcessoRequest { Nome = "Auditor", Permissoes = [PermissaoAcesso.Agenda] }, null, null, CancellationToken.None));
        await Assert.ThrowsAsync<RegraNegocioException>(() => CriarServicoPerfis(contexto).RemoverAsync(pessoa.Id, cenario.ContaId, auditor.Id, null, null, CancellationToken.None));
    }

    [Fact]
    public async Task RemoverPerfil_EmUso_DeveBloquear_ESemUsoRemove()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var perfil = await CriarPerfilAsync(contexto, cenario.ContaId, "Secretária", "Agenda");
        var pessoa = await CriarPessoaAsync(contexto, cenario.ContaId, perfil);
        var servico = CriarServicoPerfis(contexto);

        await Assert.ThrowsAsync<RegraNegocioException>(() => servico.RemoverAsync(cenario.PsicologoId, cenario.ContaId, perfil.Id, null, null, CancellationToken.None));

        pessoa.Perfil = PerfilUsuario.Recepcionista;
        pessoa.PerfilAcessoId = null;
        await contexto.SaveChangesAsync();
        await servico.RemoverAsync(cenario.PsicologoId, cenario.ContaId, perfil.Id, null, null, CancellationToken.None);

        Assert.Empty(contexto.PerfisAcesso);
    }

    [Fact]
    public async Task PerfilDeOutraConta_NaoApareceNemPodeSerUsado()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var outra = await CriarCenarioAsync(contexto);
        var perfilDeOutraConta = await CriarPerfilAsync(contexto, outra.ContaId, "Alheio", "Agenda");

        Assert.Empty(await CriarServicoPerfis(contexto).ListarAsync(cenario.PsicologoId, cenario.ContaId, CancellationToken.None));
        await Assert.ThrowsAsync<RegraNegocioException>(() => CriarServicoUsuarios(contexto).CriarAsync(cenario.PsicologoId, cenario.ContaId,
            NovoUsuario("alheio@teste.local", PerfilUsuario.Personalizado, perfilDeOutraConta.Id), null, null, CancellationToken.None));
    }

    [Fact]
    public async Task CriarUsuario_Personalizado_DeveVincularOPerfil()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var perfil = await CriarPerfilAsync(contexto, cenario.ContaId, "Secretária", "Agenda,Pacientes");

        var criado = await CriarServicoUsuarios(contexto).CriarAsync(cenario.PsicologoId, cenario.ContaId,
            NovoUsuario("ana@teste.local", PerfilUsuario.Personalizado, perfil.Id), null, null, CancellationToken.None);

        Assert.Equal(PerfilUsuario.Personalizado, criado.Perfil);
        Assert.Equal(perfil.Id, criado.PerfilAcessoId);
        Assert.Equal("Secretária", criado.NomeDoPerfil);
    }

    [Fact]
    public async Task CriarUsuario_Personalizado_SemPerfil_DeveBloquear()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);

        await Assert.ThrowsAsync<RegraNegocioException>(() => CriarServicoUsuarios(contexto).CriarAsync(cenario.PsicologoId, cenario.ContaId,
            NovoUsuario("ana@teste.local", PerfilUsuario.Personalizado, null), null, null, CancellationToken.None));
    }

    [Fact]
    public async Task CriarUsuario_ComPerfilPsicologo_DeveBloquear()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);

        await Assert.ThrowsAsync<RegraNegocioException>(() => CriarServicoUsuarios(contexto).CriarAsync(cenario.PsicologoId, cenario.ContaId,
            NovoUsuario("outro@teste.local", PerfilUsuario.Psicologo, null), null, null, CancellationToken.None));
    }

    [Fact]
    public async Task QuemTemEquipe_NaoCriaAdministrador_NemRedefineSenhaDeQuemTemMais()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var gerente = await CriarPerfilAsync(contexto, cenario.ContaId, "Gerente", "Agenda,Equipe");
        var pessoa = await CriarPessoaAsync(contexto, cenario.ContaId, gerente);
        var servico = CriarServicoUsuarios(contexto);

        await Assert.ThrowsAsync<RegraNegocioException>(() => servico.CriarAsync(pessoa.Id, cenario.ContaId,
            NovoUsuario("adm@teste.local", PerfilUsuario.Administrador, null), null, null, CancellationToken.None));
        await Assert.ThrowsAsync<RegraNegocioException>(() => servico.RedefinirSenhaAsync(pessoa.Id, cenario.ContaId, cenario.PsicologoId,
            new RedefinirSenhaUsuarioRequest { NovaSenha = "SenhaNova456!" }, null, null, CancellationToken.None));
        await Assert.ThrowsAsync<RegraNegocioException>(() => servico.AlterarStatusAsync(pessoa.Id, cenario.ContaId, cenario.PsicologoId,
            new AlterarStatusUsuarioRequest { Status = StatusUsuario.Inativo }, null, null, CancellationToken.None));
    }

    [Fact]
    public async Task Administrador_NaoRedefineSenhaDoPsicologo()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var admin = await CriarServicoUsuarios(contexto).CriarAsync(cenario.PsicologoId, cenario.ContaId,
            NovoUsuario("admin@teste.local", PerfilUsuario.Administrador, null), null, null, CancellationToken.None);

        await Assert.ThrowsAsync<RegraNegocioException>(() => CriarServicoUsuarios(contexto).RedefinirSenhaAsync(admin.Id, cenario.ContaId, cenario.PsicologoId,
            new RedefinirSenhaUsuarioRequest { NovaSenha = "SenhaNova456!" }, null, null, CancellationToken.None));
    }

    [Fact]
    public async Task AlterarPerfil_DeveTrocarOPerfil_ForcarNovoLogin_ENaoMexeNoPsicologo()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var perfil = await CriarPerfilAsync(contexto, cenario.ContaId, "Secretária", "Agenda");
        var servico = CriarServicoUsuarios(contexto);
        var criado = await servico.CriarAsync(cenario.PsicologoId, cenario.ContaId,
            NovoUsuario("ana@teste.local", PerfilUsuario.Recepcionista, null), null, null, CancellationToken.None);

        var alterado = await servico.AlterarPerfilAsync(cenario.PsicologoId, cenario.ContaId, criado.Id,
            new AlterarPerfilUsuarioRequest { Perfil = PerfilUsuario.Personalizado, PerfilAcessoId = perfil.Id }, null, null, CancellationToken.None);

        Assert.Equal(PerfilUsuario.Personalizado, alterado.Perfil);
        Assert.Equal("Secretária", alterado.NomeDoPerfil);
        Assert.Equal(1, (await contexto.Usuarios.SingleAsync(x => x.Id == criado.Id)).VersaoAutenticacao);

        await Assert.ThrowsAsync<RegraNegocioException>(() => servico.AlterarPerfilAsync(criado.Id, cenario.ContaId, cenario.PsicologoId,
            new AlterarPerfilUsuarioRequest { Perfil = PerfilUsuario.Recepcionista }, null, null, CancellationToken.None));
        await Assert.ThrowsAsync<RegraNegocioException>(() => servico.AlterarPerfilAsync(cenario.PsicologoId, cenario.ContaId, cenario.PsicologoId,
            new AlterarPerfilUsuarioRequest { Perfil = PerfilUsuario.Recepcionista }, null, null, CancellationToken.None));
    }

    private static CriarUsuarioRequest NovoUsuario(string email, PerfilUsuario perfil, Guid? perfilAcessoId) => new()
    {
        NomeCompleto = "Pessoa da Equipe",
        Email = email,
        Senha = "SenhaSegura123!",
        Perfil = perfil,
        PerfilAcessoId = perfilAcessoId
    };

    private static ClaimsPrincipal PrincipalDe(Usuario usuario)
    {
        var token = new TokenService(Microsoft.Extensions.Options.Options.Create(new Psique.Api.Configuracoes.JwtConfiguracao
        {
            Chave = "chave-exclusiva-testes-com-mais-de-32-caracteres",
            Emissor = "teste",
            Audiencia = "teste"
        })).GerarAccessToken(usuario);
        return new ClaimsPrincipal(new ClaimsIdentity(
            new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler().ReadJwtToken(token.Token).Claims, "Bearer"));
    }

    private static PerfisAcessoService CriarServicoPerfis(AppDbContext contexto) =>
        new(contexto, new AutorizacaoContaService(contexto), new AuditoriaCaptura());

    private static UsuariosService CriarServicoUsuarios(AppDbContext contexto) =>
        new(contexto, new AutorizacaoContaService(contexto), new AuditoriaCaptura(),
            new PasswordHasher<Usuario>(), new EstadoAutenticacaoMemoria());

    private static async Task<Cenario> CriarCenarioAsync(AppDbContext contexto)
    {
        var contaId = Guid.NewGuid();
        var psicologoId = Guid.NewGuid();
        contexto.AddRange(
            new ContaPsicologo { Id = contaId, NomeConta = "Consultório", Status = StatusContaPsicologo.Ativa },
            new Usuario
            {
                Id = psicologoId,
                ContaPsicologoId = contaId,
                NomeCompleto = "Psicóloga",
                Email = $"{psicologoId:N}@teste.local",
                SenhaHash = "hash",
                Perfil = PerfilUsuario.Psicologo,
                Status = StatusUsuario.Ativo
            });
        await contexto.SaveChangesAsync();
        return new Cenario(contaId, psicologoId);
    }

    private static async Task<PerfilAcesso> CriarPerfilAsync(AppDbContext contexto, Guid contaId, string nome, string permissoes)
    {
        var perfil = new PerfilAcesso { Id = Guid.NewGuid(), ContaPsicologoId = contaId, Nome = nome, Permissoes = permissoes };
        contexto.PerfisAcesso.Add(perfil);
        await contexto.SaveChangesAsync();
        return perfil;
    }

    private static async Task<Usuario> CriarPessoaAsync(AppDbContext contexto, Guid contaId, PerfilAcesso perfil)
    {
        var id = Guid.NewGuid();
        var pessoa = new Usuario
        {
            Id = id,
            ContaPsicologoId = contaId,
            NomeCompleto = "Pessoa",
            Email = $"{id:N}@teste.local",
            SenhaHash = "hash",
            Perfil = PerfilUsuario.Personalizado,
            PerfilAcessoId = perfil.Id,
            Status = StatusUsuario.Ativo
        };
        contexto.Usuarios.Add(pessoa);
        await contexto.SaveChangesAsync();
        return pessoa;
    }

    private static AppDbContext CriarContexto() => new(
        new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private sealed record Cenario(Guid ContaId, Guid PsicologoId);

    private sealed class AuditoriaCaptura : IAuditoriaService
    {
        public void Registrar(Guid contaPsicologoId, Guid? usuarioId, string tipoAcao, string entidade,
            Guid? entidadeId, string descricao, object? dadosAntes = null, object? dadosDepois = null,
            string? ip = null, string? userAgent = null)
        {
        }
    }
}
