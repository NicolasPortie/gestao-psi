using System.ComponentModel.DataAnnotations;
using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.DTOs.PerfisAcesso;

public sealed record PerfilAcessoResponse(
    Guid Id,
    string Nome,
    string? Descricao,
    IReadOnlyCollection<PermissaoAcesso> Permissoes,
    int Pessoas);

public sealed record PermissaoCatalogoResponse(PermissaoAcesso Valor, string Rotulo, string Descricao);

public sealed class SalvarPerfilAcessoRequest
{
    [Required, StringLength(80, MinimumLength = 2)]
    public string Nome { get; init; } = string.Empty;

    [StringLength(300)]
    public string? Descricao { get; init; }

    [Required, MinLength(1)]
    public IReadOnlyCollection<PermissaoAcesso> Permissoes { get; init; } = [];
}
