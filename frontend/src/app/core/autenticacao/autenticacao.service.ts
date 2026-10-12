import { useSyncExternalStore } from 'react';

import { configurarAutenticacaoApi, requisicaoApi, requisicaoPublica } from '../api/cliente-api';
import { extrairDados, type RespostaApi } from '../api/resposta-api';
import type {
  AutenticacaoResponse,
  CriarContaRequest,
  EstadoSessao,
  LoginRequest,
} from './autenticacao.types';

let estado: EstadoSessao = { status: 'verificando', usuario: null, accessToken: null };
const ouvintes = new Set<() => void>();
let renovacaoEmAndamento: Promise<boolean> | null = null;

function publicar(novoEstado: EstadoSessao) {
  estado = novoEstado;
  ouvintes.forEach((ouvinte) => ouvinte());
}

function aplicarAutenticacao(resposta: AutenticacaoResponse) {
  publicar({ status: 'autenticado', usuario: resposta.usuario, accessToken: resposta.accessToken });
}

export function obterEstadoSessao() {
  return estado;
}

export function observarSessao(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

export function useSessao() {
  return useSyncExternalStore(observarSessao, obterEstadoSessao, obterEstadoSessao);
}

export async function entrar(request: LoginRequest) {
  const envelope = await requisicaoPublica<RespostaApi<AutenticacaoResponse>>('/autenticacao/login', {
    method: 'POST',
    body: request,
  });
  const autenticacao = extrairDados(envelope, 'Não foi possível entrar.');
  aplicarAutenticacao(autenticacao);
  return autenticacao;
}

export async function criarConta(request: CriarContaRequest) {
  const envelope = await requisicaoPublica<RespostaApi<AutenticacaoResponse>>('/autenticacao/cadastro', {
    method: 'POST',
    body: request,
  });
  const autenticacao = extrairDados(envelope, 'Não foi possível criar a conta.');
  aplicarAutenticacao(autenticacao);
  return autenticacao;
}

/** Troca a senha da sessão ativa. O servidor encerra as outras sessões e devolve uma nova para esta. */
export async function alterarSenha(senhaAtual: string, novaSenha: string) {
  const envelope = await requisicaoApi<RespostaApi<AutenticacaoResponse>>('/autenticacao/senha/alterar', {
    method: 'POST',
    body: { senhaAtual, novaSenha },
  });
  aplicarAutenticacao(extrairDados(envelope, 'Não foi possível alterar a senha.'));
}

export async function renovarSessao(): Promise<boolean> {
  if (renovacaoEmAndamento) return renovacaoEmAndamento;

  renovacaoEmAndamento = (async () => {
    try {
      const envelope = await requisicaoPublica<RespostaApi<AutenticacaoResponse>>('/autenticacao/token/renovar', {
        method: 'POST',
        body: {},
      });
      aplicarAutenticacao(extrairDados(envelope, 'Sessão expirada.'));
      return true;
    } catch {
      publicar({ status: 'anonimo', usuario: null, accessToken: null });
      return false;
    } finally {
      renovacaoEmAndamento = null;
    }
  })();

  return renovacaoEmAndamento;
}

export async function restaurarSessao() {
  if (estado.status === 'autenticado') return true;
  return renovarSessao();
}

export async function sair() {
  try {
    await requisicaoApi<void>('/autenticacao/sair', { method: 'POST', body: {} });
  } finally {
    publicar({ status: 'anonimo', usuario: null, accessToken: null });
  }
}

export async function solicitarRecuperacaoSenha(email: string) {
  await requisicaoPublica('/autenticacao/recuperacao-senha/solicitar', {
    method: 'POST',
    body: { email },
  });
}

export async function redefinirSenha(token: string, novaSenha: string) {
  await requisicaoPublica('/autenticacao/recuperacao-senha/redefinir', {
    method: 'POST',
    body: { token, novaSenha },
  });
}

configurarAutenticacaoApi({
  obterToken: () => (estado.status === 'autenticado' ? estado.accessToken : null),
  renovar: renovarSessao,
});
