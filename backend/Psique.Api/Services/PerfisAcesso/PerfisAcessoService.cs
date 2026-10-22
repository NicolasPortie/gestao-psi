using Psique.Api.Data;
using Psique.Api.DTOs.PerfisAcesso;
using Psique.Api.Models;
using Psique.Api.Services.Seguranca;
using Psique.Api.Shared.Enums;
using Psique.Api.Shared.Excecoes;
using Psique.Api.Shared.Texto;
using Microsoft.EntityFrameworkCore;

namespace Psique.Api.Services.PerfisAcesso;

public sealed class PerfisAcessoService(
    AppDbContext dbContext,
    IAutorizacaoContaService autorizacao,
    IAuditoriaService auditoria) : IPerfisAcessoService
{
    /// <summary>Sem acento: comparados com <see cref="TextoNormalizado"/>.</summary>
    private static readonly string[] NomesReservados = ["psicologo", "psicologa", "administrador", "administradora", "recepcionista", "paciente", "personalizado"];

    public IReadOnlyCollection<PermissaoCatalogoResponse> ListarPermissoes() =>
        CatalogoPermissoes.Itens.Select(item => new PermissaoCatalogoResponse(item.Permissao, item.Rotulo, item.Descricao)).ToArray();

    public async Task<IReadOnlyCollection<PerfilAcessoResponse>> ListarAsync(Guid usuarioId, Guid contaId, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var perfis = await dbContext.PerfisAcesso.AsNoTracking()
            .Where(x => x.ContaPsicologoId == contaId)
            .OrderBy(x => x.Nome)
            .Select(x => new { Perfil = x, Pessoas = x.Usuarios.Count })
            .ToArrayAsync(ct);
        return perfis.Select(x => Mapear(x.Perfil, x.Pessoas)).ToArray();
    }

    public async Task<PerfilAcessoResponse> CriarAsync(Guid usuarioId, Guid contaId, SalvarPerfilAcessoRequest request, string? ip, string? userAgent, CancellationToken ct)
    {
        var ator = await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var nome = ValidarNome(request.Nome);
        var permissoes = request.Permissoes.Distinct().ToArray();
        ValidarPermissoes(ator, permissoes, []);
        await GarantirNomeLivreAsync(contaId, nome, null, ct);

        var perfil = new PerfilAcesso
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = contaId,
            Nome = nome,
            Descricao = LimparDescricao(request.Descricao),
            Permissoes = PermissoesEfetivas.Serializar(permissoes)
        };
        dbContext.PerfisAcesso.Add(perfil);
        auditoria.Registrar(contaId, usuarioId, "PerfilAcessoCriado", nameof(PerfilAcesso), perfil.Id,
            $"Perfil de acesso \"{perfil.Nome}\" criado.", null, new { perfil.Nome, perfil.Permissoes }, ip, userAgent);
        await dbContext.SaveChangesAsync(ct);
        return Mapear(perfil, 0);
    }

    public async Task<PerfilAcessoResponse> AtualizarAsync(Guid usuarioId, Guid contaId, Guid id, SalvarPerfilAcessoRequest request, string? ip, string? userAgent, CancellationToken ct)
    {
        var ator = await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var perfil = await ObterAsync(contaId, id, ct);
        var nome = ValidarNome(request.Nome);
        var atuais = PermissoesEfetivas.Ler(perfil.Permissoes);
        var novas = request.Permissoes.Distinct().ToArray();
        ValidarPermissoes(ator, novas, atuais);
        await GarantirNomeLivreAsync(contaId, nome, id, ct);

        var antes = new { perfil.Nome, perfil.Permissoes };
        perfil.Nome = nome;
        perfil.Descricao = LimparDescricao(request.Descricao);
        perfil.Permissoes = PermissoesEfetivas.Serializar(novas);
        perfil.AtualizadoEm = DateTimeOffset.UtcNow;
        auditoria.Registrar(contaId, usuarioId, "PerfilAcessoAtualizado", nameof(PerfilAcesso), perfil.Id,
            $"Perfil de acesso \"{perfil.Nome}\" alterado.", antes, new { perfil.Nome, perfil.Permissoes }, ip, userAgent);
        await dbContext.SaveChangesAsync(ct);
        var pessoas = await dbContext.Usuarios.CountAsync(x => x.PerfilAcessoId == id && x.ContaPsicologoId == contaId, ct);
        return Mapear(perfil, pessoas);
    }

    public async Task RemoverAsync(Guid usuarioId, Guid contaId, Guid id, string? ip, string? userAgent, CancellationToken ct)
    {
        var ator = await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var perfil = await ObterAsync(contaId, id, ct);
        var atuais = PermissoesEfetivas.Ler(perfil.Permissoes);
        if (!atuais.IsSubsetOf(PermissoesEfetivas.Para(ator)))
            throw new RegraNegocioException("Você só pode conceder ou alterar acessos que você mesmo tem.", StatusCodes.Status403Forbidden);

        var emUso = await dbContext.Usuarios.CountAsync(x => x.PerfilAcessoId == id && x.ContaPsicologoId == contaId, ct);
        if (emUso > 0)
            throw new RegraNegocioException(
                emUso == 1
                    ? "Este perfil está com 1 pessoa. Troque o perfil dela antes de remover."
                    : $"Este perfil está com {emUso} pessoas. Troque o perfil delas antes de remover.");

        dbContext.PerfisAcesso.Remove(perfil);
        auditoria.Registrar(contaId, usuarioId, "PerfilAcessoRemovido", nameof(PerfilAcesso), perfil.Id,
            $"Perfil de acesso \"{perfil.Nome}\" removido.", new { perfil.Nome, perfil.Permissoes }, null, ip, userAgent);
        await dbContext.SaveChangesAsync(ct);
    }

    private async Task<PerfilAcesso> ObterAsync(Guid contaId, Guid id, CancellationToken ct) =>
        await dbContext.PerfisAcesso.SingleOrDefaultAsync(x => x.Id == id && x.ContaPsicologoId == contaId, ct)
        ?? throw new RegraNegocioException("Perfil não encontrado.", StatusCodes.Status404NotFound);

    /// <summary>
    /// Ninguém concede nem retira um acesso que não tem: sem esta regra, quem gerencia a equipe
    /// criaria um perfil com Auditoria ou Equipe e o daria a si mesmo.
    /// </summary>
    private static void ValidarPermissoes(Usuario ator, IReadOnlyCollection<PermissaoAcesso> novas, IReadOnlyCollection<PermissaoAcesso> atuais)
    {
        if (novas.Count == 0)
            throw new RegraNegocioException("Escolha pelo menos um acesso para o perfil.");
        if (novas.Any(p => !Enum.IsDefined(p)))
            throw new RegraNegocioException("Há um acesso desconhecido na lista.");
        var minhas = PermissoesEfetivas.Para(ator);
        if (!novas.Concat(atuais).All(minhas.Contains))
            throw new RegraNegocioException("Você só pode conceder ou alterar acessos que você mesmo tem.", StatusCodes.Status403Forbidden);
    }

    private static string ValidarNome(string nome)
    {
        var limpo = nome.Trim();
        if (limpo.Length < 2)
            throw new RegraNegocioException("Dê um nome ao perfil.");
        if (NomesReservados.Contains(TextoNormalizado.ParaComparacao(limpo)))
            throw new RegraNegocioException("Esse nome já é usado por um perfil do sistema. Escolha outro.");
        return limpo;
    }

    private static string? LimparDescricao(string? descricao) =>
        string.IsNullOrWhiteSpace(descricao) ? null : descricao.Trim();

    private async Task GarantirNomeLivreAsync(Guid contaId, string nome, Guid? ignorarId, CancellationToken ct)
    {
        var minusculo = nome.ToLower();
        var existe = await dbContext.PerfisAcesso.AnyAsync(
            x => x.ContaPsicologoId == contaId && x.Nome.ToLower() == minusculo && x.Id != ignorarId, ct);
        if (existe)
            throw new RegraNegocioException("Já existe um perfil com esse nome.");
    }

    private static PerfilAcessoResponse Mapear(PerfilAcesso perfil, int pessoas) =>
        new(perfil.Id, perfil.Nome, perfil.Descricao, PermissoesEfetivas.Ler(perfil.Permissoes).OrderBy(p => (int)p).ToArray(), pessoas);
}
