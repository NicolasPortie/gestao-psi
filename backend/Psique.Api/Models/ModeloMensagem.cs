using Psique.Api.Data.Cifra;
using Psique.Api.Shared.Enums;

namespace Psique.Api.Models;

public class ModeloMensagem : EntidadeDaConta
{
    public Guid Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public TipoLembrete Tipo { get; set; }
    public CanalComunicacao Canal { get; set; } = CanalComunicacao.Email;
    [Cifrado]
    public string? Assunto { get; set; }
    [Cifrado]
    public string Conteudo { get; set; } = string.Empty;
    public bool Ativo { get; set; } = true;
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }

    public ICollection<Lembrete> Lembretes { get; set; } = [];
}
