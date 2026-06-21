using GestaoPsi.Api.Data;
using GestaoPsi.Api.DTOs.Painel;
using GestaoPsi.Api.Shared.Enums;
using GestaoPsi.Api.Shared.Excecoes;
using Microsoft.EntityFrameworkCore;

namespace GestaoPsi.Api.Services.Painel;

public sealed class PainelService(AppDbContext dbContext) : IPainelService
{
    public async Task<PainelResumoResponse> ObterResumoAsync(
        Guid usuarioId,
        Guid contaPsicologoId,
        CancellationToken cancellationToken)
    {
        var usuario = await dbContext.Usuarios
            .AsNoTracking()
            .SingleOrDefaultAsync(
                item => item.Id == usuarioId &&
                        item.ContaPsicologoId == contaPsicologoId,
                cancellationToken);

        if (usuario is null)
        {
            throw new RegraNegocioException(
                "Sessao invalida ou expirada.",
                StatusCodes.Status401Unauthorized);
        }

        var agora = DateTimeOffset.Now;
        var hoje = DateOnly.FromDateTime(agora.DateTime);
        var inicioHoje = new DateTimeOffset(
            hoje.ToDateTime(TimeOnly.MinValue),
            agora.Offset);
        var fimHoje = inicioHoje.AddDays(1);
        var inicioMes = new DateTimeOffset(
            new DateTime(agora.Year, agora.Month, 1),
            agora.Offset);
        var fimMes = inicioMes.AddMonths(1);
        var fimSemana = inicioHoje.AddDays(5);

        var consultasHoje = await dbContext.Consultas
            .AsNoTracking()
            .Where(consulta =>
                consulta.ContaPsicologoId == contaPsicologoId &&
                consulta.InicioEm >= inicioHoje &&
                consulta.InicioEm < fimHoje &&
                consulta.Status != StatusConsulta.Cancelada &&
                consulta.Status != StatusConsulta.Remarcada)
            .OrderBy(consulta => consulta.InicioEm)
            .Select(consulta => new PainelConsultaHojeResponse(
                consulta.Id,
                consulta.Paciente.NomeCompleto,
                consulta.InicioEm.ToLocalTime().ToString("HH:mm"),
                checked((int)Math.Round((consulta.FimEm - consulta.InicioEm).TotalMinutes)),
                consulta.TipoAtendimento.Nome,
                consulta.Modalidade.ToString(),
                consulta.Status.ToString(),
                consulta.Status == StatusConsulta.Realizada))
            .ToListAsync(cancellationToken);

        var pacientesAtivos = await dbContext.Pacientes
            .AsNoTracking()
            .CountAsync(
                paciente =>
                    paciente.ContaPsicologoId == contaPsicologoId &&
                    paciente.Status == StatusPaciente.Ativo,
                cancellationToken);

        var pagamentosPendentes = await dbContext.Pagamentos
            .AsNoTracking()
            .Where(pagamento =>
                pagamento.ContaPsicologoId == contaPsicologoId &&
                (pagamento.Status == StatusPagamento.Pendente ||
                 pagamento.Status == StatusPagamento.AguardandoConfirmacao))
            .SumAsync(pagamento => (decimal?)pagamento.Valor, cancellationToken) ?? 0;

        var consultasAguardando = await dbContext.Consultas
            .AsNoTracking()
            .CountAsync(
                consulta =>
                    consulta.ContaPsicologoId == contaPsicologoId &&
                    consulta.Status == StatusConsulta.AguardandoConfirmacao,
                cancellationToken);

        var consultasMes = await dbContext.Consultas
            .AsNoTracking()
            .CountAsync(
                consulta =>
                    consulta.ContaPsicologoId == contaPsicologoId &&
                    consulta.InicioEm >= inicioMes &&
                    consulta.InicioEm < fimMes &&
                    consulta.Status != StatusConsulta.Cancelada &&
                    consulta.Status != StatusConsulta.Remarcada,
                cancellationToken);

        var consultasRealizadasMes = await dbContext.Consultas
            .AsNoTracking()
            .CountAsync(
                consulta =>
                    consulta.ContaPsicologoId == contaPsicologoId &&
                    consulta.InicioEm >= inicioMes &&
                    consulta.InicioEm < fimMes &&
                    consulta.Status == StatusConsulta.Realizada,
                cancellationToken);

        var lembretesFalhosHoje = await dbContext.Lembretes
            .AsNoTracking()
            .CountAsync(
                lembrete =>
                    lembrete.ContaPsicologoId == contaPsicologoId &&
                    lembrete.Status == StatusLembrete.Falhou &&
                    lembrete.AgendadoPara >= inicioHoje &&
                    lembrete.AgendadoPara < fimHoje,
                cancellationToken);

        var conversasAbertas = await dbContext.ConversasWhatsApp
            .AsNoTracking()
            .CountAsync(
                conversa =>
                    conversa.ContaPsicologoId == contaPsicologoId &&
                    conversa.Status == StatusConversaWhatsApp.Aberta,
                cancellationToken);

        var conversasAtendimentoHumano = await dbContext.ConversasWhatsApp
            .AsNoTracking()
            .CountAsync(
                conversa =>
                    conversa.ContaPsicologoId == contaPsicologoId &&
                    conversa.AtendimentoHumanoNecessario,
                cancellationToken);

        var notificacoesNaoLidas = await dbContext.Notificacoes
            .AsNoTracking()
            .CountAsync(
                notificacao =>
                    notificacao.ContaPsicologoId == contaPsicologoId &&
                    notificacao.UsuarioId == usuarioId &&
                    !notificacao.Lida,
                cancellationToken);

        var alertas = await ObterAlertasAsync(
            contaPsicologoId,
            usuarioId,
            inicioHoje,
            fimHoje,
            cancellationToken);

        return new PainelResumoResponse(
            new PainelUsuarioResponse(
                usuario.NomeCompleto,
                ObterPrimeiroNome(usuario.NomeCompleto),
                usuario.Perfil.ToString()),
            new PainelIndicadoresResponse(
                consultasHoje.Count,
                consultasHoje.Count(consulta =>
                    consulta.Status is nameof(StatusConsulta.Agendada) or
                        nameof(StatusConsulta.Confirmada) or
                        nameof(StatusConsulta.AguardandoConfirmacao)),
                consultasAguardando,
                pacientesAtivos,
                pagamentosPendentes,
                lembretesFalhosHoje,
                conversasAbertas,
                conversasAtendimentoHumano,
                notificacoesNaoLidas,
                consultasMes == 0
                    ? 0
                    : Math.Clamp(
                        checked((int)Math.Round(consultasRealizadasMes * 100.0 / consultasMes)),
                        0,
                        100)),
            consultasHoje,
            await ObterVisaoSemanaAsync(
                contaPsicologoId,
                inicioHoje.AddDays(1),
                fimSemana,
                cancellationToken),
            alertas,
            CriarPrioridades(
                consultasAguardando,
                pagamentosPendentes,
                lembretesFalhosHoje,
                conversasAtendimentoHumano,
                notificacoesNaoLidas,
                consultasHoje.Count),
            CriarAcoesRapidas());
    }

    private async Task<IReadOnlyCollection<PainelDiaSemanaResponse>> ObterVisaoSemanaAsync(
        Guid contaPsicologoId,
        DateTimeOffset inicio,
        DateTimeOffset fim,
        CancellationToken cancellationToken)
    {
        var consultas = await dbContext.Consultas
            .AsNoTracking()
            .Where(consulta =>
                consulta.ContaPsicologoId == contaPsicologoId &&
                consulta.InicioEm >= inicio &&
                consulta.InicioEm < fim &&
                consulta.Status != StatusConsulta.Cancelada &&
                consulta.Status != StatusConsulta.Remarcada)
            .GroupBy(consulta => consulta.InicioEm.Date)
            .Select(grupo => new
            {
                Data = grupo.Key,
                Total = grupo.Count()
            })
            .ToListAsync(cancellationToken);

        return Enumerable.Range(0, 4)
            .Select(indice =>
            {
                var data = DateOnly.FromDateTime(inicio.AddDays(indice).Date);
                var total = consultas
                    .SingleOrDefault(item => DateOnly.FromDateTime(item.Data) == data)
                    ?.Total ?? 0;
                return new PainelDiaSemanaResponse(data, ObterRotuloDia(data), total);
            })
            .ToArray();
    }

    private async Task<IReadOnlyCollection<PainelAlertaResponse>> ObterAlertasAsync(
        Guid contaPsicologoId,
        Guid usuarioId,
        DateTimeOffset inicioHoje,
        DateTimeOffset fimHoje,
        CancellationToken cancellationToken)
    {
        var alertas = new List<PainelAlertaResponse>();

        var lembretesFalhos = await dbContext.Lembretes
            .AsNoTracking()
            .Where(lembrete =>
                lembrete.ContaPsicologoId == contaPsicologoId &&
                lembrete.Status == StatusLembrete.Falhou &&
                lembrete.AgendadoPara >= inicioHoje &&
                lembrete.AgendadoPara < fimHoje)
            .OrderByDescending(lembrete => lembrete.AtualizadoEm ?? lembrete.CriadoEm)
            .Take(2)
            .Select(lembrete => new PainelAlertaResponse(
                "erro",
                "Falha de lembrete",
                lembrete.ErroEnvio ?? "Um lembrete nao foi enviado corretamente.",
                lembrete.AtualizadoEm ?? lembrete.CriadoEm,
                null))
            .ToListAsync(cancellationToken);
        alertas.AddRange(lembretesFalhos);

        var conversas = await dbContext.ConversasWhatsApp
            .AsNoTracking()
            .Where(conversa =>
                conversa.ContaPsicologoId == contaPsicologoId &&
                conversa.AtendimentoHumanoNecessario)
            .OrderByDescending(conversa => conversa.UltimaMensagemEm ?? conversa.CriadoEm)
            .Take(2)
            .Select(conversa => new PainelAlertaResponse(
                "whatsapp",
                "Mensagem para revisar",
                conversa.MotivoAtendimentoHumano ??
                "Uma conversa do WhatsApp aguarda sua revisao.",
                conversa.UltimaMensagemEm ?? conversa.CriadoEm,
                null))
            .ToListAsync(cancellationToken);
        alertas.AddRange(conversas);

        var notificacoes = await dbContext.Notificacoes
            .AsNoTracking()
            .Where(notificacao =>
                notificacao.ContaPsicologoId == contaPsicologoId &&
                notificacao.UsuarioId == usuarioId &&
                !notificacao.Lida)
            .OrderByDescending(notificacao => notificacao.CriadoEm)
            .Take(3)
            .Select(notificacao => new PainelAlertaResponse(
                notificacao.Tipo,
                notificacao.Titulo,
                notificacao.Mensagem,
                notificacao.CriadoEm,
                null))
            .ToListAsync(cancellationToken);
        alertas.AddRange(notificacoes);

        return alertas
            .OrderByDescending(alerta => alerta.CriadoEm)
            .Take(5)
            .ToArray();
    }

    private static IReadOnlyCollection<PainelPrioridadeResponse> CriarPrioridades(
        int consultasAguardando,
        decimal pagamentosPendentes,
        int lembretesFalhosHoje,
        int conversasAtendimentoHumano,
        int notificacoesNaoLidas,
        int consultasHoje)
    {
        var prioridades = new List<PainelPrioridadeResponse>();

        if (conversasAtendimentoHumano > 0)
        {
            prioridades.Add(new PainelPrioridadeResponse(
                "Mensagens para revisar",
                FormatarQuantidade(
                    conversasAtendimentoHumano,
                    "conversa do WhatsApp aguarda sua revisao.",
                    "conversas do WhatsApp aguardam sua revisao."),
                "pi-whatsapp",
                "alerta",
                "/integracoes/whatsapp/conversas",
                "Abrir conversas"));
        }

        if (lembretesFalhosHoje > 0)
        {
            prioridades.Add(new PainelPrioridadeResponse(
                "Lembretes com falha",
                FormatarQuantidade(
                    lembretesFalhosHoje,
                    "lembrete nao foi enviado hoje.",
                    "lembretes nao foram enviados hoje."),
                "pi-send",
                "erro",
                "/lembretes",
                "Revisar envios"));
        }

        if (consultasAguardando > 0)
        {
            prioridades.Add(new PainelPrioridadeResponse(
                "Confirmacoes pendentes",
                FormatarQuantidade(
                    consultasAguardando,
                    "consulta ainda aguarda confirmacao.",
                    "consultas ainda aguardam confirmacao."),
                "pi-calendar-clock",
                "atencao",
                "/agenda",
                "Ver agenda"));
        }

        if (pagamentosPendentes > 0)
        {
            prioridades.Add(new PainelPrioridadeResponse(
                "Financeiro a acompanhar",
                "Ha pagamentos pendentes vinculados ao consultorio.",
                "pi-wallet",
                "neutro",
                "/pagamentos",
                "Abrir financeiro"));
        }

        if (notificacoesNaoLidas > 0)
        {
            prioridades.Add(new PainelPrioridadeResponse(
                "Notificacoes nao lidas",
                FormatarQuantidade(
                    notificacoesNaoLidas,
                    "notificacao precisa de leitura.",
                    "notificacoes precisam de leitura."),
                "pi-bell",
                "neutro",
                "/notificacoes",
                "Ler notificacoes"));
        }

        if (prioridades.Count == 0)
        {
            prioridades.Add(new PainelPrioridadeResponse(
                "Rotina administrativa em dia",
                consultasHoje == 0
                    ? "Sem pendencias e sem consultas registradas para hoje."
                    : "Sem pendencias criticas antes dos atendimentos de hoje.",
                "pi-check-circle",
                "ok",
                "/agenda",
                "Abrir agenda"));
        }

        return prioridades.Take(4).ToArray();
    }

    private static IReadOnlyCollection<PainelAcaoRapidaResponse> CriarAcoesRapidas() =>
    [
        new("Nova consulta", "Agende um novo atendimento.", "pi-calendar-plus", "/consultas/nova", false),
        new("Cadastrar paciente", "Adicione uma pessoa ao consultorio.", "pi-user-plus", "/pacientes/novo", false),
        new("Novo documento", "Crie um documento psicologico.", "pi-file-plus", "/documentos/novo", false),
        new("Mensagens", "Revise contatos recebidos pelo WhatsApp.", "pi-whatsapp", "/integracoes/whatsapp/conversas", false)
    ];

    private static string FormatarQuantidade(int quantidade, string singular, string plural) =>
        $"{quantidade} {(quantidade == 1 ? singular : plural)}";

    private static string ObterPrimeiroNome(string nomeCompleto) =>
        nomeCompleto
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .FirstOrDefault(parte =>
                !string.Equals(parte, "Dr.", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(parte, "Dra.", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(parte, "Dr", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(parte, "Dra", StringComparison.OrdinalIgnoreCase))
            ?? nomeCompleto;

    private static string ObterRotuloDia(DateOnly data)
    {
        var hoje = DateOnly.FromDateTime(DateTimeOffset.Now.DateTime);
        if (data == hoje.AddDays(1))
        {
            return "Amanha";
        }

        return data.DayOfWeek switch
        {
            DayOfWeek.Monday => "Segunda",
            DayOfWeek.Tuesday => "Terca",
            DayOfWeek.Wednesday => "Quarta",
            DayOfWeek.Thursday => "Quinta",
            DayOfWeek.Friday => "Sexta",
            DayOfWeek.Saturday => "Sabado",
            _ => "Domingo"
        };
    }
}
