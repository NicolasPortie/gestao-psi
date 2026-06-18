namespace GestaoPsi.Api.Services.Autenticacao;

public interface IEstadoAutenticacao
{
    Task<long> ObterTentativasLoginAsync(string identificador, CancellationToken cancellationToken);
    Task<long> RegistrarTentativaLoginAsync(
        string identificador,
        TimeSpan expiracao,
        CancellationToken cancellationToken);
    Task LimparTentativasLoginAsync(string identificador, CancellationToken cancellationToken);
    Task ArmazenarTokenRecuperacaoAsync(
        string tokenHash,
        Guid usuarioId,
        TimeSpan expiracao,
        CancellationToken cancellationToken);
    Task<Guid?> ConsumirTokenRecuperacaoAsync(
        string tokenHash,
        CancellationToken cancellationToken);
    Task RemoverTokenRecuperacaoAsync(string tokenHash, CancellationToken cancellationToken);
    Task ArmazenarRefreshTokenAsync(
        string tokenHash,
        EstadoRefreshToken estado,
        TimeSpan expiracao,
        CancellationToken cancellationToken);
    Task<EstadoRefreshToken?> ConsumirRefreshTokenAsync(
        string tokenHash,
        CancellationToken cancellationToken);
    Task RevogarRefreshTokensUsuarioAsync(Guid usuarioId, CancellationToken cancellationToken);
}
