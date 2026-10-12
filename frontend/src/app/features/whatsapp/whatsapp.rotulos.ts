import type { DescricaoEstado } from '../../core/dominio/estado';
import type { StatusConversaWhatsApp, StatusIntegracao } from './whatsapp.api';

export const estadosConversa: Record<StatusConversaWhatsApp, DescricaoEstado> = {
  Aberta: { rotulo: 'Aberta', tom: 'acento', marca: 'cheio' },
  Finalizada: { rotulo: 'Finalizada', tom: 'sucesso', marca: 'check' },
  Expirada: { rotulo: 'Expirada', tom: 'neutro', marca: 'anel' },
  AtendimentoHumano: { rotulo: 'Atendimento humano', tom: 'aviso', marca: 'meio' },
  Bloqueada: { rotulo: 'Bloqueada', tom: 'perigo', marca: 'riscado' },
};

export const estadosIntegracao: Record<StatusIntegracao, DescricaoEstado> = {
  Ativa: { rotulo: 'Ativa', tom: 'sucesso', marca: 'cheio' },
  Inativa: { rotulo: 'Inativa', tom: 'neutro', marca: 'anel' },
  Erro: { rotulo: 'Com erro', tom: 'perigo', marca: 'x' },
  Pendente: { rotulo: 'Pendente', tom: 'aviso', marca: 'meio' },
};
