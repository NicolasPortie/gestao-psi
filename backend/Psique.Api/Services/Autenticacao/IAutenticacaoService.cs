using Psique.Api.DTOs.Autenticacao;

namespace Psique.Api.Services.Autenticacao;

public interface IAutenticacaoService
{
    Task<ResultadoAutenticacao> CriarContaAsync(
        CriarContaRequest request,
        string? ip,
        CancellationToken cancellationToken);
    Task<ResultadoAutenticacao> LoginAsync(
        LoginRequest request,
        string? ip,
        CancellationToken cancellationToken);
    Task SolicitarRecuperacaoSenhaAsync(
        SolicitarRecuperacaoSenhaRequest request,
        string? ip,
        CancellationToken cancellationToken);
    Task RedefinirSenhaAsync(
        RedefinirSenhaRequest request,
        CancellationToken cancellationToken);
    Task<ResultadoAutenticacao> AlterarSenhaAsync(
        Guid usuarioId,
        Guid contaId,
        AlterarSenhaRequest request,
        CancellationToken cancellationToken);
    Task<ResultadoAutenticacao> RenovarTokenAsync(
        string refreshToken,
        CancellationToken cancellationToken);
    Task EncerrarSessaoAsync(
        string refreshToken,
        CancellationToken cancellationToken);
}
