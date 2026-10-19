using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.DataProtection;

namespace GestaoPsi.Api.Data.Cifra;

/// <summary>
/// Cifra de coluna aplicada pelo EF Core a toda propriedade marcada com <see cref="CifradoAttribute"/>: o banco só
/// guarda <c>cf1:</c> + o texto protegido pela Data Protection (AES-256-CBC + HMAC-SHA256, chaves com rotação).
/// Valores sem o prefixo são dados antigos, ainda em texto, que <see cref="MigracaoCifraColunas"/> cifra na subida.
/// Como a cifra é aleatória, buscas usam um hash HMAC à parte (ex.: <c>Usuario.EmailHash</c>).
/// </summary>
public static class CifraDeColuna
{
    public const string Prefixo = "cf1:";
    private const string Proposito = "GestaoPsi.Colunas.v1";

    private static IDataProtector? _protetor;
    private static byte[]? _chaveHash;
    private static bool _modoTeste;

    /// <summary>Chamado uma vez na subida da API, antes de qualquer acesso ao banco.</summary>
    public static void Configurar(IDataProtectionProvider provedor, byte[] chaveHash)
    {
        if (_modoTeste) return;
        if (chaveHash.Length < 32) throw new InvalidOperationException("Seguranca:ChaveHashDados precisa de pelo menos 32 bytes.");
        _protetor = provedor.CreateProtector(Proposito);
        _chaveHash = chaveHash;
    }

    /// <summary>
    /// Só para testes automatizados: chaves em memória, fixas durante o processo (hosts de teste em paralelo não as trocam).
    /// Nada cifrado assim sobrevive ao processo, de propósito.
    /// </summary>
    public static void UsarChavesEfemerasParaTestes()
    {
        _modoTeste = true;
        _protetor ??= new EphemeralDataProtectionProvider().CreateProtector(Proposito);
        _chaveHash ??= RandomNumberGenerator.GetBytes(32);
    }

    public static bool Configurada => _protetor is not null;

    // Sem configuração não há fallback: gravar com uma chave improvisada perderia os dados na próxima subida.
    private static IDataProtector Protetor => _protetor ?? throw new InvalidOperationException("Cifra de coluna não configurada: chame CifraDeColuna.Configurar na subida.");
    private static byte[] ChaveHash => _chaveHash ?? throw new InvalidOperationException("Cifra de coluna não configurada: chame CifraDeColuna.Configurar na subida.");

    public static string Cifrar(string valor) => Prefixo + Protetor.Protect(valor);

    public static string Decifrar(string valor) =>
        valor.StartsWith(Prefixo, StringComparison.Ordinal) ? Protetor.Unprotect(valor[Prefixo.Length..]) : valor;

    public static string CifrarData(DateOnly data) => Cifrar(data.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture));

    public static DateOnly DecifrarData(string valor) => DateOnly.Parse(Decifrar(valor), CultureInfo.InvariantCulture);

    /// <summary>Hash HMAC-SHA256 para localizar sem decifrar (igualdade exata, nunca "contém").</summary>
    public static string Hash(string valor)
    {
        using var hmac = new HMACSHA256(ChaveHash);
        return Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(valor)));
    }

    public static string HashEmail(string email) => Hash(email.Trim().ToLowerInvariant());

    public static string HashTelefone(string telefone) => Hash(new string(telefone.Where(char.IsDigit).ToArray()));
}

/// <summary>Marca a propriedade cujo valor nunca fica em texto aberto no banco.</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class CifradoAttribute : Attribute;
