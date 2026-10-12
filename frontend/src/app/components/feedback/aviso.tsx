import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '../ui/cn';

export type TomAviso = 'info' | 'sucesso' | 'aviso' | 'perigo';

const estilos: Record<TomAviso, { classe: string; Icone: LucideIcon }> = {
  info: { classe: 'border-accent-line bg-accent-wash text-accent-ink', Icone: Info },
  sucesso: { classe: 'border-success-line bg-success-wash text-success-ink', Icone: CircleCheck },
  aviso: { classe: 'border-warning-line bg-warning-wash text-warning-ink', Icone: TriangleAlert },
  perigo: { classe: 'border-danger-line bg-danger-wash text-danger-ink', Icone: CircleAlert },
};

interface AvisoProps {
  tom?: TomAviso;
  titulo?: string;
  children?: ReactNode;
  acao?: ReactNode;
  className?: string;
}

/** Mensagem em linha, ligada ao conteúdo que ela explica. Para confirmações passageiras, use `notificar`. */
export function Aviso({ tom = 'info', titulo, children, acao, className }: AvisoProps) {
  const { classe, Icone } = estilos[tom];
  return (
    <div
      role={tom === 'perigo' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 rounded-lg border px-3.5 py-3 text-sm', classe, className)}
    >
      <Icone size={18} className="mt-px shrink-0" aria-hidden="true" />
      <div className="grid min-w-0 flex-1 gap-0.5">
        {titulo ? <p className="font-medium">{titulo}</p> : null}
        {children ? <div className={cn(titulo && 'text-ink-muted')}>{children}</div> : null}
      </div>
      {acao ? <div className="shrink-0">{acao}</div> : null}
    </div>
  );
}
