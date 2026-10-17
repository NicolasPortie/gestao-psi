import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from './cn';

/** Lista regulada: itens separados por régua, sem cartões. */
export function ListaRegulada({ className, ...props }: HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn('animar-lista divide-y divide-line border-y border-line', className)} {...props} />;
}

export function ItemLista({ className, ...props }: HTMLAttributes<HTMLLIElement>) {
  return <li className={cn('relative py-3.5', className)} {...props} />;
}

/** Definições "rótulo sobre valor", como os campos de uma ficha impressa. */
export function Ficha({ colunas = 2, className, children }: { colunas?: 1 | 2 | 3; className?: string; children: ReactNode }) {
  return (
    <dl
      className={cn(
        'grid gap-x-10 gap-y-4',
        colunas === 2 && 'sm:grid-cols-2',
        colunas === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {children}
    </dl>
  );
}

export function Dado({ rotulo, children, largo, className }: { rotulo: string; children: ReactNode; largo?: boolean; className?: string }) {
  return (
    <div className={cn('min-w-0', largo && 'sm:col-span-full', className)}>
      <dt className="text-xs font-medium text-ink-muted">{rotulo}</dt>
      <dd className="mt-0.5 break-words text-base text-ink">{children}</dd>
    </div>
  );
}
