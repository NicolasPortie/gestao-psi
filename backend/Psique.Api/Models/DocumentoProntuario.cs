using Psique.Api.Data.Cifra;
using Psique.Api.Shared.Enums;

namespace Psique.Api.Models;

public class DocumentoProntuario : EntidadeDaConta
{
    public Guid Id { get; set; }
    public Guid ProntuarioId { get; set; }
    public Guid PacienteId { get; set; }
    public Guid CriadoPorUsuarioId { get; set; }
    public Guid? FinalizadoPorUsuarioId { get; set; }
    public TipoDocumentoPsicologico Tipo { get; set; }
    public StatusDocumentoProntuario Status { get; set; } = StatusDocumentoProntuario.Rascunho;
    [Cifrado]
    public string Titulo { get; set; } = string.Empty;
    [Cifrado]
    public string? Finalidade { get; set; }
    [Cifrado]
    public string? Solicitante { get; set; }
    public string? ConteudoAtualJson { get; set; }
    public string? HashConteudoFinal { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }
    public DateTimeOffset? FinalizadoEm { get; set; }
    public DateTimeOffset? ArquivadoEm { get; set; }

    public Prontuario Prontuario { get; set; } = null!;
    public Paciente Paciente { get; set; } = null!;
    public Usuario CriadoPorUsuario { get; set; } = null!;
    public Usuario? FinalizadoPorUsuario { get; set; }
    public ICollection<VersaoDocumentoProntuario> Versoes { get; set; } = [];
    public ICollection<ProtocoloEntregaDocumento> ProtocolosEntrega { get; set; } = [];
}
