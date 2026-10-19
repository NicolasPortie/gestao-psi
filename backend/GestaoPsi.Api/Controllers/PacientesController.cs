using GestaoPsi.Api.Shared;
using GestaoPsi.Api.DTOs.Pacientes;
using GestaoPsi.Api.Services.Pacientes;
using GestaoPsi.Api.Shared.Enums;
using GestaoPsi.Api.Shared.Excecoes;
using GestaoPsi.Api.Shared.Respostas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestaoPsi.Api.Controllers;

[ApiController]
[Authorize(Policy = Politicas.Pacientes)]
[Route("api/v1/pacientes")]
public sealed class PacientesController(IPacientesService pacientesService) : ControllerAutenticadoBase
{
    [HttpGet]
    [ProducesResponseType<RespostaApi<PacientesListagemResponse>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Listar(
        [FromQuery] string? busca,
        [FromQuery] StatusPaciente? status,
        [FromQuery] int pagina = 1,
        [FromQuery] int tamanhoPagina = 20,
        [FromQuery] int? semConsultaHaDias = null,
        CancellationToken cancellationToken = default)
    {
        var resposta = await pacientesService.ListarAsync(
            ObterUsuarioId(),
            ObterContaPsicologoId(),
            new ListarPacientesRequest(busca, status, pagina, tamanhoPagina, semConsultaHaDias),
            cancellationToken);

        return Ok(RespostaApi<PacientesListagemResponse>.ComSucesso(resposta));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType<RespostaApi<PacienteDetalheResponse>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> ObterPorId(
        Guid id,
        CancellationToken cancellationToken)
    {
        var resposta = await pacientesService.ObterPorIdAsync(
            ObterContaPsicologoId(),
            id,
            cancellationToken);

        return Ok(RespostaApi<PacienteDetalheResponse>.ComSucesso(resposta));
    }

    [HttpPost]
    [ProducesResponseType<RespostaApi<PacienteDetalheResponse>>(StatusCodes.Status201Created)]
    public async Task<IActionResult> Criar(
        [FromBody] CriarPacienteRequest request,
        CancellationToken cancellationToken)
    {
        var resposta = await pacientesService.CriarAsync(
            ObterUsuarioId(),
            ObterContaPsicologoId(),
            request,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            Request.Headers.UserAgent.ToString(),
            cancellationToken);

        return CreatedAtAction(
            nameof(ObterPorId),
            new { id = resposta.Id },
            RespostaApi<PacienteDetalheResponse>.ComSucesso(
                resposta,
                "Paciente cadastrado com sucesso."));
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType<RespostaApi<PacienteDetalheResponse>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Atualizar(
        Guid id,
        [FromBody] AtualizarPacienteRequest request,
        CancellationToken cancellationToken)
    {
        var resposta = await pacientesService.AtualizarAsync(
            ObterUsuarioId(),
            ObterContaPsicologoId(),
            id,
            request,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            Request.Headers.UserAgent.ToString(),
            cancellationToken);

        return Ok(RespostaApi<PacienteDetalheResponse>.ComSucesso(
            resposta,
            "Paciente atualizado com sucesso."));
    }

    [HttpPatch("{id:guid}/ativar")]
    [ProducesResponseType<RespostaApi<PacienteDetalheResponse>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Ativar(
        Guid id,
        CancellationToken cancellationToken)
    {
        var resposta = await pacientesService.AlterarStatusAsync(
            ObterUsuarioId(),
            ObterContaPsicologoId(),
            id,
            ativar: true,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            Request.Headers.UserAgent.ToString(),
            cancellationToken);

        return Ok(RespostaApi<PacienteDetalheResponse>.ComSucesso(
            resposta,
            "Paciente ativado com sucesso."));
    }

    [HttpPatch("{id:guid}/inativar")]
    [ProducesResponseType<RespostaApi<PacienteDetalheResponse>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Inativar(
        Guid id,
        CancellationToken cancellationToken)
    {
        var resposta = await pacientesService.AlterarStatusAsync(
            ObterUsuarioId(),
            ObterContaPsicologoId(),
            id,
            ativar: false,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            Request.Headers.UserAgent.ToString(),
            cancellationToken);

        return Ok(RespostaApi<PacienteDetalheResponse>.ComSucesso(
            resposta,
            "Paciente inativado com sucesso."));
    }

    [HttpPost("{id:guid}/consentimento")]
    public async Task<IActionResult> RegistrarConsentimento(Guid id, CancellationToken cancellationToken) =>
        Ok(RespostaApi<PacienteDetalheResponse>.ComSucesso(await pacientesService.RegistrarConsentimentoAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, HttpContext.Connection.RemoteIpAddress?.ToString(), Request.Headers.UserAgent.ToString(), cancellationToken)));

    [HttpGet("{id:guid}/exportacao")]
    public async Task<IActionResult> Exportar(Guid id, CancellationToken cancellationToken) =>
        Ok(RespostaApi<ExportacaoPacienteResponse>.ComSucesso(await pacientesService.ExportarAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, HttpContext.Connection.RemoteIpAddress?.ToString(), Request.Headers.UserAgent.ToString(), cancellationToken)));
}
