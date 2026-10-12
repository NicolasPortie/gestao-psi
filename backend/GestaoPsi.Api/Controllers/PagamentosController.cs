using GestaoPsi.Api.DTOs.Pagamentos;
using GestaoPsi.Api.Services.Pagamentos;
using GestaoPsi.Api.Shared.Enums;
using GestaoPsi.Api.Shared.Respostas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestaoPsi.Api.Controllers;
[ApiController]
[Authorize(Policy = "GestaoAdministrativa")]
[Route("api/v1/pagamentos")]
public sealed class PagamentosController(IPagamentosService pagamentosService) : ControllerAutenticadoBase
{
    [HttpGet] public async Task<IActionResult> Listar([FromQuery] StatusPagamento? status, [FromQuery] int pagina = 1, [FromQuery] int tamanhoPagina = 20, CancellationToken ct = default) => Ok(RespostaApi<PagamentosListagemResponse>.ComSucesso(await pagamentosService.ListarAsync(ObterUsuarioId(), ObterContaPsicologoId(), status, pagina, tamanhoPagina, ct)));
    [HttpPost] public async Task<IActionResult> Criar(CriarPagamentoRequest request, CancellationToken ct) => Ok(RespostaApi<PagamentoResponse>.ComSucesso(await pagamentosService.CriarAsync(ObterUsuarioId(), ObterContaPsicologoId(), request, Ip(), Agent(), ct)));
    [HttpPatch("{id:guid}/status")] public async Task<IActionResult> AlterarStatus(Guid id, AlterarStatusPagamentoRequest request, CancellationToken ct) => Ok(RespostaApi<PagamentoResponse>.ComSucesso(await pagamentosService.AlterarStatusAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, request, Ip(), Agent(), ct)));
    private string? Ip() => HttpContext.Connection.RemoteIpAddress?.ToString();
    private string? Agent() => Request.Headers.UserAgent.ToString();
}
