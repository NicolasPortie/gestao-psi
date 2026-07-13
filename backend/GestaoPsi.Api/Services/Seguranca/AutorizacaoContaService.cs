using GestaoPsi.Api.Data;
using GestaoPsi.Api.Models;
using GestaoPsi.Api.Shared.Enums;
using GestaoPsi.Api.Shared.Excecoes;
using Microsoft.EntityFrameworkCore;

namespace GestaoPsi.Api.Services.Seguranca;

public sealed class AutorizacaoContaService(AppDbContext dbContext) : IAutorizacaoContaService
{
    public async Task<Usuario> ObterUsuarioAtivoAsync(
        Guid usuarioId,
        Guid contaPsicologoId,
        CancellationToken cancellationToken)
    {
        var usuario = await dbContext.Usuarios.SingleOrDefaultAsync(
            item => item.Id == usuarioId &&
                    item.ContaPsicologoId == contaPsicologoId &&
                    item.Status == StatusUsuario.Ativo,
            cancellationToken);

        return usuario ?? throw new RegraNegocioException(
            "Sua sessao nao possui permissao para esta operacao.",
            StatusCodes.Status403Forbidden);
    }
}
