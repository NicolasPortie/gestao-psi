using GestaoPsi.Api.DTOs.Sessoes;
using GestaoPsi.Api.Services.Sessoes;
using GestaoPsi.Api.Shared.Respostas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestaoPsi.Api.Controllers;

[ApiController]
[Authorize(Policy = "AcessoClinico")]
[Route("api/v1/sessoes")]
public sealed class SessoesController(ISessoesService sessoesService) : ControllerAutenticadoBase
{
    [HttpPost]
    public async Task<IActionResult> Criar(CriarRegistroSessaoRequest request, CancellationToken ct) => Ok(RespostaApi<RegistroSessaoResponse>.ComSucesso(await sessoesService.CriarAsync(ObterUsuarioId(), ObterContaPsicologoId(), request, HttpContext.Connection.RemoteIpAddress?.ToString(), Request.Headers.UserAgent.ToString(), ct)));
    [HttpGet("evolucoes/{pacienteId:guid}")]
    public async Task<IActionResult> ListarEvolucoes(Guid pacienteId, CancellationToken ct) => Ok(RespostaApi<IReadOnlyCollection<EvolucaoProntuarioResponse>>.ComSucesso(await sessoesService.ListarEvolucoesAsync(ObterUsuarioId(), ObterContaPsicologoId(), pacienteId, ct)));
    [HttpPost("evolucoes")]
    public async Task<IActionResult> CriarEvolucao(CriarEvolucaoProntuarioRequest request, CancellationToken ct) => Ok(RespostaApi<EvolucaoProntuarioResponse>.ComSucesso(await sessoesService.CriarEvolucaoAsync(ObterUsuarioId(), ObterContaPsicologoId(), request, HttpContext.Connection.RemoteIpAddress?.ToString(), Request.Headers.UserAgent.ToString(), ct)));
}
