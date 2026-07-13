using GestaoPsi.Api.Data;
using GestaoPsi.Api.DTOs.Auditoria;
using GestaoPsi.Api.Shared.Respostas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestaoPsi.Api.Controllers;
[ApiController]
[Authorize(Policy = "Auditoria")]
[Route("api/v1/auditoria")]
public sealed class AuditoriaController(AppDbContext db) : ControllerAutenticadoBase
{
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] int limite = 100, CancellationToken ct = default)
    {
        var contaId = ObterContaPsicologoId();
        var logs = await db.LogsAuditoria.AsNoTracking().Include(x => x.Usuario).Where(x => x.ContaPsicologoId == contaId).OrderByDescending(x => x.CriadoEm).Take(Math.Clamp(limite, 1, 200)).Select(x => new LogAuditoriaResponse(x.Id, x.CriadoEm, x.TipoAcao, x.Entidade, x.EntidadeId, x.Descricao, x.Ip, x.UserAgent, x.Usuario == null ? null : x.Usuario.NomeCompleto)).ToArrayAsync(ct);
        return Ok(RespostaApi<IReadOnlyCollection<LogAuditoriaResponse>>.ComSucesso(logs));
    }
}
