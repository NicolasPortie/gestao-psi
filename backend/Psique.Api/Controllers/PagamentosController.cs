using Psique.Api.Shared;
using Psique.Api.DTOs.Pagamentos;
using Psique.Api.Services.Pagamentos;
using Psique.Api.Shared.Enums;
using Psique.Api.Shared.Respostas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Psique.Api.Controllers;
[ApiController]
[Authorize(Policy = Politicas.Financeiro)]
[Route("api/v1/pagamentos")]
public sealed class PagamentosController(IPagamentosService pagamentosService) : ControllerAutenticadoBase
{
    [HttpGet]
    public async Task<IActionResult> Listar(
        [FromQuery] StatusPagamento? status,
        [FromQuery] Guid? pacienteId,
        [FromQuery] DateOnly? de,
        [FromQuery] DateOnly? ate,
        [FromQuery] string? busca,
        [FromQuery] bool vencidos = false,
        [FromQuery] int pagina = 1,
        [FromQuery] int tamanhoPagina = 20,
        CancellationToken ct = default)
        => Ok(RespostaApi<PagamentosListagemResponse>.ComSucesso(await pagamentosService.ListarAsync(ObterUsuarioId(), ObterContaPsicologoId(), new ListarPagamentosFiltro(status, pacienteId, de, ate, busca, vencidos), pagina, tamanhoPagina, ct)));
    [HttpPost] public async Task<IActionResult> Criar(CriarPagamentoRequest request, CancellationToken ct) => Ok(RespostaApi<PagamentoResponse>.ComSucesso(await pagamentosService.CriarAsync(ObterUsuarioId(), ObterContaPsicologoId(), request, Ip(), Agent(), ct)));
    [HttpPatch("{id:guid}/status")] public async Task<IActionResult> AlterarStatus(Guid id, AlterarStatusPagamentoRequest request, CancellationToken ct) => Ok(RespostaApi<PagamentoResponse>.ComSucesso(await pagamentosService.AlterarStatusAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, request, Ip(), Agent(), ct)));
    [HttpPost("mensalidades")] public async Task<IActionResult> GerarMensalidades(GerarMensalidadesRequest request, CancellationToken ct) => Ok(RespostaApi<GerarMensalidadesResponse>.ComSucesso(await pagamentosService.GerarMensalidadesAsync(ObterUsuarioId(), ObterContaPsicologoId(), request, Ip(), Agent(), ct)));
    [HttpGet("exportacao")] public async Task<IActionResult> Exportar([FromQuery] DateOnly de, [FromQuery] DateOnly ate, CancellationToken ct) => Ok(RespostaApi<IReadOnlyCollection<RecebimentoExportadoResponse>>.ComSucesso(await pagamentosService.ExportarRecebimentosAsync(ObterUsuarioId(), ObterContaPsicologoId(), de, ate, Ip(), Agent(), ct)));
    [HttpGet("recibo-mensal")] public async Task<IActionResult> ReciboMensal([FromQuery] Guid pacienteId, [FromQuery] int ano, [FromQuery] int mes, CancellationToken ct) => Ok(RespostaApi<ReciboMensalResponse>.ComSucesso(await pagamentosService.ObterReciboMensalAsync(ObterUsuarioId(), ObterContaPsicologoId(), pacienteId, ano, mes, Ip(), Agent(), ct)));
    [HttpGet("{id:guid}/recibo")] public async Task<IActionResult> Recibo(Guid id, CancellationToken ct) => Ok(RespostaApi<ReciboResponse>.ComSucesso(await pagamentosService.ObterReciboAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, Ip(), Agent(), ct)));
    private string? Ip() => HttpContext.Connection.RemoteIpAddress?.ToString();
    private string? Agent() => Request.Headers.UserAgent.ToString();
}
