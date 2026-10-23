using Psique.Api.Data;
using Psique.Api.DTOs.Pagamentos;
using Psique.Api.Models;
using Psique.Api.Services.Seguranca;
using Psique.Api.Shared.Enums;
using Psique.Api.Shared.Excecoes;
using Psique.Api.Shared.Paginacao;
using Microsoft.EntityFrameworkCore;

namespace Psique.Api.Services.Pagamentos;
public sealed class PagamentosService(AppDbContext db, IAutorizacaoContaService autorizacao, IAuditoriaService auditoria, IProtecaoDadosService protecao) : IPagamentosService
{
    public async Task<PagamentosListagemResponse> ListarAsync(Guid usuarioId, Guid contaId, ListarPagamentosFiltro filtro, int pagina, int tamanhoPagina, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var (paginaAtual, tamanhoAtual) = ParametrosPaginacao.Normalizar(pagina, tamanhoPagina);
        var hoje = InicioDeHoje();
        var idsDaBusca = await PacientesDaBuscaAsync(contaId, filtro.Busca, ct);
        var recorte = AplicarRecorte(db.Pagamentos.AsNoTracking().Where(x => x.ContaPsicologoId == contaId), filtro, idsDaBusca);
        var consulta = recorte;
        if (filtro.Status.HasValue)
            consulta = consulta.Where(x => x.Status == filtro.Status.Value);
        if (filtro.SomenteVencidos)
            consulta = consulta.Where(x => (x.Status == StatusPagamento.Pendente || x.Status == StatusPagamento.AguardandoConfirmacao) && x.VencimentoEm != null && x.VencimentoEm < hoje);
        var total = await consulta.CountAsync(ct);
        var itens = await consulta.Include(x => x.Paciente).Include(x => x.Consulta)
            .OrderByDescending(x => x.VencimentoEm ?? x.PagoEm ?? x.CriadoEm)
            .Skip((paginaAtual - 1) * tamanhoAtual).Take(tamanhoAtual).ToArrayAsync(ct);
        var resumo = await ObterResumoAsync(recorte, hoje, ct);
        return new PagamentosListagemResponse(itens.Select(Mapear).ToArray(), resumo, total, paginaAtual, tamanhoAtual);
    }

    /// <summary>Paciente, período e busca valem para a lista e para os totais; o estado filtra só a lista.</summary>
    /// <summary>O nome do paciente é cifrado: a busca decifra os nomes da conta e filtra pelos ids.</summary>
    private async Task<Guid[]?> PacientesDaBuscaAsync(Guid contaId, string? busca, CancellationToken ct)
    {
        var termo = busca?.Trim();
        if (string.IsNullOrWhiteSpace(termo)) return null;
        var normalizado = Shared.Texto.TextoNormalizado.ParaComparacao(termo);
        var pacientes = await db.Pacientes.AsNoTracking()
            .Where(x => x.ContaPsicologoId == contaId)
            .Select(x => new { x.Id, x.NomeCompleto })
            .ToListAsync(ct);
        return pacientes.Where(x => Shared.Texto.TextoNormalizado.ParaComparacao(x.NomeCompleto).Contains(normalizado, StringComparison.Ordinal)).Select(x => x.Id).ToArray();
    }

    private static IQueryable<Pagamento> AplicarRecorte(IQueryable<Pagamento> consulta, ListarPagamentosFiltro filtro, Guid[]? idsDaBusca)
    {
        if (filtro.PacienteId.HasValue)
            consulta = consulta.Where(x => x.PacienteId == filtro.PacienteId.Value);
        if (filtro.De.HasValue)
        {
            var de = new DateTimeOffset(filtro.De.Value.ToDateTime(TimeOnly.MinValue), DateTimeOffset.Now.Offset);
            consulta = consulta.Where(x => (x.VencimentoEm ?? x.PagoEm ?? x.CriadoEm) >= de);
        }
        if (filtro.Ate.HasValue)
        {
            var ate = new DateTimeOffset(filtro.Ate.Value.AddDays(1).ToDateTime(TimeOnly.MinValue), DateTimeOffset.Now.Offset);
            consulta = consulta.Where(x => (x.VencimentoEm ?? x.PagoEm ?? x.CriadoEm) < ate);
        }
        if (idsDaBusca is not null)
            consulta = consulta.Where(x => idsDaBusca.Contains(x.PacienteId));
        return consulta;
    }

    private static async Task<PagamentosResumoResponse> ObterResumoAsync(IQueryable<Pagamento> recorte, DateTimeOffset hoje, CancellationToken ct)
    {
        var recebido = await recorte.Where(x => x.Status == StatusPagamento.Pago).SumAsync(x => (decimal?)x.Valor, ct) ?? 0;
        var pendentes = recorte.Where(x => x.Status == StatusPagamento.Pendente || x.Status == StatusPagamento.AguardandoConfirmacao);
        var pendente = await pendentes.SumAsync(x => (decimal?)x.Valor, ct) ?? 0;
        var vencido = await pendentes.Where(x => x.VencimentoEm != null && x.VencimentoEm < hoje).SumAsync(x => (decimal?)x.Valor, ct) ?? 0;
        var reembolsado = await recorte.Where(x => x.Status == StatusPagamento.Reembolsado).SumAsync(x => (decimal?)x.Valor, ct) ?? 0;
        var quantidade = await recorte.CountAsync(ct);
        return new PagamentosResumoResponse(recebido, pendente, reembolsado, quantidade, vencido);
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
        var item = await db.Pagamentos.Include(x => x.Paciente).Include(x => x.Consulta).SingleOrDefaultAsync(x => x.Id == id && x.ContaPsicologoId == contaId, ct) ?? throw new RegraNegocioException("Pagamento não encontrado.", StatusCodes.Status404NotFound);
        if (request.Status is not (StatusPagamento.Pago or StatusPagamento.Cancelado or StatusPagamento.Reembolsado)) throw new RegraNegocioException("Status de pagamento inválido.");
        var anterior = item.Status;
        item.Status = request.Status;
        item.PagoEm = request.Status == StatusPagamento.Pago ? request.PagoEm ?? DateTimeOffset.UtcNow : null;
        if (request.Status == StatusPagamento.Pago && request.FormaPagamento is { } forma) item.FormaPagamento = forma;
        item.AtualizadoEm = DateTimeOffset.UtcNow;
        auditoria.Registrar(contaId, usuarioId, "StatusPagamentoAlterado", nameof(Pagamento), id, "Status do pagamento atualizado.", new { Status = anterior }, new { Status = item.Status, item.FormaPagamento }, ip, userAgent);
        await db.SaveChangesAsync(ct);
        return Mapear(item);
    }

    public async Task<ReciboResponse> ObterReciboAsync(Guid usuarioId, Guid contaId, Guid id, string? ip, string? userAgent, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var item = await db.Pagamentos.AsNoTracking()
            .Include(x => x.Paciente)
            .Include(x => x.Consulta).ThenInclude(x => x!.TipoAtendimento)
            .SingleOrDefaultAsync(x => x.Id == id && x.ContaPsicologoId == contaId, ct)
            ?? throw new RegraNegocioException("Pagamento não encontrado.", StatusCodes.Status404NotFound);
        if (item.Status != StatusPagamento.Pago || item.PagoEm is null)
            throw new RegraNegocioException("O recibo só pode ser emitido para um pagamento recebido.");

        var profissional = await db.DadosProfissionaisPsicologo.AsNoTracking()
            .Where(x => x.ContaPsicologoId == contaId && x.Status == StatusUsuario.Ativo)
            .OrderBy(x => x.CriadoEm)
            .FirstOrDefaultAsync(ct)
            ?? throw new RegraNegocioException("Preencha nome e CRP em Configurações → Dados profissionais antes de emitir recibos.");

        var crp = string.IsNullOrWhiteSpace(profissional.Crp) ? null : protecao.Desproteger(profissional.Crp);
        auditoria.Registrar(contaId, usuarioId, "ReciboEmitido", nameof(Pagamento), item.Id, "Recibo de pagamento emitido.", null, new { item.PacienteId, item.Valor }, ip, userAgent);
        await db.SaveChangesAsync(ct);

        return new ReciboResponse(
            item.Id,
            item.Id.ToString("N")[..8].ToUpperInvariant(),
            item.Valor,
            item.PagoEm.Value,
            item.FormaPagamento,
            item.Paciente.NomeCompleto,
            string.IsNullOrWhiteSpace(item.Paciente.Cpf) ? null : FormatarCpf(protecao.Desproteger(item.Paciente.Cpf)),
            item.Consulta?.InicioEm,
            item.Consulta?.TipoAtendimento?.Nome,
            profissional.NomeProfissional,
            FormatarCrp(crp),
            profissional.EmailProfissional,
            profissional.TelefoneProfissional);
    }

    public async Task<GerarMensalidadesResponse> GerarMensalidadesAsync(Guid usuarioId, Guid contaId, GerarMensalidadesRequest request, string? ip, string? userAgent, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        if (request.Mes is < 1 or > 12 || request.Ano is < 2020 or > 2100) throw new RegraNegocioException("Mês de referência inválido.");
        var competencia = new DateOnly(request.Ano, request.Mes, 1);
        var dia = Math.Clamp(request.DiaVencimento, 1, 28);
        var vencimento = new DateTimeOffset(competencia.AddDays(dia - 1).ToDateTime(new TimeOnly(12, 0)), DateTimeOffset.Now.Offset);

        var mensalistas = await db.Pacientes
            .Where(x => x.ContaPsicologoId == contaId && x.Status == StatusPaciente.Ativo && x.ModoCobranca == ModoCobranca.Mensal)
            .Select(x => new { x.Id, x.NomeCompleto, x.ValorSessao })
            .ToListAsync(ct);
        var jaGeradas = await db.Pagamentos
            .Where(x => x.ContaPsicologoId == contaId && x.Competencia == competencia && x.Status != StatusPagamento.Cancelado)
            .Select(x => x.PacienteId)
            .ToListAsync(ct);

        var nomeMes = new System.Globalization.CultureInfo("pt-BR").DateTimeFormat.GetMonthName(request.Mes);
        var criadas = 0;
        var semValor = new List<string>();
        foreach (var paciente in mensalistas)
        {
            if (jaGeradas.Contains(paciente.Id)) continue;
            if (paciente.ValorSessao is null or <= 0)
            {
                semValor.Add(paciente.NomeCompleto);
                continue;
            }
            db.Pagamentos.Add(new Pagamento
            {
                Id = Guid.NewGuid(),
                ContaPsicologoId = contaId,
                PacienteId = paciente.Id,
                Valor = paciente.ValorSessao.Value,
                Status = StatusPagamento.Pendente,
                FormaPagamento = FormaPagamento.Manual,
                VencimentoEm = vencimento,
                Competencia = competencia,
                Observacao = $"Mensalidade de {nomeMes} de {request.Ano}"
            });
            criadas++;
        }

        auditoria.Registrar(contaId, usuarioId, "MensalidadesGeradas", nameof(Pagamento), null, "Mensalidades do mês geradas.", null, new { Competencia = competencia, Criadas = criadas, SemValor = semValor.Count }, ip, userAgent);
        await db.SaveChangesAsync(ct);
        return new GerarMensalidadesResponse(criadas, jaGeradas.Distinct().Count(), semValor);
    }

    public async Task<IReadOnlyCollection<RecebimentoExportadoResponse>> ExportarRecebimentosAsync(Guid usuarioId, Guid contaId, DateOnly de, DateOnly ate, string? ip, string? userAgent, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        if (ate < de) throw new RegraNegocioException("O fim do período deve ser depois do início.");
        if (ate.DayNumber - de.DayNumber > 400) throw new RegraNegocioException("Exporte no máximo um ano por vez.");
        var inicio = new DateTimeOffset(de.ToDateTime(TimeOnly.MinValue), DateTimeOffset.Now.Offset);
        var fim = new DateTimeOffset(ate.AddDays(1).ToDateTime(TimeOnly.MinValue), DateTimeOffset.Now.Offset);

        var itens = await db.Pagamentos.AsNoTracking()
            .Include(x => x.Paciente)
            .Include(x => x.Consulta).ThenInclude(x => x!.TipoAtendimento)
            .Where(x => x.ContaPsicologoId == contaId && x.Status == StatusPagamento.Pago && x.PagoEm >= inicio && x.PagoEm < fim)
            .OrderBy(x => x.PagoEm)
            .ToListAsync(ct);

        auditoria.Registrar(contaId, usuarioId, "RecebimentosExportados", nameof(Pagamento), null, "Recebimentos exportados com CPF dos pagadores.", null, new { De = de, Ate = ate, Quantidade = itens.Count }, ip, userAgent);
        await db.SaveChangesAsync(ct);

        return itens.Select(x => new RecebimentoExportadoResponse(
            x.PagoEm!.Value,
            x.Paciente.NomeCompleto,
            string.IsNullOrWhiteSpace(x.Paciente.Cpf) ? null : FormatarCpf(protecao.Desproteger(x.Paciente.Cpf)),
            x.Valor,
            x.FormaPagamento,
            Referencia(x))).ToArray();
    }

    public async Task<ReciboMensalResponse> ObterReciboMensalAsync(Guid usuarioId, Guid contaId, Guid pacienteId, int ano, int mes, string? ip, string? userAgent, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        if (mes is < 1 or > 12 || ano is < 2020 or > 2100) throw new RegraNegocioException("Mês de referência inválido.");
        var paciente = await db.Pacientes.AsNoTracking().SingleOrDefaultAsync(x => x.Id == pacienteId && x.ContaPsicologoId == contaId, ct)
            ?? throw new RegraNegocioException("Paciente não encontrado.", StatusCodes.Status404NotFound);
        var inicio = new DateTimeOffset(new DateTime(ano, mes, 1), DateTimeOffset.Now.Offset);
        var fim = inicio.AddMonths(1);
        var pagos = await db.Pagamentos.AsNoTracking()
            .Include(x => x.Consulta).ThenInclude(x => x!.TipoAtendimento)
            .Where(x => x.ContaPsicologoId == contaId && x.PacienteId == pacienteId && x.Status == StatusPagamento.Pago && x.PagoEm >= inicio && x.PagoEm < fim)
            .OrderBy(x => x.PagoEm)
            .ToListAsync(ct);
        if (pagos.Count == 0) throw new RegraNegocioException("Nenhum pagamento recebido deste paciente no mês.");

        var profissional = await db.DadosProfissionaisPsicologo.AsNoTracking()
            .Where(x => x.ContaPsicologoId == contaId && x.Status == StatusUsuario.Ativo)
            .OrderBy(x => x.CriadoEm)
            .FirstOrDefaultAsync(ct)
            ?? throw new RegraNegocioException("Preencha nome e CRP em Configurações → Dados profissionais antes de emitir recibos.");
        var crp = string.IsNullOrWhiteSpace(profissional.Crp) ? null : protecao.Desproteger(profissional.Crp);

        auditoria.Registrar(contaId, usuarioId, "ReciboMensalEmitido", nameof(Paciente), pacienteId, "Recibo mensal emitido.", null, new { Ano = ano, Mes = mes, Total = pagos.Sum(x => x.Valor) }, ip, userAgent);
        await db.SaveChangesAsync(ct);

        return new ReciboMensalResponse(
            paciente.NomeCompleto,
            string.IsNullOrWhiteSpace(paciente.Cpf) ? null : FormatarCpf(protecao.Desproteger(paciente.Cpf)),
            ano,
            mes,
            pagos.Select(x => new ReciboMensalItemResponse(x.PagoEm!.Value, Referencia(x), x.Valor, x.FormaPagamento)).ToArray(),
            pagos.Sum(x => x.Valor),
            profissional.NomeProfissional,
            FormatarCrp(crp),
            profissional.EmailProfissional,
            profissional.TelefoneProfissional);
    }

    /// <summary>A que o pagamento se refere, em texto: sessão, mensalidade ou a observação da cobrança avulsa.</summary>
    private static string Referencia(Pagamento x) =>
        x.Consulta is not null
            ? $"{x.Consulta.TipoAtendimento?.Nome ?? "Sessão"} de {x.Consulta.InicioEm.ToLocalTime():dd/MM/yyyy}"
            : x.Observacao ?? "Atendimento psicológico";

    private static DateTimeOffset InicioDeHoje()
    {
        var agora = DateTimeOffset.Now;
        return new DateTimeOffset(agora.Date, agora.Offset);
    }

    private static string? FormatarCpf(string? cpf) =>
        cpf is { Length: 11 } ? $"{cpf[..3]}.{cpf[3..6]}.{cpf[6..9]}-{cpf[9..]}" : cpf;

    private static string? FormatarCrp(string? crp)
    {
        var limpo = crp is null ? null : new string(crp.Where(char.IsLetterOrDigit).ToArray());
        return limpo is { Length: > 2 } ? $"{limpo[..2]}/{limpo[2..]}" : limpo;
    }

    private static string? Limpar(string? valor) => string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();
    private static PagamentoResponse Mapear(Pagamento x) => new(x.Id, x.PacienteId, x.Paciente.NomeCompleto, x.ConsultaId, x.Valor, x.Status, x.FormaPagamento, x.VencimentoEm, x.PagoEm, x.Observacao, x.Consulta?.InicioEm, x.Competencia,
        x.Status is StatusPagamento.Pendente or StatusPagamento.AguardandoConfirmacao && x.VencimentoEm is { } vencimento && vencimento < InicioDeHoje());
}
