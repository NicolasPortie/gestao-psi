using GestaoPsi.Api.Data;
using GestaoPsi.Api.DTOs.Relatorios;
using GestaoPsi.Api.Models;
using GestaoPsi.Api.Services.Relatorios;
using GestaoPsi.Api.Services.Seguranca;
using GestaoPsi.Api.Shared.Enums;
using GestaoPsi.Api.Shared.Excecoes;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;

namespace GestaoPsi.Api.Tests;

public sealed class RelatoriosAdministrativosServiceTests
{
    [Fact]
    public async Task Gerar_SessoesRealizadas_DeveRetornarHtmlComCabecalhoETabela()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        contexto.RegistrosSessao.Add(new RegistroSessao
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = cenario.ContaId,
            ProntuarioId = cenario.ProntuarioId,
            PacienteId = cenario.Paciente.Id,
            ConsultaId = cenario.Consulta.Id,
            TipoAtendimentoId = cenario.TipoId,
            CriadoPorUsuarioId = cenario.UsuarioId,
            DataSessao = DateTimeOffset.UtcNow.AddDays(-1),
            Status = StatusRegistroSessao.Finalizado
        });
        await contexto.SaveChangesAsync();

        var service = CriarService(contexto);
        var resultado = await service.GerarAsync(
            cenario.UsuarioId,
            cenario.ContaId,
            "sessoes-realizadas",
            new GerarRelatorioRequest
            {
                PeriodoInicio = DateTimeOffset.UtcNow.AddDays(-7),
                PeriodoFim = DateTimeOffset.UtcNow.AddDays(1)
            },
            null,
            null,
            CancellationToken.None);

        Assert.Contains("Sessões realizadas", resultado.Titulo);
        Assert.Contains("<!DOCTYPE html>", resultado.Html);
        Assert.Contains("Vínculo", resultado.Html);
        Assert.Contains(cenario.Paciente.NomeCompleto, resultado.Html);
        Assert.DoesNotContain("ObservacoesClinicas", resultado.Html);
    }

    [Fact]
    public async Task Gerar_NaoDeveExporDadosDeOutraConta()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var outraConta = Guid.NewGuid();
        var outroPaciente = new Paciente
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = outraConta,
            NomeCompleto = "Paciente externo secreto",
            Status = StatusPaciente.Ativo
        };
        contexto.AddRange(
            new ContaPsicologo { Id = outraConta, NomeConta = "Outra", Status = StatusContaPsicologo.Ativa },
            outroPaciente);
        await contexto.SaveChangesAsync();

        var service = CriarService(contexto);
        var resultado = await service.GerarAsync(
            cenario.UsuarioId,
            cenario.ContaId,
            "pacientes-status",
            new GerarRelatorioRequest
            {
                PeriodoInicio = DateTimeOffset.UtcNow.AddDays(-30),
                PeriodoFim = DateTimeOffset.UtcNow
            },
            null,
            null,
            CancellationToken.None);

        Assert.Contains(cenario.Paciente.NomeCompleto, resultado.Html);
        Assert.DoesNotContain("Paciente externo secreto", resultado.Html);
    }

    [Fact]
    public async Task HistoricoPaciente_ExigePaciente()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var service = CriarService(contexto);

        var excecao = await Assert.ThrowsAsync<RegraNegocioException>(() => service.GerarAsync(
            cenario.UsuarioId,
            cenario.ContaId,
            "historico-atendimentos-paciente",
            new GerarRelatorioRequest
            {
                PeriodoInicio = DateTimeOffset.UtcNow.AddDays(-30),
                PeriodoFim = DateTimeOffset.UtcNow
            },
            null,
            null,
            CancellationToken.None));

        Assert.Equal(StatusCodes.Status400BadRequest, excecao.StatusCode);
    }

    private static RelatoriosAdministrativosService CriarService(AppDbContext contexto) =>
        new(
            contexto,
            new AutorizacaoContaService(contexto),
            new AuditoriaCaptura(),
            new RelatorioHtmlRenderer(new HostAmbienteTeste()));

    private static async Task<Cenario> CriarCenarioAsync(AppDbContext contexto)
    {
        var contaId = Guid.NewGuid();
        var usuarioId = Guid.NewGuid();
        var paciente = new Paciente
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = contaId,
            NomeCompleto = "Paciente Relatorio",
            Status = StatusPaciente.Ativo
        };
        var tipoId = Guid.NewGuid();
        var prontuarioId = Guid.NewGuid();
        var consultaId = Guid.NewGuid();
        contexto.AddRange(
            new ContaPsicologo { Id = contaId, NomeConta = "Consultório Relatório", Status = StatusContaPsicologo.Ativa },
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
            new DadosProfissionaisPsicologo
            {
                Id = Guid.NewGuid(),
                ContaPsicologoId = contaId,
                UsuarioId = usuarioId,
                Crp = "06/99999",
                CrpHash = "hash",
                NomeProfissional = "Dra. Relatório",
                Status = StatusUsuario.Ativo
            },
            paciente,
            new TipoAtendimento
            {
                Id = tipoId,
                ContaPsicologoId = contaId,
                Nome = "Sessao",
                DuracaoMinutos = 50,
                ModalidadePadrao = ModalidadeAtendimento.Presencial,
                Ativo = true
            },
            new Prontuario
            {
                Id = prontuarioId,
                ContaPsicologoId = contaId,
                PacienteId = paciente.Id,
                Status = StatusProntuario.Ativo
            },
            new Consulta
            {
                Id = consultaId,
                ContaPsicologoId = contaId,
                PacienteId = paciente.Id,
                TipoAtendimentoId = tipoId,
                InicioEm = DateTimeOffset.UtcNow.AddDays(-1),
                FimEm = DateTimeOffset.UtcNow.AddDays(-1).AddMinutes(50),
                Status = StatusConsulta.Realizada,
                Modalidade = ModalidadeAtendimento.Presencial
            });
        await contexto.SaveChangesAsync();
        return new Cenario(contaId, usuarioId, paciente, tipoId, prontuarioId, new Consulta { Id = consultaId });
    }

    private static AppDbContext CriarContexto() => new(
        new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

    private sealed record Cenario(
        Guid ContaId,
        Guid UsuarioId,
        Paciente Paciente,
        Guid TipoId,
        Guid ProntuarioId,
        Consulta Consulta);

    private sealed class AuditoriaCaptura : IAuditoriaService
    {
        public void Registrar(
            Guid contaPsicologoId,
            Guid? usuarioId,
            string tipoAcao,
            string entidade,
            Guid? entidadeId,
            string descricao,
            object? dadosAntes = null,
            object? dadosDepois = null,
            string? ip = null,
            string? userAgent = null)
        {
        }
    }

    private sealed class HostAmbienteTeste : IHostEnvironment
    {
        public string EnvironmentName { get; set; } = Environments.Development;
        public string ApplicationName { get; set; } = "GestaoPsi.Api.Tests";
        public string ContentRootPath { get; set; } = Path.GetFullPath(
            Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "GestaoPsi.Api"));
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }
}
