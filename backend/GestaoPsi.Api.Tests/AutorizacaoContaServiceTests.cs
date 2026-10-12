using GestaoPsi.Api.Data;
using GestaoPsi.Api.Models;
using GestaoPsi.Api.Services.Seguranca;
using GestaoPsi.Api.Shared.Enums;
using GestaoPsi.Api.Shared.Excecoes;
using Microsoft.EntityFrameworkCore;

namespace GestaoPsi.Api.Tests;

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
