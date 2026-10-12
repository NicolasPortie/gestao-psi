import { requisicaoApi } from '../../core/api/cliente-api';
import { aplicarPaginacaoAQuery, type ResultadoPaginado } from '../../core/api/paginacao';
import { extrairDados, type RespostaApi } from '../../core/api/resposta-api';

export type TipoDocumentoPsicologico =
  | 'Declaracao'
  | 'AtestadoPsicologico'
  | 'RelatorioPsicologico'
  | 'RelatorioMultiprofissional'
  | 'LaudoPsicologico'
  | 'ParecerPsicologico'
  | 'Encaminhamento'
  | 'ResumoAcompanhamento'
  | 'Devolutiva'
  | 'InformePsicologico'
  | 'Outro';

export type StatusDocumentoProntuario =
  | 'Rascunho'
  | 'EmRevisao'
  | 'Finalizado'
  | 'Entregue'
  | 'Retificado'
  | 'Arquivado'
  | 'Cancelado';

export interface DocumentoLista {
  id: string;
  pacienteId: string;
  paciente: string;
  tipo: TipoDocumentoPsicologico;
  status: StatusDocumentoProntuario;
  titulo: string;
  finalidade: string | null;
  criadoEm: string;
  finalizadoEm: string | null;
}

export interface DocumentoDetalhe extends DocumentoLista {
  solicitante: string | null;
  conteudo: string;
  versoes: Array<{ id: string; numeroVersao: number; motivoAlteracao: string | null; criadoEm: string }>;
  entregas: Array<{
    id: string;
    tipoEntrega: string;
    status: string;
    destinatario: string | null;
    entregueEm: string;
  }>;
}

export interface CriarDocumentoRequest {
  pacienteId: string;
  tipo: TipoDocumentoPsicologico;
  titulo: string;
  finalidade?: string | null;
  solicitante?: string | null;
  conteudo: string;
}

export interface ListarDocumentosFiltro {
  pacienteId?: string;
  pagina?: number;
  tamanhoPagina?: number;
}

export const documentosKeys = {
  todos: ['documentos'] as const,
  lista: (filtro: ListarDocumentosFiltro = {}) => [...documentosKeys.todos, 'lista', filtro] as const,
  detalhe: (id: string) => [...documentosKeys.todos, 'detalhe', id] as const,
};

export async function listarDocumentos(filtro: ListarDocumentosFiltro = {}, { signal }: { signal?: AbortSignal } = {}) {
  const params = new URLSearchParams();
  aplicarPaginacaoAQuery(params, filtro);
  if (filtro.pacienteId) params.set('pacienteId', filtro.pacienteId);
  const resposta = await requisicaoApi<RespostaApi<ResultadoPaginado<DocumentoLista>>>(`/documentos?${params}`, { signal });
  return extrairDados(resposta, 'Não foi possível carregar os documentos.');
}

export async function obterDocumento(id: string, { signal }: { signal?: AbortSignal } = {}) {
  const resposta = await requisicaoApi<RespostaApi<DocumentoDetalhe>>(`/documentos/${id}`, { signal });
  return extrairDados(resposta, 'Não foi possível carregar o documento.');
}

export async function criarDocumento(request: CriarDocumentoRequest) {
  const resposta = await requisicaoApi<RespostaApi<DocumentoDetalhe>>('/documentos', {
    method: 'POST',
    body: request,
  });
  return extrairDados(resposta, 'Não foi possível criar o documento.');
}

export async function finalizarDocumento(id: string) {
  const resposta = await requisicaoApi<RespostaApi<DocumentoDetalhe>>(`/documentos/${id}/finalizar`, {
    method: 'POST',
  });
  return extrairDados(resposta, 'Não foi possível finalizar o documento.');
}

export async function registrarEntregaDocumento(
  id: string,
  request: { tipoEntrega: string; destinatario?: string | null; observacao?: string | null },
) {
  const resposta = await requisicaoApi<RespostaApi<unknown>>(`/documentos/${id}/entregas`, {
    method: 'POST',
    body: request,
  });
  return extrairDados(resposta, 'Não foi possível registrar a entrega.');
}
