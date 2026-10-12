export function capitalizar(texto: string): string {
  return texto.charAt(0).toLocaleUpperCase('pt-BR') + texto.slice(1);
}

/** pluralizar(1, 'consulta') -> "1 consulta"; pluralizar(3, 'consulta') -> "3 consultas". */
export function pluralizar(quantidade: number, singular: string, plural = `${singular}s`): string {
  return `${quantidade.toLocaleString('pt-BR')} ${quantidade === 1 ? singular : plural}`;
}
