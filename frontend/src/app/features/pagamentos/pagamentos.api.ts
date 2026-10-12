import { requisicaoApi } from '../../core/api/cliente-api';
import { aplicarPaginacaoAQuery } from '../../core/api/paginacao';
import { extrairDados, type RespostaApi } from '../../core/api/resposta-api';

export type StatusPagamento = 'Pendente' | 'Pago' | 'Cancelado' | 'Reembolsado' | 'AguardandoConfirmacao';
export type FormaPagamento = 'Manual' | 'Pix' | 'Cartao' | 'Dinheiro' | 'Transferencia' | 'Outro';

export interface Pagamento {
  id: string;
  pacienteId: string;
  paciente: string;
  consultaId: string | null;
  valor: number;
  status: StatusPagamento;
  formaPagamento: FormaPagamento;
  vencimentoEm: string | null;
  pagoEm: string | null;
  observacao: string | null;
}

export interface CriarPagamentoRequest {
  pacienteId: string;
  consultaId?: string | null;
  valor: number;
  formaPagamento: FormaPagamento;
  vencimentoEm?: string | null;
  observacao?: string | null;
}

export interface PagamentosResumo {
  recebido: number;
  pendente: number;
  reembolsado: number;
  quantidade: number;
}

export interface PagamentosListagem {
  itens: Pagamento[];
  resumo: PagamentosResumo;
  total: number;
  pagina: number;
  tamanhoPagina: number;
}

export interface ListarPagamentosFiltro {
  status?: StatusPagamento | '';
  pagina?: number;
  tamanhoPagina?: number;
}

export const pagamentosKeys = {
  todos: ['pagamentos'] as const,
  lista: (filtro: ListarPagamentosFiltro) => [...pagamentosKeys.todos, 'lista', filtro] as const,
};

export async function listarPagamentos(
  filtro: ListarPagamentosFiltro = {},
  { signal }: { signal?: AbortSignal } = {},
) {
  const params = new URLSearchParams();
  aplicarPaginacaoAQuery(params, filtro);
  if (filtro.status) params.set('status', filtro.status);
  const resposta = await requisicaoApi<RespostaApi<PagamentosListagem>>(`/pagamentos?${params}`, { signal });
  return extrairDados(resposta, 'Não foi possível carregar os pagamentos.');
}

export async function criarPagamento(request: CriarPagamentoRequest) {
  const resposta = await requisicaoApi<RespostaApi<Pagamento>>('/pagamentos', { method: 'POST', body: request });
  return extrairDados(resposta, 'Não foi possível criar o pagamento.');
}

export async function alterarStatusPagamento(id: string, status: StatusPagamento, pagoEm?: string | null) {
  const resposta = await requisicaoApi<RespostaApi<Pagamento>>(`/pagamentos/${id}/status`, {
    method: 'PATCH',
    body: { status, pagoEm: pagoEm ?? null },
  });
  return extrairDados(resposta, 'Não foi possível atualizar o pagamento.');
}
