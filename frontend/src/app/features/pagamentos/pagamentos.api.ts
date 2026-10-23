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
  /** Início da consulta vinculada, quando houver. */
  sessaoEm?: string | null;
  /** Mês de referência de uma mensalidade ("AAAA-MM-01"). */
  competencia?: string | null;
  /** Em aberto com vencimento já passado; decidido pela API. */
  vencido?: boolean;
}

export interface Recibo {
  id: string;
  numero: string;
  valor: number;
  pagoEm: string;
  formaPagamento: FormaPagamento;
  paciente: string;
  pacienteCpf: string | null;
  sessaoEm: string | null;
  tipoAtendimento: string | null;
  profissional: string;
  crp: string | null;
  emailProfissional: string | null;
  telefoneProfissional: string | null;
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
  /** Parte do pendente com vencimento anterior a hoje. */
  vencido: number;
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
  /** Só pendentes com vencimento anterior a hoje. */
  vencidos?: boolean;
  pacienteId?: string;
  /** Período pelo vencimento (ou pagamento), "AAAA-MM-DD". */
  de?: string;
  ate?: string;
  busca?: string;
  pagina?: number;
  tamanhoPagina?: number;
}

export const pagamentosKeys = {
  todos: ['pagamentos'] as const,
  lista: (filtro: ListarPagamentosFiltro) => [...pagamentosKeys.todos, 'lista', filtro] as const,
  recibo: (id: string) => [...pagamentosKeys.todos, 'recibo', id] as const,
};

export async function listarPagamentos(
  filtro: ListarPagamentosFiltro = {},
  { signal }: { signal?: AbortSignal } = {},
) {
  const params = new URLSearchParams();
  aplicarPaginacaoAQuery(params, filtro);
  if (filtro.status) params.set('status', filtro.status);
  if (filtro.vencidos) params.set('vencidos', 'true');
  if (filtro.pacienteId) params.set('pacienteId', filtro.pacienteId);
  if (filtro.de) params.set('de', filtro.de);
  if (filtro.ate) params.set('ate', filtro.ate);
  if (filtro.busca?.trim()) params.set('busca', filtro.busca.trim());
  const resposta = await requisicaoApi<RespostaApi<PagamentosListagem>>(`/pagamentos?${params}`, { signal });
  return extrairDados(resposta, 'Não foi possível carregar os pagamentos.');
}

export async function criarPagamento(request: CriarPagamentoRequest) {
  const resposta = await requisicaoApi<RespostaApi<Pagamento>>('/pagamentos', { method: 'POST', body: request });
  return extrairDados(resposta, 'Não foi possível criar o pagamento.');
}

export async function alterarStatusPagamento(id: string, status: StatusPagamento, pagoEm?: string | null, formaPagamento?: FormaPagamento | null) {
  const resposta = await requisicaoApi<RespostaApi<Pagamento>>(`/pagamentos/${id}/status`, {
    method: 'PATCH',
    body: { status, pagoEm: pagoEm ?? null, formaPagamento: formaPagamento ?? null },
  });
  return extrairDados(resposta, 'Não foi possível atualizar o pagamento.');
}

/** Dados do recibo de um pagamento recebido; a emissão fica registrada na auditoria. */
export async function obterRecibo(id: string, { signal }: { signal?: AbortSignal } = {}) {
  const resposta = await requisicaoApi<RespostaApi<Recibo>>(`/pagamentos/${id}/recibo`, { signal });
  return extrairDados(resposta, 'Não foi possível emitir o recibo.');
}

export interface ResultadoMensalidades {
  criadas: number;
  jaExistiam: number;
  semValor: string[];
}

/** Gera a mensalidade do mês para cada paciente mensalista ativo; não duplica as já geradas. */
export async function gerarMensalidades(ano: number, mes: number, diaVencimento = 10) {
  const resposta = await requisicaoApi<RespostaApi<ResultadoMensalidades>>('/pagamentos/mensalidades', {
    method: 'POST',
    body: { ano, mes, diaVencimento },
  });
  return extrairDados(resposta, 'Não foi possível gerar as mensalidades.');
}

export interface RecebimentoExportado {
  pagoEm: string;
  paciente: string;
  pacienteCpf: string | null;
  valor: number;
  formaPagamento: FormaPagamento;
  referencia: string;
}

/** Recebimentos do período com CPF do pagador (contador, Carnê-Leão). A exportação fica na auditoria. */
export async function exportarRecebimentos(de: string, ate: string) {
  const params = new URLSearchParams({ de, ate });
  const resposta = await requisicaoApi<RespostaApi<RecebimentoExportado[]>>(`/pagamentos/exportacao?${params}`);
  return extrairDados(resposta, 'Não foi possível exportar os recebimentos.');
}

export interface ReciboMensal {
  paciente: string;
  pacienteCpf: string | null;
  ano: number;
  mes: number;
  itens: Array<{ pagoEm: string; referencia: string; valor: number; formaPagamento: FormaPagamento }>;
  total: number;
  profissional: string;
  crp: string | null;
  emailProfissional: string | null;
  telefoneProfissional: string | null;
}

export async function obterReciboMensal(pacienteId: string, ano: number, mes: number, { signal }: { signal?: AbortSignal } = {}) {
  const params = new URLSearchParams({ pacienteId, ano: String(ano), mes: String(mes) });
  const resposta = await requisicaoApi<RespostaApi<ReciboMensal>>(`/pagamentos/recibo-mensal?${params}`, { signal });
  return extrairDados(resposta, 'Não foi possível emitir o recibo do mês.');
}
