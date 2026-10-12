import { requisicaoApi } from '../../core/api/cliente-api';
import { aplicarPaginacaoAQuery, type ResultadoPaginado } from '../../core/api/paginacao';
import { extrairDados, type RespostaApi } from '../../core/api/resposta-api';
import type { CanalComunicacao } from '../agenda/agenda.types';

export type TipoLembrete =
  | 'ConfirmacaoConsulta'
  | 'LembreteConsulta'
  | 'CancelamentoConsulta'
  | 'RemarcacaoConsulta'
  | 'PagamentoPendente';
export type StatusLembrete = 'Agendado' | 'Enviado' | 'Falhou' | 'Cancelado' | 'Ignorado';

export interface Lembrete {
  id: string;
  consultaId: string;
  consultaInicioEm: string;
  pacienteId: string;
  paciente: string;
  modeloMensagemId: string | null;
  modeloMensagem: string | null;
  canal: CanalComunicacao;
  tipo: TipoLembrete;
  status: StatusLembrete;
  agendadoPara: string;
  enviadoEm: string | null;
  mensagem: string | null;
  assunto: string | null;
  erroEnvio: string | null;
  criadoEm: string;
  atualizadoEm: string | null;
}

export interface LembreteIndicadores {
  programados: number;
  enviados: number;
  falhos: number;
  cancelados: number;
}

export interface CriarLembreteRequest {
  consultaId: string;
  modeloMensagemId?: string | null;
  canal: CanalComunicacao;
  tipo: TipoLembrete;
  agendadoPara: string;
  assunto?: string | null;
  mensagem?: string | null;
}

export interface ListarLembretesFiltro {
  status?: StatusLembrete | '';
  pagina?: number;
  tamanhoPagina?: number;
}

export const lembretesKeys = {
  todos: ['lembretes'] as const,
  lista: (filtro: ListarLembretesFiltro) => [...lembretesKeys.todos, 'lista', filtro] as const,
  indicadores: () => [...lembretesKeys.todos, 'indicadores'] as const,
};

function queryFiltro(filtro: ListarLembretesFiltro) {
  const params = new URLSearchParams();
  aplicarPaginacaoAQuery(params, filtro);
  if (filtro.status) params.set('status', filtro.status);
  return `?${params}`;
}

export async function listarLembretes(filtro: ListarLembretesFiltro = {}, { signal }: { signal?: AbortSignal } = {}) {
  const resposta = await requisicaoApi<RespostaApi<ResultadoPaginado<Lembrete>>>(`/lembretes${queryFiltro(filtro)}`, { signal });
  return extrairDados(resposta, 'Não foi possível carregar os lembretes.');
}

export async function indicadoresLembretes({ signal }: { signal?: AbortSignal } = {}) {
  const resposta = await requisicaoApi<RespostaApi<LembreteIndicadores>>('/lembretes/indicadores', { signal });
  return extrairDados(resposta, 'Não foi possível carregar indicadores de lembretes.');
}

export async function criarLembrete(request: CriarLembreteRequest) {
  const resposta = await requisicaoApi<RespostaApi<Lembrete>>('/lembretes', { method: 'POST', body: request });
  return extrairDados(resposta, 'Não foi possível criar o lembrete.');
}

export async function cancelarLembrete(id: string) {
  const resposta = await requisicaoApi<RespostaApi<Lembrete>>(`/lembretes/${id}/cancelar`, { method: 'POST' });
  return extrairDados(resposta, 'Não foi possível cancelar o lembrete.');
}

export async function tentarNovamenteLembrete(id: string) {
  const resposta = await requisicaoApi<RespostaApi<Lembrete>>(`/lembretes/${id}/tentar-novamente`, { method: 'POST' });
  return extrairDados(resposta, 'Não foi possível reenviar o lembrete.');
}
