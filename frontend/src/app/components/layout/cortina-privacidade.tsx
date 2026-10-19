import { Dialog } from '@base-ui/react/dialog';
import { EyeOff, LockKeyhole } from 'lucide-react';
import { useEffect } from 'react';

import { MARCA } from '../../core/marca';
import { lerMinutosInatividade, liberarTela, protegerTela, useTelaProtegida } from '../../core/privacidade/cortina';
import { Botao } from '../ui/botao';
import { Dica } from '../ui/dica';
import { Marca } from './marca';

const EVENTOS_DE_USO = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'] as const;

/** Protege a tela depois de alguns minutos sem uso (padrão 10; 0 desliga, em Conta e segurança). */
function useProtecaoPorInatividade() {
  useEffect(() => {
    const minutos = lerMinutosInatividade();
    if (minutos <= 0) return undefined;
    let temporizador = window.setTimeout(protegerTela, minutos * 60_000);
    const reiniciar = () => {
      window.clearTimeout(temporizador);
      temporizador = window.setTimeout(protegerTela, minutos * 60_000);
    };
    for (const evento of EVENTOS_DE_USO) window.addEventListener(evento, reiniciar, { passive: true });
    return () => {
      window.clearTimeout(temporizador);
      for (const evento of EVENTOS_DE_USO) window.removeEventListener(evento, reiniciar);
    };
  }, []);
}

/**
 * Cortina calma sobre todo o app: nada do que estava na tela fica visível nem alcançável por teclado
 * (diálogo modal com foco preso). Abre pelo botão do olho, pelo atalho Alt+Shift+P ou por inatividade.
 */
export function CortinaPrivacidade() {
  const protegida = useTelaProtegida();
  useProtecaoPorInatividade();

  useEffect(() => {
    function atalho(evento: KeyboardEvent) {
      if (evento.altKey && evento.shiftKey && evento.code === 'KeyP') {
        evento.preventDefault();
        protegerTela();
      }
    }
    window.addEventListener('keydown', atalho);
    return () => window.removeEventListener('keydown', atalho);
  }, []);

  return (
    <Dialog.Root open={protegida} onOpenChange={(aberto) => !aberto && liberarTela()}>
      <Dialog.Portal>
        <Dialog.Popup className="cortina-privacidade fixed inset-0 z-[95] grid place-items-center bg-paper p-6 outline-none">
          <div className="grid max-w-sm justify-items-center gap-5 text-center">
            <Marca />
            <span className="grid size-14 place-items-center rounded-full bg-accent-wash text-accent-ink">
              <LockKeyhole size={24} aria-hidden="true" />
            </span>
            <div className="grid gap-1.5">
              <Dialog.Title className="text-xl font-semibold text-ink">Tela protegida</Dialog.Title>
              <Dialog.Description className="text-base text-ink-muted">
                Os dados do consultório ficam escondidos até você voltar. A sessão continua aberta.
              </Dialog.Description>
            </div>
            <Botao variante="primario" tamanho="grande" onClick={liberarTela} autoFocus>
              Voltar ao {MARCA.nome}
            </Botao>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Atalho visível para cobrir a tela quando alguém entra na sala. */
export function BotaoProtegerTela({ className }: { className?: string }) {
  return (
    <Dica texto="Proteger a tela (Alt+Shift+P)" lado="bottom">
      <Botao variante="discreto" tamanho="icone-pequeno" aria-label="Proteger a tela" className={className} onClick={protegerTela}>
        <EyeOff size={17} aria-hidden="true" />
      </Botao>
    </Dica>
  );
}
