import { ErroApi, type RespostaApi } from './resposta-api';

const API_URL_BASE = typeof import.meta.env.VITE_API_URL === 'string' ? import.meta.env.VITE_API_URL : '/api/v1';

let obterToken: () => string | null = () => null;
let renovar: (() => Promise<boolean>) | null = null;

export function configurarAutenticacaoApi(configuracao: {
  obterToken: () => string | null;
  renovar: () => Promise<boolean>;
}) {
  obterToken = configuracao.obterToken;
  renovar = configuracao.renovar;
}

interface OpcoesApi extends Omit<RequestInit, 'body'> {
  body?: unknown;
  repetirAposRenovar?: boolean;
}

export async function requisicaoApi<T>(caminho: string, opcoes: OpcoesApi = {}): Promise<T> {
  const { body, headers, repetirAposRenovar = true, ...init } = opcoes;
  const token = obterToken();
  const resposta = await fetch(`${API_URL_BASE}${caminho}`, {
    ...init,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (resposta.status === 401 && repetirAposRenovar && renovar && (await renovar())) {
    return requisicaoApi<T>(caminho, { ...opcoes, repetirAposRenovar: false });
  }

  if (!resposta.ok) {
    let payload: Partial<RespostaApi<unknown>> | null = null;
    try {
      payload = (await resposta.json()) as Partial<RespostaApi<unknown>>;
    } catch {
      // Respostas sem JSON usam uma mensagem segura e previsivel.
    }
    throw new ErroApi(
      payload?.erros?.[0] ?? payload?.mensagem ?? 'Não foi possível concluir a operação. Tente novamente.',
      resposta.status,
      payload?.erros ?? [],
    );
  }

  if (resposta.status === 204) return undefined as T;
  return (await resposta.json()) as T;
}

export async function requisicaoPublica<T>(caminho: string, opcoes: OpcoesApi = {}): Promise<T> {
  const { body, headers, ...init } = opcoes;
  const resposta = await fetch(`${API_URL_BASE}${caminho}`, {
    ...init,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
  });

  if (!resposta.ok) {
    const payload = (await resposta.json().catch(() => null)) as Partial<RespostaApi<unknown>> | null;
    throw new ErroApi(
      payload?.erros?.[0] ?? payload?.mensagem ?? 'Não foi possível concluir a operação. Tente novamente.',
      resposta.status,
      payload?.erros ?? [],
    );
  }

  if (resposta.status === 204) return undefined as T;
  return (await resposta.json()) as T;
}
