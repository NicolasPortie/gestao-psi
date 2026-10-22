using Psique.Api.Configuracoes;
using Psique.Api.Data;
using Psique.Api.DTOs.Consultas;
using Psique.Api.Models;
using Psique.Api.Services.Agenda;
using Psique.Api.Services.Comunicacao;
using Psique.Api.Services.Consultas;
using Psique.Api.Services.Lembretes;
using Psique.Api.Services.Notificacoes;
using Psique.Api.Services.Seguranca;
using Psique.Api.Shared.Enums;
using Psique.Api.Shared.Excecoes;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Psique.Api.Tests;

public sealed class ConsultasServiceTests
{
    private static async Task<Consulta> ConsultaPassadaAsync(AppDbContext contexto, Cenario cenario)
    {
        var inicio = DateTimeOffset.UtcNow.AddHours(-3);
        var consulta = new Consulta
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = cenario.ContaId,
            PacienteId = cenario.Paciente.Id,
            TipoAtendimentoId = cenario.Tipo.Id,
            InicioEm = inicio,
            FimEm = inicio.AddMinutes(50),
            Modalidade = ModalidadeAtendimento.Presencial,
            Status = StatusConsulta.Confirmada,
            Origem = OrigemConsulta.Painel
        };
        contexto.Consultas.Add(consulta);
        await contexto.SaveChangesAsync();
        return consulta;
    }

    [Fact]
    public async Task MarcarRealizada_CriaCobrancaComValorDoPacienteSemDuplicar()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        cenario.Paciente.ValorSessao = 200;
        await contexto.SaveChangesAsync();
        var consulta = await ConsultaPassadaAsync(contexto, cenario);
        var service = CriarService(contexto);

        await service.AlterarStatusAsync(cenario.UsuarioId, cenario.ContaId, consulta.Id, new AlterarStatusConsultaRequest { Status = StatusConsulta.Realizada }, null, null, CancellationToken.None);

        var pagamento = await contexto.Pagamentos.SingleAsync(x => x.ConsultaId == consulta.Id);
        Assert.Equal(200, pagamento.Valor);
        Assert.Equal(StatusPagamento.Pendente, pagamento.Status);
    }

    [Fact]
    public async Task Falta_SoGeraCobrancaQuandoAContaCobraFalta()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        cenario.Paciente.ValorSessao = 150;
        await contexto.SaveChangesAsync();
        var service = CriarService(contexto);

        var semPolitica = await ConsultaPassadaAsync(contexto, cenario);
        await service.AlterarStatusAsync(cenario.UsuarioId, cenario.ContaId, semPolitica.Id, new AlterarStatusConsultaRequest { Status = StatusConsulta.NaoCompareceu }, null, null, CancellationToken.None);
        Assert.False(await contexto.Pagamentos.AnyAsync(x => x.ConsultaId == semPolitica.Id));

        var configuracao = await contexto.ConfiguracoesAtendimento.SingleAsync(x => x.ContaPsicologoId == cenario.ContaId);
        configuracao.CobrarFalta = true;
        await contexto.SaveChangesAsync();
        var comPolitica = await ConsultaPassadaAsync(contexto, cenario);
        await service.AlterarStatusAsync(cenario.UsuarioId, cenario.ContaId, comPolitica.Id, new AlterarStatusConsultaRequest { Status = StatusConsulta.NaoCompareceu }, null, null, CancellationToken.None);
        Assert.Equal(150, (await contexto.Pagamentos.SingleAsync(x => x.ConsultaId == comPolitica.Id)).Valor);
    }

    [Fact]
    public async Task GerarMensalidades_CriaUmaPorMensalistaENaoDuplica()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        cenario.Paciente.ValorSessao = 640;
        cenario.Paciente.ModoCobranca = ModoCobranca.Mensal;
        contexto.Pacientes.Add(new Paciente { Id = Guid.NewGuid(), ContaPsicologoId = cenario.ContaId, NomeCompleto = "Mensalista sem valor", Status = StatusPaciente.Ativo, ModoCobranca = ModoCobranca.Mensal });
        await contexto.SaveChangesAsync();
        var autorizacao = new AutorizacaoContaService(contexto);
        var pagamentos = new Services.Pagamentos.PagamentosService(contexto, autorizacao, new AuditoriaCaptura(), new ProtecaoFakeConsultas());
        var pedido = new DTOs.Pagamentos.GerarMensalidadesRequest { Ano = 2026, Mes = 11, DiaVencimento = 10 };

        var primeira = await pagamentos.GerarMensalidadesAsync(cenario.UsuarioId, cenario.ContaId, pedido, null, null, CancellationToken.None);
        var segunda = await pagamentos.GerarMensalidadesAsync(cenario.UsuarioId, cenario.ContaId, pedido, null, null, CancellationToken.None);

        Assert.Equal(1, primeira.Criadas);
        Assert.Single(primeira.SemValor);
        Assert.Equal(0, segunda.Criadas);
        Assert.Equal(1, segunda.JaExistiam);
        var mensalidade = await contexto.Pagamentos.SingleAsync();
        Assert.Equal(new DateOnly(2026, 11, 1), mensalidade.Competencia);
        Assert.Equal(640, mensalidade.Valor);
    }

    [Fact]
    public async Task MarcarRealizada_NaoCobraSessaoDeMensalista()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        cenario.Paciente.ValorSessao = 600;
        cenario.Paciente.ModoCobranca = ModoCobranca.Mensal;
        await contexto.SaveChangesAsync();
        var consulta = await ConsultaPassadaAsync(contexto, cenario);

        await CriarService(contexto).AlterarStatusAsync(cenario.UsuarioId, cenario.ContaId, consulta.Id, new AlterarStatusConsultaRequest { Status = StatusConsulta.Realizada }, null, null, CancellationToken.None);

        Assert.False(await contexto.Pagamentos.AnyAsync());
    }

    [Fact]
    public async Task CriarSerie_Semanal_RepeteNoMesmoHorarioEPulaOcupado()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var service = CriarService(contexto);
        var inicio = DateTimeOffset.UtcNow.AddDays(3);
        // A terceira semana já está ocupada por outra consulta.
        contexto.Consultas.Add(new Consulta
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = cenario.ContaId,
            PacienteId = cenario.Paciente.Id,
            TipoAtendimentoId = cenario.Tipo.Id,
            InicioEm = inicio.AddDays(14),
            FimEm = inicio.AddDays(14).AddMinutes(50),
            Modalidade = ModalidadeAtendimento.Presencial,
            Status = StatusConsulta.Confirmada,
            Origem = OrigemConsulta.Painel
        });
        await contexto.SaveChangesAsync();

        var serie = await service.CriarSerieAsync(cenario.UsuarioId, cenario.ContaId,
            new CriarConsultaRequest
            {
                PacienteId = cenario.Paciente.Id,
                TipoAtendimentoId = cenario.Tipo.Id,
                InicioEm = inicio,
                FimEm = inicio.AddMinutes(50),
                Modalidade = ModalidadeAtendimento.Presencial,
                Recorrencia = new RecorrenciaConsultaRequest { Frequencia = FrequenciaRecorrencia.Semanal, Ocorrencias = 4 }
            }, null, null, CancellationToken.None);

        Assert.NotNull(serie.SerieId);
        Assert.Equal(3, serie.Criadas.Count);
        Assert.Single(serie.Ignoradas);
        Assert.All(serie.Criadas, consulta => Assert.Equal(serie.SerieId, consulta.SerieId));
        Assert.Equal(inicio.AddDays(21).UtcDateTime, serie.Criadas.Last().InicioEm.UtcDateTime, TimeSpan.FromMinutes(1));
    }

    [Fact]
    public async Task CancelarSerie_CancelaDaSelecionadaEmDiante()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var service = CriarService(contexto);
        var inicio = DateTimeOffset.UtcNow.AddDays(3);
        var serie = await service.CriarSerieAsync(cenario.UsuarioId, cenario.ContaId,
            new CriarConsultaRequest
            {
                PacienteId = cenario.Paciente.Id,
                TipoAtendimentoId = cenario.Tipo.Id,
                InicioEm = inicio,
                FimEm = inicio.AddMinutes(50),
                Modalidade = ModalidadeAtendimento.Online,
                Recorrencia = new RecorrenciaConsultaRequest { Frequencia = FrequenciaRecorrencia.Quinzenal, Ocorrencias = 3 }
            }, null, null, CancellationToken.None);
        var segunda = serie.Criadas.ElementAt(1);

        var resultado = await service.CancelarSerieAsync(cenario.UsuarioId, cenario.ContaId, segunda.Id, new CancelarSerieRequest(), null, null, CancellationToken.None);

        Assert.Equal(2, resultado.Canceladas);
        var estados = await contexto.Consultas.Where(x => x.SerieId == serie.SerieId).OrderBy(x => x.InicioEm).Select(x => x.Status).ToListAsync();
        Assert.NotEqual(StatusConsulta.Cancelada, estados[0]);
        Assert.Equal(StatusConsulta.Cancelada, estados[1]);
        Assert.Equal(StatusConsulta.Cancelada, estados[2]);
    }

    [Fact]
    public async Task Remarcar_DeveCriarNovaConsultaEMarcarAntigaComoRemarcada()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var service = CriarService(contexto);
        var inicio = DateTimeOffset.UtcNow.AddDays(3);
        var consulta = await service.CriarAsync(cenario.UsuarioId, cenario.ContaId,
            new CriarConsultaRequest
            {
                PacienteId = cenario.Paciente.Id,
                TipoAtendimentoId = cenario.Tipo.Id,
                InicioEm = inicio,
                FimEm = inicio.AddMinutes(50),
                Modalidade = ModalidadeAtendimento.Presencial
            }, null, null, CancellationToken.None);

        var novoInicio = inicio.AddDays(1);
        var nova = await service.RemarcarAsync(cenario.UsuarioId, cenario.ContaId, consulta.Id,
            new RemarcarConsultaRequest { NovoInicioEm = novoInicio, NovoFimEm = novoInicio.AddMinutes(50) },
            null, null, CancellationToken.None);

        Assert.NotEqual(consulta.Id, nova.Id);
        Assert.Equal(novoInicio, nova.InicioEm);
        var antiga = await contexto.Consultas.SingleAsync(x => x.Id == consulta.Id);
        Assert.Equal(StatusConsulta.Remarcada, antiga.Status);
        Assert.Equal(3, contexto.HistoricosConsulta.Count());
    }

    [Fact]
    public async Task Remarcar_ForaDoPrazo_DeveBloquear()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto, antecedenciaRemarcacaoHoras: 24);
        var service = CriarService(contexto);
        var inicio = DateTimeOffset.UtcNow.AddHours(5);
        // Cria direto no banco para nao esbarrar na antecedencia minima de criacao.
        var consulta = new Consulta
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = cenario.ContaId,
            PacienteId = cenario.Paciente.Id,
            TipoAtendimentoId = cenario.Tipo.Id,
            InicioEm = inicio,
            FimEm = inicio.AddMinutes(50),
            Modalidade = ModalidadeAtendimento.Presencial,
            Status = StatusConsulta.Confirmada,
            Origem = OrigemConsulta.Painel
        };
        contexto.Consultas.Add(consulta);
        await contexto.SaveChangesAsync();

        var novoInicio = DateTimeOffset.UtcNow.AddDays(2);
        var excecao = await Assert.ThrowsAsync<RegraNegocioException>(() =>
            service.RemarcarAsync(cenario.UsuarioId, cenario.ContaId, consulta.Id,
                new RemarcarConsultaRequest { NovoInicioEm = novoInicio, NovoFimEm = novoInicio.AddMinutes(50) },
                null, null, CancellationToken.None));

        Assert.Contains("fora do prazo", excecao.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Remarcar_ParaHorarioOcupado_DeveBloquear()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var service = CriarService(contexto);
        var base_ = DateTimeOffset.UtcNow.AddDays(3);
        var primeira = await service.CriarAsync(cenario.UsuarioId, cenario.ContaId,
            new CriarConsultaRequest
            {
                PacienteId = cenario.Paciente.Id,
                TipoAtendimentoId = cenario.Tipo.Id,
                InicioEm = base_,
                FimEm = base_.AddMinutes(50),
                Modalidade = ModalidadeAtendimento.Presencial
            }, null, null, CancellationToken.None);
        var ocupada = base_.AddHours(2);
        await service.CriarAsync(cenario.UsuarioId, cenario.ContaId,
            new CriarConsultaRequest
            {
                PacienteId = cenario.Paciente.Id,
                TipoAtendimentoId = cenario.Tipo.Id,
                InicioEm = ocupada,
                FimEm = ocupada.AddMinutes(50),
                Modalidade = ModalidadeAtendimento.Presencial
            }, null, null, CancellationToken.None);

        await Assert.ThrowsAsync<RegraNegocioException>(() =>
            service.RemarcarAsync(cenario.UsuarioId, cenario.ContaId, primeira.Id,
                new RemarcarConsultaRequest { NovoInicioEm = ocupada.AddMinutes(10), NovoFimEm = ocupada.AddMinutes(60) },
                null, null, CancellationToken.None));
    }

    [Fact]
    public async Task Cancelar_ForaDoPrazo_DeveBloquear()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto, antecedenciaCancelamentoHoras: 24);
        var inicio = DateTimeOffset.UtcNow.AddHours(5);
        var consulta = new Consulta
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = cenario.ContaId,
            PacienteId = cenario.Paciente.Id,
            TipoAtendimentoId = cenario.Tipo.Id,
            InicioEm = inicio,
            FimEm = inicio.AddMinutes(50),
            Modalidade = ModalidadeAtendimento.Presencial,
            Status = StatusConsulta.Confirmada,
            Origem = OrigemConsulta.Painel
        };
        contexto.Consultas.Add(consulta);
        await contexto.SaveChangesAsync();

        var service = CriarService(contexto);
        await Assert.ThrowsAsync<RegraNegocioException>(() =>
            service.AlterarStatusAsync(cenario.UsuarioId, cenario.ContaId, consulta.Id,
                new AlterarStatusConsultaRequest { Status = StatusConsulta.Cancelada, Justificativa = "motivo" },
                null, null, CancellationToken.None));
    }

    [Fact]
    public async Task Criar_ForaDosHorariosConfigurados_DeveBloquear()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        contexto.HorariosDisponiveis.Add(new HorarioDisponivel
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = cenario.ContaId,
            DiaSemana = DiaSemana.Segunda,
            HoraInicio = new TimeOnly(8, 0),
            HoraFim = new TimeOnly(12, 0),
            Ativo = true
        });
        await contexto.SaveChangesAsync();
        var service = CriarService(contexto);

        var domingo = ProximoDiaLocal(DayOfWeek.Sunday, 9, 0);
        await Assert.ThrowsAsync<RegraNegocioException>(() =>
            service.CriarAsync(cenario.UsuarioId, cenario.ContaId,
                new CriarConsultaRequest
                {
                    PacienteId = cenario.Paciente.Id,
                    TipoAtendimentoId = cenario.Tipo.Id,
                    InicioEm = domingo,
                    FimEm = domingo.AddMinutes(50),
                    Modalidade = ModalidadeAtendimento.Presencial
                }, null, null, CancellationToken.None));

        var segunda = ProximoDiaLocal(DayOfWeek.Monday, 9, 0);
        var consulta = await service.CriarAsync(cenario.UsuarioId, cenario.ContaId,
            new CriarConsultaRequest
            {
                PacienteId = cenario.Paciente.Id,
                TipoAtendimentoId = cenario.Tipo.Id,
                InicioEm = segunda,
                FimEm = segunda.AddMinutes(50),
                Modalidade = ModalidadeAtendimento.Presencial
            }, null, null, CancellationToken.None);
        Assert.NotEqual(Guid.Empty, consulta.Id);
    }

    private static DateTimeOffset ProximoDia(DayOfWeek dia, int hora, int minuto)
    {
        var base_ = DateTimeOffset.UtcNow.AddDays(2);
        while (base_.DayOfWeek != dia) base_ = base_.AddDays(1);
        return new DateTimeOffset(base_.Year, base_.Month, base_.Day, hora, minuto, 0, TimeSpan.Zero);
    }

    private static DateTimeOffset ProximoDiaLocal(DayOfWeek dia, int hora, int minuto)
    {
        var fuso = FusoHorarioConta.Resolver(FusoHorarioConta.Padrao);
        var base_ = TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow.AddDays(2), fuso);
        while (base_.DayOfWeek != dia) base_ = base_.AddDays(1);
        return new DateTimeOffset(base_.Year, base_.Month, base_.Day, hora, minuto, 0, fuso.GetUtcOffset(base_.DateTime));
    }

    [Fact]
    public async Task Criar_HorarioUtcEquivalenteAoLocal_DeveAceitar()
    {
        // Regressao: grade de parede e comparada no fuso local, nao no relogio UTC.
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        contexto.HorariosDisponiveis.Add(new HorarioDisponivel
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = cenario.ContaId,
            DiaSemana = DiaSemana.Segunda,
            HoraInicio = new TimeOnly(8, 0),
            HoraFim = new TimeOnly(18, 0),
            Ativo = true
        });
        await contexto.SaveChangesAsync();
        var service = CriarService(contexto);

        var fuso = FusoHorarioConta.Resolver(FusoHorarioConta.Padrao);
        var dia = DateTimeOffset.UtcNow.AddDays(2);
        while (TimeZoneInfo.ConvertTime(dia, fuso).DayOfWeek != DayOfWeek.Monday) dia = dia.AddDays(1);
        var parede = TimeZoneInfo.ConvertTime(dia, fuso);
        var inicio = new DateTimeOffset(parede.Year, parede.Month, parede.Day, 15, 0, 0, fuso.GetUtcOffset(parede.DateTime));

        var consulta = await service.CriarAsync(cenario.UsuarioId, cenario.ContaId,
            new CriarConsultaRequest
            {
                PacienteId = cenario.Paciente.Id,
                TipoAtendimentoId = cenario.Tipo.Id,
                InicioEm = inicio,
                FimEm = inicio.AddMinutes(50),
                Modalidade = ModalidadeAtendimento.Presencial
            }, null, null, CancellationToken.None);
        Assert.NotEqual(Guid.Empty, consulta.Id);
    }

    [Fact]
    public async Task Criar_ComPagamentoPendente_DeveVincularPagamento()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var service = CriarService(contexto);
        var inicio = ProximoDiaLocal(DayOfWeek.Tuesday, 10, 0);
        var consulta = await service.CriarAsync(cenario.UsuarioId, cenario.ContaId,
            new CriarConsultaRequest
            {
                PacienteId = cenario.Paciente.Id,
                TipoAtendimentoId = cenario.Tipo.Id,
                InicioEm = inicio,
                FimEm = inicio.AddMinutes(50),
                Modalidade = ModalidadeAtendimento.Presencial,
                CriarPagamentoPendente = true,
                ValorPagamento = 250m
            }, null, null, CancellationToken.None);

        var pagamento = Assert.Single(contexto.Pagamentos);
        Assert.Equal(consulta.Id, pagamento.ConsultaId);
        Assert.Equal(StatusPagamento.Pendente, pagamento.Status);
        Assert.Equal(250m, pagamento.Valor);
    }

    private static ConsultasService CriarService(AppDbContext contexto)
    {
        var autorizacao = new AutorizacaoContaService(contexto);
        var lembretes = new LembretesService(
            contexto,
            autorizacao,
            new AuditoriaCaptura(),
            new ModeloMensagemTemplateService(),
            new EmailFakeConsultas(),
            Options.Create(new EmailConfiguracao { Ativo = false }),
            new NotificacoesService(contexto, autorizacao),
            new ProtecaoFakeConsultas());
        return new(contexto, autorizacao, new AuditoriaCaptura(), lembretes);
    }

    [Fact]
    public async Task Listar_DeveRecusarPeriodoInvertidoOuMaiorQueOLimite()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var service = CriarService(contexto);
        var agora = DateTimeOffset.UtcNow;

        await Assert.ThrowsAsync<RegraNegocioException>(() =>
            service.ListarAsync(cenario.UsuarioId, cenario.ContaId, agora, agora.AddDays(-1), null, CancellationToken.None));
        var excesso = await Assert.ThrowsAsync<RegraNegocioException>(() =>
            service.ListarAsync(cenario.UsuarioId, cenario.ContaId, agora, agora.AddDays(ConsultasService.MaximoDiasListagem + 1), null, CancellationToken.None));

        Assert.Contains("máximo", excesso.Message);
        var noLimite = await service.ListarAsync(cenario.UsuarioId, cenario.ContaId, agora, agora.AddDays(ConsultasService.MaximoDiasListagem), null, CancellationToken.None);
        Assert.Empty(noLimite);
    }

    [Fact]
    public async Task Listar_ComPaciente_DeveTrazerSomenteAsConsultasDele()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var outro = new Paciente { Id = Guid.NewGuid(), ContaPsicologoId = cenario.ContaId, NomeCompleto = "Outro paciente", Status = StatusPaciente.Ativo };
        contexto.Add(outro);
        var inicio = DateTimeOffset.UtcNow.AddDays(2);
        foreach (var (paciente, deslocamento) in new[] { (cenario.Paciente, 0), (outro, 2) })
        {
            contexto.Add(new Consulta
            {
                Id = Guid.NewGuid(),
                ContaPsicologoId = cenario.ContaId,
                PacienteId = paciente.Id,
                TipoAtendimentoId = cenario.Tipo.Id,
                InicioEm = inicio.AddHours(deslocamento),
                FimEm = inicio.AddHours(deslocamento).AddMinutes(50),
                Status = StatusConsulta.Agendada,
                Modalidade = ModalidadeAtendimento.Presencial
            });
        }
        await contexto.SaveChangesAsync();
        var service = CriarService(contexto);

        var todas = await service.ListarAsync(cenario.UsuarioId, cenario.ContaId, inicio.AddDays(-1), inicio.AddDays(1), null, CancellationToken.None);
        var doPaciente = await service.ListarAsync(cenario.UsuarioId, cenario.ContaId, inicio.AddDays(-1), inicio.AddDays(1), cenario.Paciente.Id, CancellationToken.None);
        var deOutraConta = await service.ListarAsync(cenario.UsuarioId, cenario.ContaId, inicio.AddDays(-1), inicio.AddDays(1), Guid.NewGuid(), CancellationToken.None);

        Assert.Equal(2, todas.Count);
        Assert.Single(doPaciente);
        Assert.Equal(cenario.Paciente.Id, doPaciente.Single().PacienteId);
        Assert.Empty(deOutraConta);
    }

    private static async Task<Cenario> CriarCenarioAsync(
        AppDbContext contexto, int? antecedenciaCancelamentoHoras = null, int? antecedenciaRemarcacaoHoras = null)
    {
        var contaId = Guid.NewGuid();
        var usuarioId = Guid.NewGuid();
        var tipo = new TipoAtendimento
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = contaId,
            Nome = "Psicoterapia",
            DuracaoMinutos = 50,
            ModalidadePadrao = ModalidadeAtendimento.Presencial,
            Ativo = true
        };
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
                AntecedenciaCancelamentoHoras = antecedenciaCancelamentoHoras,
                AntecedenciaRemarcacaoHoras = antecedenciaRemarcacaoHoras,
                Ativo = true
            },
            tipo,
            paciente);
        await contexto.SaveChangesAsync();
        return new Cenario(contaId, usuarioId, paciente, tipo);
    }

    private static AppDbContext CriarContexto() => new(
        new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

    private sealed record Cenario(Guid ContaId, Guid UsuarioId, Paciente Paciente, TipoAtendimento Tipo);

    private sealed class AuditoriaCaptura : IAuditoriaService
    {
        public void Registrar(Guid contaPsicologoId, Guid? usuarioId, string tipoAcao, string entidade,
            Guid? entidadeId, string descricao, object? dadosAntes = null, object? dadosDepois = null,
            string? ip = null, string? userAgent = null)
        {
        }
    }

    private sealed class EmailFakeConsultas : IEmailTransacionalService
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

    private sealed class ProtecaoFakeConsultas : IProtecaoDadosService
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
