using Psique.Api.DTOs.Documentos;
using Psique.Api.Services.Documentos;
using Psique.Api.Shared.Paginacao;
using Psique.Api.Shared.Respostas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Psique.Api.Controllers;

[ApiController]
[Authorize(Policy = "AcessoClinico")]
[Route("api/v1/documentos")]
public sealed class DocumentosController(IDocumentosService documentosService) : ControllerAutenticadoBase
{
    [HttpGet] public async Task<IActionResult> Listar([FromQuery] Guid? pacienteId, [FromQuery] int pagina = 1, [FromQuery] int tamanhoPagina = 20, CancellationToken ct = default) => Ok(RespostaApi<ResultadoPaginado<DocumentoListaResponse>>.ComSucesso(await documentosService.ListarAsync(ObterUsuarioId(), ObterContaPsicologoId(), pacienteId, pagina, tamanhoPagina, ct)));
    [HttpGet("{id:guid}")] public async Task<IActionResult> Obter(Guid id, CancellationToken ct) => Ok(RespostaApi<DocumentoDetalheResponse>.ComSucesso(await documentosService.ObterAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, ct)));
    [HttpPost] public async Task<IActionResult> Criar(CriarDocumentoRequest request, CancellationToken ct) => Ok(RespostaApi<DocumentoDetalheResponse>.ComSucesso(await documentosService.CriarAsync(ObterUsuarioId(), ObterContaPsicologoId(), request, ObterIp(), ObterUserAgent(), ct)));
    [HttpPut("{id:guid}")] public async Task<IActionResult> Atualizar(Guid id, AtualizarDocumentoRequest request, CancellationToken ct) => Ok(RespostaApi<DocumentoDetalheResponse>.ComSucesso(await documentosService.AtualizarAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, request, ObterIp(), ObterUserAgent(), ct)));
    [HttpPost("{id:guid}/finalizar")] public async Task<IActionResult> Finalizar(Guid id, CancellationToken ct) => Ok(RespostaApi<DocumentoDetalheResponse>.ComSucesso(await documentosService.FinalizarAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, ObterIp(), ObterUserAgent(), ct)));
    [HttpPost("{id:guid}/entregas")] public async Task<IActionResult> RegistrarEntrega(Guid id, RegistrarEntregaDocumentoRequest request, CancellationToken ct) => Ok(RespostaApi<ProtocoloEntregaResponse>.ComSucesso(await documentosService.RegistrarEntregaAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, request, ObterIp(), ObterUserAgent(), ct)));
}
