using GestaoPsi.Api.DTOs.Consultas;
using GestaoPsi.Api.Services.Consultas;
using GestaoPsi.Api.Shared.Respostas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestaoPsi.Api.Controllers;

[ApiController]
[Authorize(Policy = "GestaoAdministrativa")]
[Route("api/v1/consultas")]
public sealed class ConsultasController(IConsultasService consultasService) : ControllerAutenticadoBase
{
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] DateTimeOffset inicio, [FromQuery] DateTimeOffset fim, [FromQuery] Guid? pacienteId, CancellationToken ct) => Ok(RespostaApi<IReadOnlyCollection<ConsultaResponse>>.ComSucesso(await consultasService.ListarAsync(ObterUsuarioId(), ObterContaPsicologoId(), inicio, fim, pacienteId, ct)));
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> ObterPorId(Guid id, CancellationToken ct) => Ok(RespostaApi<ConsultaDetalheResponse>.ComSucesso(await consultasService.ObterPorIdAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, ct)));
    [HttpPost]
    public async Task<IActionResult> Criar(CriarConsultaRequest request, CancellationToken ct) => Ok(RespostaApi<ConsultaResponse>.ComSucesso(await consultasService.CriarAsync(ObterUsuarioId(), ObterContaPsicologoId(), request, ObterIp(), ObterUserAgent(), ct)));
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> AlterarStatus(Guid id, AlterarStatusConsultaRequest request, CancellationToken ct) => Ok(RespostaApi<ConsultaResponse>.ComSucesso(await consultasService.AlterarStatusAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, request, ObterIp(), ObterUserAgent(), ct)));
    [HttpPatch("{id:guid}/remarcar")]
    public async Task<IActionResult> Remarcar(Guid id, RemarcarConsultaRequest request, CancellationToken ct) => Ok(RespostaApi<ConsultaResponse>.ComSucesso(await consultasService.RemarcarAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, request, ObterIp(), ObterUserAgent(), ct)));
}
