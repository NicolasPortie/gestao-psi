namespace Psique.Api.Services.Autenticacao;

public interface IEstadoConfirmacaoEmail
{
    Task ArmazenarAsync(string chave, string hash, int tentativas, TimeSpan validade, CancellationToken cancellationToken);
    // Compara, desconta tentativa e consome o valor correto na mesma operação atômica.
    Task<bool> ConsumirAsync(string chave, string hash, CancellationToken cancellationToken);
    Task RemoverAsync(string chave, CancellationToken cancellationToken);
}
