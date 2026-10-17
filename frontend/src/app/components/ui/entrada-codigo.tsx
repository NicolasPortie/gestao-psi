import { useEffect, useRef, useState, type FocusEvent, type InputHTMLAttributes, type Ref } from 'react';

import { useCampo } from './campo-contexto';
import { cn } from './cn';

export type EstadoCodigo = 'padrao' | 'erro' | 'confirmado';

interface EntradaCodigoProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'size' | 'maxLength'> {
  ref?: Ref<HTMLInputElement>;
  /** Valor atual (o campo segue não controlado; isto só desenha as casas). */
  valor: string;
  comprimento?: number;
  estado?: EstadoCodigo;
  /** Muda a cada recusa do código: as casas balançam uma vez. */
  recusas?: number;
}

const balanco: Keyframe[] = [
  { transform: 'translateX(0)' },
  { transform: 'translateX(-6px)' },
  { transform: 'translateX(5px)' },
  { transform: 'translateX(-3px)' },
  { transform: 'translateX(2px)' },
  { transform: 'translateX(0)' },
];

/**
 * Código numérico em casas. Um único <input> real, transparente, fica por cima das casas: leitor de
 * tela, colar e preenchimento automático (`one-time-code`) funcionam como num campo comum.
 */
export function EntradaCodigo({
  ref,
  valor,
  comprimento = 6,
  estado = 'padrao',
  recusas = 0,
  id,
  className,
  onFocus,
  onBlur,
  ...props
}: EntradaCodigoProps) {
  const campo = useCampo(id);
  const casas = useRef<HTMLDivElement>(null);
  const [focado, setFocado] = useState(false);
  const ativa = Math.min(valor.length, comprimento - 1);

  useEffect(() => {
    const elemento = casas.current;
    if (recusas === 0 || typeof elemento?.animate !== 'function') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    // Mesma curva de `--ease-in-out`: deslocamento na tela, não entrada.
    elemento.animate(balanco, { duration: 320, easing: 'cubic-bezier(0.77, 0, 0.175, 1)' });
  }, [recusas]);

  // O cursor fica sempre no fim: digitar e apagar seguem a ordem das casas.
  function cursorNoFim(evento: { currentTarget: HTMLInputElement }) {
    const entrada = evento.currentTarget;
    const fim = entrada.value.length;
    if (entrada.selectionStart !== fim || entrada.selectionEnd !== fim) entrada.setSelectionRange(fim, fim);
  }

  return (
    <div className={cn('entrada-codigo relative', className)} data-estado={estado}>
      <div ref={casas} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${comprimento}, minmax(0, 1fr))` }} aria-hidden="true">
        {Array.from({ length: comprimento }, (_, indice) => {
          const digito = valor[indice];
          return (
            <span
              key={indice}
              className="casa-codigo"
              data-ativa={(focado && indice === ativa && estado !== 'confirmado') || undefined}
              data-preenchida={digito ? true : undefined}
              style={{ '--i': indice } as React.CSSProperties}
            >
              {digito ? (
                <span key={digito} className="digito-codigo">
                  {digito}
                </span>
              ) : focado && indice === ativa ? (
                <span className="cursor-codigo" />
              ) : null}
            </span>
          );
        })}
      </div>
      <input
        {...campo}
        {...props}
        ref={ref}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={comprimento}
        spellCheck={false}
        onFocus={(evento: FocusEvent<HTMLInputElement>) => {
          setFocado(true);
          cursorNoFim(evento);
          onFocus?.(evento);
        }}
        onBlur={(evento: FocusEvent<HTMLInputElement>) => {
          setFocado(false);
          onBlur?.(evento);
        }}
        onSelect={cursorNoFim}
        className="absolute inset-0 size-full cursor-text rounded-md bg-transparent text-transparent caret-transparent outline-none selection:bg-transparent"
      />
    </div>
  );
}
