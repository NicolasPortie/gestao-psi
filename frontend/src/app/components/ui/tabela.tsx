import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router';

import { cn } from './cn';
import { RegiaoRolavel } from './regiao-rolavel';

/**
 * Primitivos de tabela: um painel claro de cantos macios, cabeçalho em tom de linho e linhas
 * separadas por régua. A rolagem horizontal é um último recurso; colunas
 * secundárias somem por breakpoint com `ocultarAte`. O rótulo oculto de uma
 * coluna (`sr-only`) fica contido na célula, senão vaza para fora do scroll.
 */
export function Tabela({ rotulo, children, className }: { rotulo: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-lg border border-line bg-surface', className)}>
      <RegiaoRolavel rotulo={rotulo}>
        <table aria-label={rotulo} className="animar-conteudo w-full min-w-full border-collapse text-left text-base">
          {children}
        </table>
      </RegiaoRolavel>
    </div>
  );
}

export function CabecalhoTabela({ children }: { children: ReactNode }) {
  return <thead>{children}</thead>;
}

const ocultacao = { sm: 'max-sm:hidden', md: 'max-md:hidden', lg: 'max-lg:hidden' } as const;

interface ColunaProps {
  /** Esconde a coluna abaixo do breakpoint informado. */
  ocultarAte?: keyof typeof ocultacao;
}

export function ColunaTabela({
  ocultarAte,
  className,
  children,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & ColunaProps) {
  return (
    <th
      scope="col"
      className={cn(
        'relative border-b border-line bg-rail/60 px-2 py-2.5 text-xs font-medium text-ink-muted first:pl-4 last:pr-4 sm:px-3 sm:first:pl-5 sm:last:pr-5',
        ocultarAte && ocultacao[ocultarAte],
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function LinhaTabela({
  selecionada,
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement> & { selecionada?: boolean }) {
  return (
    <tr
      aria-selected={selecionada || undefined}
      className={cn(
        'relative border-b border-line transition-colors duration-100 ease-out last:border-b-0 hover:bg-hover',
        selecionada && 'bg-selected hover:bg-selected',
        className,
      )}
      {...props}
    />
  );
}

export function CelulaTabela({
  ocultarAte,
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & ColunaProps) {
  return (
    <td
      className={cn('px-2 py-3.5 align-middle first:pl-4 last:pr-4 sm:px-3 sm:first:pl-5 sm:last:pr-5', ocultarAte && ocultacao[ocultarAte], className)}
      {...props}
    />
  );
}

/**
 * Link que ocupa a linha inteira (área clicável ampla) sem aninhar controles:
 * o destino é um único <a> acessível; ações secundárias ficam acima dele via `relative z-10`.
 */
export function LinkDaLinha({ className, ...props }: LinkProps) {
  return (
    <Link
      className={cn(
        'font-medium text-ink no-underline outline-none after:absolute after:inset-0 after:content-[""]',
        'focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-focus',
        className,
      )}
      {...props}
    />
  );
}
