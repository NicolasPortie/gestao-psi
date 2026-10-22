using System.ComponentModel.DataAnnotations;

namespace Psique.Api.DTOs.DadosProfissionais;

public sealed record DadosProfissionaisResponse(
    Guid Id,
    string NomeProfissional,
    string CrpMascarado,
    string? Bio,
    string? EmailProfissional,
    string? TelefoneProfissional);

public sealed class SalvarDadosProfissionaisRequest
{
    [Required, StringLength(180, MinimumLength = 3)]
    public string NomeProfissional { get; init; } = string.Empty;

    [Required, StringLength(30, MinimumLength = 4)]
    public string Crp { get; init; } = string.Empty;

    [StringLength(2000)]
    public string? Bio { get; init; }

    [EmailAddress, StringLength(180)]
    public string? EmailProfissional { get; init; }

    [StringLength(30)]
    public string? TelefoneProfissional { get; init; }
}
