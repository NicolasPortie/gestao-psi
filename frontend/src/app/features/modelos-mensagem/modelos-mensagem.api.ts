import { requisicaoApi } from '../../core/api/cliente-api';
import { extrairDados, type RespostaApi } from '../../core/api/resposta-api';
import type { CanalComunicacao } from '../agenda/agenda.types';
import type { TipoLembrete } from '../lembretes/lembretes.api';

export interface ModeloMensagem {
  id: string;
  nome: string;
  tipo: TipoLembrete;
  canal: CanalComunicacao;
  assunto: string | null;
  conteudo: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string | null;
}

export interface VariavelModelo {
  chave: string;
  descricao: string;
  marcador: string;
}

export interface PreviaModelo {
  assunto: string | null;
  conteudo: string;
  variaveisUtilizadas: string[];
}

export interface SalvarModeloRequest {
  nome: string;
  tipo: TipoLembrete;
  canal: CanalComunicacao;
  assunto?: string | null;
  conteudo: string;
  ativo: boolean;
}

export const modelosKeys = {
  todos: ['modelos-mensagem'] as const,
  lista: () => [...modelosKeys.todos, 'lista'] as const,
  variaveis: () => [...modelosKeys.todos, 'variaveis'] as const,
};

export async function listarModelosMensagem({ signal }: { signal?: AbortSignal } = {}) {
  const resposta = await requisicaoApi<RespostaApi<ModeloMensagem[]>>('/modelos-mensagem', { signal });
  return extrairDados(resposta, 'Não foi possível carregar os modelos.');
}

export async function listarVariaveisModelo({ signal }: { signal?: AbortSignal } = {}) {
  const resposta = await requisicaoApi<RespostaApi<VariavelModelo[]>>('/modelos-mensagem/variaveis', { signal });
  return extrairDados(resposta, 'Não foi possível carregar as variáveis.');
}

export async function criarModeloMensagem(request: SalvarModeloRequest) {
  const resposta = await requisicaoApi<RespostaApi<ModeloMensagem>>('/modelos-mensagem', {
    method: 'POST',
    body: request,
  });
  return extrairDados(resposta, 'Não foi possível criar o modelo.');
}

export async function atualizarModeloMensagem(id: string, request: SalvarModeloRequest) {
  const resposta = await requisicaoApi<RespostaApi<ModeloMensagem>>(`/modelos-mensagem/${id}`, {
    method: 'PUT',
    body: request,
  });
  return extrairDados(resposta, 'Não foi possível atualizar o modelo.');
}

export async function alterarAtivoModelo(id: string, ativo: boolean) {
  const resposta = await requisicaoApi<RespostaApi<ModeloMensagem>>(`/modelos-mensagem/${id}/ativo`, {
    method: 'PATCH',
    body: { ativo },
  });
  return extrairDados(resposta, 'Não foi possível alterar o modelo.');
}

export async function previaModeloMensagem(assunto: string | null, conteudo: string) {
  const resposta = await requisicaoApi<RespostaApi<PreviaModelo>>('/modelos-mensagem/previa', {
    method: 'POST',
    body: { assunto, conteudo },
  });
  return extrairDados(resposta, 'Não foi possível gerar a prévia.');
}
