import { describe, expect, it } from 'vitest';

import { filtrarLinhaDoTempo, montarLinhaDoTempo, planoAtual } from './prontuario.dados';
import type { EvolucaoProntuario, RegistroSessao } from './sessoes.api';

const registro = (id: string, dataSessao: string, evolucao: string): RegistroSessao => ({
  id,
  consultaId: `c-${id}`,
  pacienteId: 'p1',
  dataSessao,
  status: 'Finalizado',
  observacoesClinicas: null,
  evolucao,
  encaminhamentos: null,
  proximaSessaoSugeridaEm: null,
});

const evolucao = (id: string, dataEvolucao: string, tipo: EvolucaoProntuario['tipo'], conteudo: string): EvolucaoProntuario => ({
  id,
  prontuarioId: 'pr1',
  pacienteId: 'p1',
  tipo,
  conteudo,
  dataEvolucao,
});

describe('linha do tempo do prontuário', () => {
  const itens = montarLinhaDoTempo(
    [registro('s1', '2026-10-05T10:00:00Z', 'Relata ansiedade no trabalho.')],
    [evolucao('e1', '2026-10-12T10:00:00Z', 'PlanoTerapeutico', 'Sessões semanais.'), evolucao('e0', '2026-09-01T10:00:00Z', 'PlanoTerapeutico', 'Plano antigo.')],
  );

  it('ordena do mais recente ao mais antigo', () => {
    expect(itens.map((item) => item.id)).toEqual(['e1', 's1', 'e0']);
  });

  it('busca sem diferenciar acentos nem maiúsculas', () => {
    expect(filtrarLinhaDoTempo(itens, 'ANSIEDADE').map((item) => item.id)).toEqual(['s1']);
    expect(filtrarLinhaDoTempo(itens, 'sessoes').map((item) => item.id)).toEqual(['e1']);
  });

  it('o plano vigente é o mais recente', () => {
    expect(planoAtual(itens.flatMap((item) => (item.tipo === 'evolucao' ? [item.evolucao] : [])))?.id).toBe('e1');
  });
});
