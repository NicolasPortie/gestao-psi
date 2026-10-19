using GestaoPsi.Api.Configuracoes;
using Microsoft.Extensions.Options;
using StackExchange.Redis;

namespace GestaoPsi.Api.Services.Autenticacao;

public sealed class EstadoConfirmacaoEmailRedis(IConnectionMultiplexer redis, IOptions<RedisConfiguracao> configuracao) : IEstadoConfirmacaoEmail
{
    private readonly IDatabase _database = redis.GetDatabase();
    private RedisKey Chave(string chave) => $"{configuracao.Value.Prefixo}auth:confirmacao-email:{chave}";

    public async Task ArmazenarAsync(string chave, string hash, int tentativas, TimeSpan validade, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        const string script = """
            redis.call('HSET', KEYS[1], 'hash', ARGV[1], 'tentativas', ARGV[2])
            redis.call('PEXPIRE', KEYS[1], ARGV[3])
            return 1
            """;
        await _database.ScriptEvaluateAsync(script, [Chave(chave)], [hash, tentativas, (long)validade.TotalMilliseconds]);
    }

    public async Task<bool> ConsumirAsync(string chave, string hash, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        const string script = """
            local valor = redis.call('HGET', KEYS[1], 'hash')
            if not valor then return 0 end
            if valor == ARGV[1] then redis.call('DEL', KEYS[1]); return 1 end
            if redis.call('HINCRBY', KEYS[1], 'tentativas', -1) <= 0 then redis.call('DEL', KEYS[1]) end
            return 0
            """;
        return (long)await _database.ScriptEvaluateAsync(script, [Chave(chave)], [hash]) == 1;
    }

    public async Task RemoverAsync(string chave, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        await _database.KeyDeleteAsync(Chave(chave));
    }
}
