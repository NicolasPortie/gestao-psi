import { NavLink, Outlet } from 'react-router';

import { useTituloRota } from '../../core/use-titulo-rota';
import { cn } from '../ui/cn';
import { Marca } from './marca';

const documentos = [
  { para: '/termos', rotulo: 'Termos de uso' },
  { para: '/privacidade', rotulo: 'Política de privacidade' },
];

/** Moldura dos documentos públicos (termos e privacidade): legível sem login e sem o shell do app. */
export function LayoutLegal() {
  useTituloRota();
  return (
    <div className="min-h-dvh bg-paper">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 sm:px-8">
          <Marca />
          <nav aria-label="Documentos legais" className="flex gap-1">
            {documentos.map(({ para, rotulo }) => (
              <NavLink
                key={para}
                to={para}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-2.5 py-1.5 text-sm font-medium no-underline transition-colors duration-150 ease-out pointer-coarse:py-2.5',
                    isActive ? 'bg-accent-wash text-accent-ink' : 'text-ink-muted hover:bg-hover hover:text-ink',
                  )
                }
              >
                {rotulo}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <Outlet />
      </main>
    </div>
  );
}
