using System.Runtime.CompilerServices;
using Psique.Api.Data.Cifra;

namespace Psique.Api.Tests;

/// <summary>Antes de qualquer teste: a cifra de coluna usa chaves só em memória, iguais para todo o processo.</summary>
internal static class CifraParaTestes
{
    [ModuleInitializer]
    internal static void Inicializar() => CifraDeColuna.UsarChavesEfemerasParaTestes();
}
