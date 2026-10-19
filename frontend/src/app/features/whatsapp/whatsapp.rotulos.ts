import type { DescricaoEstado } from '../../core/dominio/estado';
import type { StatusConversaWhatsApp, StatusIntegracao } from './whatsapp.api';

export const estadosConversa: Record<StatusConversaWhatsApp, DescricaoEstado> = {
  Aberta: { rotulo: 'Com o assistente', tom: 'acento', marca: 'cheio' },
  Finalizada: { rotulo: 'Finalizada', tom: 'sucesso', marca: 'check' },
  Expirada: { rotulo: 'Expirada', tom: 'neutro', marca: 'anel' },
  AtendimentoHumano: { rotulo: 'Com a equipe', tom: 'aviso', marca: 'meio' },
  Bloqueada: { rotulo: 'Bloqueada', tom: 'perigo', marca: 'riscado' },
};

export const estadosIntegracao: Record<StatusIntegracao, DescricaoEstado> = {
  Ativa: { rotulo: 'Ativa', tom: 'sucesso', marca: 'cheio' },
  Inativa: { rotulo: 'Inativa', tom: 'neutro', marca: 'anel' },
  Erro: { rotulo: 'Com erro', tom: 'perigo', marca: 'x' },
  Pendente: { rotulo: 'Pendente', tom: 'aviso', marca: 'meio' },
};

const rotulosEvento: Record<string, string> = {
  'mensagem.recebida': 'Mensagem recebida',
  'message.received': 'Mensagem recebida',
  mensagem_recebida: 'Mensagem recebida',
  'mensagem.entregue': 'Mensagem entregue',
  'message.delivered': 'Mensagem entregue',
  'mensagem.lida': 'Mensagem lida',
  'message.read': 'Mensagem lida',
  'mensagem.falhou': 'Mensagem não enviada',
  'message.failed': 'Mensagem não enviada',
};

/** Tipo de evento enviado pelo Bridge, em linguagem de consultório. Tipos novos aparecem como vieram. */
export function rotuloEvento(tipoEvento: string) {
  return rotulosEvento[tipoEvento.trim().toLowerCase()] ?? tipoEvento;
}
