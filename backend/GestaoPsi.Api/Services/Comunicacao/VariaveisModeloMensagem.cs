namespace GestaoPsi.Api.Services.Comunicacao;

public static class VariaveisModeloMensagem
{
    public const string NomePaciente = "nome_paciente";
    public const string DataConsulta = "data_consulta";
    public const string HorarioConsulta = "horario_consulta";
    public const string Modalidade = "modalidade";
    public const string Endereco = "endereco";
    public const string LinkSessaoOnline = "link_sessao_online";
    public const string RegrasCancelamento = "regras_cancelamento";
    public const string RegrasRemarcacao = "regras_remarcacao";
    public const string NomeProfissional = "nome_profissional";

    public static readonly IReadOnlyDictionary<string, string> Catalogo = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        [NomePaciente] = "Nome do paciente",
        [DataConsulta] = "Data da consulta",
        [HorarioConsulta] = "Horário da consulta",
        [Modalidade] = "Modalidade do atendimento",
        [Endereco] = "Endereço administrativo do atendimento",
        [LinkSessaoOnline] = "Link da sessão online",
        [RegrasCancelamento] = "Regras de cancelamento",
        [RegrasRemarcacao] = "Regras de remarcação",
        [NomeProfissional] = "Nome do profissional"
    };

    public static IReadOnlyCollection<string> ChavesPermitidas => Catalogo.Keys.ToArray();
}
