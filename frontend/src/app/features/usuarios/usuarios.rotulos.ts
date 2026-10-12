import type { DescricaoEstado } from '../../core/dominio/estado';
import type { StatusUsuario } from './usuarios.api';

export const estadosUsuario: Record<StatusUsuario, DescricaoEstado> = {
  Ativo: { rotulo: 'Ativo', tom: 'sucesso', marca: 'cheio' },
  Inativo: { rotulo: 'Inativo', tom: 'neutro', marca: 'anel' },
  Bloqueado: { rotulo: 'Bloqueado', tom: 'perigo', marca: 'riscado' },
  Pendente: { rotulo: 'Pendente', tom: 'aviso', marca: 'meio' },
};
