import type { OpcaoSelecao } from './estado';

export type PerfilUsuario = 'Psicologo' | 'Recepcionista' | 'Paciente' | 'Administrador';

export const rotulosPerfil: Record<PerfilUsuario, string> = {
  Psicologo: 'Psicólogo',
  Recepcionista: 'Recepcionista',
  Paciente: 'Paciente',
  Administrador: 'Administrador',
};

export const opcoesPerfilEquipe: Array<OpcaoSelecao<'Recepcionista' | 'Administrador'>> = [
  { valor: 'Recepcionista', rotulo: 'Recepcionista' },
  { valor: 'Administrador', rotulo: 'Administrador' },
];

export function rotuloPerfil(perfil: string | undefined) {
  return (perfil && (rotulosPerfil as Record<string, string | undefined>)[perfil]) || perfil || '';
}
