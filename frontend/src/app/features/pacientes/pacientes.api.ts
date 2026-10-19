import { requisicaoApi } from '../../core/api/cliente-api';
import { extrairDados, type RespostaApi } from '../../core/api/resposta-api';
import type {
  AtualizarPacienteRequest,
  CriarPacienteRequest,
  ExportacaoPaciente,
  ListarPacientesFiltro,
  PacienteDetalhe,
  PacientesListagem,
} from './pacientes.types';

function montarQueryListagem(filtro: ListarPacientesFiltro): string {
  const params = new URLSearchParams();
  params.set('pagina', String(filtro.pagina ?? 1));
  params.set('tamanhoPagina', String(filtro.tamanhoPagina ?? 20));

  const busca = filtro.busca?.trim();
  if (busca) params.set('busca', busca);
  if (filtro.status) params.set('status', filtro.status);
  if (filtro.semConsultaHaDias) params.set('semConsultaHaDias', String(filtro.semConsultaHaDias));

  return params.toString();
}

export async function listarPacientes(
  filtro: ListarPacientesFiltro = {},
  { signal }: { signal?: AbortSignal } = {},
) {
  const query = montarQueryListagem(filtro);
  const resposta = await requisicaoApi<RespostaApi<PacientesListagem>>(`/pacientes?${query}`, {
    signal,
  });
  return extrairDados(resposta, 'Não foi possível listar pacientes.');
}

export async function obterPacientePorId(id: string, { signal }: { signal?: AbortSignal } = {}) {
  const resposta = await requisicaoApi<RespostaApi<PacienteDetalhe>>(`/pacientes/${id}`, {
    signal,
  });
  return extrairDados(resposta, 'Paciente não encontrado.');
}

export async function criarPaciente(request: CriarPacienteRequest) {
  const resposta = await requisicaoApi<RespostaApi<PacienteDetalhe>>('/pacientes', {
    method: 'POST',
    body: request,
  });
  return extrairDados(resposta, 'Não foi possível cadastrar o paciente.');
}

export async function atualizarPaciente(id: string, request: AtualizarPacienteRequest) {
  const resposta = await requisicaoApi<RespostaApi<PacienteDetalhe>>(`/pacientes/${id}`, {
    method: 'PUT',
    body: request,
  });
  return extrairDados(resposta, 'Não foi possível atualizar o paciente.');
}

export async function ativarPaciente(id: string) {
  const resposta = await requisicaoApi<RespostaApi<PacienteDetalhe>>(`/pacientes/${id}/ativar`, {
    method: 'PATCH',
  });
  return extrairDados(resposta, 'Não foi possível ativar o paciente.');
}

export async function inativarPaciente(id: string) {
  const resposta = await requisicaoApi<RespostaApi<PacienteDetalhe>>(`/pacientes/${id}/inativar`, {
    method: 'PATCH',
  });
  return extrairDados(resposta, 'Não foi possível inativar o paciente.');
}

/** Registra que o paciente consentiu com o tratamento dos dados (LGPD); fica na auditoria. */
export async function registrarConsentimento(id: string) {
  const resposta = await requisicaoApi<RespostaApi<PacienteDetalhe>>(`/pacientes/${id}/consentimento`, { method: 'POST' });
  return extrairDados(resposta, 'Não foi possível registrar o consentimento.');
}

/** Dados administrativos do paciente para atender a um pedido de acesso. A exportação fica na auditoria. */
export async function exportarDadosPaciente(id: string) {
  const resposta = await requisicaoApi<RespostaApi<ExportacaoPaciente>>(`/pacientes/${id}/exportacao`);
  return extrairDados(resposta, 'Não foi possível exportar os dados do paciente.');
}

export { montarQueryListagem };
