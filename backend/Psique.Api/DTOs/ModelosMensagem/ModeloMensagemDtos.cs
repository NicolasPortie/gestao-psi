using System.ComponentModel.DataAnnotations;
using Psique.Api.Shared.Enums;

namespace Psique.Api.DTOs.ModelosMensagem;

public sealed record VariavelModeloMensagemResponse(string Chave, string Descricao, string Marcador);

public sealed record ModeloMensagemResponse(
    Guid Id,
    string Nome,
    TipoLembrete Tipo,
    CanalComunicacao Canal,
    string? Assunto,
    string Conteudo,
    bool Ativo,
    DateTimeOffset CriadoEm,
    DateTimeOffset? AtualizadoEm);

public sealed record PreviaModeloMensagemResponse(
    string? Assunto,
    string Conteudo,
    IReadOnlyCollection<string> VariaveisUtilizadas);

public sealed class FiltroModeloMensagemRequest
{
    public TipoLembrete? Tipo { get; init; }
    public CanalComunicacao? Canal { get; init; }
    public bool? Ativo { get; init; }
}

public sealed class CriarModeloMensagemRequest
{
    [Required, StringLength(120)]
    public string Nome { get; init; } = string.Empty;

    public TipoLembrete Tipo { get; init; }

    public CanalComunicacao Canal { get; init; } = CanalComunicacao.Email;

    [StringLength(200)]
    public string? Assunto { get; init; }

    [Required, StringLength(4000)]
    public string Conteudo { get; init; } = string.Empty;

    public bool Ativo { get; init; } = true;
}

public sealed class AtualizarModeloMensagemRequest
{
    [Required, StringLength(120)]
    public string Nome { get; init; } = string.Empty;

    public TipoLembrete Tipo { get; init; }

    public CanalComunicacao Canal { get; init; } = CanalComunicacao.Email;

    [StringLength(200)]
    public string? Assunto { get; init; }

    [Required, StringLength(4000)]
    public string Conteudo { get; init; } = string.Empty;

    public bool Ativo { get; init; } = true;
}

public sealed class AlterarAtivoModeloMensagemRequest
{
    public bool Ativo { get; init; }
}

public sealed class PreviaModeloMensagemRequest
{
    [StringLength(200)]
    public string? Assunto { get; init; }

    [Required, StringLength(4000)]
    public string Conteudo { get; init; } = string.Empty;

    public Guid? ConsultaId { get; init; }
    public Guid? PacienteId { get; init; }
}
