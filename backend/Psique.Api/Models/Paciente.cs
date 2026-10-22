using Psique.Api.Data.Cifra;
using Psique.Api.Shared.Enums;

namespace Psique.Api.Models;

public class Paciente : EntidadeDaConta
{
    public Guid Id { get; set; }
    public Guid? UsuarioId { get; set; }
    [Cifrado]
    public string NomeCompleto { get; set; } = string.Empty;
    [Cifrado]
    public DateOnly? DataNascimento { get; set; }
    public string? Cpf { get; set; }
    public string? CpfHash { get; set; }
    public string? Telefone { get; set; }
    public string? Email { get; set; }
    public StatusPaciente Status { get; set; } = StatusPaciente.Ativo;
    public string? ObservacaoAdministrativa { get; set; }
    /// <summary>Valor combinado da sessão; usado como padrão nos pagamentos criados ao agendar.</summary>
    public decimal? ValorSessao { get; set; }
    public ModoCobranca ModoCobranca { get; set; } = ModoCobranca.PorSessao;
    /// <summary>Quando o consentimento de tratamento de dados (LGPD) foi registrado pela equipe.</summary>
    public DateTimeOffset? ConsentimentoRegistradoEm { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }

    public Usuario? Usuario { get; set; }
    public ICollection<Prontuario> Prontuarios { get; set; } = [];
    public ICollection<ContatoPaciente> Contatos { get; set; } = [];
    public ICollection<Consulta> Consultas { get; set; } = [];
    public ICollection<RegistroSessao> RegistrosSessao { get; set; } = [];
    public ICollection<Pagamento> Pagamentos { get; set; } = [];
    public ICollection<ListaEspera> ListaEspera { get; set; } = [];
    public ICollection<ConversaWhatsApp> ConversasWhatsApp { get; set; } = [];
    public ICollection<SessaoBot> SessoesBot { get; set; } = [];
}
