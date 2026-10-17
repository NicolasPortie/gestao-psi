import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { NavLink } from 'react-router';

import { contarNotificacoesNaoLidas, notificacoesKeys } from '../../features/notificacoes/notificacoes.api';
import { cn } from '../ui/cn';
import { Dica } from '../ui/dica';

/** Atalho para as notificações com a contagem de não lidas; atualiza a cada minuto. */
export function SinoNotificacoes({ className }: { className?: string }) {
  const { data: naoLidas = 0 } = useQuery({
    queryKey: notificacoesKeys.contagem(),
    queryFn: ({ signal }) => contarNotificacoesNaoLidas({ signal }),
    refetchInterval: 60_000,
  });
  const rotulo = naoLidas > 0 ? `Notificações, ${naoLidas} não lidas` : 'Notificações';

  return (
    <Dica texto="Notificações">
      <NavLink
        to="/notificacoes"
        aria-label={rotulo}
        className={({ isActive }) =>
          cn(
            'relative grid size-9 shrink-0 place-items-center rounded-md text-ink-muted no-underline transition-[background-color,color,scale] duration-150 ease-out',
            'hover:bg-hover hover:text-ink active:scale-[0.96] pointer-coarse:size-11',
            isActive && 'bg-accent-wash text-accent-ink hover:bg-accent-wash',
            className,
          )
        }
      >
        <Bell size={17} strokeWidth={1.75} aria-hidden="true" />
        {naoLidas > 0 ? (
          <span
            key={naoLidas}
            aria-hidden="true"
            className="animar-selo num absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[0.625rem] font-semibold leading-none text-on-accent"
          >
            {naoLidas > 99 ? '99+' : naoLidas}
          </span>
        ) : null}
      </NavLink>
    </Dica>
  );
}
