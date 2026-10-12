import type { HorarioDisponivel } from './agenda.types';
import type { DiaSemana } from './agenda.types';
import { diasSemana } from './agenda.rotulos';

/**
 * Geometria da grade semanal. Funções puras de apresentação: decidem onde cada
 * bloco aparece, nunca se ele pode existir (isso é regra do backend).
 */

export interface Intervalo {
  inicio: Date;
  fim: Date;
}

export interface Posicionado<T> {
  item: T;
  /** Coluna dentro do grupo de itens sobrepostos (0..colunas-1). */
  coluna: number;
  colunas: number;
}

/** Distribui itens que se sobrepõem em colunas lado a lado, como num calendário. */
export function organizarEmColunas<T extends Intervalo>(itens: readonly T[]): Array<Posicionado<T>> {
  const ordenados = [...itens].sort((a, b) => a.inicio.getTime() - b.inicio.getTime() || a.fim.getTime() - b.fim.getTime());
  const resultado: Array<Posicionado<T>> = [];
  let grupo: Array<{ item: T; coluna: number }> = [];
  let fimDoGrupo = Number.NEGATIVE_INFINITY;
  let finsPorColuna: number[] = [];

  const fecharGrupo = () => {
    for (const membro of grupo) resultado.push({ ...membro, colunas: finsPorColuna.length });
    grupo = [];
    finsPorColuna = [];
  };

  for (const item of ordenados) {
    if (item.inicio.getTime() >= fimDoGrupo) {
      fecharGrupo();
      fimDoGrupo = Number.NEGATIVE_INFINITY;
    }
    let coluna = finsPorColuna.findIndex((fim) => fim <= item.inicio.getTime());
    if (coluna === -1) {
      coluna = finsPorColuna.length;
      finsPorColuna.push(item.fim.getTime());
    } else {
      finsPorColuna[coluna] = item.fim.getTime();
    }
    grupo.push({ item, coluna });
    fimDoGrupo = Math.max(fimDoGrupo, item.fim.getTime());
  }
  fecharGrupo();
  return resultado;
}

const minutosDe = (horario: string) => {
  const [horas = 0, minutos = 0] = horario.split(':').map(Number);
  return horas * 60 + minutos;
};

export interface JanelaDaGrade {
  horaInicial: number;
  horaFinal: number;
}

/**
 * Faixa de horas exibida: cobre os horários de atendimento ativos e qualquer
 * compromisso da semana, com folga mínima de uma hora e pelo menos seis horas.
 */
export function janelaDaGrade(
  horarios: readonly HorarioDisponivel[],
  intervalos: readonly Intervalo[],
  padrao: JanelaDaGrade = { horaInicial: 8, horaFinal: 18 },
): JanelaDaGrade {
  const inicios: number[] = [];
  const fins: number[] = [];
  for (const horario of horarios) {
    if (!horario.ativo) continue;
    inicios.push(minutosDe(horario.horaInicio));
    fins.push(minutosDe(horario.horaFim));
  }
  for (const intervalo of intervalos) {
    inicios.push(intervalo.inicio.getHours() * 60 + intervalo.inicio.getMinutes());
    fins.push(intervalo.fim.getHours() * 60 + intervalo.fim.getMinutes() || 24 * 60);
  }
  if (inicios.length === 0) return padrao;

  let horaInicial = Math.max(0, Math.floor(Math.min(...inicios) / 60));
  let horaFinal = Math.min(24, Math.ceil(Math.max(...fins) / 60));
  while (horaFinal - horaInicial < 6) {
    if (horaFinal < 24) horaFinal += 1;
    else if (horaInicial > 0) horaInicial -= 1;
    else break;
  }
  return { horaInicial, horaFinal };
}

/** Faixas (em minutos desde 00:00) em que há atendimento configurado para o dia da semana. */
export function faixasDisponiveis(horarios: readonly HorarioDisponivel[], dia: Date): Array<{ inicio: number; fim: number }> {
  const nome: DiaSemana | undefined = diasSemana[dia.getDay()];
  return horarios
    .filter((horario) => horario.ativo && horario.diaSemana === nome)
    .map((horario) => ({ inicio: minutosDe(horario.horaInicio), fim: minutosDe(horario.horaFim) }));
}

/** Dias a exibir: segunda a sexta sempre; sábado e domingo só se houver atendimento ou compromisso. */
export function diasVisiveis(
  semana: readonly Date[],
  horarios: readonly HorarioDisponivel[],
  intervalos: readonly Intervalo[],
): Date[] {
  return semana.filter((dia) => {
    const diaDaSemana = dia.getDay();
    if (diaDaSemana >= 1 && diaDaSemana <= 5) return true;
    const temHorario = faixasDisponiveis(horarios, dia).length > 0;
    const temCompromisso = intervalos.some(
      (intervalo) =>
        intervalo.inicio.getFullYear() === dia.getFullYear() &&
        intervalo.inicio.getMonth() === dia.getMonth() &&
        intervalo.inicio.getDate() === dia.getDate(),
    );
    return temHorario || temCompromisso;
  });
}

/** Segunda-feira da semana que contém a data (semana de segunda a domingo). */
export function inicioDaSemanaIso(referencia: Date): Date {
  const inicio = new Date(referencia);
  inicio.setHours(0, 0, 0, 0);
  const deslocamento = (inicio.getDay() + 6) % 7;
  inicio.setDate(inicio.getDate() - deslocamento);
  return inicio;
}
