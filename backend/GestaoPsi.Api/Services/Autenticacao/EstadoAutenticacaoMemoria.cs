using System.Collections.Concurrent;

namespace GestaoPsi.Api.Services.Autenticacao;

public sealed class EstadoAutenticacaoMemoria : IEstadoAutenticacao
{
    private readonly object _sync = new();
    private readonly ConcurrentDictionary<string, ContadorExpiravel> _tentativas = [];
    private readonly ConcurrentDictionary<string, ValorExpiravel<Guid>> _tokensRecuperacao = [];
    private readonly ConcurrentDictionary<string, ValorExpiravel<EstadoRefreshToken>> _refreshTokens = [];
    private readonly ConcurrentDictionary<Guid, ConcurrentDictionary<string, byte>> _refreshTokensPorUsuario = [];

    public Task<long> ObterTentativasLoginAsync(
        string identificador,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (!_tentativas.TryGetValue(identificador, out var contador) ||
            contador.ExpiraEm <= DateTimeOffset.UtcNow)
        {
            _tentativas.TryRemove(identificador, out _);
            return Task.FromResult(0L);
        }

        return Task.FromResult(contador.Total);
    }

    public Task<long> RegistrarTentativaLoginAsync(
        string identificador,
        TimeSpan expiracao,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        lock (_sync)
        {
            var agora = DateTimeOffset.UtcNow;
            if (!_tentativas.TryGetValue(identificador, out var contador) ||
                contador.ExpiraEm <= agora)
            {
                contador = new ContadorExpiravel(0, agora.Add(expiracao));
            }

            contador = contador with { Total = contador.Total + 1 };
            _tentativas[identificador] = contador;
            return Task.FromResult(contador.Total);
        }
    }

    public Task LimparTentativasLoginAsync(
        string identificador,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        _tentativas.TryRemove(identificador, out _);
        return Task.CompletedTask;
    }

    public Task ArmazenarTokenRecuperacaoAsync(
        string tokenHash,
        Guid usuarioId,
        TimeSpan expiracao,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        _tokensRecuperacao[tokenHash] = new ValorExpiravel<Guid>(
            usuarioId,
            DateTimeOffset.UtcNow.Add(expiracao));
        return Task.CompletedTask;
    }

    public Task<Guid?> ConsumirTokenRecuperacaoAsync(
        string tokenHash,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (!_tokensRecuperacao.TryRemove(tokenHash, out var token) ||
            token.ExpiraEm <= DateTimeOffset.UtcNow)
        {
            return Task.FromResult<Guid?>(null);
        }

        return Task.FromResult<Guid?>(token.Valor);
    }

    public Task RemoverTokenRecuperacaoAsync(
        string tokenHash,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        _tokensRecuperacao.TryRemove(tokenHash, out _);
        return Task.CompletedTask;
    }

    public Task ArmazenarRefreshTokenAsync(
        string tokenHash,
        EstadoRefreshToken estado,
        TimeSpan expiracao,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        _refreshTokens[tokenHash] = new ValorExpiravel<EstadoRefreshToken>(
            estado,
            DateTimeOffset.UtcNow.Add(expiracao));

        var tokensUsuario = _refreshTokensPorUsuario.GetOrAdd(
            estado.UsuarioId,
            _ => []);
        tokensUsuario[tokenHash] = 0;
        return Task.CompletedTask;
    }

    public Task<EstadoRefreshToken?> ConsumirRefreshTokenAsync(
        string tokenHash,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (!_refreshTokens.TryRemove(tokenHash, out var token) ||
            token.ExpiraEm <= DateTimeOffset.UtcNow)
        {
            return Task.FromResult<EstadoRefreshToken?>(null);
        }

        if (_refreshTokensPorUsuario.TryGetValue(
                token.Valor.UsuarioId,
                out var tokensUsuario))
        {
            tokensUsuario.TryRemove(tokenHash, out _);
        }

        return Task.FromResult<EstadoRefreshToken?>(token.Valor);
    }

    public Task RevogarRefreshTokensUsuarioAsync(
        Guid usuarioId,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (_refreshTokensPorUsuario.TryRemove(usuarioId, out var tokensUsuario))
        {
            foreach (var tokenHash in tokensUsuario.Keys)
            {
                _refreshTokens.TryRemove(tokenHash, out _);
            }
        }

        return Task.CompletedTask;
    }

    private sealed record ContadorExpiravel(long Total, DateTimeOffset ExpiraEm);
    private sealed record ValorExpiravel<T>(T Valor, DateTimeOffset ExpiraEm);
}
