using GestaoPsi.Api.DTOs.Agenda;
using GestaoPsi.Api.Services.Agenda;
using GestaoPsi.Api.Shared.Respostas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestaoPsi.Api.Controllers;

[ApiController]
[Authorize(Policy = "GestaoAdministrativa")]
[Route("api/v1/agenda")]
public sealed class AgendaController(IAgendaService agendaService) : ControllerAutenticadoBase
{
    [HttpGet("configuracoes")]
    public async Task<IActionResult> ObterConfiguracoes(CancellationToken ct) => Ok(RespostaApi<ConfiguracaoAtendimentoResponse>.ComSucesso(await agendaService.ObterConfiguracaoAsync(ObterUsuarioId(), ObterContaPsicologoId(), ct)));

    [HttpPut("configuracoes")]
    public async Task<IActionResult> AtualizarConfiguracoes(AtualizarConfiguracaoAtendimentoRequest request, CancellationToken ct) => Ok(RespostaApi<ConfiguracaoAtendimentoResponse>.ComSucesso(await agendaService.AtualizarConfiguracaoAsync(ObterUsuarioId(), ObterContaPsicologoId(), request, ObterIp(), ObterUserAgent(), ct)));

    [HttpGet("tipos-atendimento")]
    public async Task<IActionResult> ListarTipos(CancellationToken ct) => Ok(RespostaApi<IReadOnlyCollection<TipoAtendimentoResponse>>.ComSucesso(await agendaService.ListarTiposAsync(ObterUsuarioId(), ObterContaPsicologoId(), ct)));

    [HttpPost("tipos-atendimento")]
    public async Task<IActionResult> CriarTipo(SalvarTipoAtendimentoRequest request, CancellationToken ct) => Ok(RespostaApi<TipoAtendimentoResponse>.ComSucesso(await agendaService.SalvarTipoAsync(ObterUsuarioId(), ObterContaPsicologoId(), null, request, ObterIp(), ObterUserAgent(), ct)));

    [HttpPut("tipos-atendimento/{id:guid}")]
    public async Task<IActionResult> AtualizarTipo(Guid id, SalvarTipoAtendimentoRequest request, CancellationToken ct) => Ok(RespostaApi<TipoAtendimentoResponse>.ComSucesso(await agendaService.SalvarTipoAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, request, ObterIp(), ObterUserAgent(), ct)));

    [HttpGet("horarios-disponiveis")]
    public async Task<IActionResult> ListarHorarios(CancellationToken ct) => Ok(RespostaApi<IReadOnlyCollection<HorarioDisponivelResponse>>.ComSucesso(await agendaService.ListarHorariosAsync(ObterUsuarioId(), ObterContaPsicologoId(), ct)));

    [HttpPost("horarios-disponiveis")]
    public async Task<IActionResult> CriarHorario(SalvarHorarioDisponivelRequest request, CancellationToken ct) => Ok(RespostaApi<HorarioDisponivelResponse>.ComSucesso(await agendaService.SalvarHorarioAsync(ObterUsuarioId(), ObterContaPsicologoId(), null, request, ObterIp(), ObterUserAgent(), ct)));

    [HttpPut("horarios-disponiveis/{id:guid}")]
    public async Task<IActionResult> AtualizarHorario(Guid id, SalvarHorarioDisponivelRequest request, CancellationToken ct) => Ok(RespostaApi<HorarioDisponivelResponse>.ComSucesso(await agendaService.SalvarHorarioAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, request, ObterIp(), ObterUserAgent(), ct)));

    [HttpGet("bloqueios")]
    public async Task<IActionResult> ListarBloqueios([FromQuery] DateTimeOffset inicio, [FromQuery] DateTimeOffset fim, CancellationToken ct) => Ok(RespostaApi<IReadOnlyCollection<BloqueioAgendaResponse>>.ComSucesso(await agendaService.ListarBloqueiosAsync(ObterUsuarioId(), ObterContaPsicologoId(), inicio, fim, ct)));

    [HttpPost("bloqueios")]
    public async Task<IActionResult> CriarBloqueio(SalvarBloqueioAgendaRequest request, CancellationToken ct) => Ok(RespostaApi<BloqueioAgendaResponse>.ComSucesso(await agendaService.SalvarBloqueioAsync(ObterUsuarioId(), ObterContaPsicologoId(), null, request, ObterIp(), ObterUserAgent(), ct)));

    [HttpPut("bloqueios/{id:guid}")]
    public async Task<IActionResult> AtualizarBloqueio(Guid id, SalvarBloqueioAgendaRequest request, CancellationToken ct) => Ok(RespostaApi<BloqueioAgendaResponse>.ComSucesso(await agendaService.SalvarBloqueioAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, request, ObterIp(), ObterUserAgent(), ct)));

    [HttpDelete("bloqueios/{id:guid}")]
    public async Task<IActionResult> RemoverBloqueio(Guid id, CancellationToken ct) { await agendaService.RemoverBloqueioAsync(ObterUsuarioId(), ObterContaPsicologoId(), id, ObterIp(), ObterUserAgent(), ct); return NoContent(); }

    private string? ObterIp() => HttpContext.Connection.RemoteIpAddress?.ToString();
    private string? ObterUserAgent() => Request.Headers.UserAgent.ToString();
}
