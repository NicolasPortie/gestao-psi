using GestaoPsi.Api.Data.Cifra;
using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.Models;

public class HistoricoConsulta : EntidadeDaConta
{
    public Guid Id { get; set; }
    public Guid ConsultaId { get; set; }
    public Guid? UsuarioId { get; set; }
    public StatusConsulta? StatusAnterior { get; set; }
    public StatusConsulta StatusNovo { get; set; }
    [Cifrado]
    public string? Descricao { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;

    public Consulta Consulta { get; set; } = null!;
    public Usuario? Usuario { get; set; }
}
