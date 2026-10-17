import { Tabs } from '@base-ui/react/tabs';
import type { ReactNode } from 'react';

import { cn } from './cn';

interface AbaDefinicao {
  valor: string;
  rotulo: string;
  contagem?: number;
}

interface AbasProps {
  valor: string;
  aoMudar: (valor: string) => void;
  abas: AbaDefinicao[];
  rotulo: string;
  children: ReactNode;
  className?: string;
}

/**
 * Abas com sublinhado que desliza até a aba ativa (anima o recorte, sem layout). Os painéis entram como filhos de <PainelAba>.
 * Use para alternar visões do mesmo assunto, nunca para navegação entre módulos.
 */
export function Abas({ valor, aoMudar, abas, rotulo, children, className }: AbasProps) {
  return (
    <Tabs.Root value={valor} onValueChange={(proximo) => aoMudar(String(proximo))} className={className}>
      <Tabs.List
        aria-label={rotulo}
        className="sem-barra relative flex gap-1 overflow-x-auto border-b border-line"
      >
        {abas.map((aba) => (
          <Tabs.Tab
            key={aba.valor}
            value={aba.valor}
            className={cn(
              'relative flex h-10 shrink-0 items-center gap-2 px-3 text-base font-medium text-ink-muted outline-none',
              'transition-colors duration-150 ease-out hover:text-ink',
              'focus-visible:rounded-md focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus',
              'data-active:text-ink pointer-coarse:h-11',
            )}
          >
            {aba.rotulo}
            {aba.contagem !== undefined ? <span className="num text-xs font-normal text-ink-muted">{aba.contagem}</span> : null}
          </Tabs.Tab>
        ))}
        <Tabs.Indicator className="indicador-aba" />
      </Tabs.List>
      {children}
    </Tabs.Root>
  );
}

export function PainelAba({ valor, children, className }: { valor: string; children: ReactNode; className?: string }) {
  return (
    <Tabs.Panel value={valor} className={cn('animar-painel pt-6 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus', className)}>
      {children}
    </Tabs.Panel>
  );
}
