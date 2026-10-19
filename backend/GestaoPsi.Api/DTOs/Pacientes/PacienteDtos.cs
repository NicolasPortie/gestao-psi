using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.DTOs.Pacientes;

public sealed record ListarPacientesRequest(
    string? Busca,
    StatusPaciente? Status,
    int Pagina = 1,
    int TamanhoPagina = 20,
    /// <summary>Só pacientes ativos que já vieram e não têm consulta há este número de dias (nem marcada à frente).</summary>
    int? SemConsultaHaDias = null);

public sealed record CriarPacienteRequest(
    string NomeCompleto,
    DateOnly? DataNascimento,
    string? Cpf,
    string? Telefone,
    string? WhatsApp,
    string? Email,
    string? ObservacaoAdministrativa,
    IReadOnlyCollection<ContatoPacienteRequest>? ContatosAdicionais = null,
    decimal? ValorSessao = null,
    ModoCobranca ModoCobranca = ModoCobranca.PorSessao);

public sealed record AtualizarPacienteRequest(
    string NomeCompleto,
    DateOnly? DataNascimento,
    string? Cpf,
    string? Telefone,
    string? WhatsApp,
    string? Email,
    string? ObservacaoAdministrativa,
    StatusPaciente Status,
    IReadOnlyCollection<ContatoPacienteRequest>? ContatosAdicionais = null,
    decimal? ValorSessao = null,
    ModoCobranca ModoCobranca = ModoCobranca.PorSessao);

public sealed record ContatoPacienteRequest(
    TipoContato TipoContato,
    string Valor,
    bool Principal,
    string? Nome = null);

public sealed record PacienteListaResponse(
    Guid Id,
    string NomeCompleto,
    string? DataNascimento,
    string? CpfMascarado,
    string? Telefone,
    string? WhatsApp,
    string? Email,
    string Status,
    string? UltimaConsulta,
    string? ProximaConsulta,
    DateTimeOffset CriadoEm,
    DateTimeOffset? AtualizadoEm);

public sealed record PacienteDetalheResponse(
    Guid Id,
    string NomeCompleto,
    string? DataNascimento,
    string? CpfMascarado,
    string? Cpf,
    string? Telefone,
    string? WhatsApp,
    string? Email,
    string Status,
    string? ObservacaoAdministrativa,
    decimal? ValorSessao,
    ModoCobranca ModoCobranca,
    DateTimeOffset? ConsentimentoRegistradoEm,
    IReadOnlyCollection<ContatoPacienteResponse> ContatosAdicionais,
    string? UltimaConsulta,
    string? ProximaConsulta,
    DateTimeOffset CriadoEm,
    DateTimeOffset? AtualizadoEm);

public sealed record ContatoPacienteResponse(
    Guid Id,
    string TipoContato,
    string Valor,
    bool Principal,
    string? Nome);

public sealed record PacientesResumoResponse(
    int Ativos,
    int Inativos,
    int Arquivados);

public sealed record PacientesListagemResponse(
    IReadOnlyCollection<PacienteListaResponse> Itens,
    PacientesResumoResponse Resumo,
    int Total,
    int Pagina,
    int TamanhoPagina);

/// <summary>Dados administrativos do paciente para atender a um pedido de acesso (LGPD). Nunca inclui conteúdo clínico.</summary>
public sealed record ExportacaoPacienteResponse(
    DateTimeOffset GeradoEm,
    PacienteDetalheResponse Cadastro,
    IReadOnlyCollection<ExportacaoConsultaItem> Consultas,
    IReadOnlyCollection<ExportacaoPagamentoItem> Pagamentos);

public sealed record ExportacaoConsultaItem(DateTimeOffset InicioEm, DateTimeOffset FimEm, string TipoAtendimento, string Modalidade, string Status);

public sealed record ExportacaoPagamentoItem(decimal Valor, string Status, string FormaPagamento, DateTimeOffset? VencimentoEm, DateTimeOffset? PagoEm);
