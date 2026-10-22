using Psique.Api.Data;
using Psique.Api.Models;
using Psique.Api.Services.Seguranca;
using Psique.Api.Shared.Enums;
using Microsoft.EntityFrameworkCore;

namespace Psique.Api.Services.Pagamentos;

/// <summary>
/// Cobrança criada pelo desfecho da sessão: realizada (e falta, se a conta cobra falta) gera um pagamento pendente
/// para pacientes cobrados por sessão. Nunca duplica: se a consulta já tem cobrança ativa, nada acontece.
/// Mensalistas pagam pela mensalidade, então ficam de fora.
/// </summary>
public static class CobrancaAutomatica
{
    public static async Task<Pagamento?> GerarSeNecessarioAsync(
        AppDbContext db,
        IAuditoriaService auditoria,
        Consulta consulta,
        Guid? usuarioId,
        string? ip,
        string? userAgent,
        CancellationToken ct)
    {
        if (consulta.Status is not (StatusConsulta.Realizada or StatusConsulta.NaoCompareceu)) return null;

        var configuracao = await db.ConfiguracoesAtendimento.AsNoTracking()
            .SingleOrDefaultAsync(x => x.ContaPsicologoId == consulta.ContaPsicologoId && x.Ativo, ct);
        if (configuracao is null || !configuracao.CobrarAoRealizar) return null;
        if (consulta.Status == StatusConsulta.NaoCompareceu && !configuracao.CobrarFalta) return null;

        var paciente = await db.Pacientes.AsNoTracking()
            .SingleAsync(x => x.Id == consulta.PacienteId && x.ContaPsicologoId == consulta.ContaPsicologoId, ct);
        if (paciente.ModoCobranca == ModoCobranca.Mensal) return null;

        var jaCobrada = await db.Pagamentos.AnyAsync(x =>
            x.ContaPsicologoId == consulta.ContaPsicologoId &&
            x.ConsultaId == consulta.Id &&
            x.Status != StatusPagamento.Cancelado, ct);
        if (jaCobrada) return null;

        var valorTipo = await db.TiposAtendimento.AsNoTracking()
            .Where(x => x.Id == consulta.TipoAtendimentoId && x.ContaPsicologoId == consulta.ContaPsicologoId)
            .Select(x => x.ValorPadrao)
            .SingleOrDefaultAsync(ct);
        var valor = paciente.ValorSessao ?? valorTipo;
        if (valor is null or <= 0) return null;

        var pagamento = new Pagamento
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = consulta.ContaPsicologoId,
            PacienteId = consulta.PacienteId,
            ConsultaId = consulta.Id,
            Valor = valor.Value,
            Status = StatusPagamento.Pendente,
            FormaPagamento = FormaPagamento.Manual,
            VencimentoEm = DateTimeOffset.UtcNow,
            Observacao = consulta.Status == StatusConsulta.NaoCompareceu ? "Falta cobrada conforme a política do consultório." : null
        };
        db.Pagamentos.Add(pagamento);
        auditoria.Registrar(
            consulta.ContaPsicologoId,
            usuarioId,
            "PagamentoCriadoDesfecho",
            nameof(Pagamento),
            pagamento.Id,
            consulta.Status == StatusConsulta.NaoCompareceu ? "Cobrança de falta criada." : "Cobrança da sessão realizada criada.",
            null,
            new { pagamento.ConsultaId, pagamento.Valor },
            ip,
            userAgent);
        return pagamento;
    }
}
