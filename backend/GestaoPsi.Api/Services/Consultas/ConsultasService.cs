using GestaoPsi.Api.Data;
using GestaoPsi.Api.DTOs.Consultas;
using GestaoPsi.Api.Models;
using GestaoPsi.Api.Services.Seguranca;
using GestaoPsi.Api.Shared.Enums;
using GestaoPsi.Api.Shared.Excecoes;
using Microsoft.EntityFrameworkCore;

namespace GestaoPsi.Api.Services.Consultas;

public sealed class ConsultasService(AppDbContext dbContext, IAutorizacaoContaService autorizacao, IAuditoriaService auditoria) : IConsultasService
{
    public async Task<IReadOnlyCollection<ConsultaResponse>> ListarAsync(Guid usuarioId, Guid contaId, DateTimeOffset inicio, DateTimeOffset fim, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var consultas = await dbContext.Consultas.AsNoTracking().Where(x => x.ContaPsicologoId == contaId && x.InicioEm < fim && x.FimEm > inicio)
            .Include(x => x.Paciente).Include(x => x.TipoAtendimento).OrderBy(x => x.InicioEm).ToArrayAsync(ct);
        return consultas.Select(Mapear).ToArray();
    }

    public async Task<ConsultaResponse> ObterPorIdAsync(Guid usuarioId, Guid contaId, Guid id, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var consulta = await dbContext.Consultas.AsNoTracking()
            .Include(x => x.Paciente)
            .Include(x => x.TipoAtendimento)
            .SingleOrDefaultAsync(x => x.Id == id && x.ContaPsicologoId == contaId, ct)
            ?? throw new RegraNegocioException("Consulta nao encontrada.", StatusCodes.Status404NotFound);
        return Mapear(consulta);
    }

    public async Task<ConsultaResponse> CriarAsync(Guid usuarioId, Guid contaId, CriarConsultaRequest request, string? ip, string? userAgent, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        if (request.FimEm <= request.InicioEm) throw new RegraNegocioException("O fim da consulta deve ser posterior ao inicio.");
        if (request.InicioEm < DateTimeOffset.UtcNow.AddHours(await ObterAntecedenciaAsync(contaId, ct))) throw new RegraNegocioException("A consulta nao respeita a antecedencia minima configurada.");
        var paciente = await dbContext.Pacientes.SingleOrDefaultAsync(x => x.Id == request.PacienteId && x.ContaPsicologoId == contaId && x.Status == StatusPaciente.Ativo, ct) ?? throw new RegraNegocioException("Paciente ativo nao encontrado.", StatusCodes.Status404NotFound);
        var tipo = await dbContext.TiposAtendimento.SingleOrDefaultAsync(x => x.Id == request.TipoAtendimentoId && x.ContaPsicologoId == contaId && x.Ativo, ct) ?? throw new RegraNegocioException("Tipo de atendimento ativo nao encontrado.", StatusCodes.Status404NotFound);
        var bloqueado = await dbContext.BloqueiosAgenda.AnyAsync(x => x.ContaPsicologoId == contaId && x.InicioEm < request.FimEm && x.FimEm > request.InicioEm, ct);
        if (bloqueado) throw new RegraNegocioException("O horario escolhido esta bloqueado na agenda.");
        var conflitante = await dbContext.Consultas.AnyAsync(x => x.ContaPsicologoId == contaId && x.Status != StatusConsulta.Cancelada && x.Status != StatusConsulta.Remarcada && x.InicioEm < request.FimEm && x.FimEm > request.InicioEm, ct);
        if (conflitante) throw new RegraNegocioException("Ja existe uma consulta neste intervalo.");
        var configuracao = await dbContext.ConfiguracoesAtendimento.AsNoTracking().SingleAsync(x => x.ContaPsicologoId == contaId && x.Ativo, ct);
        var consulta = new Consulta { Id = Guid.NewGuid(), ContaPsicologoId = contaId, PacienteId = paciente.Id, TipoAtendimentoId = tipo.Id, InicioEm = request.InicioEm, FimEm = request.FimEm, Modalidade = request.Modalidade, LinkOnline = Limpar(request.LinkOnline), EnderecoAtendimento = Limpar(request.EnderecoAtendimento), ObservacaoAdministrativa = Limpar(request.ObservacaoAdministrativa), Status = configuracao.ConfirmacaoAutomaticaConsulta ? StatusConsulta.Confirmada : StatusConsulta.AguardandoConfirmacao, Origem = OrigemConsulta.Painel };
        dbContext.Consultas.Add(consulta);
        dbContext.HistoricosConsulta.Add(new() { Id = Guid.NewGuid(), ContaPsicologoId = contaId, ConsultaId = consulta.Id, UsuarioId = usuarioId, StatusNovo = consulta.Status, Descricao = "Consulta criada." });
        auditoria.Registrar(contaId, usuarioId, "ConsultaCriada", nameof(Consulta), consulta.Id, "Consulta criada.", null, new { consulta.PacienteId, consulta.InicioEm, consulta.FimEm, consulta.Status }, ip, userAgent);
        await dbContext.SaveChangesAsync(ct);
        consulta.Paciente = paciente; consulta.TipoAtendimento = tipo;
        return Mapear(consulta);
    }

    public async Task<ConsultaResponse> AlterarStatusAsync(Guid usuarioId, Guid contaId, Guid id, AlterarStatusConsultaRequest request, string? ip, string? userAgent, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var consulta = await dbContext.Consultas.Include(x => x.Paciente).Include(x => x.TipoAtendimento).SingleOrDefaultAsync(x => x.Id == id && x.ContaPsicologoId == contaId, ct) ?? throw new RegraNegocioException("Consulta nao encontrada.", StatusCodes.Status404NotFound);
        if (consulta.Status is StatusConsulta.Cancelada or StatusConsulta.Remarcada or StatusConsulta.Realizada) throw new RegraNegocioException("Esta consulta nao pode mais ter o status alterado.");
        if (request.Status is not (StatusConsulta.Confirmada or StatusConsulta.Cancelada or StatusConsulta.NaoCompareceu)) throw new RegraNegocioException("Transicao de status invalida.");
        if (request.Status == StatusConsulta.Cancelada && string.IsNullOrWhiteSpace(request.Justificativa)) throw new RegraNegocioException("Informe a justificativa do cancelamento.");
        var anterior = consulta.Status; consulta.Status = request.Status; consulta.JustificativaCancelamento = request.Status == StatusConsulta.Cancelada ? Limpar(request.Justificativa) : null; consulta.AtualizadoEm = DateTimeOffset.UtcNow;
        dbContext.HistoricosConsulta.Add(new() { Id = Guid.NewGuid(), ContaPsicologoId = contaId, ConsultaId = id, UsuarioId = usuarioId, StatusAnterior = anterior, StatusNovo = request.Status, Descricao = request.Status == StatusConsulta.Cancelada ? consulta.JustificativaCancelamento : "Status da consulta atualizado." });
        auditoria.Registrar(contaId, usuarioId, "StatusConsultaAlterado", nameof(Consulta), id, "Status da consulta atualizado.", new { Status = anterior }, new { Status = request.Status }, ip, userAgent);
        await dbContext.SaveChangesAsync(ct);
        return Mapear(consulta);
    }
    private async Task<int> ObterAntecedenciaAsync(Guid contaId, CancellationToken ct) => (await dbContext.ConfiguracoesAtendimento.AsNoTracking().SingleAsync(x => x.ContaPsicologoId == contaId && x.Ativo, ct)).AntecedenciaMinimaAgendamentoHoras ?? 0;
    private static string? Limpar(string? valor) => string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();
    private static ConsultaResponse Mapear(Consulta x) => new(x.Id, x.PacienteId, x.Paciente.NomeCompleto, x.TipoAtendimentoId, x.TipoAtendimento.Nome, x.InicioEm, x.FimEm, x.Status, x.Modalidade, x.LinkOnline, x.EnderecoAtendimento, x.ObservacaoAdministrativa);
}
