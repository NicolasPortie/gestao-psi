using GestaoPsi.Api.DTOs.Agenda;

namespace GestaoPsi.Api.Services.Agenda;

public interface IAgendaService
{
    Task<ConfiguracaoAtendimentoResponse> ObterConfiguracaoAsync(Guid usuarioId, Guid contaId, CancellationToken ct);
    Task<ConfiguracaoAtendimentoResponse> AtualizarConfiguracaoAsync(Guid usuarioId, Guid contaId, AtualizarConfiguracaoAtendimentoRequest request, string? ip, string? userAgent, CancellationToken ct);
    Task<IReadOnlyCollection<TipoAtendimentoResponse>> ListarTiposAsync(Guid usuarioId, Guid contaId, CancellationToken ct);
    Task<TipoAtendimentoResponse> SalvarTipoAsync(Guid usuarioId, Guid contaId, Guid? id, SalvarTipoAtendimentoRequest request, string? ip, string? userAgent, CancellationToken ct);
    Task<IReadOnlyCollection<HorarioDisponivelResponse>> ListarHorariosAsync(Guid usuarioId, Guid contaId, CancellationToken ct);
    Task<HorarioDisponivelResponse> SalvarHorarioAsync(Guid usuarioId, Guid contaId, Guid? id, SalvarHorarioDisponivelRequest request, string? ip, string? userAgent, CancellationToken ct);
    Task<IReadOnlyCollection<BloqueioAgendaResponse>> ListarBloqueiosAsync(Guid usuarioId, Guid contaId, DateTimeOffset inicio, DateTimeOffset fim, CancellationToken ct);
    Task<BloqueioAgendaResponse> SalvarBloqueioAsync(Guid usuarioId, Guid contaId, Guid? id, SalvarBloqueioAgendaRequest request, string? ip, string? userAgent, CancellationToken ct);
    Task RemoverBloqueioAsync(Guid usuarioId, Guid contaId, Guid id, string? ip, string? userAgent, CancellationToken ct);
}
