import { requisicaoApi } from '../../core/api/cliente-api';
import { aplicarPaginacaoAQuery, type ResultadoPaginado } from '../../core/api/paginacao';
import { extrairDados, type RespostaApi } from '../../core/api/resposta-api';

export type TipoEvolucaoProntuario =
  | 'ObservacaoClinica'
  | 'MarcoEvolutivo'
  | 'HipoteseClinica'
  | 'PlanoTerapeutico'
  | 'Encaminhamento'
  | 'RevisaoCaso';

export type StatusRegistroSessao = 'Rascunho' | 'Finalizado' | 'Retificado' | 'Arquivado';

export interface RegistroSessao {
  id: string;
  consultaId: string;
  pacienteId: string;
  dataSessao: string;
  status: StatusRegistroSessao;
  observacoesClinicas: string | null;
  evolucao: string | null;
  encaminhamentos: string | null;
  proximaSessaoSugeridaEm: string | null;
}

export interface EvolucaoProntuario {
  id: string;
  prontuarioId: string;
  pacienteId: string;
  tipo: TipoEvolucaoProntuario;
  conteudo: string;
  dataEvolucao: string;
}

export interface CriarRegistroSessaoRequest {
  consultaId: string;
  observacoesClinicas?: string | null;
  evolucao?: string | null;
  encaminhamentos?: string | null;
  proximaSessaoSugeridaEm?: string | null;
}

export interface CriarEvolucaoRequest {
  pacienteId: string;
  registroSessaoId?: string | null;
  tipo: TipoEvolucaoProntuario;
  conteudo: string;
  dataEvolucao: string;
}

export interface ListarEvolucoesFiltro {
  pagina?: number;
  tamanhoPagina?: number;
}

export const sessoesKeys = {
  todos: ['sessoes'] as const,
  evolucoes: (pacienteId: string, filtro: ListarEvolucoesFiltro = {}) =>
    [...sessoesKeys.todos, 'evolucoes', pacienteId, filtro] as const,
  registros: (pacienteId: string, filtro: ListarEvolucoesFiltro = {}) =>
    [...sessoesKeys.todos, 'registros', pacienteId, filtro] as const,
};

/** Registros de sessão do paciente, do mais recente ao mais antigo (conteúdo clínico descriptografado no servidor). */
export async function listarRegistrosSessao(
  pacienteId: string,
  filtro: ListarEvolucoesFiltro = {},
  { signal }: { signal?: AbortSignal } = {},
) {
  const params = new URLSearchParams();
  aplicarPaginacaoAQuery(params, filtro);
  const resposta = await requisicaoApi<RespostaApi<ResultadoPaginado<RegistroSessao>>>(
    `/sessoes/registros/${pacienteId}?${params}`,
    { signal },
  );
  return extrairDados(resposta, 'Não foi possível carregar os registros de sessão.');
}

export async function listarEvolucoes(
  pacienteId: string,
  filtro: ListarEvolucoesFiltro = {},
  { signal }: { signal?: AbortSignal } = {},
) {
  const params = new URLSearchParams();
  aplicarPaginacaoAQuery(params, filtro);
  const resposta = await requisicaoApi<RespostaApi<ResultadoPaginado<EvolucaoProntuario>>>(
    `/sessoes/evolucoes/${pacienteId}?${params}`,
    { signal },
  );
  return extrairDados(resposta, 'Não foi possível carregar o prontuário.');
}

export async function criarRegistroSessao(request: CriarRegistroSessaoRequest) {
  const resposta = await requisicaoApi<RespostaApi<RegistroSessao>>('/sessoes', {
    method: 'POST',
    body: request,
  });
  return extrairDados(resposta, 'Não foi possível registrar a sessão.');
}

export async function criarEvolucao(request: CriarEvolucaoRequest) {
  const resposta = await requisicaoApi<RespostaApi<EvolucaoProntuario>>('/sessoes/evolucoes', {
    method: 'POST',
    body: request,
  });
  return extrairDados(resposta, 'Não foi possível registrar a evolução.');
}
