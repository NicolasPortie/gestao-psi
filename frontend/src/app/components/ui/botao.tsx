import { cva, type VariantProps } from 'class-variance-authority';
import { LoaderCircle } from 'lucide-react';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, Ref } from 'react';
import { Link, type LinkProps } from 'react-router';

import { cn } from './cn';

/**
 * Um único vocabulário de botão para todo o produto. Apenas uma ação preenchida
 * (`primario`) por tela; as demais ficam neutras ou discretas.
 */
const estiloBotao = cva(
  [
    'relative inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium',
    'transition-[background-color,border-color,color,scale] duration-150 ease-out',
    'enabled:active:scale-[0.96] aria-disabled:pointer-events-none aria-disabled:opacity-50',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  {
    variants: {
      variante: {
        primario: 'bg-accent text-on-accent hover:bg-accent-hover',
        secundario: 'border border-line-strong bg-field text-ink hover:bg-hover',
        discreto: 'text-ink-muted hover:bg-hover hover:text-ink',
        perigo: 'bg-danger text-on-accent hover:bg-danger-hover',
        'perigo-discreto': 'text-danger-ink hover:bg-danger-wash',
      },
      tamanho: {
        pequeno: 'h-8 px-3 text-sm pointer-coarse:h-10',
        medio: 'h-9 px-3.5 text-base pointer-coarse:h-11',
        grande: 'h-11 px-5 text-base',
        icone: 'size-9 pointer-coarse:size-11',
        'icone-pequeno': 'size-8 pointer-coarse:size-10',
      },
    },
    defaultVariants: { variante: 'secundario', tamanho: 'medio' },
  },
);

export type EstiloBotaoProps = VariantProps<typeof estiloBotao>;

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement>, EstiloBotaoProps {
  carregando?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export function Botao({ variante, tamanho, carregando = false, className, children, disabled, type = 'button', ...props }: BotaoProps) {
  return (
    <button
      type={type}
      className={cn(estiloBotao({ variante, tamanho }), className)}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      {...props}
    >
      <span className={cn('inline-flex items-center justify-center gap-2', carregando && 'invisible')}>{children}</span>
      {carregando ? (
        <span className="absolute inset-0 grid place-items-center" aria-hidden="true">
          <LoaderCircle size={16} className="animar-girar" />
        </span>
      ) : null}
    </button>
  );
}

interface BotaoLinkProps extends LinkProps, EstiloBotaoProps {}

export function BotaoLink({ variante, tamanho, className, ...props }: BotaoLinkProps) {
  return <Link className={cn(estiloBotao({ variante, tamanho }), 'no-underline', className)} {...props} />;
}

interface BotaoAncoraProps extends AnchorHTMLAttributes<HTMLAnchorElement>, EstiloBotaoProps {}

/** Para destinos externos ou downloads; navegação interna usa BotaoLink. */
export function BotaoAncora({ variante, tamanho, className, ...props }: BotaoAncoraProps) {
  return <a className={cn(estiloBotao({ variante, tamanho }), 'no-underline', className)} {...props} />;
}
