import type { EvolucaoProntuario, RegistroSessao } from './sessoes.api';

export type ItemLinhaDoTempo =
  | { tipo: 'sessao'; id: string; data: string; registro: RegistroSessao }
  | { tipo: 'evolucao'; id: string; data: string; evolucao: EvolucaoProntuario };

/** Sessões e evoluções numa só linha do tempo, da mais recente à mais antiga. */
export function montarLinhaDoTempo(registros: RegistroSessao[], evolucoes: EvolucaoProntuario[]): ItemLinhaDoTempo[] {
  return [
    ...registros.map((registro) => ({ tipo: 'sessao' as const, id: registro.id, data: registro.dataSessao, registro })),
    ...evolucoes.map((evolucao) => ({ tipo: 'evolucao' as const, id: evolucao.id, data: evolucao.dataEvolucao, evolucao })),
  ].sort((a, b) => b.data.localeCompare(a.data));
}

const semAcento = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');

/** Busca local (o conteúdo é cifrado no banco, então não há busca no servidor), sem diferenciar acentos. */
export function filtrarLinhaDoTempo(itens: ItemLinhaDoTempo[], termo: string): ItemLinhaDoTempo[] {
  const busca = semAcento(termo.trim());
  if (!busca) return itens;
  return itens.filter((item) => {
    const texto =
      item.tipo === 'sessao'
        ? [item.registro.observacoesClinicas, item.registro.evolucao, item.registro.encaminhamentos].filter(Boolean).join(' ')
        : item.evolucao.conteudo;
    return semAcento(texto).includes(busca);
  });
}

/** O plano terapêutico vigente é a evolução mais recente desse tipo. */
export function planoAtual(evolucoes: EvolucaoProntuario[]) {
  return [...evolucoes].filter((evolucao) => evolucao.tipo === 'PlanoTerapeutico').sort((a, b) => b.dataEvolucao.localeCompare(a.dataEvolucao))[0] ?? null;
}

/** Roteiros opcionais para o registro da sessão: só preenchem campos vazios, nunca apagam o que já foi escrito. */
export const roteirosRegistro = {
  livre: { rotulo: 'Livre', observacoes: '', evolucao: '' },
  estruturado: {
    rotulo: 'Estruturado',
    observacoes: 'Demanda trazida:\n\nIntervenções:\n\nPercepções:\n',
    evolucao: 'Avanços:\n\nPontos de atenção:\n',
  },
  dap: {
    rotulo: 'DAP',
    observacoes: 'Dados (o que foi trazido e observado):\n\nAvaliação (compreensão clínica):\n',
    evolucao: 'Plano (próximos passos):\n',
  },
} as const;

export type Roteiro = keyof typeof roteirosRegistro;
