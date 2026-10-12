import { cn } from '../ui/cn';

interface SimboloProps {
  tamanho?: number;
  className?: string;
}

/**
 * Símbolo do GestaoPsi: a letra psi em traço contínuo, com a bolha vazia abaixo,
 * a mesma bolha que o produto preenche para marcar o estado de cada coisa.
 */
export function SimboloMarca({ tamanho = 28, className }: SimboloProps) {
  return (
    <svg viewBox="0 0 32 32" width={tamanho} height={tamanho} aria-hidden="true" focusable="false" className={className}>
      <path
        d="M7.5 8v5.5a8.5 8.5 0 0 0 17 0V8M16 3.5V21"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="27.2" r="2.1" fill="currentColor" />
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
    <span className={cn('inline-flex items-center gap-2.5 text-accent', className)}>
      <SimboloMarca tamanho={tamanho} />
      {somenteSimbolo ? (
        <span className="sr-only">GestãoPsi</span>
      ) : (
        <span className="text-lg font-semibold tracking-[-0.02em] text-ink">
          Gestão<span className="font-medium text-accent-ink">Psi</span>
        </span>
      )}
    </span>
  );
}
