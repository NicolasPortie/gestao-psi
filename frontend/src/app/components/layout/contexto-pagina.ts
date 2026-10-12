import { createContext } from 'react';

/** Telas dentro de um layout com subnavegação (Configurações) alinham o conteúdo à esquerda, não ao centro. */
export const ContextoAlinhamentoPagina = createContext<'centro' | 'inicio'>('centro');
