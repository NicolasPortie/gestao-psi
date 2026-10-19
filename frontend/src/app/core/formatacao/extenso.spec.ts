import { describe, expect, it } from 'vitest';

import { reaisPorExtenso } from './extenso';

describe('reaisPorExtenso', () => {
  it.each([
    [180, 'cento e oitenta reais'],
    [100, 'cem reais'],
    [1, 'um real'],
    [250.5, 'duzentos e cinquenta reais e cinquenta centavos'],
    [0.01, 'um centavo'],
    [1000, 'mil reais'],
    [1100, 'mil e cem reais'],
    [1230, 'mil duzentos e trinta reais'],
    [2015, 'dois mil e quinze reais'],
    [0, 'zero reais'],
  ])('%s → %s', (valor, esperado) => {
    expect(reaisPorExtenso(valor)).toBe(esperado);
  });
});
