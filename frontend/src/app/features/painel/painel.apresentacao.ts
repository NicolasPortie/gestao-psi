import type { DescricaoEstado } from '../../core/dominio/estado';
import { pluralizar } from '../../core/formatacao/texto';
import type { PainelResumo } from './painel.types';

type Prioridade = PainelResumo['prioridades'][number];

export function saudacao(hora: number) {
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

/** Frase de abertura do dia, montada só com números que a API já entrega. */
export function resumoDoDia(indicadores: Pick<PainelResumo['indicadores'], 'consultasHoje' | 'consultasRestantesHoje'>) {
  const { consultasHoje, consultasRestantesHoje } = indicadores;
  if (consultasHoje === 0) return 'Não há consultas marcadas para hoje.';
  const total = pluralizar(consultasHoje, 'consulta');
  if (consultasRestantesHoje === 0) return consultasHoje === 1 ? 'A consulta de hoje já passou.' : `As ${consultasHoje} consultas de hoje já passaram.`;
  if (consultasRestantesHoje === consultasHoje) return `Você tem ${total} hoje, ${consultasHoje === 1 ? 'ainda por vir' : 'todas ainda por vir'}.`;
  return `Você tem ${total} hoje; ${consultasRestantesHoje === 1 ? '1 ainda por vir' : `${consultasRestantesHoje} ainda por vir`}.`;
}

/** O tom que a API envia para cada prioridade vira a marca correspondente. */
export function estadoDaPrioridade(tom: Prioridade['tom']): DescricaoEstado {
  switch (tom) {
    case 'erro':
      return { rotulo: 'Urgente', tom: 'perigo', marca: 'x' };
    case 'alerta':
    case 'atencao':
      return { rotulo: 'Atenção', tom: 'aviso', marca: 'meio' };
    case 'ok':
      return { rotulo: 'Em dia', tom: 'sucesso', marca: 'check' };
    default:
      return { rotulo: 'Informativo', tom: 'neutro', marca: 'anel' };
  }
}

/** Minutos desde 00:00 a partir de "HH:mm" ou "HH:mm:ss"; NaN se o texto for inesperado. */
export function minutosDeHorario(horario: string): number {
  const [horas, minutos] = horario.split(':').map(Number);
  return (horas ?? Number.NaN) * 60 + (minutos ?? Number.NaN);
}

export type SituacaoNoDia = 'passada' | 'andamento' | 'proxima' | 'futura';

/** Classifica cada consulta do dia em relação ao instante atual, para destacar a próxima e marcar "agora". */
export function situacoesDoDia(
  consultas: ReadonlyArray<{ horarioInicio: string; duracaoMinutos: number }>,
  minutosAgora: number,
): SituacaoNoDia[] {
  let proximaMarcada = false;
  return consultas.map((consulta) => {
    const inicio = minutosDeHorario(consulta.horarioInicio);
    const fim = inicio + consulta.duracaoMinutos;
    if (fim <= minutosAgora) return 'passada';
    if (inicio <= minutosAgora) return 'andamento';
    if (!proximaMarcada) {
      proximaMarcada = true;
      return 'proxima';
    }
    return 'futura';
  });
}
