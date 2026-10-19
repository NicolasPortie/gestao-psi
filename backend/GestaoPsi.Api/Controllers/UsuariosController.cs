using GestaoPsi.Api.Shared;
using GestaoPsi.Api.DTOs.Usuarios;
using GestaoPsi.Api.Services.Usuarios;
using GestaoPsi.Api.Shared.Respostas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestaoPsi.Api.Controllers;

[ApiController]
[Authorize(Policy = Politicas.Equipe)]
[Route("api/v1/usuarios")]
public sealed class UsuariosController(IUsuariosService usuariosService) : ControllerAutenticadoBase
{
    [HttpGet]
    public async Task<IActionResult> Listar(CancellationToken ct) => Ok(RespostaApi<IReadOnlyCollection<UsuarioResponse>>.ComSucesso(await usuariosService.ListarAsync(ObterUsuarioId(), ObterContaPsicologoId(), ct)));

    [HttpPost]
    public async Task<IActionResult> Criar(CriarUsuarioRequest request, CancellationToken ct) => Ok(RespostaApi<UsuarioResponse>.ComSucesso(await usuariosService.CriarAsync(ObterUsuarioId(), ObterContaPsicologoId(), request, ObterIp(), ObterUserAgent(), ct)));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Atualizar(Guid id, AtualizarUsuarioRequest request, CancellationToken ct) => Ok(RespostaApi<UsuarioResponse>.ComSucesso(await usuariosService.AtualizarAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, request, ObterIp(), ObterUserAgent(), ct)));

    [HttpPatch("{id:guid}/perfil")]
    public async Task<IActionResult> AlterarPerfil(Guid id, AlterarPerfilUsuarioRequest request, CancellationToken ct) => Ok(RespostaApi<UsuarioResponse>.ComSucesso(await usuariosService.AlterarPerfilAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, request, ObterIp(), ObterUserAgent(), ct)));

    [HttpPost("{id:guid}/redefinir-senha")]
    public async Task<IActionResult> RedefinirSenha(Guid id, RedefinirSenhaUsuarioRequest request, CancellationToken ct)
    {
        await usuariosService.RedefinirSenhaAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, request, ObterIp(), ObterUserAgent(), ct);
        return Ok(RespostaApi<object>.ComSucesso(new { }, "Senha redefinida com sucesso."));
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> AlterarStatus(Guid id, AlterarStatusUsuarioRequest request, CancellationToken ct) => Ok(RespostaApi<UsuarioResponse>.ComSucesso(await usuariosService.AlterarStatusAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, request, ObterIp(), ObterUserAgent(), ct)));
}
