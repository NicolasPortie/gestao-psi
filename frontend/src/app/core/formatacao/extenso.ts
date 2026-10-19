const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
const dezAteDezenove = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

/** 0 a 999 por extenso ("cento e vinte e três"). */
function ateMil(numero: number): string {
  if (numero === 0) return '';
  if (numero === 100) return 'cem';
  const c = Math.floor(numero / 100);
  const resto = numero % 100;
  const partes: string[] = [];
  if (c > 0) partes.push(centenas[c]!);
  if (resto >= 10 && resto < 20) partes.push(dezAteDezenove[resto - 10]!);
  else {
    const d = Math.floor(resto / 10);
    const u = resto % 10;
    if (d > 0) partes.push(dezenas[d]!);
    if (u > 0) partes.push(unidades[u]!);
  }
  return partes.join(' e ');
}

/** Inteiro de 0 a 999.999 por extenso. */
function inteiroPorExtenso(numero: number): string {
  if (numero === 0) return 'zero';
  const milhares = Math.floor(numero / 1000);
  const resto = numero % 1000;
  const partes: string[] = [];
  if (milhares > 0) partes.push(milhares === 1 ? 'mil' : `${ateMil(milhares)} mil`);
  if (resto > 0) {
    // "mil e cem", "mil e vinte", mas "mil duzentos e trinta".
    const conector = milhares > 0 && (resto < 100 || resto % 100 === 0) ? 'e ' : '';
    partes.push(`${conector}${ateMil(resto)}`);
  }
  return partes.join(' ');
}

/** Valor em reais por extenso, para recibos: 180 → "cento e oitenta reais"; 1,5 → "um real e cinquenta centavos". */
export function reaisPorExtenso(valor: number): string {
  const centavosTotais = Math.round(Math.abs(valor) * 100);
  const reais = Math.floor(centavosTotais / 100);
  const centavos = centavosTotais % 100;
  if (reais > 999_999) return '';
  const partes: string[] = [];
  if (reais > 0 || centavos === 0) partes.push(`${inteiroPorExtenso(reais)} ${reais === 1 ? 'real' : 'reais'}`);
  if (centavos > 0) partes.push(`${inteiroPorExtenso(centavos)} ${centavos === 1 ? 'centavo' : 'centavos'}`);
  return partes.join(' e ');
}
