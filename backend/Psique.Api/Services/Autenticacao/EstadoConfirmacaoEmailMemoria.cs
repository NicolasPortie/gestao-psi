namespace Psique.Api.Services.Autenticacao;

public sealed class EstadoConfirmacaoEmailMemoria : IEstadoConfirmacaoEmail
{
    private readonly object _sync = new();
    private readonly Dictionary<string, Entrada> _entradas = [];

    public Task ArmazenarAsync(string chave, string hash, int tentativas, TimeSpan validade, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        lock (_sync)
        {
            foreach (var expirada in _entradas.Where(x => x.Value.ExpiraEm <= DateTimeOffset.UtcNow).Select(x => x.Key).ToArray())
                _entradas.Remove(expirada);
            _entradas[chave] = new(hash, tentativas, DateTimeOffset.UtcNow.Add(validade));
        }
        return Task.CompletedTask;
    }

    public Task<bool> ConsumirAsync(string chave, string hash, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        lock (_sync)
        {
            if (!_entradas.Remove(chave, out var entrada) || entrada.ExpiraEm <= DateTimeOffset.UtcNow)
                return Task.FromResult(false);
            if (entrada.Hash == hash) return Task.FromResult(true);
            if (entrada.Tentativas > 1) _entradas[chave] = entrada with { Tentativas = entrada.Tentativas - 1 };
            return Task.FromResult(false);
        }
    }

    public Task RemoverAsync(string chave, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        lock (_sync) _entradas.Remove(chave);
        return Task.CompletedTask;
    }

    private sealed record Entrada(string Hash, int Tentativas, DateTimeOffset ExpiraEm);
}
