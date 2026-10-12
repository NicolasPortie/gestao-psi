import { describe, expect, it } from 'vitest';

import { ErroApi, extrairDados } from './resposta-api';

describe('extrairDados', () => {
  it('retorna os dados de um envelope de sucesso', () => {
    expect(extrairDados({ sucesso: true, dados: { id: '1' } }, 'Falha')).toEqual({ id: '1' });
  });

  it('prioriza o primeiro erro seguro retornado pela API', () => {
    expect(() => extrairDados({ sucesso: false, erros: ['Horario indisponivel.'] }, 'Falha')).toThrow(
      new ErroApi('Horario indisponivel.', 422, ['Horario indisponivel.']),
    );
  });
});
