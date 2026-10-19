using GestaoPsi.Api.Data;
using GestaoPsi.Api.DTOs.Sessoes;
using GestaoPsi.Api.Models;
using GestaoPsi.Api.Services.Seguranca;
using GestaoPsi.Api.Shared.Enums;
using GestaoPsi.Api.Shared.Excecoes;
using GestaoPsi.Api.Shared.Paginacao;
using Microsoft.EntityFrameworkCore;

namespace GestaoPsi.Api.Services.Sessoes;

public sealed class SessoesService(AppDbContext db, IAutorizacaoContaService autorizacao, IProtecaoDadosService protecao, IAuditoriaService auditoria) : ISessoesService
{
    public async Task<RegistroSessaoResponse> CriarAsync(Guid usuarioId, Guid contaId, CriarRegistroSessaoRequest request, string? ip, string? userAgent, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var consulta = await db.Consultas.SingleOrDefaultAsync(x => x.Id == request.ConsultaId && x.ContaPsicologoId == contaId, ct) ?? throw new RegraNegocioException("Consulta não encontrada.", StatusCodes.Status404NotFound);
        if (consulta.Status is StatusConsulta.Cancelada or StatusConsulta.Remarcada) throw new RegraNegocioException("Não é possível registrar sessão para uma consulta cancelada ou remarcada.");
        if (await db.RegistrosSessao.AnyAsync(x => x.ContaPsicologoId == contaId && x.ConsultaId == request.ConsultaId, ct)) throw new RegraNegocioException("Esta consulta já possui registro de sessão.");
        var prontuario = await db.Prontuarios.SingleOrDefaultAsync(x => x.ContaPsicologoId == contaId && x.PacienteId == consulta.PacienteId && x.Status == StatusProntuario.Ativo, ct) ?? throw new RegraNegocioException("Prontuário ativo não encontrado.", StatusCodes.Status404NotFound);
        var statusAnterior = consulta.Status;
        var registro = new RegistroSessao { Id = Guid.NewGuid(), ContaPsicologoId = contaId, ConsultaId = consulta.Id, PacienteId = consulta.PacienteId, ProntuarioId = prontuario.Id, TipoAtendimentoId = consulta.TipoAtendimentoId, CriadoPorUsuarioId = usuarioId, DataSessao = consulta.InicioEm, ObservacoesClinicas = Proteger(request.ObservacoesClinicas), Evolucao = Proteger(request.Evolucao), Encaminhamentos = Proteger(request.Encaminhamentos), ProximaSessaoSugeridaEm = request.ProximaSessaoSugeridaEm, Status = StatusRegistroSessao.Finalizado };
        consulta.Status = StatusConsulta.Realizada; consulta.AtualizadoEm = DateTimeOffset.UtcNow; db.RegistrosSessao.Add(registro);
        db.HistoricosConsulta.Add(new() { Id = Guid.NewGuid(), ContaPsicologoId = contaId, ConsultaId = consulta.Id, UsuarioId = usuarioId, StatusAnterior = statusAnterior, StatusNovo = StatusConsulta.Realizada, Descricao = "Sessão registrada." });
        auditoria.Registrar(contaId, usuarioId, "RegistroSessaoCriado", nameof(RegistroSessao), registro.Id, "Registro de sessão criado.", null, new { registro.ConsultaId, registro.PacienteId, registro.Status }, ip, userAgent);
        await Pagamentos.CobrancaAutomatica.GerarSeNecessarioAsync(db, auditoria, consulta, usuarioId, ip, userAgent, ct);
        await db.SaveChangesAsync(ct); return Mapear(registro);
    }
    public async Task<ResultadoPaginado<EvolucaoProntuarioResponse>> ListarEvolucoesAsync(Guid usuarioId, Guid contaId, Guid pacienteId, int pagina, int tamanhoPagina, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var (paginaAtual, tamanhoAtual) = ParametrosPaginacao.Normalizar(pagina, tamanhoPagina);
        var consulta = db.EvolucoesProntuario.AsNoTracking().Where(x => x.ContaPsicologoId == contaId && x.PacienteId == pacienteId);
        var total = await consulta.CountAsync(ct);
        var evolucoes = await consulta.OrderByDescending(x => x.DataEvolucao).Skip((paginaAtual - 1) * tamanhoAtual).Take(tamanhoAtual).ToArrayAsync(ct);
        return new ResultadoPaginado<EvolucaoProntuarioResponse>(evolucoes.Select(Mapear).ToArray(), total, paginaAtual, tamanhoAtual);
    }
    public async Task<ResultadoPaginado<RegistroSessaoResponse>> ListarRegistrosAsync(Guid usuarioId, Guid contaId, Guid pacienteId, int pagina, int tamanhoPagina, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var (paginaAtual, tamanhoAtual) = ParametrosPaginacao.Normalizar(pagina, tamanhoPagina);
        var consulta = db.RegistrosSessao.AsNoTracking().Where(x => x.ContaPsicologoId == contaId && x.PacienteId == pacienteId);
        var total = await consulta.CountAsync(ct);
        var registros = await consulta.OrderByDescending(x => x.DataSessao).Skip((paginaAtual - 1) * tamanhoAtual).Take(tamanhoAtual).ToArrayAsync(ct);
        return new ResultadoPaginado<RegistroSessaoResponse>(registros.Select(Mapear).ToArray(), total, paginaAtual, tamanhoAtual);
    }
    public async Task<EvolucaoProntuarioResponse> CriarEvolucaoAsync(Guid usuarioId, Guid contaId, CriarEvolucaoProntuarioRequest request, string? ip, string? userAgent, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var prontuario = await db.Prontuarios.SingleOrDefaultAsync(x => x.ContaPsicologoId == contaId && x.PacienteId == request.PacienteId && x.Status == StatusProntuario.Ativo, ct) ?? throw new RegraNegocioException("Prontuário ativo não encontrado.", StatusCodes.Status404NotFound);
        if (request.RegistroSessaoId is not null && !await db.RegistrosSessao.AnyAsync(x => x.Id == request.RegistroSessaoId && x.ContaPsicologoId == contaId && x.PacienteId == request.PacienteId && x.ProntuarioId == prontuario.Id, ct)) throw new RegraNegocioException("Registro de sessão inválido para este prontuário.");
        var evolucao = new EvolucaoProntuario { Id = Guid.NewGuid(), ContaPsicologoId = contaId, ProntuarioId = prontuario.Id, PacienteId = request.PacienteId, RegistroSessaoId = request.RegistroSessaoId, CriadoPorUsuarioId = usuarioId, Tipo = request.Tipo, Conteudo = protecao.Proteger(request.Conteudo.Trim()), DataEvolucao = request.DataEvolucao == default ? DateTimeOffset.UtcNow : request.DataEvolucao };
        db.EvolucoesProntuario.Add(evolucao); auditoria.Registrar(contaId, usuarioId, "EvolucaoProntuarioCriada", nameof(EvolucaoProntuario), evolucao.Id, "Evolução clínica criada.", null, new { evolucao.PacienteId, evolucao.Tipo, evolucao.DataEvolucao }, ip, userAgent); await db.SaveChangesAsync(ct); return Mapear(evolucao);
    }
    private string? Proteger(string? valor) => string.IsNullOrWhiteSpace(valor) ? null : protecao.Proteger(valor.Trim());
    private RegistroSessaoResponse Mapear(RegistroSessao x) => new(x.Id, x.ConsultaId, x.PacienteId, x.DataSessao, x.Status, Desproteger(x.ObservacoesClinicas), Desproteger(x.Evolucao), Desproteger(x.Encaminhamentos), x.ProximaSessaoSugeridaEm);
    private EvolucaoProntuarioResponse Mapear(EvolucaoProntuario x) => new(x.Id, x.ProntuarioId, x.PacienteId, x.Tipo, protecao.Desproteger(x.Conteudo), x.DataEvolucao);
    private string? Desproteger(string? valor) => string.IsNullOrWhiteSpace(valor) ? null : protecao.Desproteger(valor);
}
