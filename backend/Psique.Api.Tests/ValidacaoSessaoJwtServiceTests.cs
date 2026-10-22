using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Psique.Api.Configuracoes;
using Psique.Api.Data;
using Psique.Api.Models;
using Psique.Api.Services.Autenticacao;
using Psique.Api.Services.Seguranca;
using Psique.Api.Shared.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Psique.Api.Tests;

public sealed class ValidacaoSessaoJwtServiceTests
{
    [Theory]
    [InlineData("nenhuma", true)]
    [InlineData("senha", false)]
    [InlineData("perfil", false)]
    [InlineData("usuario", false)]
    [InlineData("conta", false)]
    public async Task TokenEmitido_DeveRespeitarEstadoAtual(string alteracao, bool permitido)
    {
        await using var contexto = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        var conta = new ContaPsicologo { Id = Guid.NewGuid(), NomeConta = "Conta", Status = StatusContaPsicologo.Ativa };
        var usuario = new Usuario { Id = Guid.NewGuid(), ContaPsicologoId = conta.Id,
            Perfil = PerfilUsuario.Psicologo, Status = StatusUsuario.Ativo };
        contexto.AddRange(conta, usuario);
        await contexto.SaveChangesAsync();
        var token = new TokenService(Options.Create(new JwtConfiguracao
        {
            Chave = "chave-exclusiva-testes-com-mais-de-32-caracteres", Emissor = "teste", Audiencia = "teste",
        })).GerarAccessToken(usuario);
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
            new JwtSecurityTokenHandler().ReadJwtToken(token.Token).Claims, "Bearer"));
        switch (alteracao)
        {
            case "senha": usuario.VersaoAutenticacao++; break;
            case "perfil": usuario.Perfil = PerfilUsuario.Recepcionista; break;
            case "usuario": usuario.Status = StatusUsuario.Inativo; break;
            case "conta": conta.Status = StatusContaPsicologo.Bloqueada; break;
        }
        await contexto.SaveChangesAsync();
        var validacao = new ValidacaoSessaoJwtService(new AutorizacaoContaService(contexto));
        Assert.Equal(permitido, await validacao.ValidarAsync(principal, CancellationToken.None));
    }
}
