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

/** Pendente cujo vencimento ficou para trás. Derivado na tela: o servidor guarda só "Pendente". */
export function pagamentoVencido(pagamento: Pick<Pagamento, 'status' | 'vencimentoEm'>, hoje = new Date()) {
  if (!pagamentoEmAberto(pagamento.status) || !pagamento.vencimentoEm) return false;
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return new Date(pagamento.vencimentoEm) < inicioHoje;
}

/** Estado exibido: o vencido aparece em tijolo, os demais seguem o status do servidor. */
export function estadoDoPagamento(pagamento: Pick<Pagamento, 'status' | 'vencimentoEm'>, hoje = new Date()): DescricaoEstado {
  return pagamentoVencido(pagamento, hoje) ? estadoVencido : estadosPagamento[pagamento.status];
}
