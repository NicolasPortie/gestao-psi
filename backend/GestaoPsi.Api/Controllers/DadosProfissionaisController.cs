using GestaoPsi.Api.DTOs.DadosProfissionais;
using GestaoPsi.Api.Services.DadosProfissionais;
using GestaoPsi.Api.Shared.Respostas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestaoPsi.Api.Controllers;

[ApiController]
[Authorize(Policy = "GestaoConta")]
[Route("api/v1/dados-profissionais")]
public sealed class DadosProfissionaisController(IDadosProfissionaisService dadosService) : ControllerAutenticadoBase
{
    [HttpGet("situacao")]
    public async Task<IActionResult> Situacao(CancellationToken ct) => Ok(RespostaApi<SituacaoPerfilProfissionalResponse>.ComSucesso(await dadosService.ObterSituacaoAsync(ObterUsuarioId(), ObterContaPsicologoId(), ct)));

    [HttpPost("adiar")]
    public async Task<IActionResult> Adiar(CancellationToken ct)
    {
        await dadosService.AdiarAsync(ObterUsuarioId(), ObterContaPsicologoId(), ct);
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> Obter(CancellationToken ct)
    {
        var dados = await dadosService.ObterAsync(ObterUsuarioId(), ObterContaPsicologoId(), ct);
        return dados is null
            ? NotFound(RespostaApi<object>.ComErro("Dados profissionais não cadastrados."))
            : Ok(RespostaApi<DadosProfissionaisResponse>.ComSucesso(dados));
    }

    [HttpPut]
    public async Task<IActionResult> Salvar(SalvarDadosProfissionaisRequest request, CancellationToken ct) => Ok(RespostaApi<DadosProfissionaisResponse>.ComSucesso(await dadosService.SalvarAsync(ObterUsuarioId(), ObterContaPsicologoId(), request, ObterIp(), ObterUserAgent(), ct)));
}
