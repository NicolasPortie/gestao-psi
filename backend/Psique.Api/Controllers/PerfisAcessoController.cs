using Psique.Api.DTOs.PerfisAcesso;
using Psique.Api.Services.PerfisAcesso;
using Psique.Api.Shared;
using Psique.Api.Shared.Respostas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Psique.Api.Controllers;

[ApiController]
[Authorize(Policy = Politicas.Equipe)]
[Route("api/v1/perfis-acesso")]
public sealed class PerfisAcessoController(IPerfisAcessoService perfisService) : ControllerAutenticadoBase
{
    [HttpGet]
    public async Task<IActionResult> Listar(CancellationToken ct) =>
        Ok(RespostaApi<IReadOnlyCollection<PerfilAcessoResponse>>.ComSucesso(await perfisService.ListarAsync(ObterUsuarioId(), ObterContaPsicologoId(), ct)));

    [HttpGet("permissoes")]
    public IActionResult ListarPermissoes() =>
        Ok(RespostaApi<IReadOnlyCollection<PermissaoCatalogoResponse>>.ComSucesso(perfisService.ListarPermissoes()));

    [HttpPost]
    public async Task<IActionResult> Criar(SalvarPerfilAcessoRequest request, CancellationToken ct) =>
        Ok(RespostaApi<PerfilAcessoResponse>.ComSucesso(await perfisService.CriarAsync(ObterUsuarioId(), ObterContaPsicologoId(), request, ObterIp(), ObterUserAgent(), ct)));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Atualizar(Guid id, SalvarPerfilAcessoRequest request, CancellationToken ct) =>
        Ok(RespostaApi<PerfilAcessoResponse>.ComSucesso(await perfisService.AtualizarAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, request, ObterIp(), ObterUserAgent(), ct)));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Remover(Guid id, CancellationToken ct)
    {
        await perfisService.RemoverAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, ObterIp(), ObterUserAgent(), ct);
        return Ok(RespostaApi<object>.ComSucesso(new { }, "Perfil removido."));
    }
}
