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

const corTexto: Record<TomEstado, string> = {
  neutro: 'text-ink-muted',
  acento: 'text-accent-ink',
  sucesso: 'text-success-ink',
  aviso: 'text-warning-ink',
  perigo: 'text-danger-ink',
};

const TRACO = 1.5;
const TESSELA = { x: 1.25, y: 1.25, width: 13.5, height: 13.5, rx: 2.25 } as const;
const contraste = 'var(--marca-contraste, var(--paper))';

/** O azulejo vazio: o contorno em que todo estado se desenha. */
function Contorno() {
  return <rect {...TESSELA} fill="none" stroke="currentColor" strokeWidth={TRACO} />;
}

/** O azulejo cheio. */
function Cheio() {
  return <rect {...TESSELA} fill="currentColor" />;
}

/**
 * Cada estado e o mesmo azulejo em um ponto do preenchimento: vazio, quarto de circulo, cheio.
 * Cancelado, remarcado e nao compareceu mantem o contorno (ou o cheio) e acrescentam um traco.
 */
function Forma({ forma }: { forma: FormaMarca }) {
  switch (forma) {
    case 'anel':
      return (
        <>
          <Contorno />
          <path d="M1.25 14.75A13.5 13.5 0 0 1 14.75 1.25" fill="none" stroke="currentColor" strokeWidth={1.1} opacity={0.55} />
        </>
      );
    case 'meio':
      return (
        <>
          <Contorno />
          <path d="M14.75 14.75H6.5A8.25 8.25 0 0 1 14.75 6.5Z" fill="currentColor" />
        </>
      );
    case 'cheio':
      return <Cheio />;
    case 'check':
      return (
        <>
          <Cheio />
          <path d="m4.6 8.2 2.3 2.3 4.5-5" fill="none" stroke={contraste} strokeWidth={TRACO} strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case 'riscado':
      return (
        <>
          <Contorno />
          <path d="m4 12 8-8" fill="none" stroke="currentColor" strokeWidth={TRACO} strokeLinecap="round" />
        </>
      );
    case 'seta':
      return (
        <>
          <Contorno />
          <path d="M4.6 8h6.3m-2.4-2.4L10.9 8l-2.4 2.4" fill="none" stroke="currentColor" strokeWidth={TRACO} strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case 'x':
      return (
        <>
          <Cheio />
          <path d="m5.5 5.5 5 5m0-5-5 5" fill="none" stroke={contraste} strokeWidth={TRACO} strokeLinecap="round" />
        </>
      );
    case 'ponto':
      return <rect x="4.75" y="4.75" width="6.5" height="6.5" rx="1.5" fill="currentColor" />;
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

/** Forma desenhada do estado: um azulejo em um ponto do preenchimento. Sempre decorativa: o texto acompanha. */
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

/** Marca + texto: a única forma de exibir um estado na interface. */
export function EstadoRotulado({ estado, className, compacto = false, animar = false }: EstadoRotuladoProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap', compacto ? 'text-xs' : 'text-sm', corTexto[estado.tom], className)}>
      <MarcaEstado forma={estado.marca} tom={estado.tom} tamanho={compacto ? 14 : 16} animar={animar} />
      <span className="font-medium">{estado.rotulo}</span>
    </span>
  );
}
