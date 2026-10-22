using Psique.Api.Shared.Enums;

namespace Psique.Api.Shared;

/// <summary>Nomes das políticas de autorização. Uma política por permissão do catálogo, mais as de papel.</summary>
public static class Politicas
{
    /// <summary>Qualquer pessoa da equipe com acesso ativo: painel e notificações.</summary>
    public const string GestaoAdministrativa = "GestaoAdministrativa";
    public const string AcessoClinico = "AcessoClinico";
    public const string GestaoConta = "GestaoConta";

    public const string Agenda = "Permissao:Agenda";
    public const string Pacientes = "Permissao:Pacientes";
    public const string Financeiro = "Permissao:Financeiro";
    public const string Mensagens = "Permissao:Mensagens";
    public const string Conversas = "Permissao:Conversas";
    public const string IntegracaoWhatsApp = "Permissao:IntegracaoWhatsApp";
    public const string Relatorios = "Permissao:Relatorios";
    public const string Auditoria = "Permissao:Auditoria";
    public const string Equipe = "Permissao:Equipe";

    public static string De(PermissaoAcesso permissao) => $"Permissao:{permissao}";
}
