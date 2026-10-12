using GestaoPsi.Api.Data;
using GestaoPsi.Api.DTOs.Pagamentos;
using GestaoPsi.Api.Models;
using GestaoPsi.Api.Services.Seguranca;
using GestaoPsi.Api.Shared.Enums;
using GestaoPsi.Api.Shared.Excecoes;
using GestaoPsi.Api.Shared.Paginacao;
using Microsoft.EntityFrameworkCore;

namespace GestaoPsi.Api.Services.Pagamentos;
public sealed class PagamentosService(AppDbContext db, IAutorizacaoContaService autorizacao, IAuditoriaService auditoria) : IPagamentosService
{
    public async Task<PagamentosListagemResponse> ListarAsync(Guid usuarioId, Guid contaId, StatusPagamento? status, int pagina, int tamanhoPagina, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var (paginaAtual, tamanhoAtual) = ParametrosPaginacao.Normalizar(pagina, tamanhoPagina);
        var consulta = db.Pagamentos.AsNoTracking().Include(x => x.Paciente).Where(x => x.ContaPsicologoId == contaId);
        if (status.HasValue)
            consulta = consulta.Where(x => x.Status == status.Value);
        var total = await consulta.CountAsync(ct);
        var itens = await consulta.OrderByDescending(x => x.VencimentoEm).Skip((paginaAtual - 1) * tamanhoAtual).Take(tamanhoAtual).ToArrayAsync(ct);
        var resumo = await ObterResumoAsync(contaId, ct);
        return new PagamentosListagemResponse(itens.Select(Mapear).ToArray(), resumo, total, paginaAtual, tamanhoAtual);
    }
    private async Task<PagamentosResumoResponse> ObterResumoAsync(Guid contaId, CancellationToken ct)
    {
        var baseResumo = db.Pagamentos.AsNoTracking().Where(x => x.ContaPsicologoId == contaId);
        var recebido = await baseResumo.Where(x => x.Status == StatusPagamento.Pago).SumAsync(x => (decimal?)x.Valor, ct) ?? 0;
        var pendente = await baseResumo.Where(x => x.Status == StatusPagamento.Pendente || x.Status == StatusPagamento.AguardandoConfirmacao).SumAsync(x => (decimal?)x.Valor, ct) ?? 0;
        var reembolsado = await baseResumo.Where(x => x.Status == StatusPagamento.Reembolsado).SumAsync(x => (decimal?)x.Valor, ct) ?? 0;
        var quantidade = await baseResumo.CountAsync(ct);
        return new PagamentosResumoResponse(recebido, pendente, reembolsado, quantidade);
    }
    public async Task<PagamentoResponse> CriarAsync(Guid usuarioId, Guid contaId, CriarPagamentoRequest request, string? ip, string? userAgent, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var paciente = await db.Pacientes.SingleOrDefaultAsync(x => x.Id == request.PacienteId && x.ContaPsicologoId == contaId, ct) ?? throw new RegraNegocioException("Paciente não encontrado.", StatusCodes.Status404NotFound);
        if (request.ConsultaId is not null && !await db.Consultas.AnyAsync(x => x.Id == request.ConsultaId && x.ContaPsicologoId == contaId && x.PacienteId == paciente.Id, ct)) throw new RegraNegocioException("Consulta inválida para este paciente.");
        var item = new Pagamento { Id = Guid.NewGuid(), ContaPsicologoId = contaId, PacienteId = paciente.Id, ConsultaId = request.ConsultaId, Valor = request.Valor, FormaPagamento = request.FormaPagamento, VencimentoEm = request.VencimentoEm, Observacao = Limpar(request.Observacao), Status = StatusPagamento.Pendente };
        db.Pagamentos.Add(item); auditoria.Registrar(contaId, usuarioId, "PagamentoCriado", nameof(Pagamento), item.Id, "Pagamento criado.", null, new { item.PacienteId, item.Valor, item.Status }, ip, userAgent); await db.SaveChangesAsync(ct); item.Paciente = paciente; return Mapear(item);
    }
    public async Task<PagamentoResponse> AlterarStatusAsync(Guid usuarioId, Guid contaId, Guid id, AlterarStatusPagamentoRequest request, string? ip, string? userAgent, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var item = await db.Pagamentos.Include(x => x.Paciente).SingleOrDefaultAsync(x => x.Id == id && x.ContaPsicologoId == contaId, ct) ?? throw new RegraNegocioException("Pagamento não encontrado.", StatusCodes.Status404NotFound);
        if (request.Status is not (StatusPagamento.Pago or StatusPagamento.Cancelado or StatusPagamento.Reembolsado)) throw new RegraNegocioException("Status de pagamento inválido.");
        var anterior = item.Status; item.Status = request.Status; item.PagoEm = request.Status == StatusPagamento.Pago ? request.PagoEm ?? DateTimeOffset.UtcNow : null; item.AtualizadoEm = DateTimeOffset.UtcNow; auditoria.Registrar(contaId, usuarioId, "StatusPagamentoAlterado", nameof(Pagamento), id, "Status do pagamento atualizado.", new { Status = anterior }, new { Status = item.Status }, ip, userAgent); await db.SaveChangesAsync(ct); return Mapear(item);
    }
    private static string? Limpar(string? valor) => string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();
    private static PagamentoResponse Mapear(Pagamento x) => new(x.Id, x.PacienteId, x.Paciente.NomeCompleto, x.ConsultaId, x.Valor, x.Status, x.FormaPagamento, x.VencimentoEm, x.PagoEm, x.Observacao);
}
