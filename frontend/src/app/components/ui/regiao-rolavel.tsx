import { useEffect, useRef, useState, type ReactNode } from 'react';

import { cn } from './cn';

interface RegiaoRolavelProps {
  /** Nome da região para leitores de tela, usado só enquanto há rolagem. */
  rotulo: string;
  className?: string;
  children: ReactNode;
}

/**
 * Contêiner de rolagem horizontal acessível. Só vira região focável (e anunciada) enquanto o
 * conteúdo realmente ultrapassa a largura, para que o teclado alcance o que está fora da tela
 * sem criar paradas de tabulação inúteis. A medição vem do ResizeObserver, que dispara ao observar.
 */
export function RegiaoRolavel({ rotulo, className, children }: RegiaoRolavelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [rolavel, setRolavel] = useState(false);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento || typeof ResizeObserver === 'undefined') return undefined;
    const observador = new ResizeObserver(() => setRolavel(elemento.scrollWidth > elemento.clientWidth + 1));
    observador.observe(elemento);
    if (elemento.firstElementChild) observador.observe(elemento.firstElementChild);
    return () => observador.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      role={rolavel ? 'region' : undefined}
      aria-label={rolavel ? rotulo : undefined}
      tabIndex={rolavel ? 0 : undefined}
      className={cn('overflow-x-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus', className)}
    >
      {children}
    </div>
  );
}
