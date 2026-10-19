import { requisicaoApi } from '../../core/api/cliente-api';
import { extrairDados, type RespostaApi } from '../../core/api/resposta-api';
import type { PermissaoAcesso } from '../../core/dominio/permissao-acesso';

export interface PerfilAcesso {
  id: string;
  nome: string;
  descricao: string | null;
  permissoes: PermissaoAcesso[];
  pessoas: number;
}

export interface PermissaoCatalogo {
  valor: PermissaoAcesso;
  rotulo: string;
  descricao: string;
}

export interface SalvarPerfilAcessoRequest {
  nome: string;
  descricao?: string | null;
  permissoes: PermissaoAcesso[];
}

export const perfisAcessoKeys = {
  todos: ['perfis-acesso'] as const,
  lista: () => [...perfisAcessoKeys.todos, 'lista'] as const,
  catalogo: () => [...perfisAcessoKeys.todos, 'catalogo'] as const,
};

export async function listarPerfisAcesso({ signal }: { signal?: AbortSignal } = {}) {
  const resposta = await requisicaoApi<RespostaApi<PerfilAcesso[]>>('/perfis-acesso', { signal });
  return extrairDados(resposta, 'Não foi possível carregar os perfis.');
}

export async function listarPermissoes({ signal }: { signal?: AbortSignal } = {}) {
  const resposta = await requisicaoApi<RespostaApi<PermissaoCatalogo[]>>(
    '/perfis-acesso/permissoes',
    { signal },
  );
  return extrairDados(resposta, 'Não foi possível carregar a lista de acessos.');
}

export async function criarPerfilAcesso(request: SalvarPerfilAcessoRequest) {
  const resposta = await requisicaoApi<RespostaApi<PerfilAcesso>>('/perfis-acesso', {
    method: 'POST',
    body: request,
  });
  return extrairDados(resposta, 'Não foi possível criar o perfil.');
}

export async function atualizarPerfilAcesso(id: string, request: SalvarPerfilAcessoRequest) {
  const resposta = await requisicaoApi<RespostaApi<PerfilAcesso>>(`/perfis-acesso/${id}`, {
    method: 'PUT',
    body: request,
  });
  return extrairDados(resposta, 'Não foi possível salvar o perfil.');
}

export async function removerPerfilAcesso(id: string) {
  const resposta = await requisicaoApi<RespostaApi<unknown>>(`/perfis-acesso/${id}`, {
    method: 'DELETE',
  });
  return extrairDados(resposta, 'Não foi possível remover o perfil.');
}
