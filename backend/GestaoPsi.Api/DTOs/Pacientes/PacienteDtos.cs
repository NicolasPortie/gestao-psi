using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.DTOs.Pacientes;

public sealed record ListarPacientesRequest(
    string? Busca,
    StatusPaciente? Status,
    int Pagina = 1,
    int TamanhoPagina = 20);

public sealed record CriarPacienteRequest(
    string NomeCompleto,
    DateOnly? DataNascimento,
    string? Cpf,
    string? Telefone,
    string? WhatsApp,
    string? Email,
    string? ObservacaoAdministrativa,
    IReadOnlyCollection<ContatoPacienteRequest>? ContatosAdicionais = null);

public sealed record AtualizarPacienteRequest(
    string NomeCompleto,
    DateOnly? DataNascimento,
    string? Cpf,
    string? Telefone,
    string? WhatsApp,
    string? Email,
    string? ObservacaoAdministrativa,
    StatusPaciente Status,
    IReadOnlyCollection<ContatoPacienteRequest>? ContatosAdicionais = null);

public sealed record ContatoPacienteRequest(
    TipoContato TipoContato,
    string Valor,
    bool Principal);

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
    string? Telefone,
    string? WhatsApp,
    string? Email,
    string Status,
    string? ObservacaoAdministrativa,
    IReadOnlyCollection<ContatoPacienteResponse> ContatosAdicionais,
    string? UltimaConsulta,
    string? ProximaConsulta,
    DateTimeOffset CriadoEm,
    DateTimeOffset? AtualizadoEm);

public sealed record ContatoPacienteResponse(
    Guid Id,
    string TipoContato,
    string Valor,
    bool Principal);

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
