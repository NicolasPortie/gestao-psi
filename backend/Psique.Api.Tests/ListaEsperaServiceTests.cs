using Psique.Api.Data;
using Psique.Api.DTOs.Consultas;
using Psique.Api.DTOs.ListaEspera;
using Psique.Api.Models;
using Psique.Api.Services.Consultas;
using Psique.Api.Services.Lembretes;
using Psique.Api.Services.ListaEspera;
using Psique.Api.Services.Notificacoes;
using Psique.Api.Services.Seguranca;
using Psique.Api.Configuracoes;
using Psique.Api.Services.Comunicacao;
using Microsoft.Extensions.Options;
using Psique.Api.Shared.Enums;
using Psique.Api.Shared.Excecoes;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Psique.Api.Tests;

public sealed class ListaEsperaServiceTests
{
    [Fact]
    public async Task Listar_DeveRetornarSomenteRegistrosDaContaAutenticada()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var outraContaId = Guid.NewGuid();
        var outroPaciente = new Paciente
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = outraContaId,
            NomeCompleto = "Paciente externo",
            Status = StatusPaciente.Ativo
        };
        contexto.AddRange(
            new ContaPsicologo { Id = outraContaId, NomeConta = "Outra conta", Status = StatusContaPsicologo.Ativa },
            outroPaciente,
            new ListaEspera
            {
                Id = Guid.NewGuid(),
                ContaPsicologoId = cenario.ContaId,
                PacienteId = cenario.Paciente.Id,
                Prioridade = 1
            },
            new ListaEspera
            {
                Id = Guid.NewGuid(),
                ContaPsicologoId = outraContaId,
                PacienteId = outroPaciente.Id,
                Prioridade = 1
            });
        await contexto.SaveChangesAsync();

        var service = CriarService(contexto);
        var resultado = await service.ListarAsync(cenario.UsuarioId, cenario.ContaId, new(), CancellationToken.None);

        Assert.Single(resultado.Itens);
        Assert.Equal(cenario.Paciente.NomeCompleto, resultado.Itens.Single().Paciente);
    }

    [Fact]
    public async Task Listar_DevePaginarComTotalCorreto()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        for (var i = 0; i < 7; i++)
        {
            contexto.ListaEspera.Add(new ListaEspera
            {
                Id = Guid.NewGuid(),
                ContaPsicologoId = cenario.ContaId,
                PacienteId = cenario.Paciente.Id,
                Prioridade = 2
            });
        }
        await contexto.SaveChangesAsync();

        var service = CriarService(contexto);
        var primeira = await service.ListarAsync(cenario.UsuarioId, cenario.ContaId, new FiltroListaEsperaRequest { Pagina = 1, TamanhoPagina = 5 }, CancellationToken.None);
        var segunda = await service.ListarAsync(cenario.UsuarioId, cenario.ContaId, new FiltroListaEsperaRequest { Pagina = 2, TamanhoPagina = 5 }, CancellationToken.None);

        Assert.Equal(7, primeira.Total);
        Assert.Equal(5, primeira.Itens.Count);
        Assert.Equal(1, primeira.Pagina);
        Assert.Equal(2, segunda.Itens.Count);
        Assert.Equal(2, segunda.Pagina);
        Assert.Empty(primeira.Itens.Select(item => item.Id).Intersect(segunda.Itens.Select(item => item.Id)));
    }

    [Fact]
    public async Task Listar_DeveNormalizarPaginaETamanhoPagina()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);

        var service = CriarService(contexto);
        var resultado = await service.ListarAsync(cenario.UsuarioId, cenario.ContaId, new FiltroListaEsperaRequest { Pagina = 0, TamanhoPagina = 500 }, CancellationToken.None);

        Assert.Equal(1, resultado.Pagina);
        Assert.Equal(100, resultado.TamanhoPagina);
    }

    [Fact]
    public async Task Criar_NaoDeveAceitarPacienteDeOutraConta()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var outraContaId = Guid.NewGuid();
        var outroPaciente = new Paciente
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = outraContaId,
            NomeCompleto = "Paciente externo",
            Status = StatusPaciente.Ativo
        };
        contexto.AddRange(
            new ContaPsicologo { Id = outraContaId, NomeConta = "Outra conta", Status = StatusContaPsicologo.Ativa },
            outroPaciente);
        await contexto.SaveChangesAsync();

        var service = CriarService(contexto);
        var excecao = await Assert.ThrowsAsync<RegraNegocioException>(() => service.CriarAsync(
            cenario.UsuarioId,
            cenario.ContaId,
            new CriarListaEsperaRequest { PacienteId = outroPaciente.Id, Prioridade = 2 },
            null,
            null,
            CancellationToken.None));

        Assert.Equal(StatusCodes.Status404NotFound, excecao.StatusCode);
        Assert.Empty(contexto.ListaEspera);
    }

    [Fact]
    public async Task CriarConsulta_DeveEncerrarRegistroAtivoDaListaDeEspera()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var tipo = new TipoAtendimento
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = cenario.ContaId,
            Nome = "Psicoterapia",
            DuracaoMinutos = 50,
            ModalidadePadrao = ModalidadeAtendimento.Presencial,
            Ativo = true
        };
        var espera = new ListaEspera
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = cenario.ContaId,
            PacienteId = cenario.Paciente.Id,
            TipoAtendimentoId = tipo.Id,
            Status = StatusListaEspera.Contatado,
            Prioridade = 1
        };
        contexto.AddRange(tipo, espera);
        await contexto.SaveChangesAsync();

        var autorizacao = new AutorizacaoContaService(contexto);
        var lembretes = new LembretesService(
            contexto,
            autorizacao,
            new AuditoriaCaptura(),
            new ModeloMensagemTemplateService(),
            new EmailFakeListaEspera(),
            Options.Create(new EmailConfiguracao { Ativo = false }),
            new NotificacoesService(contexto, autorizacao),
            new ProtecaoFakeListaEspera());
        var service = new ConsultasService(contexto, autorizacao, new AuditoriaCaptura(), lembretes);
        var inicio = DateTimeOffset.UtcNow.AddDays(2);
        var consulta = await service.CriarAsync(
            cenario.UsuarioId,
            cenario.ContaId,
            new CriarConsultaRequest
            {
                PacienteId = cenario.Paciente.Id,
                TipoAtendimentoId = tipo.Id,
                ListaEsperaId = espera.Id,
                InicioEm = inicio,
                FimEm = inicio.AddMinutes(50),
                Modalidade = ModalidadeAtendimento.Presencial
            },
            null,
            null,
            CancellationToken.None);

        Assert.NotEqual(Guid.Empty, consulta.Id);
        Assert.Equal(StatusListaEspera.Agendado, espera.Status);
    }

    private static ListaEsperaService CriarService(AppDbContext contexto) =>
        new(contexto, new AutorizacaoContaService(contexto), new AuditoriaCaptura());

    private static async Task<Cenario> CriarCenarioAsync(AppDbContext contexto)
    {
        var contaId = Guid.NewGuid();
        var usuarioId = Guid.NewGuid();
        var paciente = new Paciente
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = contaId,
            NomeCompleto = "Paciente da conta",
            Status = StatusPaciente.Ativo
        };
        contexto.AddRange(
            new ContaPsicologo { Id = contaId, NomeConta = "Consultorio", Status = StatusContaPsicologo.Ativa },
            new Usuario
            {
                Id = usuarioId,
                ContaPsicologoId = contaId,
                NomeCompleto = "Psicologa",
                Email = $"{usuarioId:N}@teste.local",
                SenhaHash = "hash",
                Perfil = PerfilUsuario.Psicologo,
                Status = StatusUsuario.Ativo
            },
            new ConfiguracaoAtendimento
            {
                Id = Guid.NewGuid(),
                ContaPsicologoId = contaId,
                PermiteListaEspera = true,
                Ativo = true
            },
            paciente);
        await contexto.SaveChangesAsync();
        return new Cenario(contaId, usuarioId, paciente);
    }

    private static AppDbContext CriarContexto() => new(
        new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

    private sealed record Cenario(Guid ContaId, Guid UsuarioId, Paciente Paciente);

    private sealed class AuditoriaCaptura : IAuditoriaService
    {
        public void Registrar(Guid contaPsicologoId, Guid? usuarioId, string tipoAcao, string entidade, Guid? entidadeId, string descricao, object? dadosAntes = null, object? dadosDepois = null, string? ip = null, string? userAgent = null)
        {
        }
    }

    private sealed class EmailFakeListaEspera : IEmailTransacionalService
    {
        public Task<bool> EnviarRecuperacaoSenhaAsync(string destinatario, string nome, string token, CancellationToken cancellationToken) =>
            Task.FromResult(false);

        public Task<bool> EnviarMensagemAdministrativaAsync(
            string destinatario,
            string nomeDestinatario,
            string assunto,
            string corpo,
            CancellationToken cancellationToken) =>
            Task.FromResult(false);
    }

    private sealed class ProtecaoFakeListaEspera : IProtecaoDadosService
    {
        public string Proteger(string valor) => $"protegido:{valor}";
        public string Desproteger(string valorProtegido) =>
            valorProtegido.StartsWith("protegido:", StringComparison.Ordinal)
                ? valorProtegido["protegido:".Length..]
                : valorProtegido;
        public string HashDeterministico(string valor) => $"hash:{valor}";
        public string HashToken(string token) => $"tokenhash:{token}";
        public string GerarTokenSeguro() => "token";
    }
}

