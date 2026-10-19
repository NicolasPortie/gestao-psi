import type { RecebimentoExportado } from './pagamentos.api';
import { rotulosFormaPagamento } from './pagamentos.rotulos';

const dataBr = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const BOM = '﻿';

/** Célula de CSV com ponto e vírgula (padrão do Excel em português): aspas quando há separador, aspas ou quebra. */
function celula(valor: string) {
  return /[";\n]/.test(valor) ? `"${valor.replace(/"/g, '""')}"` : valor;
}

/** Planilha dos recebimentos, com BOM para os acentos abrirem certos no Excel. */
export function montarRecebimentosCsv(itens: RecebimentoExportado[]) {
  const cabecalho = ['Data do recebimento', 'Paciente', 'CPF', 'Valor', 'Forma', 'Referência'];
  const linhas = itens.map((item) => [
    dataBr.format(new Date(item.pagoEm)),
    item.paciente,
    item.pacienteCpf ?? '',
    item.valor.toFixed(2).replace('.', ','),
    rotulosFormaPagamento[item.formaPagamento],
    item.referencia,
  ]);
  return BOM + [cabecalho, ...linhas].map((linha) => linha.map(celula).join(';')).join('\r\n');
}

export function baixarRecebimentosCsv(itens: RecebimentoExportado[], nomeArquivo: string) {
  const endereco = URL.createObjectURL(new Blob([montarRecebimentosCsv(itens)], { type: 'text/csv;charset=utf-8' }));
  const ancora = document.createElement('a');
  ancora.href = endereco;
  ancora.download = nomeArquivo;
  ancora.click();
  URL.revokeObjectURL(endereco);
}
