import { useEffect, useRef } from 'react';

import { cn } from '../../../components/ui/cn';
import { formatarDataHora, formatarHora, mesmoDia } from '../../../core/formatacao/datas';
import type { MensagemWhatsApp } from '../whatsapp.api';

const rotulosStatusMensagem: Record<string, string> = {
  Pendente: 'Enviando',
  Enviada: 'Enviada',
  Entregue: 'Entregue',
  Lida: 'Lida',
  Falhou: 'Falhou',
  Recebida: 'Recebida',
};

function instante(mensagem: MensagemWhatsApp) {
  return mensagem.enviadaEm ?? mensagem.recebidaEm ?? mensagem.criadoEm;
}

/** Mensagens em ordem cronológica, separadas por dia; rola até a mais recente ao abrir e a cada nova mensagem. */
export function FioDaConversa({ mensagens }: { mensagens: MensagemWhatsApp[] }) {
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ block: 'end' });
  }, [mensagens.length]);

  if (mensagens.length === 0) {
    return <p className="py-10 text-center text-base text-ink-muted">Nenhuma mensagem nesta conversa ainda.</p>;
  }

  return (
    <ol className="grid content-end gap-2 py-4">
      {mensagens.map((mensagem, indice) => {
        const saida = mensagem.direcao === 'Saida';
        const anterior = mensagens[indice - 1];
        const novoDia = !anterior || !mesmoDia(new Date(instante(anterior)), new Date(instante(mensagem)));
        return (
          <li key={mensagem.id} className="grid gap-2">
            {novoDia ? (
              <p className="my-1 text-center text-xs font-medium text-ink-muted">
                {new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(instante(mensagem)))}
              </p>
            ) : null}
            <div
              className={cn(
                'max-w-[min(85%,34rem)] rounded-lg px-3 py-2 text-base',
                saida ? 'ml-auto rounded-br-sm bg-accent-wash text-ink' : 'mr-auto rounded-bl-sm bg-rail text-ink',
              )}
            >
              <p className="whitespace-pre-wrap break-words">{mensagem.conteudo ?? `(${mensagem.tipoMensagem})`}</p>
              <p className={cn('num mt-1 text-xs', mensagem.status === 'Falhou' ? 'text-danger-ink' : 'text-ink-muted')} title={formatarDataHora(instante(mensagem))}>
                {formatarHora(instante(mensagem))}
                {saida ? ` · ${rotulosStatusMensagem[mensagem.status] ?? mensagem.status}` : ''}
                {mensagem.erroEnvio ? ` · ${mensagem.erroEnvio}` : ''}
              </p>
            </div>
          </li>
        );
      })}
      <div ref={fimRef} aria-hidden="true" />
    </ol>
  );
}
