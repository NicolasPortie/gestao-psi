import { requisicaoApi } from '../../core/api/cliente-api';
import { aplicarPaginacaoAQuery, type ResultadoPaginado } from '../../core/api/paginacao';
import { extrairDados, type RespostaApi } from '../../core/api/resposta-api';

export interface LogAuditoria {
  id: string;
  criadoEm: string;
  tipoAcao: string;
  entidade: string;
  entidadeId: string | null;
  descricao: string | null;
  ip: string | null;
  userAgent: string | null;
  usuario: string | null;
}

export interface LogAuditoriaDetalhe extends LogAuditoria {
  dadosAntesJson: string | null;
  dadosDepoisJson: string | null;
}

export interface FiltroAuditoria {
  tipoAcao?: string;
  entidade?: string;
  incluirTecnicos?: boolean;
  de?: string;
  ate?: string;
  pagina?: number;
  tamanhoPagina?: number;
}

export const auditoriaKeys = {
  todos: ['auditoria'] as const,
  lista: (filtro: FiltroAuditoria) => [...auditoriaKeys.todos, 'lista', filtro] as const,
  detalhe: (id: string) => [...auditoriaKeys.todos, 'detalhe', id] as const,
};

export async function listarAuditoria(
  filtro: FiltroAuditoria,
  { signal }: { signal?: AbortSignal } = {},
) {
  const params = new URLSearchParams();
  aplicarPaginacaoAQuery(params, filtro);
  if (filtro.tipoAcao) params.set('tipoAcao', filtro.tipoAcao);
  if (filtro.entidade) params.set('entidade', filtro.entidade);
  if (filtro.incluirTecnicos) params.set('incluirTecnicos', 'true');
  if (filtro.de) params.set('de', filtro.de);
  if (filtro.ate) params.set('ate', filtro.ate);
  const resposta = await requisicaoApi<RespostaApi<ResultadoPaginado<LogAuditoria>>>(
    `/auditoria?${params}`,
    { signal },
  );
  return extrairDados(resposta, 'Não foi possível carregar a auditoria.');
}

export async function obterLogAuditoria(id: string, { signal }: { signal?: AbortSignal } = {}) {
  const resposta = await requisicaoApi<RespostaApi<LogAuditoriaDetalhe>>(`/auditoria/${id}`, {
    signal,
  });
  return extrairDados(resposta, 'Não foi possível carregar o detalhe.');
}
