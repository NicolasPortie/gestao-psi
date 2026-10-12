import { useEffect, useState } from 'react';

/** Atrasa a propagação de um valor que muda a cada tecla (busca remota, por exemplo). */
export function useDebounce<Valor>(valor: Valor, atrasoMs = 280): Valor {
  const [atrasado, setAtrasado] = useState(valor);

  useEffect(() => {
    const temporizador = window.setTimeout(() => setAtrasado(valor), atrasoMs);
    return () => window.clearTimeout(temporizador);
  }, [valor, atrasoMs]);

  return atrasado;
}
