import { cn } from '../ui/cn';

/** Bloco que reserva o espaço do conteúdo enquanto ele carrega. */
export function Esqueleto({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn('animar-esqueleto block rounded-sm bg-pressed', className)} />;
}

/** Linhas de lista/tabela com a proporção típica de "texto principal + apoio". */
export function EsqueletoLinhas({ quantidade = 6, className }: { quantidade?: number; className?: string }) {
  return (
    <div className={cn('divide-y divide-line', className)} aria-hidden="true">
      {Array.from({ length: quantidade }, (_, indice) => (
        <div key={indice} className="flex items-center gap-4 py-3.5">
          <Esqueleto className="h-4 w-12" />
          <div className="grid flex-1 gap-1.5">
            <Esqueleto className="h-4 w-2/5" />
            <Esqueleto className="h-3 w-1/4" />
          </div>
          <Esqueleto className="hidden h-4 w-24 sm:block" />
        </div>
      ))}
    </div>
  );
}

/** Esqueleto de página inteira: cabeçalho + conteúdo; anuncia o carregamento para leitores de tela. */
export function CarregandoPagina({ rotulo = 'Carregando…' }: { rotulo?: string }) {
  return (
    <div role="status" aria-live="polite" className="animar-conteudo">
      <span className="sr-only">{rotulo}</span>
      <div className="grid gap-2" aria-hidden="true">
        <Esqueleto className="h-7 w-48" />
        <Esqueleto className="h-4 w-80 max-w-full" />
      </div>
      <EsqueletoLinhas className="mt-8" />
    </div>
  );
}
