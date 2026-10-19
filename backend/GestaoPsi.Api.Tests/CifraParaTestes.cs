using System.Runtime.CompilerServices;
using GestaoPsi.Api.Data.Cifra;

namespace GestaoPsi.Api.Tests;

/// <summary>Antes de qualquer teste: a cifra de coluna usa chaves só em memória, iguais para todo o processo.</summary>
internal static class CifraParaTestes
{
    [ModuleInitializer]
    internal static void Inicializar() => CifraDeColuna.UsarChavesEfemerasParaTestes();
}
