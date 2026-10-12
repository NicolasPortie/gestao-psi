using GestaoPsi.Api.Data;
using GestaoPsi.Api.DTOs.Usuarios;
using GestaoPsi.Api.Models;
using GestaoPsi.Api.Services.Seguranca;
using GestaoPsi.Api.Services.Autenticacao;
using GestaoPsi.Api.Services.Usuarios;
using GestaoPsi.Api.Shared.Enums;
using GestaoPsi.Api.Shared.Excecoes;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace GestaoPsi.Api.Tests;

public sealed class UsuariosServiceTests
{
    [Fact]
    public async Task Criar_Recepcionista_DeveSalvarComHash()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var service = CriarService(contexto);

        var usuario = await service.CriarAsync(cenario.UsuarioId, cenario.ContaId,
            new CriarUsuarioRequest
            {
                NomeCompleto = "Recepcionista",
                Email = "recepcao@teste.local",
                Senha = "SenhaSegura123!",
                Perfil = PerfilUsuario.Recepcionista
            }, null, null, CancellationToken.None);

        Assert.Equal(PerfilUsuario.Recepcionista, usuario.Perfil);
        Assert.Equal(StatusUsuario.Ativo, usuario.Status);
        var salvo = await contexto.Usuarios.SingleAsync(x => x.Id == usuario.Id);
        Assert.NotEqual("SenhaSegura123!", salvo.SenhaHash);
    }

    [Fact]
    public async Task Criar_EmailDuplicado_DeveBloquear()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var service = CriarService(contexto);

        await Assert.ThrowsAsync<RegraNegocioException>(() =>
            service.CriarAsync(cenario.UsuarioId, cenario.ContaId,
                new CriarUsuarioRequest
                {
                    NomeCompleto = "Outro",
                    Email = cenario.Email,
                    Senha = "SenhaSegura123!",
                    Perfil = PerfilUsuario.Recepcionista
                }, null, null, CancellationToken.None));
    }

    [Fact]
    public async Task AlterarStatus_ProprioUsuario_DeveBloquear()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var service = CriarService(contexto);

        await Assert.ThrowsAsync<RegraNegocioException>(() =>
            service.AlterarStatusAsync(cenario.UsuarioId, cenario.ContaId, cenario.UsuarioId,
                new AlterarStatusUsuarioRequest { Status = StatusUsuario.Inativo },
                null, null, CancellationToken.None));
    }

    [Fact]
    public async Task Atualizar_DeveAlterarNomeETelefone()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var service = CriarService(contexto);

        var atualizado = await service.AtualizarAsync(cenario.UsuarioId, cenario.ContaId, cenario.UsuarioId,
            new AtualizarUsuarioRequest { NomeCompleto = "Novo Nome", Telefone = "11999999999" },
            null, null, CancellationToken.None);

        Assert.Equal("Novo Nome", atualizado.NomeCompleto);
        Assert.Equal("11999999999", atualizado.Telefone);
    }

    [Fact]
    public async Task RedefinirSenha_DeveTrocarHashEValidarNovaSenha()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var service = CriarService(contexto);
        var criado = await service.CriarAsync(cenario.UsuarioId, cenario.ContaId,
            new CriarUsuarioRequest
            {
                NomeCompleto = "Recepcionista",
                Email = "redefinir@teste.local",
                Senha = "SenhaAntiga123!",
                Perfil = PerfilUsuario.Recepcionista
            }, null, null, CancellationToken.None);

        await service.RedefinirSenhaAsync(cenario.UsuarioId, cenario.ContaId, criado.Id,
            new RedefinirSenhaUsuarioRequest { NovaSenha = "SenhaNova456!" }, null, null, CancellationToken.None);

        var salvo = await contexto.Usuarios.SingleAsync(x => x.Id == criado.Id);
        Assert.Equal(1, salvo.VersaoAutenticacao);
        Assert.Equal(
            PasswordVerificationResult.Success,
            new PasswordHasher<Usuario>().VerifyHashedPassword(salvo, salvo.SenhaHash, "SenhaNova456!"));
    }

    private static UsuariosService CriarService(AppDbContext contexto) =>
        new(contexto, new AutorizacaoContaService(contexto), new AuditoriaCaptura(),
            new PasswordHasher<Usuario>(), new EstadoAutenticacaoMemoria());

    private static async Task<Cenario> CriarCenarioAsync(AppDbContext contexto)
    {
        var contaId = Guid.NewGuid();
        var usuarioId = Guid.NewGuid();
        var email = $"{usuarioId:N}@teste.local";
        contexto.AddRange(
            new ContaPsicologo { Id = contaId, NomeConta = "Consultorio", Status = StatusContaPsicologo.Ativa },
            new Usuario
            {
                Id = usuarioId,
                ContaPsicologoId = contaId,
                NomeCompleto = "Psicologa",
                Email = email,
                SenhaHash = "hash",
                Perfil = PerfilUsuario.Psicologo,
                Status = StatusUsuario.Ativo
            });
        await contexto.SaveChangesAsync();
        return new Cenario(contaId, usuarioId, email);
    }

    private static AppDbContext CriarContexto() => new(
        new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

    private sealed record Cenario(Guid ContaId, Guid UsuarioId, string Email);

    private sealed class AuditoriaCaptura : IAuditoriaService
    {
        public void Registrar(Guid contaPsicologoId, Guid? usuarioId, string tipoAcao, string entidade,
            Guid? entidadeId, string descricao, object? dadosAntes = null, object? dadosDepois = null,
            string? ip = null, string? userAgent = null)
        {
        }
    }
}
