using System.Text.Json;
using System.Text.RegularExpressions;
using Psique.Api.Models;
using Psique.Api.Services.Agenda;
using Psique.Api.Shared.Enums;
using Microsoft.EntityFrameworkCore;

namespace Psique.Api.Services.WhatsApp;

/// <summary>
/// Motor administrativo do bot: executa regras de agenda/consulta a partir da intencao
/// detectada e registra a resposta como mensagem de saida (entrega via Bridge externo).
/// Nunca realiza atendimento psicologico.
/// </summary>
public sealed partial class BridgeWhatsAppService
{
    private static readonly StatusConsulta[] StatusConsultaAtiva =
    [
        StatusConsulta.AguardandoConfirmacao,
        StatusConsulta.Agendada,
        StatusConsulta.Confirmada
    ];

    public async Task ExecutarAcaoBotAsync(
        IntegracaoWhatsApp integracao,
        ConversaWhatsApp conversa,
        string? conteudo,
        string intencao,
        CancellationToken ct)
    {
        var contaId = integracao.ContaPsicologoId;
        var configuracao = await dbContext.ConfiguracoesAtendimento.AsNoTracking()
            .SingleOrDefaultAsync(x => x.ContaPsicologoId == contaId && x.Ativo, ct);
        if (configuracao is null)
        {
            await EncaminharParaHumanoAsync(contaId, conversa, "A agenda do consultório ainda não foi configurada.", RespostaAgendaNaoConfigurada, ct);
            return;
        }

        var sessaoAtual = await dbContext.SessoesBot.FirstOrDefaultAsync(
            x => x.ContaPsicologoId == contaId &&
                 x.ConversaWhatsAppId == conversa.Id &&
                 x.Status == StatusSessaoBot.Aberta, ct);

        // O assistente não entendeu duas mensagens seguidas: em vez de repetir a ajuda, passa para uma pessoa.
        if (EhIntencaoDesconhecida(intencao) && sessaoAtual is not null && EhIntencaoDesconhecida(sessaoAtual.EtapaAtual))
        {
            await EncaminharParaHumanoAsync(contaId, conversa, MotivoNaoEntendeu, RespostaNaoEntendeu, ct);
            return;
        }

        // Pedidos que dependem do cadastro não andam sem ele: a equipe localiza o paciente e continua.
        if (conversa.PacienteId is null && intencao is "agendar_consulta" or "cancelar_consulta" or "remarcar_consulta" or "confirmar_presenca")
        {
            await EncaminharParaHumanoAsync(contaId, conversa, "Paciente não identificado pelo número do WhatsApp.", RespostaPacienteNaoIdentificado, ct);
            return;
        }

        var resposta = intencao switch
        {
            "consultar_horarios" => await ResponderHorariosAsync(contaId, configuracao, ct),
            "agendar_consulta" => await ProcessarAgendamentoBotAsync(contaId, conversa, configuracao, conteudo, ct),
            "cancelar_consulta" => await ProcessarCancelamentoBotAsync(contaId, conversa, configuracao, conteudo, ct),
            "remarcar_consulta" => await ProcessarRemarcacaoBotAsync(contaId, conversa, configuracao, conteudo, ct),
            "confirmar_presenca" => await ProcessarConfirmacaoBotAsync(contaId, conversa, ct),
            _ => RespostaAjudaBot()
        };

        await RegistrarRespostaBotAsync(contaId, conversa, resposta, ct);

        var sessao = sessaoAtual;
        if (sessao is not null)
        {
            sessao.EtapaAtual = intencao;
            sessao.DadosTemporariosJson = protecao.Proteger(JsonSerializer.Serialize(
                new { intencao, conversa.PacienteId }, JsonOptions));
            sessao.ExpiraEm = DateTimeOffset.UtcNow.AddHours(2);
            sessao.AtualizadoEm = DateTimeOffset.UtcNow;
        }
    }

    private Task RegistrarRespostaBotAsync(Guid contaId, ConversaWhatsApp conversa, string resposta, CancellationToken ct)
    {
        RegistrarRespostaBot(contaId, conversa, resposta);
        return Task.CompletedTask;
    }

    private void RegistrarRespostaBot(Guid contaId, ConversaWhatsApp conversa, string resposta)
    {
        dbContext.MensagensWhatsApp.Add(new MensagemWhatsApp
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = contaId,
            ConversaWhatsAppId = conversa.Id,
            Direcao = DirecaoMensagem.Saida,
            TipoMensagem = TipoMensagemWhatsApp.Texto,
            Conteudo = protecao.Proteger(resposta),
            Status = StatusMensagemWhatsApp.Pendente,
            ErroEnvio = "Aguardando confirmação de entrega pelo Bridge.",
            CriadoEm = DateTimeOffset.UtcNow
        });
        conversa.UltimaMensagemEm = DateTimeOffset.UtcNow;
        conversa.AtualizadoEm = DateTimeOffset.UtcNow;
    }

    private static string RespostaAjudaBot() =>
        "Posso ajudar com horários disponíveis, agendar (ex.: agendar 12/08 14:00), " +
        "cancelar, remarcar (ex.: remarcar 12/08 14:00 para 13/08 15:00) ou confirmar presença. " +
        "Para falar com uma pessoa da equipe, responda ATENDENTE.";

    private static string TextoRegrasBot(ConfiguracaoAtendimento c)
    {
        var partes = new List<string>();
        if (c.AntecedenciaCancelamentoHoras is > 0)
            partes.Add($"cancelamento até {c.AntecedenciaCancelamentoHoras}h antes");
        if (c.AntecedenciaRemarcacaoHoras is > 0)
            partes.Add($"remarcação até {c.AntecedenciaRemarcacaoHoras}h antes");
        return partes.Count == 0 ? string.Empty : " Regras: " + string.Join("; ", partes) + ".";
    }

    private async Task<List<Consulta>> ConsultasFuturasBotAsync(Guid contaId, Guid? pacienteId, CancellationToken ct)
    {
        var agora = DateTimeOffset.UtcNow;
        return await dbContext.Consultas.AsNoTracking()
            .Where(x => x.ContaPsicologoId == contaId &&
                        x.InicioEm > agora &&
                        StatusConsultaAtiva.Contains(x.Status) &&
                        (pacienteId == null || x.PacienteId == pacienteId))
            .OrderBy(x => x.InicioEm)
            .Take(10)
            .ToListAsync(ct);
    }

    private async Task<TipoAtendimento?> TipoPadraoBotAsync(Guid contaId, CancellationToken ct) =>
        await dbContext.TiposAtendimento.AsNoTracking()
            .Where(x => x.ContaPsicologoId == contaId && x.Ativo)
            .OrderBy(x => x.Nome)
            .FirstOrDefaultAsync(ct);

    private async Task<string> ResponderHorariosAsync(Guid contaId, ConfiguracaoAtendimento config, CancellationToken ct)
    {
        var livres = await CalcularHorariosLivresBotAsync(contaId, config, 6, ct);
        if (livres.Count == 0)
            return "No momento não há horários livres nos próximos dias. Posso colocar você na lista de espera: responda com LISTA DE ESPERA e a equipe entra em contato.";
        var linhas = livres.Select((s, i) => $"{i + 1}. {s:dd/MM/yyyy HH:mm}");
        return "Horários disponíveis:\n" + string.Join("\n", linhas) +
               "\nPara agendar, responda com AGENDAR + data e hora (ex.: agendar 12/08 14:00).";
    }

    private async Task<bool> HorarioDentroDaAgendaBotAsync(
        Guid contaId, ConfiguracaoAtendimento config, DateTimeOffset inicio, DateTimeOffset fim, CancellationToken ct)
    {
        var fuso = FusoHorarioConta.Resolver(config.FusoHorario);
        var inicioLocal = TimeZoneInfo.ConvertTime(inicio, fuso);
        var fimLocal = TimeZoneInfo.ConvertTime(fim, fuso);
        var diaSemana = (DiaSemana)(int)inicioLocal.DayOfWeek;
        var horaInicio = TimeOnly.FromDateTime(inicioLocal.DateTime);
        var horaFim = TimeOnly.FromDateTime(fimLocal.DateTime);
        return await dbContext.HorariosDisponiveis.AsNoTracking().AnyAsync(
            x => x.ContaPsicologoId == contaId && x.Ativo &&
                 x.DiaSemana == diaSemana &&
                 x.HoraInicio <= horaInicio && x.HoraFim >= horaFim, ct);
    }

    private async Task<List<DateTimeOffset>> CalcularHorariosLivresBotAsync(Guid contaId, ConfiguracaoAtendimento config, int limite, CancellationToken ct)
    {
        var duracao = config.DuracaoPadraoMinutos > 0 ? config.DuracaoPadraoMinutos : 50;
        var agora = DateTimeOffset.UtcNow;
        var inicioJanela = agora.AddHours(config.AntecedenciaMinimaAgendamentoHoras ?? 0);
        var fimJanela = agora.AddDays(21);
        var fuso = FusoHorarioConta.Resolver(config.FusoHorario);

        var horarios = await dbContext.HorariosDisponiveis.AsNoTracking()
            .Where(x => x.ContaPsicologoId == contaId && x.Ativo).ToListAsync(ct);
        var consultas = await dbContext.Consultas.AsNoTracking()
            .Where(x => x.ContaPsicologoId == contaId &&
                        x.Status != StatusConsulta.Cancelada &&
                        x.Status != StatusConsulta.Remarcada &&
                        x.InicioEm < fimJanela && x.FimEm > inicioJanela).ToListAsync(ct);
        var bloqueios = await dbContext.BloqueiosAgenda.AsNoTracking()
            .Where(x => x.ContaPsicologoId == contaId && x.InicioEm < fimJanela && x.FimEm > inicioJanela).ToListAsync(ct);

        var livres = new List<DateTimeOffset>();
        for (var dia = DateOnly.FromDateTime(inicioJanela.DateTime);
             dia <= DateOnly.FromDateTime(fimJanela.DateTime) && livres.Count < limite;
             dia = dia.AddDays(1))
        {
            var diaSemana = (DiaSemana)(int)dia.DayOfWeek;
            foreach (var h in horarios.Where(x => x.DiaSemana == diaSemana))
            {
                for (var t = h.HoraInicio; t.AddMinutes(duracao) <= h.HoraFim; t = t.AddMinutes(duracao))
                {
                    var local = dia.ToDateTime(t);
                    var slot = new DateTimeOffset(local, fuso.GetUtcOffset(local));
                    if (slot < inicioJanela) continue;
                    var fim = slot.AddMinutes(duracao);
                    if (consultas.Any(c => c.InicioEm < fim && c.FimEm > slot)) continue;
                    if (bloqueios.Any(b => b.InicioEm < fim && b.FimEm > slot)) continue;
                    livres.Add(slot);
                    if (livres.Count >= limite) break;
                }
                if (livres.Count >= limite) break;
            }
        }
        return livres;
    }

    private async Task<string> ProcessarAgendamentoBotAsync(
        Guid contaId, ConversaWhatsApp conversa, ConfiguracaoAtendimento config, string? conteudo, CancellationToken ct)
    {
        if (!config.PermiteAgendamentoWhatsApp)
            return "O agendamento pelo WhatsApp está desativado no momento. A equipe do consultório pode agendar para você por aqui mesmo.";
        if (conversa.PacienteId is null)
            return "Não encontrei seu cadastro pelo número desta conversa. Informe seu nome completo ou fale com a equipe para vincular seu cadastro e concluir o agendamento.";
        if (conteudo is not null && Regex.IsMatch(conteudo, @"lista\s*de\s*espera", RegexOptions.IgnoreCase))
        {
            dbContext.ListaEspera.Add(new Models.ListaEspera
            {
                Id = Guid.NewGuid(),
                ContaPsicologoId = contaId,
                PacienteId = conversa.PacienteId.Value,
                Status = StatusListaEspera.Aguardando,
                Origem = OrigemConsulta.Chatbot,
                ObservacaoAdministrativa = "Inclusao via chatbot WhatsApp.",
                CriadoEm = DateTimeOffset.UtcNow
            });
            auditoria.Registrar(contaId, null, "ListaEsperaCriadaBot", nameof(ListaEspera), conversa.PacienteId.Value,
                "Paciente incluido na lista de espera pelo chatbot.", null, new { conversa.Id }, null, null);
            return "Você entrou na lista de espera. Avisaremos assim que um horário for liberado.";
        }

        var fuso = FusoHorarioConta.Resolver(config.FusoHorario);
        var desejado = TentarExtrairDataHoraBot(conteudo, fuso);
        if (desejado is null)
        {
            var livres = await CalcularHorariosLivresBotAsync(contaId, config, 5, ct);
            if (livres.Count == 0)
                return "Não há horários livres nos próximos dias. Responda com LISTA DE ESPERA para entrarmos em contato quando abrir vaga.";
            return "Para qual horário? Opções livres:\n" +
                   string.Join("\n", livres.Select((s, i) => $"{i + 1}. {s:dd/MM/yyyy HH:mm}")) +
                   "\nResponda com AGENDAR + data e hora (ex.: agendar 12/08 14:00).";
        }

        var tipo = await TipoPadraoBotAsync(contaId, ct);
        if (tipo is null)
            return "Ainda não há tipos de atendimento configurados. A equipe do consultório vai concluir seu agendamento por aqui.";

        var duracao = tipo.DuracaoMinutos > 0 ? tipo.DuracaoMinutos : config.DuracaoPadraoMinutos;
        var fim = desejado.Value.AddMinutes(duracao);
        if (!await HorarioDentroDaAgendaBotAsync(contaId, config, desejado.Value, fim, ct))
        {
            var livres = await CalcularHorariosLivresBotAsync(contaId, config, 5, ct);
            var dica = livres.Count == 0
                ? "Não há horários livres nos próximos dias."
                : "Horários livres:\n" + string.Join("\n", livres.Select((s, i) => $"{i + 1}. {s:dd/MM/yyyy HH:mm}"));
            return "Este horário está fora da agenda de atendimento do consultório. " + dica;
        }
        if (desejado.Value < DateTimeOffset.UtcNow.AddHours(config.AntecedenciaMinimaAgendamentoHoras ?? 0))
            return "Este horário não respeita a antecedência mínima do consultório. Escolha outro horário com mais antecedência.";
        if (await dbContext.BloqueiosAgenda.AnyAsync(x => x.ContaPsicologoId == contaId && x.InicioEm < fim && x.FimEm > desejado.Value, ct))
            return "Este horário está bloqueado na agenda. Escolha outro horário.";
        if (await dbContext.Consultas.AnyAsync(x => x.ContaPsicologoId == contaId &&
                x.Status != StatusConsulta.Cancelada && x.Status != StatusConsulta.Remarcada &&
                x.InicioEm < fim && x.FimEm > desejado.Value, ct))
            return "Este horário acabou de ser ocupado. Escolha outro horário.";

        var consulta = new Consulta
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = contaId,
            PacienteId = conversa.PacienteId.Value,
            TipoAtendimentoId = tipo.Id,
            InicioEm = desejado.Value,
            FimEm = fim,
            Modalidade = tipo.ModalidadePadrao,
            Status = config.ConfirmacaoAutomaticaConsulta ? StatusConsulta.Confirmada : StatusConsulta.AguardandoConfirmacao,
            Origem = OrigemConsulta.Chatbot
        };
        dbContext.Consultas.Add(consulta);
        dbContext.HistoricosConsulta.Add(new HistoricoConsulta
        {
            Id = Guid.NewGuid(), ContaPsicologoId = contaId, ConsultaId = consulta.Id,
            StatusNovo = consulta.Status, Descricao = "Consulta criada pelo chatbot WhatsApp."
        });
        auditoria.Registrar(contaId, null, "ConsultaCriadaBot", nameof(Consulta), consulta.Id,
            "Consulta criada pelo chatbot.", null, new { consulta.PacienteId, consulta.InicioEm, consulta.FimEm }, null, null);
        await NotificarEquipeAsync(contaId, "Consulta marcada pelo assistente", "Um paciente marcou uma consulta pelo WhatsApp. Confira a agenda.", ct);

        var statusMsg = consulta.Status == StatusConsulta.Confirmada ? "confirmada" : "registrada e aguardando confirmação da equipe";
        return $"Consulta {statusMsg}: {desejado.Value:dd/MM/yyyy HH:mm} ({tipo.Nome})." + TextoRegrasBot(config);
    }

    private async Task<string> ProcessarCancelamentoBotAsync(
        Guid contaId, ConversaWhatsApp conversa, ConfiguracaoAtendimento config, string? conteudo, CancellationToken ct)
    {
        if (conversa.PacienteId is null)
            return "Não encontrei seu cadastro pelo número desta conversa. A equipe pode localizar seu agendamento e cancelar por aqui.";
        var futuras = await ConsultasFuturasBotAsync(contaId, conversa.PacienteId, ct);
        if (futuras.Count == 0) return "Você não tem consultas futuras para cancelar.";
        var alvo = SelecionarConsultaBot(futuras, conteudo, FusoHorarioConta.Resolver(config.FusoHorario));
        if (alvo is null)
            return "Qual consulta deseja cancelar?\n" +
                   string.Join("\n", futuras.Select((c, i) => $"{i + 1}. {c.InicioEm:dd/MM/yyyy HH:mm}")) +
                   "\nResponda com CANCELAR + data e hora (ex.: cancelar 12/08 14:00).";
        if (config.AntecedenciaCancelamentoHoras is > 0 &&
            (alvo.InicioEm - DateTimeOffset.UtcNow).TotalHours < config.AntecedenciaCancelamentoHoras.Value)
            return "Esta consulta está fora do prazo de cancelamento automático. Fale diretamente com o consultório para tratar este caso.";

        var entidade = await dbContext.Consultas
            .SingleAsync(x => x.ContaPsicologoId == contaId && x.Id == alvo.Id, ct);
        entidade.Status = StatusConsulta.Cancelada;
        entidade.JustificativaCancelamento = "Cancelado pelo paciente via WhatsApp.";
        entidade.AtualizadoEm = DateTimeOffset.UtcNow;
        dbContext.HistoricosConsulta.Add(new HistoricoConsulta
        {
            Id = Guid.NewGuid(), ContaPsicologoId = contaId, ConsultaId = entidade.Id,
            StatusAnterior = alvo.Status, StatusNovo = StatusConsulta.Cancelada,
            Descricao = "Cancelado pelo paciente via WhatsApp."
        });
        auditoria.Registrar(contaId, null, "ConsultaCanceladaBot", nameof(Consulta), entidade.Id,
            "Consulta cancelada pelo chatbot.", new { Status = alvo.Status }, new { Status = StatusConsulta.Cancelada }, null, null);
        foreach (var lembrete in await dbContext.Lembretes
                     .Where(x => x.ContaPsicologoId == contaId && x.ConsultaId == entidade.Id && x.Status == StatusLembrete.Agendado).ToListAsync(ct))
        {
            lembrete.Status = StatusLembrete.Ignorado;
            lembrete.AtualizadoEm = DateTimeOffset.UtcNow;
        }
        await NotificarEquipeAsync(contaId, "Consulta cancelada pelo assistente", "Um paciente cancelou uma consulta pelo WhatsApp. Confira a agenda.", ct);
        return $"Consulta de {alvo.InicioEm:dd/MM/yyyy HH:mm} cancelada." + TextoRegrasBot(config);
    }

    private async Task<string> ProcessarRemarcacaoBotAsync(
        Guid contaId, ConversaWhatsApp conversa, ConfiguracaoAtendimento config, string? conteudo, CancellationToken ct)
    {
        if (!config.PermiteAgendamentoWhatsApp)
            return "A remarcação pelo WhatsApp está desativada no momento. A equipe pode remarcar para você por aqui mesmo.";
        if (conversa.PacienteId is null)
            return "Não encontrei seu cadastro pelo número desta conversa. A equipe pode localizar seu agendamento e remarcar por aqui.";
        var futuras = await ConsultasFuturasBotAsync(contaId, conversa.PacienteId, ct);
        if (futuras.Count == 0) return "Você não tem consultas futuras para remarcar.";
        var datas = ExtrairDatasBot(conteudo, FusoHorarioConta.Resolver(config.FusoHorario));
        if (datas.Count < 2)
        {
            var livres = await CalcularHorariosLivresBotAsync(contaId, config, 5, ct);
            var dica = livres.Count == 0 ? string.Empty :
                "\nHorários livres:\n" + string.Join("\n", livres.Select((s, i) => $"{i + 1}. {s:dd/MM/yyyy HH:mm}"));
            return "Para remarcar, informe a consulta atual e o novo horário (ex.: remarcar 12/08 14:00 para 13/08 15:00)." + dica;
        }
        var alvo = futuras.OrderBy(c => Math.Abs((c.InicioEm - datas[0]).Ticks)).First();
        var novoInicio = datas[1];
        var tipo = await dbContext.TiposAtendimento.AsNoTracking()
            .SingleOrDefaultAsync(x => x.ContaPsicologoId == contaId && x.Id == alvo.TipoAtendimentoId, ct);
        var duracao = tipo?.DuracaoMinutos > 0 ? tipo!.DuracaoMinutos : config.DuracaoPadraoMinutos;
        var novoFim = novoInicio.AddMinutes(duracao);

        if (config.AntecedenciaRemarcacaoHoras is > 0 &&
            (alvo.InicioEm - DateTimeOffset.UtcNow).TotalHours < config.AntecedenciaRemarcacaoHoras.Value)
            return "Esta consulta está fora do prazo de remarcação automática. Fale diretamente com o consultório.";
        if (novoInicio < DateTimeOffset.UtcNow.AddHours(config.AntecedenciaMinimaAgendamentoHoras ?? 0))
            return "O novo horário não respeita a antecedência mínima. Escolha outro horário.";
        if (!await HorarioDentroDaAgendaBotAsync(contaId, config, novoInicio, novoFim, ct))
            return "O novo horário está fora da agenda de atendimento do consultório. Informe outro horário em dia útil no período de atendimento.";
        if (await dbContext.BloqueiosAgenda.AnyAsync(x => x.ContaPsicologoId == contaId && x.InicioEm < novoFim && x.FimEm > novoInicio, ct))
            return "O novo horário está bloqueado na agenda. Escolha outro horário.";
        if (await dbContext.Consultas.AnyAsync(x => x.ContaPsicologoId == contaId && x.Id != alvo.Id &&
                x.Status != StatusConsulta.Cancelada && x.Status != StatusConsulta.Remarcada &&
                x.InicioEm < novoFim && x.FimEm > novoInicio, ct))
            return "O novo horário acabou de ser ocupado. Escolha outro horário.";

        var entidade = await dbContext.Consultas
            .SingleAsync(x => x.ContaPsicologoId == contaId && x.Id == alvo.Id, ct);
        entidade.Status = StatusConsulta.Remarcada;
        entidade.AtualizadoEm = DateTimeOffset.UtcNow;
        dbContext.HistoricosConsulta.Add(new HistoricoConsulta
        {
            Id = Guid.NewGuid(), ContaPsicologoId = contaId, ConsultaId = entidade.Id,
            StatusAnterior = alvo.Status, StatusNovo = StatusConsulta.Remarcada,
            Descricao = $"Remarcada pelo chatbot de {alvo.InicioEm:dd/MM/yyyy HH:mm} para {novoInicio:dd/MM/yyyy HH:mm}."
        });
        var nova = new Consulta
        {
            Id = Guid.NewGuid(), ContaPsicologoId = contaId, PacienteId = entidade.PacienteId,
            TipoAtendimentoId = entidade.TipoAtendimentoId, InicioEm = novoInicio, FimEm = novoFim,
            Modalidade = entidade.Modalidade,
            Status = config.ConfirmacaoAutomaticaConsulta ? StatusConsulta.Confirmada : StatusConsulta.AguardandoConfirmacao,
            Origem = OrigemConsulta.Chatbot
        };
        dbContext.Consultas.Add(nova);
        dbContext.HistoricosConsulta.Add(new HistoricoConsulta
        {
            Id = Guid.NewGuid(), ContaPsicologoId = contaId, ConsultaId = nova.Id,
            StatusNovo = nova.Status, Descricao = $"Criada por remarcação via chatbot da consulta {entidade.Id}."
        });
        auditoria.Registrar(contaId, null, "ConsultaRemarcadaBot", nameof(Consulta), entidade.Id,
            "Consulta remarcada pelo chatbot.", new { InicioEm = alvo.InicioEm }, new { NovaConsultaId = nova.Id, NovoInicio = novoInicio }, null, null);
        await NotificarEquipeAsync(contaId, "Consulta remarcada pelo assistente", "Um paciente remarcou uma consulta pelo WhatsApp. Confira a agenda.", ct);
        return $"Remarcado: {alvo.InicioEm:dd/MM/yyyy HH:mm} -> {novoInicio:dd/MM/yyyy HH:mm}." + TextoRegrasBot(config);
    }

    private async Task<string> ProcessarConfirmacaoBotAsync(Guid contaId, ConversaWhatsApp conversa, CancellationToken ct)
    {
        if (conversa.PacienteId is null)
            return "Não encontrei seu cadastro pelo número desta conversa. A equipe pode confirmar sua presença por aqui.";
        var pendente = await dbContext.Consultas.AsNoTracking()
            .Where(x => x.ContaPsicologoId == contaId && x.PacienteId == conversa.PacienteId &&
                        x.InicioEm > DateTimeOffset.UtcNow &&
                        (x.Status == StatusConsulta.AguardandoConfirmacao || x.Status == StatusConsulta.Agendada))
            .OrderBy(x => x.InicioEm).FirstOrDefaultAsync(ct);
        if (pendente is null) return "Você não tem consultas aguardando confirmação.";
        var entidade = await dbContext.Consultas
            .SingleAsync(x => x.ContaPsicologoId == contaId && x.Id == pendente.Id, ct);
        entidade.Status = StatusConsulta.Confirmada;
        entidade.AtualizadoEm = DateTimeOffset.UtcNow;
        dbContext.HistoricosConsulta.Add(new HistoricoConsulta
        {
            Id = Guid.NewGuid(), ContaPsicologoId = contaId, ConsultaId = entidade.Id,
            StatusAnterior = pendente.Status, StatusNovo = StatusConsulta.Confirmada,
            Descricao = "Presença confirmada pelo paciente via WhatsApp."
        });
        auditoria.Registrar(contaId, null, "ConsultaConfirmadaBot", nameof(Consulta), entidade.Id,
            "Presença confirmada pelo chatbot.", new { Status = pendente.Status }, new { Status = StatusConsulta.Confirmada }, null, null);
        await NotificarEquipeAsync(contaId, "Presença confirmada pelo assistente", "Um paciente confirmou presença pelo WhatsApp. Confira a agenda.", ct);
        return $"Presença confirmada para {pendente.InicioEm:dd/MM/yyyy HH:mm}. Até lá!";
    }

    private static Consulta? SelecionarConsultaBot(List<Consulta> futuras, string? conteudo, TimeZoneInfo fuso)
    {
        if (futuras.Count == 1) return futuras[0];
        var data = TentarExtrairDataHoraBot(conteudo, fuso);
        if (data is null) return null;
        return futuras.OrderBy(c => Math.Abs((c.InicioEm - data.Value).Ticks)).First();
    }

    private static List<DateTimeOffset> ExtrairDatasBot(string? texto, TimeZoneInfo fuso)
    {
        var lista = new List<DateTimeOffset>();
        if (string.IsNullOrWhiteSpace(texto)) return lista;
        foreach (Match m in DataHoraBotRegex().Matches(texto))
        {
            if (MontarDataBot(m, fuso, out var data)) lista.Add(data);
        }
        return lista;
    }

    private static DateTimeOffset? TentarExtrairDataHoraBot(string? texto, TimeZoneInfo fuso)
    {
        if (string.IsNullOrWhiteSpace(texto)) return null;
        var m = DataHoraBotRegex().Match(texto);
        if (!m.Success) return null;
        return MontarDataBot(m, fuso, out var data) ? data : null;
    }

    private static bool MontarDataBot(Match m, TimeZoneInfo fuso, out DateTimeOffset data)
    {
        data = default;
        if (!int.TryParse(m.Groups["dia"].Value, out var dia) ||
            !int.TryParse(m.Groups["mes"].Value, out var mes)) return false;
        var hora = int.TryParse(m.Groups["hora"].Value, out var h) ? h : 0;
        var min = m.Groups["min"].Success && int.TryParse(m.Groups["min"].Value, out var mm) ? mm : 0;
        if (dia is < 1 or > 31 || mes is < 1 or > 12 || hora is < 0 or > 23 || min is < 0 or > 59) return false;
        var ano = TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, fuso).Year;
        if (m.Groups["ano"].Success && int.TryParse(m.Groups["ano"].Value, out var anoMsg))
            ano = anoMsg < 100 ? 2000 + anoMsg : anoMsg;
        try
        {
            var local = new DateTime(ano, mes, dia, hora, min, 0, DateTimeKind.Unspecified);
            data = new DateTimeOffset(local, fuso.GetUtcOffset(local));
            if (!m.Groups["ano"].Success && data < DateTimeOffset.UtcNow.AddHours(-1))
                data = new DateTimeOffset(new DateTime(ano + 1, mes, dia, hora, min, 0), fuso.GetUtcOffset(new DateTime(ano + 1, mes, dia, hora, min, 0)));
            return true;
        }
        catch (ArgumentOutOfRangeException)
        {
            return false;
        }
    }

    [GeneratedRegex(@"(?<dia>\d{1,2})/(?<mes>\d{1,2})(/(?<ano>\d{2,4}))?\s*(às|as|-|,)?\s*(?<hora>\d{1,2})[:hH](?<min>\d{2})?")]
    private static partial Regex DataHoraBotRegex();
}
