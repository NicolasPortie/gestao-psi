using Psique.Api.DTOs.Lembretes;
using Psique.Api.Shared.Enums;
using Psique.Api.Shared.Paginacao;

namespace Psique.Api.Services.Lembretes;

public interface ILembretesService
{
    Task<ResultadoPaginado<LembreteResponse>> ListarAsync(
        Guid usuarioId,
        Guid contaId,
        FiltroLembreteRequest filtro,
        CancellationToken cancellationToken);

    Task<LembreteIndicadoresResponse> IndicadoresAsync(
        Guid usuarioId,
        Guid contaId,
        FiltroLembreteRequest filtro,
        CancellationToken cancellationToken);

    Task<LembreteResponse> ObterAsync(
        Guid usuarioId,
        Guid contaId,
        Guid id,
        CancellationToken cancellationToken);

    Task<LembreteResponse> CriarAsync(
        Guid usuarioId,
        Guid contaId,
        CriarLembreteRequest request,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken);

    Task<PreviaLembreteResponse> PreviaAsync(
        Guid usuarioId,
        Guid contaId,
        PreviaLembreteRequest request,
        CancellationToken cancellationToken);

    Task<LembreteResponse> CancelarAsync(
        Guid usuarioId,
        Guid contaId,
        Guid id,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken);

    Task<LembreteResponse> TentarNovamenteAsync(
        Guid usuarioId,
        Guid contaId,
        Guid id,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken);

    /// <summary>
    /// Programa lembrete automático conforme configuração da conta, sem duplicar programados.
    /// </summary>
    Task<LembreteResponse?> ProgramarAutomaticoParaConsultaAsync(
        Guid? usuarioId,
        Guid contaId,
        Guid consultaId,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken);

    /// <summary>
    /// Encerra lembretes programados da consulta (ex.: cancelamento ou falta).
    /// </summary>
    Task<int> EncerrarProgramadosDaConsultaAsync(
        Guid? usuarioId,
        Guid contaId,
        Guid consultaId,
        StatusLembrete statusFinal,
        string motivo,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken);

    /// <summary>
    /// Processa lote de lembretes vencidos. Usado pelo worker em background.
    /// </summary>
    Task<int> ProcessarVencidosAsync(CancellationToken cancellationToken);
}
