import { requisicaoApi } from '../../core/api/cliente-api';
import { aplicarPaginacaoAQuery, type ResultadoPaginado } from '../../core/api/paginacao';
import { extrairDados, type RespostaApi } from '../../core/api/resposta-api';
import type { DiaSemana } from '../agenda/agenda.types';

export type StatusListaEspera = 'Aguardando' | 'Contatado' | 'Agendado' | 'Cancelado' | 'Expirado';
export type OrigemConsulta = 'Painel' | 'WhatsApp' | 'Chatbot' | 'Recepcionista' | 'Paciente' | 'Outro';

export interface ListaEsperaItem {
  id: string;
  pacienteId: string;
  paciente: string;
  tipoAtendimentoId: string | null;
  tipoAtendimento: string | null;
  preferenciaDiaSemana: DiaSemana | null;
  preferenciaHorarioInicio: string | null;
  preferenciaHorarioFim: string | null;
  prioridade: number;
  status: StatusListaEspera;
  origem: OrigemConsulta;
  observacaoAdministrativa: string | null;
  criadoEm: string;
  atualizadoEm: string | null;
}

export interface CriarListaEsperaRequest {
  pacienteId: string;
  tipoAtendimentoId?: string | null;
  preferenciaDiaSemana?: DiaSemana | null;
  preferenciaHorarioInicio?: string | null;
  preferenciaHorarioFim?: string | null;
  prioridade: number;
  observacaoAdministrativa?: string | null;
}

export interface ListarListaEsperaFiltro {
  status?: StatusListaEspera | '';
  pagina?: number;
  tamanhoPagina?: number;
}

export const listaEsperaKeys = {
  todos: ['lista-espera'] as const,
  lista: (filtro: ListarListaEsperaFiltro) => [...listaEsperaKeys.todos, 'lista', filtro] as const,
};

export async function listarListaEspera(filtro: ListarListaEsperaFiltro = {}, { signal }: { signal?: AbortSignal } = {}) {
  const params = new URLSearchParams();
  aplicarPaginacaoAQuery(params, filtro);
  if (filtro.status) params.set('status', filtro.status);
  const resposta = await requisicaoApi<RespostaApi<ResultadoPaginado<ListaEsperaItem>>>(
    `/lista-espera?${params}`,
    { signal },
  );
  return extrairDados(resposta, 'Não foi possível carregar a lista de espera.');
}

export async function criarListaEspera(request: CriarListaEsperaRequest) {
  const resposta = await requisicaoApi<RespostaApi<ListaEsperaItem>>('/lista-espera', {
    method: 'POST',
    body: request,
  });
  return extrairDados(resposta, 'Não foi possível incluir na lista de espera.');
}

export async function alterarStatusListaEspera(id: string, status: StatusListaEspera) {
  const resposta = await requisicaoApi<RespostaApi<ListaEsperaItem>>(`/lista-espera/${id}/status`, {
    method: 'PATCH',
    body: { status },
  });
  return extrairDados(resposta, 'Não foi possível atualizar a lista de espera.');
}
