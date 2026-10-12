import type { DescricaoEstado } from '../../core/dominio/estado';
import type { StatusListaEspera } from './lista-espera.api';

export const estadosListaEspera: Record<StatusListaEspera, DescricaoEstado> = {
  Aguardando: { rotulo: 'Aguardando', tom: 'aviso', marca: 'meio' },
  Contatado: { rotulo: 'Contatado', tom: 'acento', marca: 'cheio' },
  Agendado: { rotulo: 'Agendado', tom: 'sucesso', marca: 'check' },
  Cancelado: { rotulo: 'Cancelado', tom: 'neutro', marca: 'riscado' },
  Expirado: { rotulo: 'Expirado', tom: 'neutro', marca: 'riscado' },
};

export const rotulosPrioridade: Record<number, string> = { 1: 'Alta', 2: 'Média', 3: 'Baixa' };

export const opcoesPrioridade = [
  { valor: 1, rotulo: 'Alta' },
  { valor: 2, rotulo: 'Média' },
  { valor: 3, rotulo: 'Baixa' },
];
