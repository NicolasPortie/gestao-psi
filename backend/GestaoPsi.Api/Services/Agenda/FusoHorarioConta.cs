namespace GestaoPsi.Api.Services.Agenda;

/// <summary>
/// Resolve o fuso horario da conta (IANA, ex.: America/Sao_Paulo) para
/// comparar a grade de horarios com o relogio de parede do consultorio.
/// Aceita IDs do Windows como fallback e o fuso local em ultimo caso.
/// </summary>
public static class FusoHorarioConta
{
    public const string Padrao = "America/Sao_Paulo";

    private static readonly IReadOnlyDictionary<string, string> IanaParaWindows =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["America/Noronha"] = "UTC-02",
            ["America/Belem"] = "SA Eastern Standard Time",
            ["America/Fortaleza"] = "SA Eastern Standard Time",
            ["America/Recife"] = "SA Eastern Standard Time",
            ["America/Bahia"] = "Bahia Standard Time",
            ["America/Sao_Paulo"] = "E. South America Standard Time",
            ["America/Campo_Grande"] = "Central Brazilian Standard Time",
            ["America/Cuiaba"] = "Central Brazilian Standard Time",
            ["America/Manaus"] = "SA Western Standard Time",
            ["America/Rio_Branco"] = "SA Pacific Standard Time"
        };

    public static TimeZoneInfo Resolver(string? fusoHorario)
    {
        var id = string.IsNullOrWhiteSpace(fusoHorario) ? Padrao : fusoHorario.Trim();
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(id);
        }
        catch (TimeZoneNotFoundException)
        {
            if (IanaParaWindows.TryGetValue(id, out var windowsId))
            {
                try
                {
                    return TimeZoneInfo.FindSystemTimeZoneById(windowsId);
                }
                catch (TimeZoneNotFoundException)
                {
                    return TimeZoneInfo.Local;
                }
            }
            throw new Shared.Excecoes.RegraNegocioException("Fuso horário inválido.");
        }
    }
}
