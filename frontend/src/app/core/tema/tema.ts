import { useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';

export type PreferenciaTema = 'sistema' | 'claro' | 'escuro';
export type TemaAplicado = 'claro' | 'escuro';

/** Preferência visual não sensível; por isso pode viver em localStorage. */
const CHAVE = 'gestaopsi:tema';
const consultaEscuro = '(prefers-color-scheme: dark)';
const ouvintes = new Set<() => void>();

function lerPreferencia(): PreferenciaTema {
  try {
    const salva = window.localStorage.getItem(CHAVE);
    return salva === 'claro' || salva === 'escuro' ? salva : 'sistema';
  } catch {
    return 'sistema';
  }
}

let preferencia: PreferenciaTema = typeof window === 'undefined' ? 'sistema' : lerPreferencia();

export function resolverTema(valor: PreferenciaTema): TemaAplicado {
  if (valor !== 'sistema') return valor;
  return window.matchMedia(consultaEscuro).matches ? 'escuro' : 'claro';
}

function aplicar() {
  const raiz = document.documentElement;
  // Suspende transições para a troca não "borrar" cada cor ao mesmo tempo.
  raiz.classList.add('sem-transicao');
  raiz.dataset.tema = resolverTema(preferencia);
  requestAnimationFrame(() => requestAnimationFrame(() => raiz.classList.remove('sem-transicao')));
  ouvintes.forEach((ouvinte) => ouvinte());
}

export function definirPreferenciaTema(valor: PreferenciaTema) {
  const mudaCores = resolverTema(valor) !== resolverTema(preferencia);
  preferencia = valor;
  try {
    if (valor === 'sistema') window.localStorage.removeItem(CHAVE);
    else window.localStorage.setItem(CHAVE, valor);
  } catch {
    // Sem armazenamento disponível, a preferência vale apenas para esta sessão.
  }
  // Escolha explícita do usuário: a tela inteira esmaece de um tema para o outro uma única vez,
  // em vez de cada cor transicionar sozinha. Sem suporte ou com movimento reduzido, troca direto.
  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (mudaCores && !semMovimento && typeof document.startViewTransition === 'function') {
    document.startViewTransition(() => flushSync(aplicar));
  } else {
    aplicar();
  }
}

export function iniciarTema() {
  aplicar();
  window.matchMedia(consultaEscuro).addEventListener('change', () => {
    if (preferencia === 'sistema') aplicar();
  });
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

export function usePreferenciaTema() {
  return useSyncExternalStore(assinar, () => preferencia, () => 'sistema');
}
