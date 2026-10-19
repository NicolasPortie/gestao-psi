using System.ComponentModel.DataAnnotations;
using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.DTOs.Consultas;

public sealed record ConsultaResponse(Guid Id, Guid PacienteId, string Paciente, Guid TipoAtendimentoId, string TipoAtendimento, DateTimeOffset InicioEm, DateTimeOffset FimEm, StatusConsulta Status, ModalidadeAtendimento Modalidade, string? LinkOnline, string? EnderecoAtendimento, string? ObservacaoAdministrativa, Guid? SerieId = null);

public sealed record PagamentoVinculadoResponse(Guid Id, decimal Valor, StatusPagamento Status);

public sealed record LembreteVinculadoResponse(Guid Id, StatusLembrete Status, DateTimeOffset AgendadoPara);

public sealed record HistoricoConsultaResponse(StatusConsulta? StatusAnterior, StatusConsulta StatusNovo, string? Descricao, DateTimeOffset CriadoEm);

public sealed record ConsultaDetalheResponse(
    Guid Id,
    Guid PacienteId,
    string Paciente,
    Guid TipoAtendimentoId,
    string TipoAtendimento,
    DateTimeOffset InicioEm,
    DateTimeOffset FimEm,
    StatusConsulta Status,
    ModalidadeAtendimento Modalidade,
    OrigemConsulta Origem,
    string? LinkOnline,
    string? EnderecoAtendimento,
    string? ObservacaoAdministrativa,
    string? JustificativaCancelamento,
    IReadOnlyCollection<PagamentoVinculadoResponse> Pagamentos,
    IReadOnlyCollection<LembreteVinculadoResponse> Lembretes,
    IReadOnlyCollection<HistoricoConsultaResponse> Historico,
    Guid? SerieId = null,
    int ProximasNaSerie = 0);

public sealed class CriarConsultaRequest
{
    public Guid PacienteId { get; init; }
    public Guid TipoAtendimentoId { get; init; }
    public Guid? ListaEsperaId { get; init; }
    public DateTimeOffset InicioEm { get; init; }
    public DateTimeOffset FimEm { get; init; }
    public ModalidadeAtendimento Modalidade { get; init; }
    [Url, StringLength(500)] public string? LinkOnline { get; init; }
    [StringLength(500)] public string? EnderecoAtendimento { get; init; }
    [StringLength(2000)] public string? ObservacaoAdministrativa { get; init; }
    /// <summary>Quando nulo, usa a configuração da conta.</summary>
    public bool? ProgramarLembrete { get; init; }
    /// <summary>Cria um Pagamento pendente vinculado a consulta.</summary>
    public bool CriarPagamentoPendente { get; init; }
    [Range(0, 999999.99)] public decimal? ValorPagamento { get; init; }
    /// <summary>Quando informado em /consultas/serie, repete a consulta no mesmo horário.</summary>
    public RecorrenciaConsultaRequest? Recorrencia { get; init; }
}

public enum FrequenciaRecorrencia
{
    Semanal = 1,
    Quinzenal = 2
}

public sealed class RecorrenciaConsultaRequest
{
    public FrequenciaRecorrencia Frequencia { get; init; } = FrequenciaRecorrencia.Semanal;
    /// <summary>Total de consultas da série, contando a primeira.</summary>
    [Range(2, 52)] public int Ocorrencias { get; init; }
}

public sealed record OcorrenciaIgnoradaResponse(DateTimeOffset InicioEm, string Motivo);

public sealed record SerieConsultasResponse(
    Guid? SerieId,
    IReadOnlyCollection<ConsultaResponse> Criadas,
    IReadOnlyCollection<OcorrenciaIgnoradaResponse> Ignoradas);

public sealed class CancelarSerieRequest
{
    [StringLength(1000)] public string? Justificativa { get; init; }
}

public sealed record CancelamentoSerieResponse(int Canceladas);

public sealed class AlterarStatusConsultaRequest
{
    public StatusConsulta Status { get; init; }
    [StringLength(1000)] public string? Justificativa { get; init; }
}

public sealed class RemarcarConsultaRequest
{
    public DateTimeOffset NovoInicioEm { get; init; }
    public DateTimeOffset NovoFimEm { get; init; }
    [StringLength(1000)] public string? Justificativa { get; init; }
}
