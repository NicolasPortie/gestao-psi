using Psique.Api.Data;
using Psique.Api.Models;
using Psique.Api.Services.Seguranca;
using Psique.Api.Shared.Enums;
using Psique.Api.Shared.Excecoes;
using Microsoft.EntityFrameworkCore;

namespace Psique.Api.Tests;

public sealed class AutorizacaoContaServiceTests
{
    [Fact]
    public async Task ContaBloqueada_DeveNegarOperacaoMesmoComUsuarioAtivo()
    {
        await using var contexto = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        var conta = new ContaPsicologo { Id = Guid.NewGuid(), NomeConta = "Conta", Status = StatusContaPsicologo.Bloqueada };
        var usuario = new Usuario { Id = Guid.NewGuid(), ContaPsicologoId = conta.Id, Status = StatusUsuario.Ativo };
        contexto.AddRange(conta, usuario);
        await contexto.SaveChangesAsync();

        var erro = await Assert.ThrowsAsync<RegraNegocioException>(() =>
            new AutorizacaoContaService(contexto).ObterUsuarioAtivoAsync(usuario.Id, conta.Id, CancellationToken.None));
        Assert.Equal(403, erro.StatusCode);
    }
}
