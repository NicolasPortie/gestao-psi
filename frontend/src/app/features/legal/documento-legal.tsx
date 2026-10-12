import type { ReactNode } from 'react';

/** Versão vigente dos documentos. Acompanha `Seguranca:VersaoTermosUso`, gravada no aceite do cadastro. */
export const VERSAO_DOCUMENTOS = '1.0';
export const VIGENTE_DESDE = '12 de outubro de 2026';

export function DocumentoLegal({ titulo, resumo, children }: { titulo: string; resumo: string; children: ReactNode }) {
  return (
    <article className="grid gap-10">
      <header className="grid gap-2">
        <h1 className="text-2xl font-semibold tracking-[-0.015em] text-ink">{titulo}</h1>
        <p className="max-w-[60ch] text-base text-ink-muted">{resumo}</p>
        <p className="num text-sm text-ink-muted">
          Versão {VERSAO_DOCUMENTOS} · vigente desde {VIGENTE_DESDE}
        </p>
      </header>
      <div className="grid gap-9">{children}</div>
    </article>
  );
}

export function SecaoLegal({ numero, titulo, children }: { numero: number; titulo: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`secao-${numero}`} className="grid max-w-[65ch] gap-3 border-t border-line pt-6">
      <h2 id={`secao-${numero}`} className="text-lg font-semibold text-ink">
        <span className="num mr-2 text-ink-muted">{numero}.</span>
        {titulo}
      </h2>
      <div className="grid gap-3 text-base text-ink [&_li]:pl-1 [&_ul]:grid [&_ul]:list-disc [&_ul]:gap-1.5 [&_ul]:pl-5">{children}</div>
    </section>
  );
}
