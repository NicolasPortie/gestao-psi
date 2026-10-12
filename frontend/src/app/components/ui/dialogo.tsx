import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Dialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';

import { Botao } from './botao';
import { cn } from './cn';

interface CabecalhoSobreposicaoProps {
  titulo: string;
  descricao?: string;
  fechar?: ReactNode;
}

function CabecalhoSobreposicao({ titulo, descricao, fechar }: CabecalhoSobreposicaoProps) {
  return (
    <header className="flex items-start justify-between gap-4 px-5 pb-3 pt-5">
      <div className="grid gap-1">
        <Dialog.Title className="text-lg font-semibold text-ink">{titulo}</Dialog.Title>
        {descricao ? <Dialog.Description className="text-sm text-ink-muted">{descricao}</Dialog.Description> : null}
      </div>
      {fechar}
    </header>
  );
}

function BotaoFechar() {
  return (
    <Dialog.Close
      aria-label="Fechar"
      className="-mr-1.5 -mt-1 grid size-8 shrink-0 place-items-center rounded-md text-ink-muted transition-[background-color,color,scale] duration-150 ease-out hover:bg-hover hover:text-ink active:scale-[0.96] pointer-coarse:size-10"
    >
      <X size={18} aria-hidden="true" />
    </Dialog.Close>
  );
}

interface DialogoProps {
  aberto: boolean;
  aoMudar: (aberto: boolean) => void;
  titulo: string;
  descricao?: string;
  children: ReactNode;
  /** Ações do rodapé (normalmente Cancelar + ação principal). */
  rodape?: ReactNode;
  largura?: string;
}

/** Diálogo modal para tarefas curtas que exigem foco. Em telas estreitas vira uma folha inferior. */
export function Dialogo({ aberto, aoMudar, titulo, descricao, children, rodape, largura }: DialogoProps) {
  return (
    <Dialog.Root open={aberto} onOpenChange={aoMudar}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fundo-overlay" />
        <Dialog.Popup className="dialogo" style={largura ? ({ '--largura-dialogo': largura } as CSSProperties) : undefined}>
          <CabecalhoSobreposicao titulo={titulo} descricao={descricao} fechar={<BotaoFechar />} />
          <div className="scroll-contido min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-1">{children}</div>
          {rodape ? <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3">{rodape}</footer> : null}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface GavetaProps extends Omit<DialogoProps, 'largura'> {
  lado?: 'direita' | 'esquerda';
  largura?: string;
  className?: string;
}

/**
 * Painel lateral para formulários que preservam o contexto da lista ao fundo.
 * Em telas estreitas vira uma folha inferior; o lado esquerdo serve à navegação móvel.
 */
export function Gaveta({ aberto, aoMudar, titulo, descricao, children, rodape, lado = 'direita', largura, className }: GavetaProps) {
  return (
    <Dialog.Root open={aberto} onOpenChange={aoMudar}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fundo-overlay" />
        <Dialog.Popup
          className={cn('gaveta', className)}
          data-lado={lado === 'esquerda' ? 'esquerda' : undefined}
          style={largura ? ({ '--largura-gaveta': largura } as CSSProperties) : undefined}
        >
          <CabecalhoSobreposicao titulo={titulo} descricao={descricao} fechar={<BotaoFechar />} />
          <div className="scroll-contido min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-1">{children}</div>
          {rodape ? <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3">{rodape}</footer> : null}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface ConfirmacaoProps {
  aberto: boolean;
  aoMudar: (aberto: boolean) => void;
  titulo: string;
  descricao: ReactNode;
  rotuloConfirmar: string;
  rotuloCancelar?: string;
  perigoso?: boolean;
  carregando?: boolean;
  aoConfirmar: () => void;
  /** Conteúdo extra entre a descrição e as ações (ex.: campo de justificativa). */
  children?: ReactNode;
}

/** Confirmação de ações irreversíveis ou com efeito externo; o foco inicial fica em "Cancelar". */
export function Confirmacao({
  aberto,
  aoMudar,
  titulo,
  descricao,
  rotuloConfirmar,
  rotuloCancelar = 'Cancelar',
  perigoso = false,
  carregando = false,
  aoConfirmar,
  children,
}: ConfirmacaoProps) {
  return (
    <AlertDialog.Root open={aberto} onOpenChange={aoMudar}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fundo-overlay" />
        <AlertDialog.Popup className="dialogo" style={{ '--largura-dialogo': '26rem' } as CSSProperties}>
          <div className="grid gap-1.5 px-5 pb-3 pt-5">
            <AlertDialog.Title className="text-lg font-semibold text-ink">{titulo}</AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-ink-muted">{descricao}</AlertDialog.Description>
          </div>
          {children ? <div className="px-5 pb-3">{children}</div> : null}
          <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3">
            <AlertDialog.Close render={<Botao variante="secundario">{rotuloCancelar}</Botao>} />
            <Botao variante={perigoso ? 'perigo' : 'primario'} carregando={carregando} onClick={aoConfirmar}>
              {rotuloConfirmar}
            </Botao>
          </footer>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
