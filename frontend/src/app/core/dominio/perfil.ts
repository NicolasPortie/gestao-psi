import type { OpcaoSelecao } from './estado';

export type PerfilUsuario =
  'Psicologo' | 'Recepcionista' | 'Paciente' | 'Administrador' | 'Personalizado';

export const rotulosPerfil: Record<PerfilUsuario, string> = {
  Psicologo: 'Psicólogo',
  Recepcionista: 'Recepcionista',
  Paciente: 'Paciente',
  Administrador: 'Administrador',
  Personalizado: 'Perfil da conta',
};

/** Perfis fixos que a tela de equipe oferece; os criados pela própria conta vêm da API. */
export const opcoesPerfilFixo: Array<OpcaoSelecao<'Recepcionista' | 'Administrador'>> = [
  { valor: 'Recepcionista', rotulo: 'Recepcionista' },
  { valor: 'Administrador', rotulo: 'Administrador' },
];

/** O perfil personalizado mostra o nome que a conta deu a ele; os demais, o rótulo padrão. */
export function rotuloPerfil(perfil: string | undefined, nomeDoPerfil?: string | null) {
  if (nomeDoPerfil) return nomeDoPerfil;
  return (perfil && (rotulosPerfil as Record<string, string | undefined>)[perfil]) || perfil || '';
}
