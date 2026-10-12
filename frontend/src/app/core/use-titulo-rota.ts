import { useEffect } from 'react';
import { useMatches } from 'react-router';

interface HandleRota {
  titulo?: string;
}

/** Aplica o título da rota ativa ao documento e o devolve (para anúncio a leitores de tela). */
export function useTituloRota() {
  const matches = useMatches();
  const titulo = [...matches]
    .reverse()
    .map((m) => (m.handle as HandleRota | undefined)?.titulo)
    .find(Boolean);

  useEffect(() => {
    document.title = titulo ? `${titulo} · GestãoPsi` : 'GestãoPsi';
  }, [titulo]);

  return titulo ?? '';
}
