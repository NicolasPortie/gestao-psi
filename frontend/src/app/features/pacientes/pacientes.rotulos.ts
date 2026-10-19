import type { DescricaoEstado } from '../../core/dominio/estado';
import type { StatusPaciente, TipoContatoPaciente } from './pacientes.types';

export const estadosPaciente: Record<StatusPaciente, DescricaoEstado> = {
  Ativo: { rotulo: 'Ativo', tom: 'sucesso', marca: 'cheio' },
  Inativo: { rotulo: 'Inativo', tom: 'neutro', marca: 'anel' },
  Arquivado: { rotulo: 'Arquivado', tom: 'neutro', marca: 'riscado' },
};

export const rotulosTipoContato: Record<TipoContatoPaciente, string> = {
  Telefone: 'Telefone',
  WhatsApp: 'WhatsApp',
  Email: 'E-mail',
  Responsavel: 'Responsável legal',
  Emergencia: 'Contato de emergência',
};
