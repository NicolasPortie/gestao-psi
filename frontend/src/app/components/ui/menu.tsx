import { Menu } from '@base-ui/react/menu';
import { Check, Ellipsis } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';
import { Link } from 'react-router';

import { cn } from './cn';
import { Botao } from './botao';

export interface ItemMenu {
  rotulo: string;
  icone?: ReactNode;
  aoSelecionar?: () => void;
  /** Destino interno; renderiza um link em vez de um botão. */
  para?: string;
  perigo?: boolean;
  desabilitado?: boolean;
  selecionado?: boolean;
  /** Separador visual antes deste item. */
  separador?: boolean;
}

interface MenuAcoesProps {
  itens: ItemMenu[];
  /** Gatilho próprio; por padrão um botão com reticências. */
  gatilho?: ReactElement;
  rotulo?: string;
  alinhamento?: 'start' | 'center' | 'end';
  lado?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

/** Menu de ações com navegação por teclado, tipo-ahead e foco devolvido ao gatilho. */
export function MenuAcoes({ itens, gatilho, rotulo = 'Mais ações', alinhamento = 'end', lado = 'bottom', className }: MenuAcoesProps) {
  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          gatilho ?? (
            <Botao variante="discreto" tamanho="icone-pequeno" aria-label={rotulo} className={className}>
              <Ellipsis size={18} aria-hidden="true" />
            </Botao>
          )
        }
      />
      <Menu.Portal>
        <Menu.Positioner sideOffset={6} align={alinhamento} side={lado} className="z-[70]">
          <Menu.Popup className="menu-popup">
            {itens.map((item) => (
              <ItemDoMenu key={item.rotulo} item={item} />
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

function ItemDoMenu({ item }: { item: ItemMenu }) {
  const conteudo = (
    <>
      {item.icone ? <span className="grid size-4 shrink-0 place-items-center text-ink-muted">{item.icone}</span> : null}
      <span className="flex-1">{item.rotulo}</span>
      {item.selecionado ? <Check size={15} aria-hidden="true" className="text-accent" /> : null}
    </>
  );
  const propriedades = {
    className: cn('item-menu'),
    'data-perigo': item.perigo ? '' : undefined,
    'data-selecionado': item.selecionado ? '' : undefined,
  };
  return (
    <>
      {item.separador ? <Menu.Separator className="-mx-1 my-1 h-px bg-line" /> : null}
      {item.para ? (
        <Menu.LinkItem render={<Link to={item.para} />} {...propriedades}>
          {conteudo}
        </Menu.LinkItem>
      ) : (
        <Menu.Item disabled={item.desabilitado} onClick={item.aoSelecionar} {...propriedades}>
          {conteudo}
        </Menu.Item>
      )}
    </>
  );
}
