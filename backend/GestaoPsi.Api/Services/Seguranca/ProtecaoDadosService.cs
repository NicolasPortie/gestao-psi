using System.Security.Cryptography;
using System.Text;
using GestaoPsi.Api.Configuracoes;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Options;

namespace GestaoPsi.Api.Services.Seguranca;

public sealed class ProtecaoDadosService : IProtecaoDadosService
{
    private readonly IDataProtector _protetor;
    private readonly byte[] _chaveHash;

    public ProtecaoDadosService(
        IDataProtectionProvider dataProtectionProvider,
        IOptions<SegurancaConfiguracao> configuracao)
    {
        _protetor = dataProtectionProvider.CreateProtector("GestaoPsi.DadosSensiveis.v1");
        _chaveHash = Convert.FromBase64String(configuracao.Value.ChaveHashDados);
    }

    public string Proteger(string valor) => _protetor.Protect(valor);

    public string Desproteger(string valorProtegido) => _protetor.Unprotect(valorProtegido);

    public string HashDeterministico(string valor)
    {
        using var hmac = new HMACSHA256(_chaveHash);
        return Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(valor)));
    }

    public string HashToken(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

    public string GerarTokenSeguro() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(48))
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
}
