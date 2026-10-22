using Psique.Api.Data;
using Psique.Api.DTOs.Painel;
using Psique.Api.Services.Seguranca;
using Psique.Api.Shared.Enums;
using Psique.Api.Shared.Excecoes;
using Microsoft.EntityFrameworkCore;

namespace Psique.Api.Services.Painel;

public sealed class PainelService(AppDbContext dbContext) : IPainelService
{
    public async Task<PainelResumoResponse> ObterResumoAsync(
        Guid usuarioId,
        Guid contaPsicologoId,
        CancellationToken cancellationToken)
    {
        var usuario = await dbContext.Usuarios
            .AsNoTracking()
            .Include(item => item.PerfilAcesso)
            .SingleOrDefaultAsync(
                item => item.Id == usuarioId &&
                        item.ContaPsicologoId == contaPsicologoId,
                cancellationToken);

        if (usuario is null)
        {
            throw new RegraNegocioException(
                "Sessão inválida ou expirada.",
                StatusCodes.Status401Unauthorized);
        }

        // O painel só mostra o que a pessoa pode abrir: cada bloco depende da permissão da página correspondente.
        var permissoes = PermissoesEfetivas.Para(usuario);
        var podeAgenda = permissoes.Contains(PermissaoAcesso.Agenda);
        var podePacientes = permissoes.Contains(PermissaoAcesso.Pacientes);
        var podeFinanceiro = permissoes.Contains(PermissaoAcesso.Financeiro);
        var podeMensagens = permissoes.Contains(PermissaoAcesso.Mensagens);
        var podeConversas = permissoes.Contains(PermissaoAcesso.Conversas);

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
                podeAgenda &&
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
                    podePacientes &&
                    paciente.ContaPsicologoId == contaPsicologoId &&
                    paciente.Status == StatusPaciente.Ativo,
                cancellationToken);

        var pagamentosPendentes = await dbContext.Pagamentos
            .AsNoTracking()
            .Where(pagamento =>
                podeFinanceiro &&
                pagamento.ContaPsicologoId == contaPsicologoId &&
                (pagamento.Status == StatusPagamento.Pendente ||
                 pagamento.Status == StatusPagamento.AguardandoConfirmacao))
            .SumAsync(pagamento => (decimal?)pagamento.Valor, cancellationToken) ?? 0;

        var consultasAguardando = await dbContext.Consultas
            .AsNoTracking()
            .CountAsync(
                consulta =>
                    podeAgenda &&
                    consulta.ContaPsicologoId == contaPsicologoId &&
                    consulta.Status == StatusConsulta.AguardandoConfirmacao,
                cancellationToken);

        var consultasMes = await dbContext.Consultas
            .AsNoTracking()
            .CountAsync(
                consulta =>
                    podeAgenda &&
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
                    podeAgenda &&
                    consulta.ContaPsicologoId == contaPsicologoId &&
                    consulta.InicioEm >= inicioMes &&
                    consulta.InicioEm < fimMes &&
                    consulta.Status == StatusConsulta.Realizada,
                cancellationToken);

        var lembretesFalhosHoje = await dbContext.Lembretes
            .AsNoTracking()
            .CountAsync(
                lembrete =>
                    podeMensagens &&
                    lembrete.ContaPsicologoId == contaPsicologoId &&
                    lembrete.Status == StatusLembrete.Falhou &&
                    lembrete.AgendadoPara >= inicioHoje &&
                    lembrete.AgendadoPara < fimHoje,
                cancellationToken);

        var conversasAbertas = await dbContext.ConversasWhatsApp
            .AsNoTracking()
            .CountAsync(
                conversa =>
                    podeConversas &&
                    conversa.ContaPsicologoId == contaPsicologoId &&
                    conversa.Status == StatusConversaWhatsApp.Aberta,
                cancellationToken);

        var conversasAtendimentoHumano = await dbContext.ConversasWhatsApp
            .AsNoTracking()
            .CountAsync(
                conversa =>
                    podeConversas &&
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

        // Em aberto = ainda pode ser confirmada, realizada ou marcada como falta.
        var emAberto = new[] { StatusConsulta.AguardandoConfirmacao, StatusConsulta.Agendada, StatusConsulta.Confirmada };
        var proximas = await dbContext.Consultas
            .AsNoTracking()
            .Where(consulta =>
                podeAgenda &&
                consulta.ContaPsicologoId == contaPsicologoId &&
                consulta.FimEm > agora &&
                emAberto.Contains(consulta.Status))
            .OrderBy(consulta => consulta.InicioEm)
            .Take(3)
            .Select(consulta => new PainelConsultaResponse(
                consulta.Id,
                consulta.PacienteId,
                consulta.Paciente.NomeCompleto,
                consulta.InicioEm,
                consulta.FimEm,
                consulta.TipoAtendimento.Nome,
                consulta.Modalidade.ToString(),
                consulta.Status.ToString(),
                consulta.LinkOnline))
            .ToListAsync(cancellationToken);

        var semDesfecho = await dbContext.Consultas
            .AsNoTracking()
            .Where(consulta =>
                podeAgenda &&
                consulta.ContaPsicologoId == contaPsicologoId &&
                consulta.FimEm <= agora &&
                consulta.InicioEm >= inicioHoje.AddDays(-60) &&
                emAberto.Contains(consulta.Status))
            .OrderByDescending(consulta => consulta.InicioEm)
            .Take(20)
            .Select(consulta => new PainelConsultaResponse(
                consulta.Id,
                consulta.PacienteId,
                consulta.Paciente.NomeCompleto,
                consulta.InicioEm,
                consulta.FimEm,
                consulta.TipoAtendimento.Nome,
                consulta.Modalidade.ToString(),
                consulta.Status.ToString(),
                consulta.LinkOnline))
            .ToListAsync(cancellationToken);

        var alertas = await ObterAlertasAsync(
            contaPsicologoId,
            usuarioId,
            inicioHoje,
            fimHoje,
            podeMensagens,
            podeConversas,
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
                podeAgenda,
                cancellationToken),
            alertas,
            CriarPrioridades(
                consultasAguardando,
                pagamentosPendentes,
                lembretesFalhosHoje,
                conversasAtendimentoHumano,
                notificacoesNaoLidas,
                consultasHoje.Count),
            CriarAcoesRapidas(usuario.Perfil, podeAgenda, podePacientes, podeConversas),
            proximas,
            semDesfecho,
            await ObterAniversariantesAsync(contaPsicologoId, hoje, podePacientes, cancellationToken),
            usuario.Perfil is PerfilUsuario.Psicologo or PerfilUsuario.Administrador
                ? await ObterPrimeirosPassosAsync(contaPsicologoId, cancellationToken)
                : null);
    }

    private async Task<IReadOnlyCollection<PainelAniversarianteResponse>> ObterAniversariantesAsync(
        Guid contaPsicologoId,
        DateOnly hoje,
        bool podePacientes,
        CancellationToken cancellationToken)
    {
        if (!podePacientes) return [];
        var nascimentos = await dbContext.Pacientes
            .AsNoTracking()
            .Where(paciente =>
                paciente.ContaPsicologoId == contaPsicologoId &&
                paciente.Status == StatusPaciente.Ativo &&
                paciente.DataNascimento != null)
            .Select(paciente => new { paciente.Id, paciente.NomeCompleto, Nascimento = paciente.DataNascimento!.Value })
            .ToListAsync(cancellationToken);

        return nascimentos
            .Select(item =>
            {
                // 29/02 vira 28/02 nos anos que não são bissextos.
                var dia = Math.Min(item.Nascimento.Day, DateTime.DaysInMonth(hoje.Year, item.Nascimento.Month));
                var aniversario = new DateOnly(hoje.Year, item.Nascimento.Month, dia);
                if (aniversario < hoje) aniversario = aniversario.AddYears(1);
                return new PainelAniversarianteResponse(item.Id, item.NomeCompleto, aniversario, aniversario.Year - item.Nascimento.Year);
            })
            .Where(item => item.Data.DayNumber - hoje.DayNumber <= 7)
            .OrderBy(item => item.Data)
            .Take(8)
            .ToArray();
    }

    private async Task<PainelPrimeirosPassosResponse> ObterPrimeirosPassosAsync(Guid contaPsicologoId, CancellationToken cancellationToken) =>
        new(
            await dbContext.DadosProfissionaisPsicologo.AsNoTracking().AnyAsync(item => item.ContaPsicologoId == contaPsicologoId && item.Crp != "", cancellationToken),
            await dbContext.HorariosDisponiveis.AsNoTracking().AnyAsync(item => item.ContaPsicologoId == contaPsicologoId && item.Ativo, cancellationToken),
            await dbContext.TiposAtendimento.AsNoTracking().AnyAsync(item => item.ContaPsicologoId == contaPsicologoId && item.Ativo, cancellationToken),
            await dbContext.Pacientes.AsNoTracking().AnyAsync(item => item.ContaPsicologoId == contaPsicologoId, cancellationToken),
            await dbContext.IntegracoesWhatsApp.AsNoTracking().AnyAsync(item => item.ContaPsicologoId == contaPsicologoId && item.Status == StatusIntegracao.Ativa, cancellationToken));

    private async Task<IReadOnlyCollection<PainelDiaSemanaResponse>> ObterVisaoSemanaAsync(
        Guid contaPsicologoId,
        DateTimeOffset inicio,
        DateTimeOffset fim,
        bool podeAgenda,
        CancellationToken cancellationToken)
    {
        var consultas = await dbContext.Consultas
            .AsNoTracking()
            .Where(consulta =>
                podeAgenda &&
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
        bool podeMensagens,
        bool podeConversas,
        CancellationToken cancellationToken)
    {
        var alertas = new List<PainelAlertaResponse>();

        var lembretesFalhos = await dbContext.Lembretes
            .AsNoTracking()
            .Where(lembrete =>
                podeMensagens &&
                lembrete.ContaPsicologoId == contaPsicologoId &&
                lembrete.Status == StatusLembrete.Falhou &&
                lembrete.AgendadoPara >= inicioHoje &&
                lembrete.AgendadoPara < fimHoje)
            .OrderByDescending(lembrete => lembrete.AtualizadoEm ?? lembrete.CriadoEm)
            .Take(2)
            .Select(lembrete => new PainelAlertaResponse(
                "erro",
                "Falha de lembrete",
                lembrete.ErroEnvio ?? "Um lembrete não foi enviado corretamente.",
                lembrete.AtualizadoEm ?? lembrete.CriadoEm,
                null))
            .ToListAsync(cancellationToken);
        alertas.AddRange(lembretesFalhos);

        var conversas = await dbContext.ConversasWhatsApp
            .AsNoTracking()
            .Where(conversa =>
                podeConversas &&
                conversa.ContaPsicologoId == contaPsicologoId &&
                conversa.AtendimentoHumanoNecessario)
            .OrderByDescending(conversa => conversa.UltimaMensagemEm ?? conversa.CriadoEm)
            .Take(2)
            .Select(conversa => new PainelAlertaResponse(
                "whatsapp",
                "Conversa esperando uma pessoa",
                conversa.MotivoAtendimentoHumano ??
                "Uma conversa do WhatsApp espera uma pessoa da equipe.",
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
                "Conversas esperando uma pessoa",
                FormatarQuantidade(
                    conversasAtendimentoHumano,
                    "conversa do WhatsApp espera uma pessoa da equipe.",
                    "conversas do WhatsApp esperam uma pessoa da equipe."),
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
                    "lembrete não foi enviado hoje.",
                    "lembretes não foram enviados hoje."),
                "pi-send",
                "erro",
                "/lembretes",
                "Revisar envios"));
        }

        if (consultasAguardando > 0)
        {
            prioridades.Add(new PainelPrioridadeResponse(
                "Confirmações pendentes",
                FormatarQuantidade(
                    consultasAguardando,
                    "consulta ainda aguarda confirmação.",
                    "consultas ainda aguardam confirmação."),
                "pi-calendar-clock",
                "atencao",
                "/agenda",
                "Ver agenda"));
        }

        if (pagamentosPendentes > 0)
        {
            prioridades.Add(new PainelPrioridadeResponse(
                "Financeiro a acompanhar",
                "Há pagamentos pendentes vinculados ao consultório.",
                "pi-wallet",
                "neutro",
                "/pagamentos",
                "Abrir financeiro"));
        }

        if (notificacoesNaoLidas > 0)
        {
            prioridades.Add(new PainelPrioridadeResponse(
                "Notificações não lidas",
                FormatarQuantidade(
                    notificacoesNaoLidas,
                    "notificação precisa de leitura.",
                    "notificações precisam de leitura."),
                "pi-bell",
                "neutro",
                "/notificacoes",
                "Ler notificações"));
        }

        if (prioridades.Count == 0)
        {
            prioridades.Add(new PainelPrioridadeResponse(
                "Rotina administrativa em dia",
                consultasHoje == 0
                    ? "Sem pendências e sem consultas registradas para hoje."
                    : "Sem pendências críticas antes dos atendimentos de hoje.",
                "pi-check-circle",
                "ok",
                "/agenda",
                "Abrir agenda"));
        }

        return prioridades.Take(4).ToArray();
    }

    private static IReadOnlyCollection<PainelAcaoRapidaResponse> CriarAcoesRapidas(
        PerfilUsuario perfil,
        bool podeAgenda,
        bool podePacientes,
        bool podeConversas)
    {
        var acoes = new List<PainelAcaoRapidaResponse>();
        if (podeAgenda)
            acoes.Add(new("Nova consulta", "Marque um novo atendimento.", "pi-calendar-plus", "/consultas/nova", false));
        if (podePacientes)
            acoes.Add(new("Cadastrar paciente", "Adicione uma pessoa ao consultório.", "pi-user-plus", "/pacientes/novo", false));
        if (perfil == PerfilUsuario.Psicologo)
            acoes.Add(new("Novo documento", "Crie um documento psicológico.", "pi-file-plus", "/documentos/novo", false));
        if (podeConversas)
            acoes.Add(new("Conversas", "Responda as mensagens recebidas pelo WhatsApp.", "pi-whatsapp", "/integracoes/whatsapp/conversas", false));
        return acoes;
    }

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
            return "Amanhã";
        }

        return data.DayOfWeek switch
        {
            DayOfWeek.Monday => "Segunda",
            DayOfWeek.Tuesday => "Terça",
            DayOfWeek.Wednesday => "Quarta",
            DayOfWeek.Thursday => "Quinta",
            DayOfWeek.Friday => "Sexta",
            DayOfWeek.Saturday => "Sábado",
            _ => "Domingo"
        };
    }
}
