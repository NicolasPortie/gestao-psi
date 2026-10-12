import { requisicaoApi } from '../../core/api/cliente-api';
import { aplicarPaginacaoAQuery, type ResultadoPaginado } from '../../core/api/paginacao';
import { extrairDados, type RespostaApi } from '../../core/api/resposta-api';

export interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  lida: boolean;
  lidaEm: string | null;
  criadoEm: string;
  urlOrigem: string | null;
}

export interface ListarNotificacoesFiltro {
  lida?: boolean;
  pagina?: number;
  tamanhoPagina?: number;
}

export const notificacoesKeys = {
  todos: ['notificacoes'] as const,
  lista: (filtro: ListarNotificacoesFiltro = {}) => [...notificacoesKeys.todos, 'lista', filtro] as const,
  contagem: () => [...notificacoesKeys.todos, 'contagem'] as const,
};

export async function listarNotificacoes(filtro: ListarNotificacoesFiltro = {}, { signal }: { signal?: AbortSignal } = {}) {
  const params = new URLSearchParams();
  aplicarPaginacaoAQuery(params, filtro);
  if (filtro.lida !== undefined) params.set('lida', String(filtro.lida));
  const resposta = await requisicaoApi<RespostaApi<ResultadoPaginado<Notificacao>>>(`/notificacoes?${params}`, { signal });
  return extrairDados(resposta, 'Não foi possível carregar as notificações.');
}

export async function contarNotificacoesNaoLidas({ signal }: { signal?: AbortSignal } = {}) {
  const resposta = await requisicaoApi<RespostaApi<number>>('/notificacoes/nao-lidas/contagem', { signal });
  return extrairDados(resposta, 'Não foi possível contar notificações.');
}

export async function marcarNotificacaoLida(id: string) {
  const resposta = await requisicaoApi<RespostaApi<Notificacao>>(`/notificacoes/${id}/lida`, { method: 'POST' });
  return extrairDados(resposta, 'Não foi possível marcar a notificação.');
}

export async function marcarTodasNotificacoesLidas() {
  const resposta = await requisicaoApi<RespostaApi<number>>('/notificacoes/marcar-todas-lidas', { method: 'POST' });
  return extrairDados(resposta, 'Não foi possível marcar todas como lidas.');
}
