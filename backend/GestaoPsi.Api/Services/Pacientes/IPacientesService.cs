using GestaoPsi.Api.DTOs.Pacientes;

namespace GestaoPsi.Api.Services.Pacientes;

public interface IPacientesService
{
    Task<PacientesListagemResponse> ListarAsync(
        Guid usuarioId,
        Guid contaPsicologoId,
        ListarPacientesRequest request,
        CancellationToken cancellationToken);

    Task<PacienteDetalheResponse> ObterPorIdAsync(
        Guid contaPsicologoId,
        Guid pacienteId,
        CancellationToken cancellationToken);

    Task<PacienteDetalheResponse> CriarAsync(
        Guid usuarioId,
        Guid contaPsicologoId,
        CriarPacienteRequest request,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken);

    Task<PacienteDetalheResponse> AtualizarAsync(
        Guid usuarioId,
        Guid contaPsicologoId,
        Guid pacienteId,
        AtualizarPacienteRequest request,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken);

    Task<PacienteDetalheResponse> AlterarStatusAsync(
        Guid usuarioId,
        Guid contaPsicologoId,
        Guid pacienteId,
        bool ativar,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken);
    Task<PacienteDetalheResponse> RegistrarConsentimentoAsync(Guid usuarioId, Guid contaPsicologoId, Guid pacienteId, string? ip, string? userAgent, CancellationToken cancellationToken);
    Task<ExportacaoPacienteResponse> ExportarAsync(Guid usuarioId, Guid contaPsicologoId, Guid pacienteId, string? ip, string? userAgent, CancellationToken cancellationToken);
}
