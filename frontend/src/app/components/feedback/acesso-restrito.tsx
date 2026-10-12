import { ShieldAlert } from 'lucide-react';
import type { ReactNode } from 'react';

/** Tela exibida a quem não tem o perfil exigido. A autorização final é sempre do backend. */
export function AcessoRestrito({ titulo = 'Acesso clínico necessário', mensagem, acao }: { titulo?: string; mensagem: string; acao?: ReactNode }) {
  return (
    <div role="alert" className="mx-auto grid max-w-md justify-items-center gap-3 py-14 text-center">
      <span className="grid size-11 place-items-center rounded-full bg-warning-wash text-warning-ink">
        <ShieldAlert size={20} aria-hidden="true" />
      </span>
      <div className="grid gap-1">
        <h1 className="text-lg font-semibold text-ink">{titulo}</h1>
        <p className="text-base text-ink-muted">{mensagem}</p>
      </div>
      {acao ? <div className="mt-1 flex flex-wrap justify-center gap-2">{acao}</div> : null}
    </div>
  );
}
