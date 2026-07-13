using GestaoPsi.Api.Models;

namespace GestaoPsi.Api.Services.Seguranca;

public interface IAuditoriaService
{
    void Registrar(
        Guid contaPsicologoId,
        Guid? usuarioId,
        string tipoAcao,
        string entidade,
        Guid? entidadeId,
        string descricao,
        object? dadosAntes = null,
        object? dadosDepois = null,
        string? ip = null,
        string? userAgent = null);
}
