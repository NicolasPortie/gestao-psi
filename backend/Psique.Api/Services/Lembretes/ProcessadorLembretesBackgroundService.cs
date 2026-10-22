namespace Psique.Api.Services.Lembretes;

/// <summary>
/// Processa periodicamente lembretes programados cujo horário já venceu.
/// </summary>
public sealed class ProcessadorLembretesBackgroundService(
    IServiceScopeFactory escopoFactory,
    ILogger<ProcessadorLembretesBackgroundService> logger) : BackgroundService
{
    private static readonly TimeSpan Intervalo = TimeSpan.FromMinutes(1);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Aguarda a API subir antes do primeiro ciclo.
        try
        {
            await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken);
        }
        catch (OperationCanceledException)
        {
            return;
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var escopo = escopoFactory.CreateScope();
                var lembretes = escopo.ServiceProvider.GetRequiredService<ILembretesService>();
                var processados = await lembretes.ProcessarVencidosAsync(stoppingToken);
                if (processados > 0)
                {
                    logger.LogInformation(
                        "Processador de lembretes concluiu ciclo com {Quantidade} item(ns).",
                        processados);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception excecao)
            {
                logger.LogError(excecao, "Falha no processador de lembretes em background.");
            }

            try
            {
                await Task.Delay(Intervalo, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }
}
