using GestaoPsi.Api.DTOs.Sessoes;
using GestaoPsi.Api.Services.Sessoes;
using GestaoPsi.Api.Shared.Paginacao;
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
    public async Task<IActionResult> ListarEvolucoes(Guid pacienteId, [FromQuery] int pagina = 1, [FromQuery] int tamanhoPagina = 20, CancellationToken ct = default) => Ok(RespostaApi<ResultadoPaginado<EvolucaoProntuarioResponse>>.ComSucesso(await sessoesService.ListarEvolucoesAsync(ObterUsuarioId(), ObterContaPsicologoId(), pacienteId, pagina, tamanhoPagina, ct)));
    [HttpGet("registros/{pacienteId:guid}")]
    public async Task<IActionResult> ListarRegistros(Guid pacienteId, [FromQuery] int pagina = 1, [FromQuery] int tamanhoPagina = 20, CancellationToken ct = default) => Ok(RespostaApi<ResultadoPaginado<RegistroSessaoResponse>>.ComSucesso(await sessoesService.ListarRegistrosAsync(ObterUsuarioId(), ObterContaPsicologoId(), pacienteId, pagina, tamanhoPagina, ct)));
    [HttpPost("evolucoes")]
    public async Task<IActionResult> CriarEvolucao(CriarEvolucaoProntuarioRequest request, CancellationToken ct) => Ok(RespostaApi<EvolucaoProntuarioResponse>.ComSucesso(await sessoesService.CriarEvolucaoAsync(ObterUsuarioId(), ObterContaPsicologoId(), request, HttpContext.Connection.RemoteIpAddress?.ToString(), Request.Headers.UserAgent.ToString(), ct)));
}
