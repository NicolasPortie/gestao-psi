import { useSyncExternalStore } from 'react';

/** Acompanha uma media query do navegador; útil quando a estrutura (não só o estilo) muda por largura. */
export function useMediaQuery(consulta: string): boolean {
  return useSyncExternalStore(
    (aviso) => {
      const lista = window.matchMedia(consulta);
      lista.addEventListener('change', aviso);
      return () => lista.removeEventListener('change', aviso);
    },
    () => window.matchMedia(consulta).matches,
    () => false,
  );
}

/** Mesmo ponto de quebra `lg` do Tailwind (64rem), onde o trilho lateral substitui a navegação móvel. */
export const useTelaLarga = () => useMediaQuery('(min-width: 64rem)');
