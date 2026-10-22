using Psique.Api.Data;
using Psique.Api.Models;
using Psique.Api.Services.DadosProfissionais;
using Psique.Api.Services.Seguranca;
using Psique.Api.Shared.Enums;
using Psique.Api.Shared.Excecoes;
using Microsoft.EntityFrameworkCore;

namespace Psique.Api.Tests;

public sealed class PerfilProfissionalInicialTests
{
    private static readonly CancellationToken Ct = CancellationToken.None;

    [Fact]
    public async Task Adiar_PersistePreferenciaSemCriarRegistroProfissional()
    {
        await using var db = Contexto();
        var usuario = await AdicionarPsicologo(db);
        var service = Service(db);
        Assert.Equal(new(true, true), await service.ObterSituacaoAsync(usuario.Id, usuario.ContaPsicologoId, Ct));
        await service.AdiarAsync(usuario.Id, usuario.ContaPsicologoId, Ct);
        db.ChangeTracker.Clear();
        Assert.Equal(new(true, false), await Service(db).ObterSituacaoAsync(usuario.Id, usuario.ContaPsicologoId, Ct));
        Assert.NotNull((await db.ContasPsicologo.SingleAsync()).PerfilProfissionalAdiadoEm);
        Assert.Empty(db.DadosProfissionaisPsicologo);
    }

    [Fact]
    public async Task Completar_CriaRegistroProtegidoEAtualizaNomeDoTitular()
    {
        await using var db = Contexto();
        var usuario = await AdicionarPsicologo(db);
        var service = Service(db);
        await service.SalvarAsync(usuario.Id, usuario.ContaPsicologoId, new() { NomeProfissional = " Ana Silva ", Crp = "06/123456" }, null, null, Ct);
        var dados = await db.DadosProfissionaisPsicologo.SingleAsync();
        Assert.Equal(usuario.Id, dados.UsuarioId);
        Assert.Equal("protegido:06123456", dados.Crp);
        Assert.Equal("Ana Silva", usuario.NomeCompleto);
        Assert.Equal("Ana Silva", (await db.ContasPsicologo.SingleAsync()).NomeConta);
        Assert.Equal(new(false, false), await service.ObterSituacaoAsync(usuario.Id, usuario.ContaPsicologoId, Ct));
    }

    [Fact]
    public async Task Completar_RecusaCrpInvalidoSemPersistirDados()
    {
        await using var db = Contexto();
        var usuario = await AdicionarPsicologo(db);
        await Assert.ThrowsAsync<RegraNegocioException>(() => Service(db).SalvarAsync(usuario.Id, usuario.ContaPsicologoId, new() { NomeProfissional = "Ana Silva", Crp = "1234" }, null, null, Ct));
        Assert.Empty(db.DadosProfissionaisPsicologo);
        Assert.Empty(usuario.NomeCompleto);
    }

    [Fact]
    public async Task EstadoEAdiamento_NaoPermitemAcessarOutraConta()
    {
        await using var db = Contexto();
        var usuario = await AdicionarPsicologo(db);
        var outraConta = await AdicionarPsicologo(db);
        var service = Service(db);
        await Assert.ThrowsAsync<RegraNegocioException>(() => service.AdiarAsync(usuario.Id, outraConta.ContaPsicologoId, Ct));
        await Assert.ThrowsAsync<RegraNegocioException>(() => service.ObterSituacaoAsync(usuario.Id, outraConta.ContaPsicologoId, Ct));
        Assert.All(await db.ContasPsicologo.ToArrayAsync(), conta => Assert.Null(conta.PerfilProfissionalAdiadoEm));
    }

    private static AppDbContext Contexto() => new(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
    private static DadosProfissionaisService Service(AppDbContext db) => new(db, new AutorizacaoContaService(db), new AuditoriaFake(), new ProtecaoFake());
    private static async Task<Usuario> AdicionarPsicologo(AppDbContext db)
    {
        var conta = new ContaPsicologo { Id = Guid.NewGuid() };
        var usuario = new Usuario { Id = Guid.NewGuid(), ContaPsicologoId = conta.Id, Email = $"{Guid.NewGuid():N}@teste.local", SenhaHash = "hash", Perfil = PerfilUsuario.Psicologo, ContaPsicologo = conta };
        db.Add(usuario);
        await db.SaveChangesAsync();
        return usuario;
    }
    private sealed class ProtecaoFake : IProtecaoDadosService
    {
        public string Proteger(string valor) => $"protegido:{valor}";
        public string Desproteger(string valorProtegido) => valorProtegido.Replace("protegido:", "");
        public string HashDeterministico(string valor) => $"hash:{valor}";
        public string HashToken(string token) => throw new NotSupportedException();
        public string GerarTokenSeguro() => throw new NotSupportedException();
    }
    private sealed class AuditoriaFake : IAuditoriaService
    {
        public void Registrar(Guid contaPsicologoId, Guid? usuarioId, string tipoAcao, string entidade, Guid? entidadeId, string descricao, object? dadosAntes = null, object? dadosDepois = null, string? ip = null, string? userAgent = null) { }
    }
}
