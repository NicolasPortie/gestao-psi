using GestaoPsi.Api.Data;
using GestaoPsi.Api.DTOs.ListaEspera;
using GestaoPsi.Api.Models;
using GestaoPsi.Api.Services.Seguranca;
using GestaoPsi.Api.Shared.Enums;
using GestaoPsi.Api.Shared.Excecoes;
using GestaoPsi.Api.Shared.Paginacao;
using Microsoft.EntityFrameworkCore;

namespace GestaoPsi.Api.Services.ListaEspera;

public sealed class ListaEsperaService(
    AppDbContext dbContext,
    IAutorizacaoContaService autorizacao,
    IAuditoriaService auditoria) : IListaEsperaService
{
    public async Task<ResultadoPaginado<ListaEsperaResponse>> ListarAsync(
        Guid usuarioId,
        Guid contaId,
        FiltroListaEsperaRequest filtro,
        CancellationToken cancellationToken)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, cancellationToken);
        var (pagina, tamanhoPagina) = ParametrosPaginacao.Normalizar(filtro.Pagina, filtro.TamanhoPagina);

        var consulta = dbContext.ListaEspera
            .AsNoTracking()
            .Include(item => item.Paciente)
            .Include(item => item.TipoAtendimento)
            .Where(item => item.ContaPsicologoId == contaId);

        if (filtro.Status is not null) consulta = consulta.Where(item => item.Status == filtro.Status);
        if (filtro.TipoAtendimentoId is not null) consulta = consulta.Where(item => item.TipoAtendimentoId == filtro.TipoAtendimentoId);
        if (filtro.Prioridade is not null) consulta = consulta.Where(item => item.Prioridade == filtro.Prioridade);
        if (filtro.Origem is not null) consulta = consulta.Where(item => item.Origem == filtro.Origem);

        var total = await consulta.CountAsync(cancellationToken);

        var itens = await consulta
            .OrderBy(item => item.Status == StatusListaEspera.Aguardando ? 0 : item.Status == StatusListaEspera.Contatado ? 1 : 2)
            .ThenBy(item => item.Prioridade ?? 2)
            .ThenBy(item => item.CriadoEm)
            .Skip((pagina - 1) * tamanhoPagina)
            .Take(tamanhoPagina)
            .ToArrayAsync(cancellationToken);

        return new ResultadoPaginado<ListaEsperaResponse>(itens.Select(Mapear).ToArray(), total, pagina, tamanhoPagina);
    }

    public async Task<ListaEsperaResponse> CriarAsync(
        Guid usuarioId,
        Guid contaId,
        CriarListaEsperaRequest request,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken)
    {
        var usuario = await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, cancellationToken);
        await ValidarConfiguracaoAsync(contaId, cancellationToken);
        ValidarHorario(request.PreferenciaHorarioInicio, request.PreferenciaHorarioFim);

        var paciente = await dbContext.Pacientes.SingleOrDefaultAsync(
            item => item.Id == request.PacienteId &&
                    item.ContaPsicologoId == contaId &&
                    item.Status == StatusPaciente.Ativo,
            cancellationToken) ?? throw new RegraNegocioException("Paciente ativo não encontrado.", StatusCodes.Status404NotFound);

        TipoAtendimento? tipo = null;
        if (request.TipoAtendimentoId is not null)
        {
            tipo = await dbContext.TiposAtendimento.SingleOrDefaultAsync(
                item => item.Id == request.TipoAtendimentoId && item.ContaPsicologoId == contaId && item.Ativo,
                cancellationToken) ?? throw new RegraNegocioException("Tipo de atendimento ativo não encontrado.", StatusCodes.Status404NotFound);
        }

        var jaExiste = await dbContext.ListaEspera.AnyAsync(
            item => item.ContaPsicologoId == contaId &&
                    item.PacienteId == paciente.Id &&
                    item.TipoAtendimentoId == request.TipoAtendimentoId &&
                    (item.Status == StatusListaEspera.Aguardando || item.Status == StatusListaEspera.Contatado),
            cancellationToken);
        if (jaExiste) throw new RegraNegocioException("O paciente já está aguardando este tipo de atendimento.");

        var item = new Models.ListaEspera
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = contaId,
            PacienteId = paciente.Id,
            TipoAtendimentoId = tipo?.Id,
            PreferenciaDiaSemana = request.PreferenciaDiaSemana,
            PreferenciaHorarioInicio = request.PreferenciaHorarioInicio,
            PreferenciaHorarioFim = request.PreferenciaHorarioFim,
            Prioridade = request.Prioridade,
            Status = StatusListaEspera.Aguardando,
            Origem = usuario.Perfil == PerfilUsuario.Recepcionista ? OrigemConsulta.Recepcionista : OrigemConsulta.Painel,
            ObservacaoAdministrativa = Limpar(request.ObservacaoAdministrativa)
        };

        dbContext.ListaEspera.Add(item);
        auditoria.Registrar(contaId, usuarioId, "ListaEsperaCriada", nameof(Models.ListaEspera), item.Id, "Paciente adicionado a lista de espera.", null, new { item.PacienteId, item.TipoAtendimentoId, item.Prioridade }, ip, userAgent);
        await dbContext.SaveChangesAsync(cancellationToken);

        item.Paciente = paciente;
        item.TipoAtendimento = tipo;
        return Mapear(item);
    }

    public async Task<ListaEsperaResponse> AlterarStatusAsync(
        Guid usuarioId,
        Guid contaId,
        Guid id,
        AlterarStatusListaEsperaRequest request,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, cancellationToken);
        var item = await dbContext.ListaEspera
            .Include(registro => registro.Paciente)
            .Include(registro => registro.TipoAtendimento)
            .SingleOrDefaultAsync(registro => registro.Id == id && registro.ContaPsicologoId == contaId, cancellationToken)
            ?? throw new RegraNegocioException("Registro da lista de espera não encontrado.", StatusCodes.Status404NotFound);

        if (item.Status is StatusListaEspera.Agendado or StatusListaEspera.Cancelado or StatusListaEspera.Expirado)
            throw new RegraNegocioException("Este registro da lista de espera já foi encerrado.");
        if (request.Status is not (StatusListaEspera.Contatado or StatusListaEspera.Cancelado or StatusListaEspera.Expirado))
            throw new RegraNegocioException("Transição de status da lista de espera inválida.");

        var statusAnterior = item.Status;
        item.Status = request.Status;
        item.AtualizadoEm = DateTimeOffset.UtcNow;
        auditoria.Registrar(contaId, usuarioId, "StatusListaEsperaAlterado", nameof(Models.ListaEspera), item.Id, "Status da lista de espera atualizado.", new { Status = statusAnterior }, new { item.Status }, ip, userAgent);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Mapear(item);
    }

    private async Task ValidarConfiguracaoAsync(Guid contaId, CancellationToken cancellationToken)
    {
        var configuracao = await dbContext.ConfiguracoesAtendimento.AsNoTracking().SingleOrDefaultAsync(
            item => item.ContaPsicologoId == contaId && item.Ativo,
            cancellationToken);
        if (configuracao is null || !configuracao.PermiteListaEspera)
            throw new RegraNegocioException("A lista de espera está desativada nas configurações da agenda.");
    }

    private static void ValidarHorario(TimeOnly? inicio, TimeOnly? fim)
    {
        if (inicio.HasValue != fim.HasValue) throw new RegraNegocioException("Informe o início e o fim da preferência de horário.");
        if (inicio is not null && fim <= inicio) throw new RegraNegocioException("O fim da preferência deve ser posterior ao início.");
    }

    private static string? Limpar(string? valor) => string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();

    private static ListaEsperaResponse Mapear(Models.ListaEspera item) => new(
        item.Id,
        item.PacienteId,
        item.Paciente.NomeCompleto,
        item.TipoAtendimentoId,
        item.TipoAtendimento?.Nome,
        item.PreferenciaDiaSemana,
        item.PreferenciaHorarioInicio,
        item.PreferenciaHorarioFim,
        item.Prioridade ?? 2,
        item.Status,
        item.Origem,
        item.ObservacaoAdministrativa,
        item.CriadoEm,
        item.AtualizadoEm);
}
