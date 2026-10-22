using Psique.Api.Data;
using Psique.Api.Models;
using Microsoft.EntityFrameworkCore;
using Xunit.Abstractions;

namespace Psique.Api.Tests;

public sealed class ModeloRelacionalTests(ITestOutputHelper output)
{
    [Fact]
    public void EntidadesEF_TodasAsRelacoesPreservamContaEHistorico()
    {
        using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer("Server=(localdb)\\MSSQLLocalDB;Database=ModeloSemConexao;Integrated Security=true")
            .Options);
        var entidades = db.Model.GetEntityTypes().ToArray();
        var tiposDaConta = typeof(EntidadeDaConta).Assembly.GetTypes()
            .Where(x => x.IsSubclassOf(typeof(EntidadeDaConta)) && !x.IsAbstract);
        foreach (var tipo in tiposDaConta) Assert.NotNull(db.Model.FindEntityType(tipo));

        foreach (var entidade in entidades.OrderBy(x => x.ClrType.Name))
        {
            Assert.DoesNotContain(entidade.GetProperties(), x => x.IsShadowProperty());
            var fks = entidade.GetForeignKeys().ToArray();
            foreach (var fk in fks)
            {
                Assert.Equal(DeleteBehavior.Restrict, fk.DeleteBehavior);
                if (typeof(EntidadeDaConta).IsAssignableFrom(fk.PrincipalEntityType.ClrType))
                {
                    Assert.Contains(fk.Properties, x => x.Name == nameof(EntidadeDaConta.ContaPsicologoId));
                    Assert.Contains(fk.PrincipalKey.Properties, x => x.Name == nameof(EntidadeDaConta.ContaPsicologoId));
                }
            }

            if (typeof(EntidadeDaConta).IsAssignableFrom(entidade.ClrType))
            {
                Assert.False(entidade.FindProperty(nameof(EntidadeDaConta.ContaPsicologoId))!.IsNullable);
                Assert.Contains(fks, x => x.PrincipalEntityType.ClrType == typeof(ContaPsicologo));
            }

            var relacoes = fks.Select(fk => $"{fk.PrincipalEntityType.ClrType.Name}({string.Join(",", fk.Properties.Select(x => x.Name))}; {(fk.IsUnique ? "1:1" : "1:N")}; {(fk.IsRequired ? "obrigatoria" : "opcional")})");
            var unicos = entidade.GetIndexes().Where(x => x.IsUnique)
                .Select(x => $"[{string.Join(",", x.Properties.Select(p => p.Name))}] {x.GetFilter() ?? "sem filtro"}");
            output.WriteLine($"{entidade.ClrType.Name}: {string.Join("; ", relacoes)} | unicos: {string.Join("; ", unicos)}");
        }
        output.WriteLine($"TOTAL: {entidades.Length} entidades / {entidades.Sum(x => x.GetForeignKeys().Count())} FKs.");
    }
}
