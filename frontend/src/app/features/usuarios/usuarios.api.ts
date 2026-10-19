import { requisicaoApi } from '../../core/api/cliente-api';
import { extrairDados, type RespostaApi } from '../../core/api/resposta-api';

export type PerfilUsuario =
  'Psicologo' | 'Recepcionista' | 'Paciente' | 'Administrador' | 'Personalizado';
export type StatusUsuario = 'Ativo' | 'Inativo' | 'Bloqueado' | 'Pendente';

export interface Usuario {
  id: string;
  nomeCompleto: string;
  email: string;
  telefone: string | null;
  perfil: PerfilUsuario;
  status: StatusUsuario;
  ultimoAcessoEm: string | null;
  perfilAcessoId: string | null;
  /** Nome do perfil criado pela conta, quando o perfil é personalizado. */
  nomeDoPerfil: string | null;
}

export interface CriarUsuarioRequest {
  nomeCompleto: string;
  email: string;
  senha: string;
  telefone?: string | null;
  perfil: 'Recepcionista' | 'Administrador' | 'Personalizado';
  perfilAcessoId?: string | null;
}

export interface AlterarPerfilRequest {
  perfil: 'Recepcionista' | 'Administrador' | 'Personalizado';
  perfilAcessoId?: string | null;
}

export const usuariosKeys = {
  todos: ['usuarios'] as const,
  lista: () => [...usuariosKeys.todos, 'lista'] as const,
};

export async function listarUsuarios({ signal }: { signal?: AbortSignal } = {}) {
  const resposta = await requisicaoApi<RespostaApi<Usuario[]>>('/usuarios', { signal });
  return extrairDados(resposta, 'Não foi possível carregar os usuários.');
}

export async function criarUsuario(request: CriarUsuarioRequest) {
  const resposta = await requisicaoApi<RespostaApi<Usuario>>('/usuarios', {
    method: 'POST',
    body: request,
  });
  return extrairDados(resposta, 'Não foi possível criar o usuário.');
}

export async function alterarStatusUsuario(id: string, status: StatusUsuario) {
  const resposta = await requisicaoApi<RespostaApi<Usuario>>(`/usuarios/${id}/status`, {
    method: 'PATCH',
    body: { status },
  });
  return extrairDados(resposta, 'Não foi possível atualizar o usuário.');
}

export async function alterarPerfilUsuario(id: string, request: AlterarPerfilRequest) {
  const resposta = await requisicaoApi<RespostaApi<Usuario>>(`/usuarios/${id}/perfil`, {
    method: 'PATCH',
    body: request,
  });
  return extrairDados(resposta, 'Não foi possível alterar o perfil.');
}

export async function atualizarUsuario(
  id: string,
  request: { nomeCompleto: string; telefone?: string | null },
) {
  const resposta = await requisicaoApi<RespostaApi<Usuario>>(`/usuarios/${id}`, {
    method: 'PUT',
    body: request,
  });
  return extrairDados(resposta, 'Não foi possível atualizar o usuário.');
}

export async function redefinirSenhaUsuario(id: string, novaSenha: string) {
  const resposta = await requisicaoApi<RespostaApi<unknown>>(`/usuarios/${id}/redefinir-senha`, {
    method: 'POST',
    body: { novaSenha },
  });
  return extrairDados(resposta, 'Não foi possível redefinir a senha.');
}
