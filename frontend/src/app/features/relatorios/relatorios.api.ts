import { requisicaoApi } from '../../core/api/cliente-api';
import { extrairDados, type RespostaApi } from '../../core/api/resposta-api';

export interface RelatorioCatalogoItem {
  codigo: string;
  nome: string;
  descricao: string;
  exigePaciente: boolean;
}

export interface RelatorioGerado {
  codigo: string;
  titulo: string;
  html: string;
  geradoEm: string;
  periodoInicio: string;
  periodoFim: string;
}

export interface GerarRelatorioRequest {
  periodoInicio: string;
  periodoFim: string;
  pacienteId?: string | null;
  status?: string | null;
}

export const relatoriosKeys = {
  todos: ['relatorios'] as const,
  catalogo: () => [...relatoriosKeys.todos, 'catalogo'] as const,
};

export async function listarCatalogoRelatorios({ signal }: { signal?: AbortSignal } = {}) {
  const resposta = await requisicaoApi<RespostaApi<RelatorioCatalogoItem[]>>('/relatorios/catalogo', { signal });
  return extrairDados(resposta, 'Não foi possível carregar o catálogo de relatórios.');
}

export async function gerarRelatorio(codigo: string, request: GerarRelatorioRequest) {
  const resposta = await requisicaoApi<RespostaApi<RelatorioGerado>>(`/relatorios/${encodeURIComponent(codigo)}/gerar`, {
    method: 'POST',
    body: request,
  });
  return extrairDados(resposta, 'Não foi possível gerar o relatório.');
}
