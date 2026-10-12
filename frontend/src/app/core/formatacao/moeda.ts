const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const inteiro = new Intl.NumberFormat('pt-BR');

export function formatarMoeda(valor: number): string {
  return moeda.format(valor);
}

export function formatarNumero(valor: number): string {
  return inteiro.format(valor);
}
