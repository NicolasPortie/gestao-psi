import { NavLink } from 'react-router';

import { cn } from '../ui/cn';
import { Dica } from '../ui/dica';
import type { ItemNavegacao } from './navegacao';

interface LinkNavegacaoProps {
  item: ItemNavegacao;
  /** Mostra só o ícone (trilho recolhido), com o nome numa dica. */
  recolhido?: boolean;
  aoNavegar?: () => void;
}

/** Destino de navegação lateral. O estado atual vem de aria-current, não só de cor. */
export function LinkNavegacao({ item, recolhido = false, aoNavegar }: LinkNavegacaoProps) {
  const { rota, rotulo, icone: Icone } = item;
  const link = (
    <NavLink
      to={rota}
      end={rota === '/painel'}
      onClick={aoNavegar}
      aria-label={recolhido ? rotulo : undefined}
      className={({ isActive }) =>
        cn(
          'flex h-8 items-center gap-2.5 rounded-md text-sm font-medium no-underline',
          'transition-[background-color,color,scale] duration-150 ease-out active:scale-[0.98] pointer-coarse:h-11 pointer-coarse:text-base',
          recolhido ? 'justify-center' : 'px-2.5',
          isActive ? 'bg-accent-wash text-accent-ink' : 'text-ink-muted hover:bg-hover hover:text-ink',
        )
      }
    >
      <Icone size={16} strokeWidth={1.75} className="shrink-0" aria-hidden="true" />
      {recolhido ? null : <span className="truncate">{rotulo}</span>}
    </NavLink>
  );
  return recolhido ? (
    <Dica texto={rotulo} lado="right">
      {link}
    </Dica>
  ) : (
    link
  );
}
