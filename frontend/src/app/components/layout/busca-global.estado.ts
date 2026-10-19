import { useSyncExternalStore } from 'react';

/** Abertura da busca global, compartilhada entre o atalho de teclado e os botões do trilho e do celular. */
let aberta = false;
const ouvintes = new Set<() => void>();

export function definirBuscaAberta(valor: boolean) {
  aberta = valor;
  for (const ouvinte of ouvintes) ouvinte();
}

export function abrirBuscaGlobal() {
  definirBuscaAberta(true);
}

export function useBuscaAberta() {
  return useSyncExternalStore(
    (ouvinte) => {
      ouvintes.add(ouvinte);
      return () => ouvintes.delete(ouvinte);
    },
    () => aberta,
    () => false,
  );
}
