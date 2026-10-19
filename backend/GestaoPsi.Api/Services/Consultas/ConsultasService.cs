using GestaoPsi.Api.Data;
using GestaoPsi.Api.DTOs.Consultas;
using GestaoPsi.Api.Models;
using GestaoPsi.Api.Services.Lembretes;
using GestaoPsi.Api.Services.Seguranca;
using GestaoPsi.Api.Shared.Enums;
using GestaoPsi.Api.Shared.Excecoes;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace GestaoPsi.Api.Services.Consultas;

public sealed class ConsultasService(
    AppDbContext dbContext,
    IAutorizacaoContaService autorizacao,
    IAuditoriaService auditoria,
    ILembretesService lembretes) : IConsultasService
{
    /// <summary>Maior intervalo aceito na listagem: a agenda pede dias e semanas, e o registro de sessão olha alguns meses.</summary>
    public const int MaximoDiasListagem = 366;

    public async Task<IReadOnlyCollection<ConsultaResponse>> ListarAsync(Guid usuarioId, Guid contaId, DateTimeOffset inicio, DateTimeOffset fim, Guid? pacienteId, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        if (fim <= inicio)
            throw new RegraNegocioException("O fim do período deve ser posterior ao início.");
        if ((fim - inicio).TotalDays > MaximoDiasListagem)
            throw new RegraNegocioException($"O período máximo da listagem é de {MaximoDiasListagem} dias.");

        var consulta = dbContext.Consultas.AsNoTracking().Where(x => x.ContaPsicologoId == contaId && x.InicioEm < fim && x.FimEm > inicio);
        if (pacienteId is not null) consulta = consulta.Where(x => x.PacienteId == pacienteId);
        var consultas = await consulta
            .Include(x => x.Paciente).Include(x => x.TipoAtendimento).OrderBy(x => x.InicioEm).ToArrayAsync(ct);
        return consultas.Select(Mapear).ToArray();
    }

    public async Task<ConsultaDetalheResponse> ObterPorIdAsync(Guid usuarioId, Guid contaId, Guid id, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var consulta = await dbContext.Consultas.AsNoTracking()
            .Include(x => x.Paciente)
            .Include(x => x.TipoAtendimento)
            .Include(x => x.Pagamentos)
            .Include(x => x.Lembretes)
            .Include(x => x.Historicos)
            .SingleOrDefaultAsync(x => x.Id == id && x.ContaPsicologoId == contaId, ct)
            ?? throw new RegraNegocioException("Consulta não encontrada.", StatusCodes.Status404NotFound);
        var proximasNaSerie = consulta.SerieId is null
            ? 0
            : await dbContext.Consultas.CountAsync(x => x.ContaPsicologoId == contaId && x.SerieId == consulta.SerieId && x.InicioEm > consulta.InicioEm &&
                (x.Status == StatusConsulta.AguardandoConfirmacao || x.Status == StatusConsulta.Agendada || x.Status == StatusConsulta.Confirmada), ct);
        return MapearDetalhe(consulta, proximasNaSerie);
    }

    public async Task<ConsultaResponse> CriarAsync(Guid usuarioId, Guid contaId, CriarConsultaRequest request, string? ip, string? userAgent, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        if (request.FimEm <= request.InicioEm) throw new RegraNegocioException("O fim da consulta deve ser posterior ao início.");
        var configuracao = await dbContext.ConfiguracoesAtendimento.AsNoTracking().SingleAsync(x => x.ContaPsicologoId == contaId && x.Ativo, ct);
        if (request.InicioEm < DateTimeOffset.UtcNow.AddHours(configuracao.AntecedenciaMinimaAgendamentoHoras ?? 0)) throw new RegraNegocioException("A consulta não respeita a antecedência mínima configurada.");
        var paciente = await dbContext.Pacientes.SingleOrDefaultAsync(x => x.Id == request.PacienteId && x.ContaPsicologoId == contaId && x.Status == StatusPaciente.Ativo, ct) ?? throw new RegraNegocioException("Paciente ativo não encontrado.", StatusCodes.Status404NotFound);
        var tipo = await dbContext.TiposAtendimento.SingleOrDefaultAsync(x => x.Id == request.TipoAtendimentoId && x.ContaPsicologoId == contaId && x.Ativo, ct) ?? throw new RegraNegocioException("Tipo de atendimento ativo não encontrado.", StatusCodes.Status404NotFound);
        Models.ListaEspera? listaEspera = null;
        if (request.ListaEsperaId is not null)
        {
            listaEspera = await dbContext.ListaEspera.SingleOrDefaultAsync(x =>
                x.Id == request.ListaEsperaId &&
                x.ContaPsicologoId == contaId &&
                x.PacienteId == paciente.Id &&
                (x.TipoAtendimentoId == null || x.TipoAtendimentoId == tipo.Id) &&
                (x.Status == StatusListaEspera.Aguardando || x.Status == StatusListaEspera.Contatado), ct)
                ?? throw new RegraNegocioException("Registro ativo da lista de espera não encontrado.", StatusCodes.Status404NotFound);
        }
        var bloqueado = await dbContext.BloqueiosAgenda.AnyAsync(x => x.ContaPsicologoId == contaId && x.InicioEm < request.FimEm && x.FimEm > request.InicioEm, ct);
        if (bloqueado) throw new RegraNegocioException("O horário escolhido está bloqueado na agenda.");
        if (!await HorarioNaAgendaConfiguradaAsync(contaId, request.InicioEm, request.FimEm, ct)) throw new RegraNegocioException("O horário está fora dos horários de atendimento configurados.");

        await using var transacaoCriar = await IniciarTransacaoSerializavelAsync(ct);
        var conflitante = await dbContext.Consultas.AnyAsync(x => x.ContaPsicologoId == contaId && x.Status != StatusConsulta.Cancelada && x.Status != StatusConsulta.Remarcada && x.InicioEm < request.FimEm && x.FimEm > request.InicioEm, ct);
        if (conflitante) throw new RegraNegocioException("Já existe uma consulta neste intervalo.");
        var consulta = new Consulta
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = contaId,
            PacienteId = paciente.Id,
            TipoAtendimentoId = tipo.Id,
            InicioEm = request.InicioEm,
            FimEm = request.FimEm,
            Modalidade = request.Modalidade,
            LinkOnline = Limpar(request.LinkOnline),
            EnderecoAtendimento = Limpar(request.EnderecoAtendimento),
            ObservacaoAdministrativa = Limpar(request.ObservacaoAdministrativa),
            Status = configuracao.ConfirmacaoAutomaticaConsulta ? StatusConsulta.Confirmada : StatusConsulta.AguardandoConfirmacao,
            Origem = listaEspera?.Origem ?? OrigemConsulta.Painel
        };
        dbContext.Consultas.Add(consulta);
        if (listaEspera is not null)
        {
            var statusListaEsperaAnterior = listaEspera.Status;
            listaEspera.Status = StatusListaEspera.Agendado;
            listaEspera.AtualizadoEm = DateTimeOffset.UtcNow;
            auditoria.Registrar(contaId, usuarioId, "ListaEsperaAgendada", nameof(Models.ListaEspera), listaEspera.Id, "Lista de espera convertida em consulta.", new { Status = statusListaEsperaAnterior }, new { listaEspera.Status, ConsultaId = consulta.Id }, ip, userAgent);
        }
        dbContext.HistoricosConsulta.Add(new() { Id = Guid.NewGuid(), ContaPsicologoId = contaId, ConsultaId = consulta.Id, UsuarioId = usuarioId, StatusNovo = consulta.Status, Descricao = "Consulta criada." });
        auditoria.Registrar(contaId, usuarioId, "ConsultaCriada", nameof(Consulta), consulta.Id, "Consulta criada.", null, new { consulta.PacienteId, consulta.InicioEm, consulta.FimEm, consulta.Status }, ip, userAgent);
        if (request.CriarPagamentoPendente && paciente.ModoCobranca != ModoCobranca.Mensal)
        {
            var valor = request.ValorPagamento ?? paciente.ValorSessao ?? tipo.ValorPadrao
                ?? throw new RegraNegocioException("Informe o valor do pagamento, o valor da sessão do paciente ou um valor padrão no tipo de atendimento.");
            if (valor < 0) throw new RegraNegocioException("O valor do pagamento não pode ser negativo.");
            var pagamento = new Pagamento
            {
                Id = Guid.NewGuid(),
                ContaPsicologoId = contaId,
                PacienteId = paciente.Id,
                ConsultaId = consulta.Id,
                Valor = valor,
                Status = StatusPagamento.Pendente,
                FormaPagamento = FormaPagamento.Manual,
                VencimentoEm = consulta.InicioEm,
                Observacao = null
            };
            dbContext.Pagamentos.Add(pagamento);
            auditoria.Registrar(contaId, usuarioId, "PagamentoCriadoConsulta", nameof(Pagamento), pagamento.Id, "Pagamento pendente criado no agendamento.", null, new { pagamento.ConsultaId, pagamento.Valor }, ip, userAgent);
        }
        await dbContext.SaveChangesAsync(ct);
        if (transacaoCriar is not null) await transacaoCriar.CommitAsync(ct);

        var deveProgramarLembrete = request.ProgramarLembrete
            ?? (configuracao.LembretesAutomaticosAtivos && configuracao.ProgramarLembreteAoCriarConsulta);
        if (deveProgramarLembrete)
        {
            await lembretes.ProgramarAutomaticoParaConsultaAsync(usuarioId, contaId, consulta.Id, ip, userAgent, ct);
        }

        consulta.Paciente = paciente;
        consulta.TipoAtendimento = tipo;
        return Mapear(consulta);
    }

    public async Task<SerieConsultasResponse> CriarSerieAsync(Guid usuarioId, Guid contaId, CriarConsultaRequest request, string? ip, string? userAgent, CancellationToken ct)
    {
        if (request.Recorrencia is null)
        {
            var unica = await CriarAsync(usuarioId, contaId, request, ip, userAgent, ct);
            return new SerieConsultasResponse(null, [unica], []);
        }

        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        if (request.FimEm <= request.InicioEm) throw new RegraNegocioException("O fim da consulta deve ser posterior ao início.");
        if (request.Recorrencia.Ocorrencias is < 2 or > 52) throw new RegraNegocioException("Uma série tem de 2 a 52 consultas.");
        if (request.ListaEsperaId is not null) throw new RegraNegocioException("Agende a primeira consulta da lista de espera sem repetição e crie a série depois.");
        var configuracao = await dbContext.ConfiguracoesAtendimento.AsNoTracking().SingleAsync(x => x.ContaPsicologoId == contaId && x.Ativo, ct);
        if (request.InicioEm < DateTimeOffset.UtcNow.AddHours(configuracao.AntecedenciaMinimaAgendamentoHoras ?? 0)) throw new RegraNegocioException("A consulta não respeita a antecedência mínima configurada.");
        var paciente = await dbContext.Pacientes.SingleOrDefaultAsync(x => x.Id == request.PacienteId && x.ContaPsicologoId == contaId && x.Status == StatusPaciente.Ativo, ct) ?? throw new RegraNegocioException("Paciente ativo não encontrado.", StatusCodes.Status404NotFound);
        var tipo = await dbContext.TiposAtendimento.SingleOrDefaultAsync(x => x.Id == request.TipoAtendimentoId && x.ContaPsicologoId == contaId && x.Ativo, ct) ?? throw new RegraNegocioException("Tipo de atendimento ativo não encontrado.", StatusCodes.Status404NotFound);
        decimal? valorPagamento = null;
        if (request.CriarPagamentoPendente && paciente.ModoCobranca != ModoCobranca.Mensal)
        {
            valorPagamento = request.ValorPagamento ?? paciente.ValorSessao ?? tipo.ValorPadrao
                ?? throw new RegraNegocioException("Informe o valor do pagamento, o valor da sessão do paciente ou um valor padrão no tipo de atendimento.");
            if (valorPagamento < 0) throw new RegraNegocioException("O valor do pagamento não pode ser negativo.");
        }

        // Cada repetição mantém o horário de parede no fuso da conta.
        var fuso = Agenda.FusoHorarioConta.Resolver(configuracao.FusoHorario);
        var duracao = request.FimEm - request.InicioEm;
        var inicioLocal = TimeZoneInfo.ConvertTime(request.InicioEm, fuso).DateTime;
        var passoDias = request.Recorrencia.Frequencia == FrequenciaRecorrencia.Quinzenal ? 14 : 7;
        var serieId = Guid.NewGuid();
        var criadas = new List<Consulta>();
        var ignoradas = new List<OcorrenciaIgnoradaResponse>();

        await using var transacao = await IniciarTransacaoSerializavelAsync(ct);
        for (var indice = 0; indice < request.Recorrencia.Ocorrencias; indice++)
        {
            var local = DateTime.SpecifyKind(inicioLocal.AddDays(indice * passoDias), DateTimeKind.Unspecified);
            var inicio = new DateTimeOffset(local, fuso.GetUtcOffset(local));
            var fim = inicio + duracao;
            var motivo = await MotivoParaNaoAgendarAsync(contaId, inicio, fim, ct);
            if (motivo is not null)
            {
                if (indice == 0) throw new RegraNegocioException(motivo);
                ignoradas.Add(new OcorrenciaIgnoradaResponse(inicio, motivo));
                continue;
            }

            var consulta = new Consulta
            {
                Id = Guid.NewGuid(),
                ContaPsicologoId = contaId,
                PacienteId = paciente.Id,
                TipoAtendimentoId = tipo.Id,
                InicioEm = inicio,
                FimEm = fim,
                Modalidade = request.Modalidade,
                LinkOnline = Limpar(request.LinkOnline),
                EnderecoAtendimento = Limpar(request.EnderecoAtendimento),
                ObservacaoAdministrativa = Limpar(request.ObservacaoAdministrativa),
                Status = configuracao.ConfirmacaoAutomaticaConsulta ? StatusConsulta.Confirmada : StatusConsulta.AguardandoConfirmacao,
                Origem = OrigemConsulta.Painel,
                SerieId = serieId
            };
            dbContext.Consultas.Add(consulta);
            dbContext.HistoricosConsulta.Add(new() { Id = Guid.NewGuid(), ContaPsicologoId = contaId, ConsultaId = consulta.Id, UsuarioId = usuarioId, StatusNovo = consulta.Status, Descricao = $"Consulta criada na série ({indice + 1} de {request.Recorrencia.Ocorrencias})." });
            if (valorPagamento is not null)
            {
                dbContext.Pagamentos.Add(new Pagamento
                {
                    Id = Guid.NewGuid(),
                    ContaPsicologoId = contaId,
                    PacienteId = paciente.Id,
                    ConsultaId = consulta.Id,
                    Valor = valorPagamento.Value,
                    Status = StatusPagamento.Pendente,
                    FormaPagamento = FormaPagamento.Manual,
                    VencimentoEm = consulta.InicioEm
                });
            }
            criadas.Add(consulta);
            // As consultas da série ainda não estão salvas; a próxima checagem de conflito precisa enxergá-las.
            await dbContext.SaveChangesAsync(ct);
        }

        auditoria.Registrar(contaId, usuarioId, "SerieConsultasCriada", nameof(Consulta), serieId, "Série de consultas criada.", null, new { PacienteId = paciente.Id, request.Recorrencia.Frequencia, Criadas = criadas.Count, Ignoradas = ignoradas.Count, PrimeiraEm = criadas[0].InicioEm }, ip, userAgent);
        await dbContext.SaveChangesAsync(ct);
        if (transacao is not null) await transacao.CommitAsync(ct);

        var deveProgramarLembrete = request.ProgramarLembrete
            ?? (configuracao.LembretesAutomaticosAtivos && configuracao.ProgramarLembreteAoCriarConsulta);
        if (deveProgramarLembrete)
        {
            foreach (var consulta in criadas)
            {
                await lembretes.ProgramarAutomaticoParaConsultaAsync(usuarioId, contaId, consulta.Id, ip, userAgent, ct);
            }
        }

        foreach (var consulta in criadas)
        {
            consulta.Paciente = paciente;
            consulta.TipoAtendimento = tipo;
        }
        return new SerieConsultasResponse(serieId, criadas.Select(Mapear).ToArray(), ignoradas);
    }

    public async Task<CancelamentoSerieResponse> CancelarSerieAsync(Guid usuarioId, Guid contaId, Guid id, CancelarSerieRequest request, string? ip, string? userAgent, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var selecionada = await dbContext.Consultas.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id && x.ContaPsicologoId == contaId, ct)
            ?? throw new RegraNegocioException("Consulta não encontrada.", StatusCodes.Status404NotFound);
        if (selecionada.SerieId is null) throw new RegraNegocioException("Esta consulta não faz parte de uma série.");
        var configuracao = await dbContext.ConfiguracoesAtendimento.AsNoTracking().SingleAsync(x => x.ContaPsicologoId == contaId && x.Ativo, ct);
        if (configuracao.ExigeJustificativaCancelamento && string.IsNullOrWhiteSpace(request.Justificativa)) throw new RegraNegocioException("Informe a justificativa do cancelamento.");

        var abertas = new[] { StatusConsulta.AguardandoConfirmacao, StatusConsulta.Agendada, StatusConsulta.Confirmada };
        var alvo = await dbContext.Consultas
            .Where(x => x.ContaPsicologoId == contaId && x.SerieId == selecionada.SerieId && x.InicioEm >= selecionada.InicioEm && abertas.Contains(x.Status))
            .OrderBy(x => x.InicioEm)
            .ToListAsync(ct);
        if (alvo.Count == 0) throw new RegraNegocioException("Não há consultas em aberto nesta série a partir desta data.");
        if (configuracao.AntecedenciaCancelamentoHoras is > 0 && (alvo[0].InicioEm - DateTimeOffset.UtcNow).TotalHours < configuracao.AntecedenciaCancelamentoHoras.Value)
            throw new RegraNegocioException("Cancelamento fora do prazo permitido. Entre em contato diretamente com o psicólogo.", StatusCodes.Status422UnprocessableEntity);

        var justificativa = Limpar(request.Justificativa);
        foreach (var consulta in alvo)
        {
            var anterior = consulta.Status;
            consulta.Status = StatusConsulta.Cancelada;
            consulta.JustificativaCancelamento = justificativa;
            consulta.AtualizadoEm = DateTimeOffset.UtcNow;
            dbContext.HistoricosConsulta.Add(new() { Id = Guid.NewGuid(), ContaPsicologoId = contaId, ConsultaId = consulta.Id, UsuarioId = usuarioId, StatusAnterior = anterior, StatusNovo = StatusConsulta.Cancelada, Descricao = justificativa ?? "Cancelada junto com as próximas da série." });
        }
        auditoria.Registrar(contaId, usuarioId, "SerieConsultasCancelada", nameof(Consulta), selecionada.SerieId.Value, "Consultas da série canceladas a partir de uma data.", null, new { APartirDe = selecionada.InicioEm, Canceladas = alvo.Count }, ip, userAgent);
        await dbContext.SaveChangesAsync(ct);

        foreach (var consulta in alvo)
        {
            await lembretes.EncerrarProgramadosDaConsultaAsync(usuarioId, contaId, consulta.Id, StatusLembrete.Ignorado, "Consulta cancelada com a série; lembrete encerrado automaticamente.", ip, userAgent, ct);
        }
        return new CancelamentoSerieResponse(alvo.Count);
    }

    /// <summary>Motivo pelo qual o intervalo não pode receber consulta, ou nulo se estiver livre.</summary>
    private async Task<string?> MotivoParaNaoAgendarAsync(Guid contaId, DateTimeOffset inicio, DateTimeOffset fim, CancellationToken ct)
    {
        if (await dbContext.BloqueiosAgenda.AnyAsync(x => x.ContaPsicologoId == contaId && x.InicioEm < fim && x.FimEm > inicio, ct))
            return "O horário está bloqueado na agenda.";
        if (!await HorarioNaAgendaConfiguradaAsync(contaId, inicio, fim, ct))
            return "O horário está fora dos horários de atendimento configurados.";
        if (await dbContext.Consultas.AnyAsync(x => x.ContaPsicologoId == contaId && x.Status != StatusConsulta.Cancelada && x.Status != StatusConsulta.Remarcada && x.InicioEm < fim && x.FimEm > inicio, ct))
            return "Já existe uma consulta neste intervalo.";
        return null;
    }

    public async Task<ConsultaResponse> AlterarStatusAsync(Guid usuarioId, Guid contaId, Guid id, AlterarStatusConsultaRequest request, string? ip, string? userAgent, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var consulta = await dbContext.Consultas.Include(x => x.Paciente).Include(x => x.TipoAtendimento).SingleOrDefaultAsync(x => x.Id == id && x.ContaPsicologoId == contaId, ct) ?? throw new RegraNegocioException("Consulta não encontrada.", StatusCodes.Status404NotFound);
        if (consulta.Status is StatusConsulta.Cancelada or StatusConsulta.Remarcada or StatusConsulta.Realizada) throw new RegraNegocioException("Esta consulta não pode mais ter o status alterado.");
        if (request.Status is not (StatusConsulta.Confirmada or StatusConsulta.Cancelada or StatusConsulta.NaoCompareceu or StatusConsulta.Realizada)) throw new RegraNegocioException("Transição de status inválida.");
        var configuracao = await dbContext.ConfiguracoesAtendimento.AsNoTracking().SingleAsync(x => x.ContaPsicologoId == contaId && x.Ativo, ct);
        if (request.Status == StatusConsulta.Cancelada)
        {
            if (configuracao.ExigeJustificativaCancelamento && string.IsNullOrWhiteSpace(request.Justificativa)) throw new RegraNegocioException("Informe a justificativa do cancelamento.");
            if (configuracao.AntecedenciaCancelamentoHoras is > 0)
            {
                var horasRestantes = (consulta.InicioEm - DateTimeOffset.UtcNow).TotalHours;
                if (horasRestantes < configuracao.AntecedenciaCancelamentoHoras.Value) throw new RegraNegocioException("Cancelamento fora do prazo permitido. Entre em contato diretamente com o psicólogo.", StatusCodes.Status422UnprocessableEntity);
            }
        }
        var anterior = consulta.Status;
        consulta.Status = request.Status;
        consulta.JustificativaCancelamento = request.Status == StatusConsulta.Cancelada ? Limpar(request.Justificativa) : null;
        consulta.AtualizadoEm = DateTimeOffset.UtcNow;
        dbContext.HistoricosConsulta.Add(new() { Id = Guid.NewGuid(), ContaPsicologoId = contaId, ConsultaId = id, UsuarioId = usuarioId, StatusAnterior = anterior, StatusNovo = request.Status, Descricao = request.Status == StatusConsulta.Cancelada ? consulta.JustificativaCancelamento : "Status da consulta atualizado." });
        auditoria.Registrar(contaId, usuarioId, "StatusConsultaAlterado", nameof(Consulta), id, "Status da consulta atualizado.", new { Status = anterior }, new { Status = request.Status }, ip, userAgent);
        await Pagamentos.CobrancaAutomatica.GerarSeNecessarioAsync(dbContext, auditoria, consulta, usuarioId, ip, userAgent, ct);
        await dbContext.SaveChangesAsync(ct);

        if (request.Status == StatusConsulta.Confirmada)
        {
            if (configuracao is { LembretesAutomaticosAtivos: true, ProgramarLembreteAoConfirmar: true })
            {
                await lembretes.ProgramarAutomaticoParaConsultaAsync(usuarioId, contaId, consulta.Id, ip, userAgent, ct);
            }
        }
        else if (request.Status is StatusConsulta.Cancelada or StatusConsulta.NaoCompareceu)
        {
            var motivo = request.Status == StatusConsulta.Cancelada
                ? "Consulta cancelada; lembrete encerrado automaticamente."
                : "Consulta marcada como falta; lembrete programado ignorado.";
            await lembretes.EncerrarProgramadosDaConsultaAsync(
                usuarioId,
                contaId,
                consulta.Id,
                StatusLembrete.Ignorado,
                motivo,
                ip,
                userAgent,
                ct);
        }

        return Mapear(consulta);
    }

    public async Task<ConsultaResponse> RemarcarAsync(Guid usuarioId, Guid contaId, Guid id, RemarcarConsultaRequest request, string? ip, string? userAgent, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        if (request.NovoFimEm <= request.NovoInicioEm) throw new RegraNegocioException("O fim da consulta deve ser posterior ao início.");
        var consulta = await dbContext.Consultas.Include(x => x.Paciente).Include(x => x.TipoAtendimento).SingleOrDefaultAsync(x => x.Id == id && x.ContaPsicologoId == contaId, ct) ?? throw new RegraNegocioException("Consulta não encontrada.", StatusCodes.Status404NotFound);
        if (consulta.Status is StatusConsulta.Cancelada or StatusConsulta.Remarcada or StatusConsulta.Realizada or StatusConsulta.NaoCompareceu) throw new RegraNegocioException("Esta consulta não pode ser remarcada.");
        var configuracao = await dbContext.ConfiguracoesAtendimento.AsNoTracking().SingleAsync(x => x.ContaPsicologoId == contaId && x.Ativo, ct);
        if (configuracao.AntecedenciaRemarcacaoHoras is > 0)
        {
            var horasRestantes = (consulta.InicioEm - DateTimeOffset.UtcNow).TotalHours;
            if (horasRestantes < configuracao.AntecedenciaRemarcacaoHoras.Value) throw new RegraNegocioException("Remarcação fora do prazo permitido. Entre em contato diretamente com o psicólogo.", StatusCodes.Status422UnprocessableEntity);
        }
        if (request.NovoInicioEm < DateTimeOffset.UtcNow.AddHours(configuracao.AntecedenciaMinimaAgendamentoHoras ?? 0)) throw new RegraNegocioException("O novo horário não respeita a antecedência mínima configurada.");
        var bloqueado = await dbContext.BloqueiosAgenda.AnyAsync(x => x.ContaPsicologoId == contaId && x.InicioEm < request.NovoFimEm && x.FimEm > request.NovoInicioEm, ct);
        if (bloqueado) throw new RegraNegocioException("O novo horário está bloqueado na agenda.");
        if (!await HorarioNaAgendaConfiguradaAsync(contaId, request.NovoInicioEm, request.NovoFimEm, ct)) throw new RegraNegocioException("O novo horário está fora dos horários de atendimento configurados.");

        await using var transacaoRemarcar = await IniciarTransacaoSerializavelAsync(ct);
        var conflitante = await dbContext.Consultas.AnyAsync(x => x.ContaPsicologoId == contaId && x.Id != consulta.Id && x.Status != StatusConsulta.Cancelada && x.Status != StatusConsulta.Remarcada && x.InicioEm < request.NovoFimEm && x.FimEm > request.NovoInicioEm, ct);
        if (conflitante) throw new RegraNegocioException("Já existe uma consulta neste intervalo.");

        var statusAnterior = consulta.Status;
        var inicioAnterior = consulta.InicioEm;
        consulta.Status = StatusConsulta.Remarcada;
        consulta.JustificativaCancelamento = Limpar(request.Justificativa);
        consulta.AtualizadoEm = DateTimeOffset.UtcNow;
        dbContext.HistoricosConsulta.Add(new() { Id = Guid.NewGuid(), ContaPsicologoId = contaId, ConsultaId = consulta.Id, UsuarioId = usuarioId, StatusAnterior = statusAnterior, StatusNovo = StatusConsulta.Remarcada, Descricao = $"Consulta remarcada de {inicioAnterior:dd/MM/yyyy HH:mm} para {request.NovoInicioEm:dd/MM/yyyy HH:mm}." });

        var nova = new Consulta
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = contaId,
            PacienteId = consulta.PacienteId,
            TipoAtendimentoId = consulta.TipoAtendimentoId,
            InicioEm = request.NovoInicioEm,
            FimEm = request.NovoFimEm,
            Modalidade = consulta.Modalidade,
            LinkOnline = consulta.LinkOnline,
            EnderecoAtendimento = consulta.EnderecoAtendimento,
            ObservacaoAdministrativa = consulta.ObservacaoAdministrativa,
            Status = configuracao.ConfirmacaoAutomaticaConsulta ? StatusConsulta.Confirmada : StatusConsulta.AguardandoConfirmacao,
            Origem = OrigemConsulta.Painel
        };
        dbContext.Consultas.Add(nova);
        dbContext.HistoricosConsulta.Add(new() { Id = Guid.NewGuid(), ContaPsicologoId = contaId, ConsultaId = nova.Id, UsuarioId = usuarioId, StatusNovo = nova.Status, Descricao = $"Consulta criada por remarcação da consulta {consulta.Id}." });
        auditoria.Registrar(contaId, usuarioId, "ConsultaRemarcada", nameof(Consulta), consulta.Id, "Consulta remarcada.", new { Status = statusAnterior, InicioEm = inicioAnterior }, new { Status = StatusConsulta.Remarcada, NovaConsultaId = nova.Id, NovoInicioEm = nova.InicioEm, NovoFimEm = nova.FimEm }, ip, userAgent);
        await dbContext.SaveChangesAsync(ct);
        if (transacaoRemarcar is not null) await transacaoRemarcar.CommitAsync(ct);

        await lembretes.EncerrarProgramadosDaConsultaAsync(usuarioId, contaId, consulta.Id, StatusLembrete.Ignorado, "Consulta remarcada; lembretes transferidos para o novo horário.", ip, userAgent, ct);
        if (configuracao.LembretesAutomaticosAtivos && configuracao.ProgramarLembreteAoCriarConsulta)
        {
            await lembretes.ProgramarAutomaticoParaConsultaAsync(usuarioId, contaId, nova.Id, ip, userAgent, ct);
        }

        nova.Paciente = consulta.Paciente;
        nova.TipoAtendimento = consulta.TipoAtendimento;
        return Mapear(nova);
    }

    private async Task<bool> HorarioNaAgendaConfiguradaAsync(Guid contaId, DateTimeOffset inicio, DateTimeOffset fim, CancellationToken ct)
    {
        // Grade de parede no fuso da conta (padrao: America/Sao_Paulo).
        var fusoId = await dbContext.ConfiguracoesAtendimento.AsNoTracking()
            .Where(x => x.ContaPsicologoId == contaId && x.Ativo)
            .Select(x => x.FusoHorario)
            .SingleOrDefaultAsync(ct);
        var fuso = Agenda.FusoHorarioConta.Resolver(fusoId);
        var inicioLocal = TimeZoneInfo.ConvertTime(inicio, fuso);
        var fimLocal = TimeZoneInfo.ConvertTime(fim, fuso);
        var diaSemana = (DiaSemana)(int)inicioLocal.DayOfWeek;
        var horaInicio = TimeOnly.FromDateTime(inicioLocal.DateTime);
        var horaFim = TimeOnly.FromDateTime(fimLocal.DateTime);
        var temConfiguracao = await dbContext.HorariosDisponiveis
            .AnyAsync(x => x.ContaPsicologoId == contaId && x.Ativo, ct);
        if (!temConfiguracao) return true;
        return await dbContext.HorariosDisponiveis.AnyAsync(
            x => x.ContaPsicologoId == contaId && x.Ativo &&
                 x.DiaSemana == diaSemana &&
                 x.HoraInicio <= horaInicio && x.HoraFim >= horaFim, ct);
    }

    private async Task<IDbContextTransaction?> IniciarTransacaoSerializavelAsync(CancellationToken ct)
    {
        try
        {
            return await dbContext.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, ct);
        }
        catch (InvalidOperationException)
        {
            // Provedores sem suporte a transacao (ex.: InMemory em testes).
            return null;
        }
    }

    private static string? Limpar(string? valor) => string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();

    private static ConsultaResponse Mapear(Consulta x) => new(
        x.Id,
        x.PacienteId,
        x.Paciente.NomeCompleto,
        x.TipoAtendimentoId,
        x.TipoAtendimento.Nome,
        x.InicioEm,
        x.FimEm,
        x.Status,
        x.Modalidade,
        x.LinkOnline,
        x.EnderecoAtendimento,
        x.ObservacaoAdministrativa,
        x.SerieId);

    private static ConsultaDetalheResponse MapearDetalhe(Consulta x, int proximasNaSerie) => new(
        x.Id,
        x.PacienteId,
        x.Paciente.NomeCompleto,
        x.TipoAtendimentoId,
        x.TipoAtendimento.Nome,
        x.InicioEm,
        x.FimEm,
        x.Status,
        x.Modalidade,
        x.Origem,
        x.LinkOnline,
        x.EnderecoAtendimento,
        x.ObservacaoAdministrativa,
        x.JustificativaCancelamento,
        x.Pagamentos.Select(p => new PagamentoVinculadoResponse(p.Id, p.Valor, p.Status)).ToArray(),
        x.Lembretes.OrderBy(l => l.AgendadoPara).Select(l => new LembreteVinculadoResponse(l.Id, l.Status, l.AgendadoPara)).ToArray(),
        x.Historicos.OrderBy(h => h.CriadoEm).Select(h => new HistoricoConsultaResponse(h.StatusAnterior, h.StatusNovo, h.Descricao, h.CriadoEm)).ToArray(),
        x.SerieId,
        proximasNaSerie);
}
