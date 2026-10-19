import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from './cn';

/** Lista num painel claro: itens separados por régua, cantos macios. */
export function ListaRegulada({ className, ...props }: HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn('animar-lista divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface', className)} {...props} />;
}

export function ItemLista({ className, ...props }: HTMLAttributes<HTMLLIElement>) {
  return <li className={cn('relative px-4 py-3.5 sm:px-5', className)} {...props} />;
}

/** Painel: superfície clara de cantos macios para os blocos que importam na tela. Não é grade de cartões iguais. */
export function Painel({ className, children, destaque = false }: { className?: string; children: ReactNode; destaque?: boolean }) {
  return (
    <div className={cn('rounded-lg border p-4 sm:p-5', destaque ? 'border-accent-line bg-accent-wash' : 'border-line bg-surface', className)}>
      {children}
    </div>
  );
}

/** Mensagem curta num painel (lista vazia dentro de uma seção). */
export function PainelVazio({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('flex items-center gap-2 rounded-lg border border-dashed border-line px-4 py-4 text-base text-ink-muted sm:px-5', className)}>{children}</p>;
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
