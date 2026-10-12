import { requisicaoApi } from '../../core/api/cliente-api';
import { ErroApi, extrairDados, type RespostaApi } from '../../core/api/resposta-api';

export interface DadosProfissionais {
  id: string;
  nomeProfissional: string;
  crpMascarado: string;
  bio: string | null;
  emailProfissional: string | null;
  telefoneProfissional: string | null;
}

export interface SalvarDadosProfissionaisRequest {
  nomeProfissional: string;
  crp: string;
  bio?: string | null;
  emailProfissional?: string | null;
  telefoneProfissional?: string | null;
}

export const dadosProfissionaisKeys = {
  todos: ['dados-profissionais'] as const,
  atual: () => [...dadosProfissionaisKeys.todos, 'atual'] as const,
};

export async function obterDadosProfissionais({ signal }: { signal?: AbortSignal } = {}) {
  try {
    const resposta = await requisicaoApi<RespostaApi<DadosProfissionais>>('/dados-profissionais', { signal });
    return extrairDados(resposta, 'Não foi possível carregar os dados profissionais.');
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) return null;
    throw erro;
  }
}

export async function salvarDadosProfissionais(request: SalvarDadosProfissionaisRequest) {
  const resposta = await requisicaoApi<RespostaApi<DadosProfissionais>>('/dados-profissionais', {
    method: 'PUT',
    body: request,
  });
  return extrairDados(resposta, 'Não foi possível salvar os dados profissionais.');
}
