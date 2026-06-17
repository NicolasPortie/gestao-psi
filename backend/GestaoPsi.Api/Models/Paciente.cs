using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.Models;

public class Paciente
{
    public Guid Id { get; set; }
    public Guid? UsuarioId { get; set; }
    public string NomeCompleto { get; set; } = string.Empty;
    public DateOnly? DataNascimento { get; set; }
    public string? Cpf { get; set; }
    public string? Telefone { get; set; }
    public string? Email { get; set; }
    public StatusPaciente Status { get; set; } = StatusPaciente.Ativo;
    public string? ObservacaoAdministrativa { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }

    public Usuario? Usuario { get; set; }
    public ICollection<ContatoPaciente> Contatos { get; set; } = [];
    public ICollection<Consulta> Consultas { get; set; } = [];
    public ICollection<RegistroSessao> RegistrosSessao { get; set; } = [];
    public ICollection<Pagamento> Pagamentos { get; set; } = [];
    public ICollection<ListaEspera> ListaEspera { get; set; } = [];
    public ICollection<ConversaWhatsApp> ConversasWhatsApp { get; set; } = [];
    public ICollection<SessaoBot> SessoesBot { get; set; } = [];
}
