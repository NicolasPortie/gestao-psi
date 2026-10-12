import { Tooltip } from '@base-ui/react/tooltip';
import type { ReactElement, ReactNode } from 'react';

/** Dica de texto curto para controles que só têm ícone. Nunca carrega informação essencial. */
export function Dica({ texto, children, lado = 'top' }: { texto: ReactNode; children: ReactElement; lado?: 'top' | 'bottom' | 'left' | 'right' }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={children} />
      <Tooltip.Portal>
        <Tooltip.Positioner side={lado} sideOffset={8} className="z-[80]">
          <Tooltip.Popup className="dica-popup">{texto}</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

export const ProvedorDicas = Tooltip.Provider;
