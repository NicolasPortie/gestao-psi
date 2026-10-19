import { describe, expect, it } from 'vitest';

import { montarRecebimentosCsv } from './pagamentos.exportacao';

describe('montarRecebimentosCsv', () => {
  it('usa ponto e vírgula, vírgula decimal e protege campos com separador', () => {
    const csv = montarRecebimentosCsv([
      { pagoEm: '2026-10-12T15:00:00Z', paciente: 'Ana; Silva', pacienteCpf: '123.456.789-00', valor: 180, formaPagamento: 'Pix', referencia: 'Sessão de 12/10/2026' },
    ]);
    const [cabecalho, linha] = csv.replace('﻿', '').split('\r\n');
    expect(cabecalho).toBe('Data do recebimento;Paciente;CPF;Valor;Forma;Referência');
    expect(linha).toBe('12/10/2026;"Ana; Silva";123.456.789-00;180,00;Pix;Sessão de 12/10/2026');
  });
});
