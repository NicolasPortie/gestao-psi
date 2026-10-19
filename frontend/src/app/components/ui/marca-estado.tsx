import { cva } from 'class-variance-authority';

import type { DescricaoEstado, FormaMarca, TomEstado } from '../../core/dominio/estado';
import { cn } from './cn';

const corMarca = cva('shrink-0', {
  variants: {
    tom: {
      neutro: 'text-ink-muted',
      acento: 'text-accent',
      sucesso: 'text-success',
      aviso: 'text-warning',
      perigo: 'text-danger',
    },
  },
});

const estiloPilula: Record<TomEstado, string> = {
  neutro: 'bg-pressed text-ink-muted',
  acento: 'bg-accent-wash text-accent-ink',
  sucesso: 'bg-success-wash text-success-ink',
  aviso: 'bg-warning-wash text-warning-ink',
  perigo: 'bg-danger-wash text-danger-ink',
};

const TRACO = 1.5;
const RAIO = 6.75;
const contraste = 'var(--marca-contraste, var(--surface))';

/** O círculo vazio: o contorno em que todo estado se desenha. */
function Contorno() {
  return <circle cx="8" cy="8" r={RAIO} fill="none" stroke="currentColor" strokeWidth={TRACO} />;
}

/** O círculo cheio. */
function Cheio() {
  return <circle cx="8" cy="8" r={RAIO + TRACO / 2} fill="currentColor" />;
}

/**
 * Cada estado é o mesmo círculo em um ponto do preenchimento: vazio, metade, cheio, cheio com check.
 * Cancelado, remarcado e não compareceu mantêm o contorno (ou o cheio) e acrescentam um traço.
 */
function Forma({ forma }: { forma: FormaMarca }) {
  switch (forma) {
    case 'anel':
      return (
        <>
          <Contorno />
          <circle cx="8" cy="8" r="1.75" fill="currentColor" opacity={0.55} />
        </>
      );
    case 'meio':
      return (
        <>
          <Contorno />
          <path d="M8 1.25A6.75 6.75 0 0 1 8 14.75Z" fill="currentColor" />
        </>
      );
    case 'cheio':
      return <Cheio />;
    case 'check':
      return (
        <>
          <Cheio />
          <path d="m5 8.2 2.1 2.1 4-4.4" fill="none" stroke={contraste} strokeWidth={TRACO} strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case 'riscado':
      return (
        <>
          <Contorno />
          <path d="m4.2 11.8 7.6-7.6" fill="none" stroke="currentColor" strokeWidth={TRACO} strokeLinecap="round" />
        </>
      );
    case 'seta':
      return (
        <>
          <Contorno />
          <path d="M4.9 8h5.8m-2.2-2.2L10.7 8l-2.2 2.2" fill="none" stroke="currentColor" strokeWidth={TRACO} strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case 'x':
      return (
        <>
          <Cheio />
          <path d="m5.7 5.7 4.6 4.6m0-4.6-4.6 4.6" fill="none" stroke={contraste} strokeWidth={TRACO} strokeLinecap="round" />
        </>
      );
    case 'ponto':
      return <circle cx="8" cy="8" r="3.25" fill="currentColor" />;
  }
}

interface MarcaEstadoProps {
  forma: FormaMarca;
  tom?: TomEstado;
  tamanho?: number;
  className?: string;
  /** Anima a entrada quando o estado muda (use `key` para reiniciar). */
  animar?: boolean;
}

/** Forma desenhada do estado: um círculo em um ponto do preenchimento. Sempre decorativa: o texto acompanha. */
export function MarcaEstado({ forma, tom = 'neutro', tamanho = 16, className, animar = false }: MarcaEstadoProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={tamanho}
      height={tamanho}
      aria-hidden="true"
      focusable="false"
      className={cn(corMarca({ tom }), animar && 'animar-marca', className)}
    >
      <Forma forma={forma} />
    </svg>
  );
}

interface EstadoRotuladoProps {
  estado: DescricaoEstado;
  className?: string;
  /** Texto menor, para linhas densas. */
  compacto?: boolean;
  animar?: boolean;
}

/** Marca + texto numa pílula tingida pelo tom: a única forma de exibir um estado na interface. */
export function EstadoRotulado({ estado, className, compacto = false, animar = false }: EstadoRotuladoProps) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center whitespace-nowrap rounded-full font-medium',
        compacto ? 'h-6 gap-1 pl-1.5 pr-2 text-xs' : 'h-7 gap-1.5 pl-2 pr-2.5 text-sm',
        estiloPilula[estado.tom],
        className,
      )}
    >
      <MarcaEstado forma={estado.marca} tom={estado.tom} tamanho={compacto ? 12 : 14} animar={animar} />
      <span>{estado.rotulo}</span>
    </span>
  );
}
