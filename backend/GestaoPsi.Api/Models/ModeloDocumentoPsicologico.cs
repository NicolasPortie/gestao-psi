using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.Models;

public class ModeloDocumentoPsicologico : EntidadeDaConta
{
    public Guid Id { get; set; }
    public TipoDocumentoPsicologico Tipo { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string EstruturaJson { get; set; } = string.Empty;
    public bool PadraoSistema { get; set; }
    public bool Ativo { get; set; } = true;
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }
}
