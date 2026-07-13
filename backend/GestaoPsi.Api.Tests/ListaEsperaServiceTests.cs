using GestaoPsi.Api.Data;
using GestaoPsi.Api.DTOs.Consultas;
using GestaoPsi.Api.DTOs.ListaEspera;
using GestaoPsi.Api.Models;
using GestaoPsi.Api.Services.Consultas;
using GestaoPsi.Api.Services.ListaEspera;
using GestaoPsi.Api.Services.Seguranca;
using GestaoPsi.Api.Shared.Enums;
using GestaoPsi.Api.Shared.Excecoes;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace GestaoPsi.Api.Tests;

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

        Assert.Single(resultado);
        Assert.Equal(cenario.Paciente.NomeCompleto, resultado.Single().Paciente);
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

        var service = new ConsultasService(contexto, new AutorizacaoContaService(contexto), new AuditoriaCaptura());
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
}
