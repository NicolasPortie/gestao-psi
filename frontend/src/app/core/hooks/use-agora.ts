import { useEffect, useState } from 'react';

/** Data/hora atual, atualizada em intervalo; mantém a linha de "agora" e rótulos relativos corretos. */
export function useAgora(intervaloMs = 30_000) {
  const [agora, setAgora] = useState(() => new Date());

  useEffect(() => {
    const temporizador = window.setInterval(() => setAgora(new Date()), intervaloMs);
    return () => window.clearInterval(temporizador);
  }, [intervaloMs]);

  return agora;
}
