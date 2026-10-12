import { createContext, use } from 'react';

interface ContextoDoCampo {
  id: string;
  invalido: boolean;
  descricao?: string;
}

export const ContextoCampo = createContext<ContextoDoCampo | null>(null);

/** Id e atributos de acessibilidade do campo que envolve este controle (vazio fora de um <Campo>). */
export function useCampo(idPropio?: string) {
  const contexto = use(ContextoCampo);
  return {
    id: idPropio ?? contexto?.id,
    'aria-invalid': contexto?.invalido || undefined,
    'aria-describedby': contexto?.descricao,
  };
}
