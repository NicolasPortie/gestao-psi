import { describe, expect, it } from 'vitest';

import { formatarMoeda } from './moeda';
import { formatarCpf, formatarCrp, formatarTelefone, iniciaisNome, primeiroNome } from './pessoas';
import { capitalizar, pluralizar } from './texto';
import { formatarPeriodo, formatarTempoRelativo, paraCampoData, paraCampoDataHora, periodoDaSemana } from './datas';

describe('pessoas', () => {
  it('gera iniciais do primeiro e do último nome', () => {
    expect(iniciaisNome('Ana Luíza da Silveira')).toBe('AS');
    expect(iniciaisNome('  beatriz ')).toBe('B');
    expect(iniciaisNome('')).toBe('GP');
    expect(primeiroNome('Helena Duarte')).toBe('Helena');
  });

  it('aplica máscaras de CPF, telefone e CRP sem perder dígitos', () => {
    expect(formatarCpf('12345678900')).toBe('123.456.789-00');
    expect(formatarCpf('123.***.***-00')).toBe('123.***.***-00');
    expect(formatarTelefone('11987654321')).toBe('(11) 98765-4321');
    expect(formatarTelefone('1132104567')).toBe('(11) 3210-4567');
    expect(formatarTelefone(null)).toBe('');
    expect(formatarCrp('06184392')).toBe('06/184392');
    expect(formatarCrp('0')).toBe('0');
  });
});

describe('texto e moeda', () => {
  it('capitaliza e pluraliza em português', () => {
    expect(capitalizar('domingo, 11 de outubro')).toBe('Domingo, 11 de outubro');
    expect(pluralizar(1, 'consulta')).toBe('1 consulta');
    expect(pluralizar(3, 'consulta')).toBe('3 consultas');
    expect(pluralizar(0, 'cadastro')).toBe('0 cadastros');
    expect(pluralizar(1200, 'registro')).toBe('1.200 registros');
  });

  it('formata moeda em reais', () => {
    expect(formatarMoeda(1234.5).replace(/\s/g, ' ')).toBe('R$ 1.234,50');
  });
});

describe('datas', () => {
  it('converte datas para os valores dos campos HTML', () => {
    const data = new Date(2026, 9, 5, 8, 7);
    expect(paraCampoData(data)).toBe('2026-10-05');
    expect(paraCampoDataHora(data)).toBe('2026-10-05T08:07');
  });

  it('descreve o período de uma semana dentro do mesmo mês ou entre meses', () => {
    expect(formatarPeriodo(new Date(2026, 9, 12), new Date(2026, 9, 18))).toBe('12 a 18 de outubro de 2026');
    expect(formatarPeriodo(new Date(2026, 8, 28), new Date(2026, 9, 4))).toBe('28 de set a 4 de out de 2026');
  });

  it('calcula a semana de domingo a sábado e mantém o fim exclusivo', () => {
    const { inicio, fim } = periodoDaSemana(new Date(2026, 9, 14, 15));
    expect(inicio.getDay()).toBe(0);
    expect(inicio.getDate()).toBe(11);
    expect(fim.getDate()).toBe(18);
  });

  it('usa linguagem relativa curta e cai para a data completa quando distante', () => {
    const agora = new Date(2026, 9, 11, 12, 0);
    expect(formatarTempoRelativo(new Date(2026, 9, 11, 12, 0), agora)).toBe('agora');
    expect(formatarTempoRelativo(new Date(2026, 9, 11, 9, 0), agora)).toBe('há 3 horas');
    expect(formatarTempoRelativo(new Date(2026, 9, 10, 12, 0), agora)).toBe('ontem');
    expect(formatarTempoRelativo(new Date(2026, 7, 1, 12, 0), agora)).toBe('01/08/2026');
    expect(formatarTempoRelativo(null, agora)).toBe('—');
  });
});
