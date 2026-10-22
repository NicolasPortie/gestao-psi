using System.ComponentModel.DataAnnotations;
using Psique.Api.Shared.Enums;

namespace Psique.Api.DTOs.Agenda;

public sealed record ConfiguracaoAtendimentoResponse(
    string FusoHorario,
    int DuracaoPadraoMinutos,
    bool ConfirmacaoAutomaticaConsulta,
    int? AntecedenciaMinimaAgendamentoHoras,
    int? AntecedenciaCancelamentoHoras,
    int? AntecedenciaRemarcacaoHoras,
    bool ExigeJustificativaCancelamento,
    bool LembretesAutomaticosAtivos,
    bool ProgramarLembreteAoCriarConsulta,
    bool ProgramarLembreteAoConfirmar,
    int AntecedenciaLembreteHoras,
    CanalComunicacao CanalLembretePadrao,
    bool CobrarAoRealizar = true,
    bool CobrarFalta = false);

public sealed class AtualizarConfiguracaoAtendimentoRequest
{
    [Required, StringLength(80, MinimumLength = 3)] public string FusoHorario { get; init; } = "America/Sao_Paulo";
    [Range(10, 240)] public int DuracaoPadraoMinutos { get; init; }
    public bool ConfirmacaoAutomaticaConsulta { get; init; }
    [Range(0, 720)] public int? AntecedenciaMinimaAgendamentoHoras { get; init; }
    [Range(0, 720)] public int? AntecedenciaCancelamentoHoras { get; init; }
    [Range(0, 720)] public int? AntecedenciaRemarcacaoHoras { get; init; }
    public bool ExigeJustificativaCancelamento { get; init; }
    public bool LembretesAutomaticosAtivos { get; init; } = true;
    public bool ProgramarLembreteAoCriarConsulta { get; init; } = true;
    public bool ProgramarLembreteAoConfirmar { get; init; } = true;
    [Range(0, 720)] public int AntecedenciaLembreteHoras { get; init; } = 24;
    public CanalComunicacao CanalLembretePadrao { get; init; } = CanalComunicacao.Email;
    public bool CobrarAoRealizar { get; init; } = true;
    public bool CobrarFalta { get; init; }
}

public sealed record TipoAtendimentoResponse(
    Guid Id, string Nome, string? Descricao, int DuracaoMinutos,
    decimal? ValorPadrao, ModalidadeAtendimento ModalidadePadrao, bool Ativo);

public sealed class SalvarTipoAtendimentoRequest
{
    [Required, StringLength(120, MinimumLength = 2)] public string Nome { get; init; } = string.Empty;
    [StringLength(1000)] public string? Descricao { get; init; }
    [Range(10, 240)] public int DuracaoMinutos { get; init; }
    [Range(typeof(decimal), "0", "999999.99", ParseLimitsInInvariantCulture = true)] public decimal? ValorPadrao { get; init; }
    public ModalidadeAtendimento ModalidadePadrao { get; init; }
    public bool Ativo { get; init; } = true;
}

public sealed record HorarioDisponivelResponse(
    Guid Id, DiaSemana DiaSemana, TimeOnly HoraInicio, TimeOnly HoraFim, bool Ativo);

public sealed class SalvarHorarioDisponivelRequest
{
    public DiaSemana DiaSemana { get; init; }
    public TimeOnly HoraInicio { get; init; }
    public TimeOnly HoraFim { get; init; }
    public bool Ativo { get; init; } = true;
}

public sealed record BloqueioAgendaResponse(
    Guid Id, string Titulo, string? Descricao, DateTimeOffset InicioEm,
    DateTimeOffset FimEm, bool DiaInteiro);

public sealed class SalvarBloqueioAgendaRequest
{
    [Required, StringLength(160, MinimumLength = 2)] public string Titulo { get; init; } = string.Empty;
    [StringLength(1000)] public string? Descricao { get; init; }
    public DateTimeOffset InicioEm { get; init; }
    public DateTimeOffset FimEm { get; init; }
    public bool DiaInteiro { get; init; }
}
