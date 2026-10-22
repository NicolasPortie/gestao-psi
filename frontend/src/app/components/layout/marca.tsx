import { MARCA } from '../../core/marca';
import { cn } from '../ui/cn';

interface SimboloProps {
  tamanho?: number;
  className?: string;
}

/**
 * Simbolo: um azulejo cobalto com duas metades de um semicirculo, porcelana e acafrao, que se
 * encontram no meio. E o encontro entre duas pessoas e, ao mesmo tempo, o modulo que o produto
 * preenche para mostrar o estado de cada coisa. As cores vem dos tokens, entao acompanham o tema.
 */
export function SimboloMarca({ tamanho = 28, className }: SimboloProps) {
  return (
    <svg viewBox="0 0 64 64" width={tamanho} height={tamanho} aria-hidden="true" focusable="false" className={className}>
      <rect width="64" height="64" rx="7" fill="var(--marca-azulejo)" />
      <path d="M10 43A22 22 0 0 1 32 21V43z" fill="var(--marca-metade-a)" />
      <path d="M54 43A22 22 0 0 0 32 21V43z" fill="var(--marca-metade-b)" />
    </svg>
  );
}

interface MarcaProps {
  somenteSimbolo?: boolean;
  className?: string;
  tamanho?: number;
}

export function Marca({ somenteSimbolo = false, className, tamanho = 28 }: MarcaProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <SimboloMarca tamanho={tamanho} />
      {somenteSimbolo ? (
        <span className="sr-only">{MARCA.nome}</span>
      ) : (
        <span className="font-display text-xl font-semibold leading-none tracking-[-0.02em] text-ink">{MARCA.nome.toLowerCase()}</span>
      )}
    </span>
  );
}
