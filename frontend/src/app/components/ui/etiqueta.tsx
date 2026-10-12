import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';

import { cn } from './cn';

const estiloEtiqueta = cva('inline-flex h-5 items-center whitespace-nowrap rounded-sm px-1.5 text-xs font-medium leading-none', {
  variants: {
    tom: {
      neutro: 'bg-hover text-ink-muted',
      acento: 'bg-accent-wash text-accent-ink',
      sucesso: 'bg-success-wash text-success-ink',
      aviso: 'bg-warning-wash text-warning-ink',
      perigo: 'bg-danger-wash text-danger-ink',
    },
  },
  defaultVariants: { tom: 'neutro' },
});

interface EtiquetaProps extends VariantProps<typeof estiloEtiqueta> {
  children: ReactNode;
  className?: string;
}

/** Rótulo curto e retangular (perfil, contagem). Estados do consultório usam EstadoRotulado, não esta etiqueta. */
export function Etiqueta({ tom, className, children }: EtiquetaProps) {
  return <span className={cn(estiloEtiqueta({ tom }), className)}>{children}</span>;
}
