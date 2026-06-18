using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.Models;

public class TipoAtendimento : EntidadeDaConta
{
    public Guid Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public int DuracaoMinutos { get; set; } = 50;
    public decimal? ValorPadrao { get; set; }
    public ModalidadeAtendimento ModalidadePadrao { get; set; } = ModalidadeAtendimento.Presencial;
    public bool Ativo { get; set; } = true;
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }

    public ICollection<Consulta> Consultas { get; set; } = [];
    public ICollection<RegistroSessao> RegistrosSessao { get; set; } = [];
    public ICollection<ListaEspera> ListaEspera { get; set; } = [];
}
