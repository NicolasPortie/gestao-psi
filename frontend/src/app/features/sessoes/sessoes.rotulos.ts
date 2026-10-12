import type { TipoEvolucaoProntuario } from './sessoes.api';

export const rotulosTipoEvolucao: Record<TipoEvolucaoProntuario, string> = {
  ObservacaoClinica: 'Observação clínica',
  MarcoEvolutivo: 'Marco evolutivo',
  HipoteseClinica: 'Hipótese clínica',
  PlanoTerapeutico: 'Plano terapêutico',
  Encaminhamento: 'Encaminhamento',
  RevisaoCaso: 'Revisão de caso',
};
