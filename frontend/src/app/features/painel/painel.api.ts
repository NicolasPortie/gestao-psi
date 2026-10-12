import { requisicaoApi } from '../../core/api/cliente-api';
import { extrairDados, type RespostaApi } from '../../core/api/resposta-api';
import type { PainelResumo } from './painel.types';

export const painelKeys = {
  todos: ['painel'] as const,
  resumo: () => [...painelKeys.todos, 'resumo'] as const,
};

export async function obterResumoPainel({ signal }: { signal?: AbortSignal } = {}) {
  const resposta = await requisicaoApi<RespostaApi<PainelResumo>>('/painel/resumo', { signal });
  return extrairDados(resposta, 'Não foi possível carregar o painel.');
}
