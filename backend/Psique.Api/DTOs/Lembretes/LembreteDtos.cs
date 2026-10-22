using System.ComponentModel.DataAnnotations;
using Psique.Api.Shared.Enums;

namespace Psique.Api.DTOs.Lembretes;

public sealed record LembreteResponse(
    Guid Id,
    Guid ConsultaId,
    DateTimeOffset ConsultaInicioEm,
    Guid PacienteId,
    string Paciente,
    Guid? ModeloMensagemId,
    string? ModeloMensagem,
    CanalComunicacao Canal,
    TipoLembrete Tipo,
    StatusLembrete Status,
    DateTimeOffset AgendadoPara,
    DateTimeOffset? EnviadoEm,
    string? Mensagem,
    string? Assunto,
    string? ErroEnvio,
    DateTimeOffset CriadoEm,
    DateTimeOffset? AtualizadoEm);

public sealed record PreviaLembreteResponse(
    string? Assunto,
    string Mensagem,
    CanalComunicacao Canal,
    TipoLembrete Tipo);

public sealed record LembreteIndicadoresResponse(
    int Programados,
    int Enviados,
    int Falhos,
    int Cancelados);

public sealed class FiltroLembreteRequest
{
    public DateTimeOffset? PeriodoInicio { get; init; }
    public DateTimeOffset? PeriodoFim { get; init; }
    public StatusLembrete? Status { get; init; }
    public Guid? PacienteId { get; init; }
    public Guid? ConsultaId { get; init; }
    public TipoLembrete? Tipo { get; init; }
    public CanalComunicacao? Canal { get; init; }
    public int Pagina { get; init; } = 1;
    public int TamanhoPagina { get; init; } = 20;
}

public sealed class CriarLembreteRequest
{
    public Guid ConsultaId { get; init; }
    public Guid? ModeloMensagemId { get; init; }
    public CanalComunicacao Canal { get; init; } = CanalComunicacao.Email;
    public TipoLembrete Tipo { get; init; } = TipoLembrete.LembreteConsulta;
    public DateTimeOffset AgendadoPara { get; init; }

    [StringLength(200)]
    public string? Assunto { get; init; }

    [StringLength(2000)]
    public string? Mensagem { get; init; }
}

public sealed class PreviaLembreteRequest
{
    public Guid ConsultaId { get; init; }
    public Guid? ModeloMensagemId { get; init; }
    public CanalComunicacao Canal { get; init; } = CanalComunicacao.Email;
    public TipoLembrete Tipo { get; init; } = TipoLembrete.LembreteConsulta;

    [StringLength(200)]
    public string? Assunto { get; init; }

    [StringLength(2000)]
    public string? Mensagem { get; init; }
}
