using System.ComponentModel.DataAnnotations;
using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.DTOs.Consultas;

public sealed record ConsultaResponse(Guid Id, Guid PacienteId, string Paciente, Guid TipoAtendimentoId, string TipoAtendimento, DateTimeOffset InicioEm, DateTimeOffset FimEm, StatusConsulta Status, ModalidadeAtendimento Modalidade, string? LinkOnline, string? EnderecoAtendimento, string? ObservacaoAdministrativa);

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
    IReadOnlyCollection<HistoricoConsultaResponse> Historico);

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
}

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
