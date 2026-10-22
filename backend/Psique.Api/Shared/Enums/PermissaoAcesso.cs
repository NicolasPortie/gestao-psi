namespace Psique.Api.Shared.Enums;

/// <summary>
/// O que uma pessoa da equipe pode fazer. Só cobre a rotina administrativa: conteúdo clínico
/// (prontuário, sessões e documentos) é exclusivo do perfil Psicólogo e nunca entra neste catálogo.
/// Os nomes são gravados como texto no perfil de acesso e viajam como claims; não renomeie.
/// </summary>
public enum PermissaoAcesso
{
    Agenda = 1,
    Pacientes = 2,
    Financeiro = 3,
    Mensagens = 4,
    Conversas = 5,
    IntegracaoWhatsApp = 6,
    Relatorios = 7,
    Auditoria = 8,
    Equipe = 9
}
