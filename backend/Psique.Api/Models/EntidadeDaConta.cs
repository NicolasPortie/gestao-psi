namespace Psique.Api.Models;

public abstract class EntidadeDaConta
{
    public Guid ContaPsicologoId { get; set; }

    public ContaPsicologo ContaPsicologo { get; set; } = null!;
}
