import { requisicaoApi } from '../../core/api/cliente-api';
import { extrairDados, type RespostaApi } from '../../core/api/resposta-api';
import type {
  AlterarStatusConsultaRequest,
  BloqueioAgenda,
  ConfiguracaoAtendimento,
  Consulta,
  CriarConsultaRequest,
  HorarioDisponivel,
  RemarcarConsultaRequest,
  SerieConsultas,
  SalvarBloqueioAgendaRequest,
  SalvarHorarioDisponivelRequest,
  SalvarTipoAtendimentoRequest,
  TipoAtendimento,
} from './agenda.types';

export const agendaKeys = {
  todos: ['agenda'] as const,
  consultas: (inicio: string, fim: string, pacienteId = '') => [...agendaKeys.todos, 'consultas', inicio, fim, pacienteId] as const,
  consulta: (id: string) => [...agendaKeys.todos, 'consulta', id] as const,
  configuracao: () => [...agendaKeys.todos, 'configuracao'] as const,
  tipos: () => [...agendaKeys.todos, 'tipos'] as const,
  horarios: () => [...agendaKeys.todos, 'horarios'] as const,
  bloqueios: (inicio: string, fim: string) => [...agendaKeys.todos, 'bloqueios', inicio, fim] as const,
  horariosLivres: (data: string, duracao: number) => [...agendaKeys.todos, 'horarios-livres', data, duracao] as const,
};

export async function listarConsultas(
  inicio: string,
  fim: string,
  { signal, pacienteId }: { signal?: AbortSignal; pacienteId?: string } = {},
) {
  const params = new URLSearchParams({ inicio, fim });
  if (pacienteId) params.set('pacienteId', pacienteId);
  const resposta = await requisicaoApi<RespostaApi<Consulta[]>>(`/consultas?${params}`, { signal });
  return extrairDados(resposta, 'Não foi possível carregar a agenda.');
}

export async function obterConsulta(id: string, { signal }: { signal?: AbortSignal } = {}) {
  const resposta = await requisicaoApi<RespostaApi<Consulta>>(`/consultas/${id}`, { signal });
  return extrairDados(resposta, 'Não foi possível carregar a consulta.');
}

export async function criarConsulta(request: CriarConsultaRequest) {
  const resposta = await requisicaoApi<RespostaApi<Consulta>>('/consultas', { method: 'POST', body: request });
  return extrairDados(resposta, 'Não foi possível criar a consulta.');
}

/** Cria a consulta e, com `recorrencia`, as repetições no mesmo horário. Horários ocupados voltam em `ignoradas`. */
export async function criarSerieConsultas(request: CriarConsultaRequest) {
  const resposta = await requisicaoApi<RespostaApi<SerieConsultas>>('/consultas/serie', { method: 'POST', body: request });
  return extrairDados(resposta, 'Não foi possível criar as consultas.');
}

/** Cancela esta consulta e as próximas em aberto da mesma série. */
export async function cancelarSerieConsultas(id: string, justificativa?: string | null) {
  const resposta = await requisicaoApi<RespostaApi<{ canceladas: number }>>(`/consultas/${id}/cancelar-serie`, {
    method: 'PATCH',
    body: { justificativa: justificativa ?? null },
  });
  return extrairDados(resposta, 'Não foi possível cancelar as consultas da série.');
}

/** Inícios livres ("HH:mm") no dia, para uma consulta da duração informada. */
export async function listarHorariosLivres(data: string, duracaoMinutos: number, { signal }: { signal?: AbortSignal } = {}) {
  const params = new URLSearchParams({ data, duracaoMinutos: String(duracaoMinutos) });
  const resposta = await requisicaoApi<RespostaApi<string[]>>(`/agenda/horarios-livres?${params}`, { signal });
  return extrairDados(resposta, 'Não foi possível carregar os horários livres.');
}

export async function alterarStatusConsulta(id: string, request: AlterarStatusConsultaRequest) {
  const resposta = await requisicaoApi<RespostaApi<Consulta>>(`/consultas/${id}/status`, {
    method: 'PATCH',
    body: request,
  });
  return extrairDados(resposta, 'Não foi possível atualizar o status da consulta.');
}

export async function remarcarConsulta(id: string, request: RemarcarConsultaRequest) {
  const resposta = await requisicaoApi<RespostaApi<Consulta>>(`/consultas/${id}/remarcar`, {
    method: 'PATCH',
    body: request,
  });
  return extrairDados(resposta, 'Não foi possível remarcar a consulta.');
}

export async function obterConfiguracaoAgenda({ signal }: { signal?: AbortSignal } = {}) {
  const resposta = await requisicaoApi<RespostaApi<ConfiguracaoAtendimento>>('/agenda/configuracoes', { signal });
  return extrairDados(resposta, 'Não foi possível carregar as configurações.');
}

export async function salvarConfiguracaoAgenda(request: ConfiguracaoAtendimento) {
  const resposta = await requisicaoApi<RespostaApi<ConfiguracaoAtendimento>>('/agenda/configuracoes', {
    method: 'PUT',
    body: request,
  });
  return extrairDados(resposta, 'Não foi possível salvar as configurações.');
}

export async function listarTiposAtendimento({ signal }: { signal?: AbortSignal } = {}) {
  const resposta = await requisicaoApi<RespostaApi<TipoAtendimento[]>>('/agenda/tipos-atendimento', { signal });
  return extrairDados(resposta, 'Não foi possível carregar os tipos de atendimento.');
}

export async function salvarTipoAtendimento(id: string | null, request: SalvarTipoAtendimentoRequest) {
  const caminho = id ? `/agenda/tipos-atendimento/${id}` : '/agenda/tipos-atendimento';
  const resposta = await requisicaoApi<RespostaApi<TipoAtendimento>>(caminho, {
    method: id ? 'PUT' : 'POST',
    body: request,
  });
  return extrairDados(resposta, 'Não foi possível salvar o tipo de atendimento.');
}

export async function listarHorariosDisponiveis({ signal }: { signal?: AbortSignal } = {}) {
  const resposta = await requisicaoApi<RespostaApi<HorarioDisponivel[]>>('/agenda/horarios-disponiveis', { signal });
  return extrairDados(resposta, 'Não foi possível carregar os horários.');
}

export async function salvarHorarioDisponivel(id: string | null, request: SalvarHorarioDisponivelRequest) {
  const caminho = id ? `/agenda/horarios-disponiveis/${id}` : '/agenda/horarios-disponiveis';
  const resposta = await requisicaoApi<RespostaApi<HorarioDisponivel>>(caminho, {
    method: id ? 'PUT' : 'POST',
    body: request,
  });
  return extrairDados(resposta, 'Não foi possível salvar o horário.');
}

export async function listarBloqueios(inicio: string, fim: string, { signal }: { signal?: AbortSignal } = {}) {
  const params = new URLSearchParams({ inicio, fim });
  const resposta = await requisicaoApi<RespostaApi<BloqueioAgenda[]>>(`/agenda/bloqueios?${params}`, { signal });
  return extrairDados(resposta, 'Não foi possível carregar os bloqueios.');
}

export async function salvarBloqueio(id: string | null, request: SalvarBloqueioAgendaRequest) {
  const caminho = id ? `/agenda/bloqueios/${id}` : '/agenda/bloqueios';
  const resposta = await requisicaoApi<RespostaApi<BloqueioAgenda>>(caminho, {
    method: id ? 'PUT' : 'POST',
    body: request,
  });
  return extrairDados(resposta, 'Não foi possível salvar o bloqueio.');
}

export async function removerBloqueio(id: string) {
  await requisicaoApi<void>(`/agenda/bloqueios/${id}`, { method: 'DELETE' });
}
