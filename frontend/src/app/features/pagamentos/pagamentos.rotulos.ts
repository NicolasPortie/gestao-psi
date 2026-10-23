import type { DescricaoEstado } from '../../core/dominio/estado';
import type { FormaPagamento, Pagamento, StatusPagamento } from './pagamentos.api';

export const estadosPagamento: Record<StatusPagamento, DescricaoEstado> = {
  Pendente: { rotulo: 'Pendente', tom: 'aviso', marca: 'meio' },
  AguardandoConfirmacao: { rotulo: 'Em confirmação', tom: 'aviso', marca: 'anel' },
  Pago: { rotulo: 'Pago', tom: 'sucesso', marca: 'check' },
  Reembolsado: { rotulo: 'Reembolsado', tom: 'neutro', marca: 'seta' },
  Cancelado: { rotulo: 'Cancelado', tom: 'neutro', marca: 'riscado' },
};

export const rotulosFormaPagamento: Record<FormaPagamento, string> = {
  Pix: 'Pix',
  Cartao: 'Cartão',
  Dinheiro: 'Dinheiro',
  Transferencia: 'Transferência',
  Manual: 'A definir',
  Outro: 'Outra forma',
};

/** Pagamentos que ainda aceitam ação (marcar pago ou cancelar). */
export const pagamentoEmAberto = (status: StatusPagamento) => status === 'Pendente' || status === 'AguardandoConfirmacao';

export const estadoVencido: DescricaoEstado = { rotulo: 'Vencido', tom: 'perigo', marca: 'meio' };

/** Estado exibido: o vencido (decidido pela API) aparece em tijolo, os demais seguem o status. */
export function estadoDoPagamento(pagamento: Pick<Pagamento, 'status' | 'vencido'>): DescricaoEstado {
  return pagamento.vencido ? estadoVencido : estadosPagamento[pagamento.status];
}
