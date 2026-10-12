import { describe, expect, it } from 'vitest';

import { estadoDaPrioridade, minutosDeHorario, resumoDoDia, saudacao, situacoesDoDia } from './painel.apresentacao';

describe('painel.apresentacao', () => {
  it('escolhe a saudação pela hora do dia', () => {
    expect(saudacao(7)).toBe('Bom dia');
    expect(saudacao(12)).toBe('Boa tarde');
    expect(saudacao(19)).toBe('Boa noite');
  });

  it('resume o dia com concordância correta', () => {
    expect(resumoDoDia({ consultasHoje: 0, consultasRestantesHoje: 0 })).toBe('Não há consultas marcadas para hoje.');
    expect(resumoDoDia({ consultasHoje: 1, consultasRestantesHoje: 1 })).toBe('Você tem 1 consulta hoje, ainda por vir.');
    expect(resumoDoDia({ consultasHoje: 5, consultasRestantesHoje: 5 })).toBe('Você tem 5 consultas hoje, todas ainda por vir.');
    expect(resumoDoDia({ consultasHoje: 5, consultasRestantesHoje: 1 })).toBe('Você tem 5 consultas hoje; 1 ainda por vir.');
    expect(resumoDoDia({ consultasHoje: 5, consultasRestantesHoje: 2 })).toBe('Você tem 5 consultas hoje; 2 ainda por vir.');
    expect(resumoDoDia({ consultasHoje: 1, consultasRestantesHoje: 0 })).toBe('A consulta de hoje já passou.');
    expect(resumoDoDia({ consultasHoje: 4, consultasRestantesHoje: 0 })).toBe('As 4 consultas de hoje já passaram.');
  });

  it('lê horários com e sem segundos', () => {
    expect(minutosDeHorario('09:30')).toBe(570);
    expect(minutosDeHorario('14:05:00')).toBe(845);
    expect(minutosDeHorario('??')).toBeNaN();
  });

  it('marca o que passou, o que está em andamento e a próxima consulta', () => {
    const dia = [
      { horarioInicio: '09:00', duracaoMinutos: 50 },
      { horarioInicio: '10:00', duracaoMinutos: 50 },
      { horarioInicio: '11:00', duracaoMinutos: 50 },
      { horarioInicio: '14:00', duracaoMinutos: 50 },
    ];
    expect(situacoesDoDia(dia, 8 * 60)).toEqual(['proxima', 'futura', 'futura', 'futura']);
    expect(situacoesDoDia(dia, 10 * 60 + 20)).toEqual(['passada', 'andamento', 'proxima', 'futura']);
    expect(situacoesDoDia(dia, 18 * 60)).toEqual(['passada', 'passada', 'passada', 'passada']);
  });

  it('traduz o tom da prioridade em marca e texto', () => {
    expect(estadoDaPrioridade('erro')).toMatchObject({ tom: 'perigo', marca: 'x' });
    expect(estadoDaPrioridade('atencao')).toMatchObject({ tom: 'aviso', marca: 'meio' });
    expect(estadoDaPrioridade('ok')).toMatchObject({ tom: 'sucesso', marca: 'check' });
    expect(estadoDaPrioridade('neutro')).toMatchObject({ tom: 'neutro', marca: 'anel' });
  });
});
