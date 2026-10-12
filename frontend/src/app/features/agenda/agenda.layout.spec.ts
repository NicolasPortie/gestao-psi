import { describe, expect, it } from 'vitest';

import { diasVisiveis, faixasDisponiveis, inicioDaSemanaIso, janelaDaGrade, organizarEmColunas } from './agenda.layout';
import type { HorarioDisponivel } from './agenda.types';

const data = (dia: number, hora: number, minuto = 0) => new Date(2026, 9, dia, hora, minuto);
const horario = (diaSemana: HorarioDisponivel['diaSemana'], horaInicio: string, horaFim: string, ativo = true): HorarioDisponivel => ({
  id: `${diaSemana}-${horaInicio}`,
  diaSemana,
  horaInicio,
  horaFim,
  ativo,
});

describe('organizarEmColunas', () => {
  it('mantém itens sem sobreposição em coluna única', () => {
    const itens = [
      { inicio: data(12, 9), fim: data(12, 10) },
      { inicio: data(12, 10), fim: data(12, 11) },
    ];
    expect(organizarEmColunas(itens).map((p) => [p.coluna, p.colunas])).toEqual([
      [0, 1],
      [0, 1],
    ]);
  });

  it('divide itens sobrepostos lado a lado e reaproveita colunas livres', () => {
    const a = { inicio: data(12, 9), fim: data(12, 11) };
    const b = { inicio: data(12, 9, 30), fim: data(12, 10) };
    const c = { inicio: data(12, 10), fim: data(12, 10, 30) };
    const resultado = organizarEmColunas([a, b, c]);
    const porItem = new Map(resultado.map((p) => [p.item, p]));
    expect(porItem.get(a)).toMatchObject({ coluna: 0, colunas: 2 });
    expect(porItem.get(b)).toMatchObject({ coluna: 1, colunas: 2 });
    expect(porItem.get(c)).toMatchObject({ coluna: 1, colunas: 2 });
  });
});

describe('janelaDaGrade', () => {
  it('usa o padrão quando não há horários nem compromissos', () => {
    expect(janelaDaGrade([], [])).toEqual({ horaInicial: 8, horaFinal: 18 });
  });

  it('cobre horários ativos e compromissos fora da faixa, ignorando horários inativos', () => {
    const janela = janelaDaGrade(
      [horario('Segunda', '08:00:00', '12:00:00'), horario('Segunda', '05:00:00', '06:00:00', false)],
      [{ inicio: data(12, 19), fim: data(12, 20, 20) }],
    );
    expect(janela).toEqual({ horaInicial: 8, horaFinal: 21 });
  });

  it('garante ao menos seis horas visíveis', () => {
    expect(janelaDaGrade([horario('Terca', '09:00:00', '10:00:00')], [])).toEqual({ horaInicial: 9, horaFinal: 15 });
  });
});

describe('semana', () => {
  it('começa na segunda-feira', () => {
    expect(inicioDaSemanaIso(data(11, 15)).getDate()).toBe(5); // domingo 11/10/2026 -> segunda 05/10
    expect(inicioDaSemanaIso(data(12, 8)).getDate()).toBe(12);
  });

  it('mostra fim de semana apenas com atendimento ou compromisso', () => {
    const semana = Array.from({ length: 7 }, (_, i) => data(12 + i, 0));
    expect(diasVisiveis(semana, [], []).map((d) => d.getDate())).toEqual([12, 13, 14, 15, 16]);
    const comSabado = diasVisiveis(semana, [horario('Sabado', '08:00:00', '12:00:00')], []);
    expect(comSabado.map((d) => d.getDate())).toEqual([12, 13, 14, 15, 16, 17]);
    const comDomingo = diasVisiveis(semana, [], [{ inicio: data(18, 10), fim: data(18, 11) }]);
    expect(comDomingo.map((d) => d.getDate())).toEqual([12, 13, 14, 15, 16, 18]);
  });

  it('lista faixas disponíveis do dia', () => {
    expect(faixasDisponiveis([horario('Segunda', '08:00:00', '12:00:00'), horario('Terca', '08:00:00', '12:00:00')], data(12, 0))).toEqual([
      { inicio: 480, fim: 720 },
    ]);
  });
});
