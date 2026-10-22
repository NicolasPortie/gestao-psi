using Psique.Api.Shared;
using Psique.Api.DTOs.ModelosMensagem;
using Psique.Api.Services.ModelosMensagem;
using Psique.Api.Shared.Respostas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Psique.Api.Controllers;

[ApiController]
[Authorize(Policy = Politicas.Mensagens)]
[Route("api/v1/modelos-mensagem")]
public sealed class ModelosMensagemController(IModelosMensagemService modelosMensagemService) : ControllerAutenticadoBase
{
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] FiltroModeloMensagemRequest filtro, CancellationToken cancellationToken) =>
        Ok(RespostaApi<IReadOnlyCollection<ModeloMensagemResponse>>.ComSucesso(
            await modelosMensagemService.ListarAsync(ObterUsuarioId(), ObterContaPsicologoId(), filtro, cancellationToken)));

    [HttpGet("variaveis")]
    public async Task<IActionResult> ListarVariaveis(CancellationToken cancellationToken) =>
        Ok(RespostaApi<IReadOnlyCollection<VariavelModeloMensagemResponse>>.ComSucesso(
            await modelosMensagemService.ListarVariaveisAsync(ObterUsuarioId(), ObterContaPsicologoId(), cancellationToken)));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Obter(Guid id, CancellationToken cancellationToken) =>
        Ok(RespostaApi<ModeloMensagemResponse>.ComSucesso(
            await modelosMensagemService.ObterAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, cancellationToken)));

    [HttpPost]
    public async Task<IActionResult> Criar(CriarModeloMensagemRequest request, CancellationToken cancellationToken) =>
        Ok(RespostaApi<ModeloMensagemResponse>.ComSucesso(
            await modelosMensagemService.CriarAsync(ObterUsuarioId(), ObterContaPsicologoId(), request, ObterIp(), ObterUserAgent(), cancellationToken)));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Atualizar(Guid id, AtualizarModeloMensagemRequest request, CancellationToken cancellationToken) =>
        Ok(RespostaApi<ModeloMensagemResponse>.ComSucesso(
            await modelosMensagemService.AtualizarAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, request, ObterIp(), ObterUserAgent(), cancellationToken)));

    [HttpPatch("{id:guid}/ativo")]
    public async Task<IActionResult> AlterarAtivo(Guid id, AlterarAtivoModeloMensagemRequest request, CancellationToken cancellationToken) =>
        Ok(RespostaApi<ModeloMensagemResponse>.ComSucesso(
            await modelosMensagemService.AlterarAtivoAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, request, ObterIp(), ObterUserAgent(), cancellationToken)));

    [HttpPost("previa")]
    public async Task<IActionResult> Previa(PreviaModeloMensagemRequest request, CancellationToken cancellationToken) =>
        Ok(RespostaApi<PreviaModeloMensagemResponse>.ComSucesso(
            await modelosMensagemService.PreviaAsync(ObterUsuarioId(), ObterContaPsicologoId(), request, cancellationToken)));
}
