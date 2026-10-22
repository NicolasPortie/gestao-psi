using Psique.Api.Shared;
using Psique.Api.Data;
using Psique.Api.DTOs.Auditoria;
using Psique.Api.Shared.Paginacao;
using Psique.Api.Shared.Respostas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Psique.Api.Controllers;
[ApiController]
[Authorize(Policy = Politicas.Auditoria)]
[Route("api/v1/auditoria")]
public sealed class AuditoriaController(AppDbContext db) : ControllerAutenticadoBase
{
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] FiltroAuditoriaRequest filtro, CancellationToken ct = default)
    {
        var contaId = ObterContaPsicologoId();
        var (pagina, tamanhoPagina) = ParametrosPaginacao.Normalizar(filtro.Pagina, filtro.TamanhoPagina);
        var consulta = db.LogsAuditoria.AsNoTracking().Where(x => x.ContaPsicologoId == contaId);
        if (!string.IsNullOrWhiteSpace(filtro.TipoAcao))
            consulta = consulta.Where(x => x.TipoAcao == filtro.TipoAcao);
        if (!string.IsNullOrWhiteSpace(filtro.Entidade))
            consulta = consulta.Where(x => x.Entidade == filtro.Entidade);
        if (!filtro.IncluirTecnicos && string.IsNullOrWhiteSpace(filtro.TipoAcao))
            consulta = consulta.Where(x => x.TipoAcao != "EventoBridgeProcessado");
        if (filtro.UsuarioId is not null)
            consulta = consulta.Where(x => x.UsuarioId == filtro.UsuarioId);
        if (filtro.De is not null)
            consulta = consulta.Where(x => x.CriadoEm >= filtro.De);
        if (filtro.Ate is not null)
            consulta = consulta.Where(x => x.CriadoEm <= filtro.Ate);
        var total = await consulta.CountAsync(ct);
        var logs = await consulta.Include(x => x.Usuario).OrderByDescending(x => x.CriadoEm).Skip((pagina - 1) * tamanhoPagina).Take(tamanhoPagina).Select(x => new LogAuditoriaResponse(x.Id, x.CriadoEm, x.TipoAcao, x.Entidade, x.EntidadeId, x.Descricao, x.Ip, x.UserAgent, x.Usuario == null ? null : x.Usuario.NomeCompleto)).ToArrayAsync(ct);
        return Ok(RespostaApi<ResultadoPaginado<LogAuditoriaResponse>>.ComSucesso(new ResultadoPaginado<LogAuditoriaResponse>(logs, total, pagina, tamanhoPagina)));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Obter(Guid id, CancellationToken ct = default)
    {
        var contaId = ObterContaPsicologoId();
        var log = await db.LogsAuditoria.AsNoTracking().Include(x => x.Usuario).SingleOrDefaultAsync(x => x.Id == id && x.ContaPsicologoId == contaId, ct);
        if (log is null) return NotFound(RespostaApi<object>.ComErro("Log não encontrado."));
        return Ok(RespostaApi<LogAuditoriaDetalheResponse>.ComSucesso(new(log.Id, log.CriadoEm, log.TipoAcao, log.Entidade, log.EntidadeId, log.Descricao, log.Ip, log.UserAgent, log.Usuario == null ? null : log.Usuario.NomeCompleto, log.DadosAntesJson, log.DadosDepoisJson)));
    }
}
