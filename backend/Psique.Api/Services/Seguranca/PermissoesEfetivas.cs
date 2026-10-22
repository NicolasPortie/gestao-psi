using Psique.Api.Models;
using Psique.Api.Shared.Enums;

namespace Psique.Api.Services.Seguranca;

/// <summary>
/// Regra única de "quem pode o quê" na rotina administrativa. Psicólogo e Administrador têm tudo;
/// Recepcionista tem tudo menos auditoria, equipe e conexão do WhatsApp; Personalizado tem o que o perfil de acesso concede.
/// Conteúdo clínico não passa por aqui: segue exclusivo do perfil Psicólogo.
/// </summary>
public static class PermissoesEfetivas
{
    private static readonly PermissaoAcesso[] Todas = Enum.GetValues<PermissaoAcesso>();

    private static readonly PermissaoAcesso[] DaRecepcao =
        Todas.Where(p => p is not (PermissaoAcesso.Auditoria or PermissaoAcesso.Equipe or PermissaoAcesso.IntegracaoWhatsApp)).ToArray();

    public static IReadOnlySet<PermissaoAcesso> Para(Usuario usuario) => usuario.Perfil switch
    {
        PerfilUsuario.Psicologo or PerfilUsuario.Administrador => Todas.ToHashSet(),
        PerfilUsuario.Recepcionista => DaRecepcao.ToHashSet(),
        PerfilUsuario.Personalizado => Ler(usuario.PerfilAcesso?.Permissoes),
        _ => new HashSet<PermissaoAcesso>()
    };

    public static bool Tem(Usuario usuario, PermissaoAcesso permissao) => Para(usuario).Contains(permissao);

    /// <summary>Quem recebe aviso e responde conversas do WhatsApp: pessoas ativas com a permissão de conversas.</summary>
    public static bool PodeConversar(Usuario usuario) => Tem(usuario, PermissaoAcesso.Conversas);

    /// <summary>
    /// Ninguém gerencia (senha, status, perfil) quem tem permissão que ele mesmo não tem:
    /// sem isso, a pessoa redefiniria a senha de um Administrador e entraria no lugar dele.
    /// </summary>
    public static bool PodeGerenciar(Usuario ator, Usuario alvo) =>
        ator.Perfil == PerfilUsuario.Psicologo ||
        (alvo.Perfil != PerfilUsuario.Psicologo && Para(alvo).IsSubsetOf(Para(ator)));

    public static string Serializar(IEnumerable<PermissaoAcesso> permissoes) =>
        string.Join(',', permissoes.Distinct().OrderBy(p => (int)p).Select(p => p.ToString()));

    public static IReadOnlySet<PermissaoAcesso> Ler(string? texto)
    {
        var resultado = new HashSet<PermissaoAcesso>();
        if (string.IsNullOrWhiteSpace(texto))
            return resultado;
        foreach (var parte in texto.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            if (Enum.TryParse<PermissaoAcesso>(parte, out var permissao) && Enum.IsDefined(permissao))
                resultado.Add(permissao);
        }
        return resultado;
    }
}

/// <summary>Textos do catálogo mostrados na tela de perfis. Em linguagem de consultório, sem termos técnicos.</summary>
public static class CatalogoPermissoes
{
    public sealed record Item(PermissaoAcesso Permissao, string Rotulo, string Descricao);

    public static readonly IReadOnlyList<Item> Itens =
    [
        new(PermissaoAcesso.Agenda, "Agenda", "Ver e marcar consultas, bloquear horários e cuidar da lista de espera."),
        new(PermissaoAcesso.Pacientes, "Pacientes", "Ver e editar cadastro, contatos e dados de cobrança. Sem acesso a prontuário."),
        new(PermissaoAcesso.Financeiro, "Financeiro", "Registrar pagamentos e ver o que está em aberto."),
        new(PermissaoAcesso.Mensagens, "Lembretes e modelos", "Programar lembretes e editar os modelos de mensagem."),
        new(PermissaoAcesso.Conversas, "Conversas do WhatsApp", "Responder pacientes, assumir conversas e receber aviso quando alguém pedir uma pessoa."),
        new(PermissaoAcesso.IntegracaoWhatsApp, "Conexão do WhatsApp", "Conectar o número do consultório e testar a conexão."),
        new(PermissaoAcesso.Relatorios, "Relatórios", "Ver os relatórios administrativos."),
        new(PermissaoAcesso.Auditoria, "Auditoria", "Ver quem fez o quê na conta."),
        new(PermissaoAcesso.Equipe, "Equipe e perfis", "Adicionar pessoas, trocar senhas, ativar ou desativar acessos e criar perfis.")
    ];
}
