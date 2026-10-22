using Psique.Api.Data;
using Psique.Api.DTOs.Notificacoes;
using Psique.Api.Models;
using Psique.Api.Services.Seguranca;
using Psique.Api.Shared.Excecoes;
using Psique.Api.Shared.Paginacao;
using Microsoft.EntityFrameworkCore;

namespace Psique.Api.Services.Notificacoes;

public sealed class NotificacoesService(
    AppDbContext dbContext,
    IAutorizacaoContaService autorizacao) : INotificacoesService
{
    public async Task<ResultadoPaginado<NotificacaoResponse>> ListarAsync(
        Guid usuarioId,
        Guid contaId,
        FiltroNotificacaoRequest filtro,
        CancellationToken cancellationToken)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, cancellationToken);
        var (pagina, tamanhoPagina) = ParametrosPaginacao.Normalizar(filtro.Pagina, filtro.TamanhoPagina);

        var consulta = dbContext.Notificacoes.AsNoTracking()
            .Where(item => item.ContaPsicologoId == contaId && item.UsuarioId == usuarioId);

        if (filtro.Lida is not null)
            consulta = consulta.Where(item => item.Lida == filtro.Lida);
        if (!string.IsNullOrWhiteSpace(filtro.Tipo))
            consulta = consulta.Where(item => item.Tipo == filtro.Tipo);

        var total = await consulta.CountAsync(cancellationToken);

        var itens = await consulta
            .OrderByDescending(item => item.CriadoEm)
            .Skip((pagina - 1) * tamanhoPagina)
            .Take(tamanhoPagina)
            .ToArrayAsync(cancellationToken);

        return new ResultadoPaginado<NotificacaoResponse>(itens.Select(Mapear).ToArray(), total, pagina, tamanhoPagina);
    }

    public async Task<int> ContarNaoLidasAsync(Guid usuarioId, Guid contaId, CancellationToken cancellationToken)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, cancellationToken);
        return await dbContext.Notificacoes.CountAsync(
            item => item.ContaPsicologoId == contaId && item.UsuarioId == usuarioId && !item.Lida,
            cancellationToken);
    }

    public async Task<NotificacaoResponse> MarcarComoLidaAsync(
        Guid usuarioId,
        Guid contaId,
        Guid id,
        CancellationToken cancellationToken)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, cancellationToken);
        var item = await dbContext.Notificacoes.SingleOrDefaultAsync(
            n => n.Id == id && n.ContaPsicologoId == contaId && n.UsuarioId == usuarioId,
            cancellationToken) ?? throw new RegraNegocioException("Notificação não encontrada.", StatusCodes.Status404NotFound);

        if (!item.Lida)
        {
            item.Lida = true;
            item.LidaEm = DateTimeOffset.UtcNow;
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        return Mapear(item);
    }

    public async Task<int> MarcarTodasComoLidasAsync(Guid usuarioId, Guid contaId, CancellationToken cancellationToken)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, cancellationToken);
        var itens = await dbContext.Notificacoes
            .Where(item => item.ContaPsicologoId == contaId && item.UsuarioId == usuarioId && !item.Lida)
            .ToListAsync(cancellationToken);

        if (itens.Count == 0)
            return 0;

        var agora = DateTimeOffset.UtcNow;
        foreach (var item in itens)
        {
            item.Lida = true;
            item.LidaEm = agora;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return itens.Count;
    }

    public async Task CriarAsync(
        Guid contaId,
        Guid usuarioId,
        string titulo,
        string mensagem,
        string tipo,
        CancellationToken cancellationToken)
    {
        dbContext.Notificacoes.Add(new Notificacao
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = contaId,
            UsuarioId = usuarioId,
            Titulo = titulo.Trim(),
            Mensagem = mensagem.Trim(),
            Tipo = tipo.Trim(),
            Lida = false
        });
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static NotificacaoResponse Mapear(Notificacao item) => new(
        item.Id,
        item.Titulo,
        item.Mensagem,
        item.Tipo,
        item.Lida,
        item.LidaEm,
        item.CriadoEm,
        UrlOrigem(item.Tipo));

    private static string? UrlOrigem(string tipo) => tipo.ToLowerInvariant() switch
    {
        "lembrete" or "lembrete_falha" => "/lembretes",
        "agenda" or "consulta" => "/agenda",
        "pagamento" or "financeiro" => "/pagamentos",
        "lista_espera" => "/lista-espera",
        "whatsapp" or "conversa" => "/integracoes/whatsapp/conversas",
        _ => null
    };
}
