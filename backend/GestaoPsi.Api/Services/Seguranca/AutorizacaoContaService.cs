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
        var usuario = await dbContext.Usuarios.Include(item => item.PerfilAcesso).SingleOrDefaultAsync(
            item => item.Id == usuarioId &&
                    item.ContaPsicologoId == contaPsicologoId &&
                    item.Status == StatusUsuario.Ativo &&
                    item.ContaPsicologo.Status == StatusContaPsicologo.Ativa,
            cancellationToken);

        return usuario ?? throw new RegraNegocioException(
            "Sua sessão não possui permissão para esta operação.",
            StatusCodes.Status403Forbidden);
    }
}
