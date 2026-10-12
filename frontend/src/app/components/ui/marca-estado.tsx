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

const TRACO = 1.75;

function Forma({ forma }: { forma: FormaMarca }) {
  switch (forma) {
    case 'anel':
      return <circle cx="8" cy="8" r="5.75" fill="none" stroke="currentColor" strokeWidth={TRACO} />;
    case 'meio':
      return (
        <>
          <circle cx="8" cy="8" r="5.75" fill="none" stroke="currentColor" strokeWidth={TRACO} />
          <path d="M8 2.25a5.75 5.75 0 0 1 0 11.5Z" fill="currentColor" />
        </>
      );
    case 'cheio':
      return <circle cx="8" cy="8" r="6.6" fill="currentColor" />;
    case 'check':
      return (
        <>
          <circle cx="8" cy="8" r="6.6" fill="currentColor" />
          <path d="m5.2 8.2 2 2 3.6-4.1" fill="none" stroke="var(--marca-contraste, var(--paper))" strokeWidth={TRACO} strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case 'riscado':
      return (
        <>
          <circle cx="8" cy="8" r="5.75" fill="none" stroke="currentColor" strokeWidth={TRACO} />
          <path d="m4.4 11.6 7.2-7.2" fill="none" stroke="currentColor" strokeWidth={TRACO} strokeLinecap="round" />
        </>
      );
    case 'seta':
      return (
        <>
          <circle cx="8" cy="8" r="5.75" fill="none" stroke="currentColor" strokeWidth={TRACO} />
          <path d="M5.4 8h5m-2-2.1 2.1 2.1-2.1 2.1" fill="none" stroke="currentColor" strokeWidth={TRACO} strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case 'x':
      return (
        <>
          <circle cx="8" cy="8" r="6.6" fill="currentColor" />
          <path d="m5.6 5.6 4.8 4.8m0-4.8-4.8 4.8" fill="none" stroke="var(--marca-contraste, var(--paper))" strokeWidth={TRACO} strokeLinecap="round" />
        </>
      );
    case 'ponto':
      return <circle cx="8" cy="8" r="3.4" fill="currentColor" />;
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

/** Forma desenhada do estado, como a marca de preenchimento numa folha de respostas. Sempre decorativa: o texto acompanha. */
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
