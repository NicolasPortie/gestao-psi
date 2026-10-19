import { useSyncExternalStore } from 'react';

/**
 * Cortina de privacidade: cobre a tela inteira quando o paciente entra na sala ou o computador fica sozinho.
 * Estado só de interface, em memória; não substitui o bloqueio de sessão do servidor.
 */
let protegida = false;
const ouvintes = new Set<() => void>();

function avisar() {
  for (const ouvinte of ouvintes) ouvinte();
}

export function protegerTela() {
  if (protegida) return;
  protegida = true;
  avisar();
}

export function liberarTela() {
  if (!protegida) return;
  protegida = false;
  avisar();
}

export function useTelaProtegida() {
  return useSyncExternalStore(
    (ouvinte) => {
      ouvintes.add(ouvinte);
      return () => ouvintes.delete(ouvinte);
    },
    () => protegida,
    () => false,
  );
}

const CHAVE_MINUTOS = 'gestaopsi:cortina-minutos';
/** Minutos sem uso até a tela se proteger sozinha; 0 desliga. */
export const MINUTOS_PADRAO = 10;

export function lerMinutosInatividade(): number {
  try {
    const valor = Number(window.localStorage.getItem(CHAVE_MINUTOS));
    return Number.isFinite(valor) && window.localStorage.getItem(CHAVE_MINUTOS) !== null ? Math.max(0, valor) : MINUTOS_PADRAO;
  } catch {
    return MINUTOS_PADRAO;
  }
}

export function salvarMinutosInatividade(minutos: number) {
  try {
    window.localStorage.setItem(CHAVE_MINUTOS, String(Math.max(0, Math.round(minutos))));
  } catch {
    // Sem armazenamento, vale o padrão nesta sessão.
  }
}
