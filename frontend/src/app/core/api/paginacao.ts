export interface ResultadoPaginado<T> {
  itens: T[];
  total: number;
  pagina: number;
  tamanhoPagina: number;
}

export interface FiltroPaginado {
  pagina?: number;
  tamanhoPagina?: number;
}

export const TAMANHO_PAGINA_PADRAO = 20;
export const OPCOES_TAMANHO_PAGINA: readonly number[] = [10, 20, 50];

export function calcularTotalPaginas(total: number, tamanhoPagina: number): number {
  return Math.max(1, Math.ceil(total / Math.max(1, tamanhoPagina)));
}

export function calcularIntervaloExibicao(
  pagina: number,
  tamanhoPagina: number,
  total: number,
): { inicio: number; fim: number } {
  if (total <= 0) return { inicio: 0, fim: 0 };
  const inicio = (pagina - 1) * tamanhoPagina + 1;
  return { inicio, fim: Math.min(total, pagina * tamanhoPagina) };
}

export function aplicarPaginacaoAQuery(params: URLSearchParams, filtro: FiltroPaginado): void {
  params.set('pagina', String(filtro.pagina ?? 1));
  params.set('tamanhoPagina', String(filtro.tamanhoPagina ?? TAMANHO_PAGINA_PADRAO));
}

export type PaginaVisivel = number | 'reticencias-inicio' | 'reticencias-fim';

export function paginasVisiveis(paginaAtual: number, totalPaginas: number): PaginaVisivel[] {
  if (totalPaginas <= 7) {
    return Array.from({ length: totalPaginas }, (_, i) => i + 1);
  }

  const janela = new Set<number>([1, 2, totalPaginas - 1, totalPaginas, paginaAtual - 1, paginaAtual, paginaAtual + 1]);
  const ordenadas = [...janela].filter((p) => p >= 1 && p <= totalPaginas).sort((a, b) => a - b);

  const resultado: PaginaVisivel[] = [];
  let anterior = 0;
  let lacunas = 0;
  for (const pagina of ordenadas) {
    if (anterior !== 0 && pagina - anterior > 1) {
      lacunas += 1;
      resultado.push(lacunas === 1 ? 'reticencias-inicio' : 'reticencias-fim');
    }
    resultado.push(pagina);
    anterior = pagina;
  }
  return resultado;
}
