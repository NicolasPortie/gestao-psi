/** O que uma pessoa da equipe pode fazer na rotina administrativa. Conteúdo clínico não entra: é só do Psicólogo. */
export type PermissaoAcesso =
  | 'Agenda'
  | 'Pacientes'
  | 'Financeiro'
  | 'Mensagens'
  | 'Conversas'
  | 'IntegracaoWhatsApp'
  | 'Relatorios'
  | 'Auditoria'
  | 'Equipe';

export const todasAsPermissoes: readonly PermissaoAcesso[] = [
  'Agenda',
  'Pacientes',
  'Financeiro',
  'Mensagens',
  'Conversas',
  'IntegracaoWhatsApp',
  'Relatorios',
  'Auditoria',
  'Equipe',
];

/**
 * Permissões de quem ainda não recebeu a lista do servidor (sessão antiga): derivadas do perfil.
 * Só decide o que mostrar; o servidor continua sendo quem autoriza.
 */
export function permissoesDoPerfil(perfil: string | undefined): readonly PermissaoAcesso[] {
  const normalizado = perfil?.trim().toLocaleLowerCase('pt-BR');
  if (normalizado === 'psicologo' || normalizado === 'administrador') return todasAsPermissoes;
  if (normalizado === 'recepcionista')
    return todasAsPermissoes.filter(
      (permissao) =>
        permissao !== 'Auditoria' && permissao !== 'Equipe' && permissao !== 'IntegracaoWhatsApp',
    );
  return [];
}
