import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import {
  calcularIntervaloExibicao,
  calcularTotalPaginas,
  OPCOES_TAMANHO_PAGINA,
  paginasVisiveis,
} from '../../core/api/paginacao';
import { formatarNumero } from '../../core/formatacao/moeda';
import { cn } from './cn';

interface PaginacaoProps {
  pagina: number;
  total: number;
  tamanhoPagina: number;
  aoMudarPagina: (pagina: number) => void;
  aoMudarTamanhoPagina?: (tamanho: number) => void;
  opcoesTamanhoPagina?: readonly number[];
  desabilitado?: boolean;
  rotulo?: string;
  variante?: 'completa' | 'compacta';
  className?: string;
}

const botao = cn(
  'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium text-ink',
  'transition-[background-color,color,scale] duration-150 ease-out hover:bg-hover',
  'enabled:active:scale-[0.96] disabled:cursor-not-allowed disabled:text-ink-faint disabled:opacity-60 disabled:hover:bg-transparent',
  'pointer-coarse:h-11 pointer-coarse:min-w-11',
);

export function Paginacao({
  pagina,
  total,
  tamanhoPagina,
  aoMudarPagina,
  aoMudarTamanhoPagina,
  opcoesTamanhoPagina = OPCOES_TAMANHO_PAGINA,
  desabilitado = false,
  rotulo = 'Paginação',
  variante = 'completa',
  className,
}: PaginacaoProps) {
  const totalPaginas = calcularTotalPaginas(total, tamanhoPagina);

  if (total <= 0 || totalPaginas <= 1) return null;

  if (variante === 'compacta') {
    return (
      <nav className={cn('flex items-center justify-between gap-2 border-t border-line pt-3', className)} aria-label={rotulo}>
        <p className="num text-sm text-ink-muted" role="status">
          Página {pagina} de {totalPaginas}
        </p>
        <div className="flex gap-1">
          <button className={botao} type="button" disabled={desabilitado || pagina <= 1} onClick={() => aoMudarPagina(pagina - 1)} aria-label="Página anterior">
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button className={botao} type="button" disabled={desabilitado || pagina >= totalPaginas} onClick={() => aoMudarPagina(pagina + 1)} aria-label="Próxima página">
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </nav>
    );
  }

  const { inicio, fim } = calcularIntervaloExibicao(pagina, tamanhoPagina, total);
  const visiveis = paginasVisiveis(pagina, totalPaginas);

  const irPara = (destino: number) => {
    const proxima = Math.min(totalPaginas, Math.max(1, destino));
    if (proxima !== pagina) aoMudarPagina(proxima);
  };

  return (
    <nav
      className={cn('flex flex-col gap-3 border-t border-line pt-3 sm:flex-row sm:items-center sm:justify-between', className)}
      aria-label={rotulo}
    >
      <p className="num text-sm text-ink-muted" role="status">
        Mostrando {formatarNumero(inicio)}–{formatarNumero(fim)} de {formatarNumero(total)}
        <span className="sm:hidden"> · Página {pagina} de {totalPaginas}</span>
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {aoMudarTamanhoPagina ? (
          <label className="inline-flex items-center gap-2 text-sm text-ink-muted">
            Por página
            <select
              className="h-8 rounded-md border border-line-strong bg-field px-2 text-sm font-medium text-ink pointer-coarse:h-11"
              value={tamanhoPagina}
              name="tamanho-pagina"
              disabled={desabilitado}
              onChange={(evento) => aoMudarTamanhoPagina(Number(evento.target.value))}
              aria-label="Itens por página"
            >
              {opcoesTamanhoPagina.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="flex items-center gap-0.5">
          <button className={botao} type="button" disabled={desabilitado || pagina <= 1} onClick={() => irPara(1)} aria-label="Primeira página">
            <ChevronsLeft size={15} aria-hidden="true" />
          </button>
          <button className={botao} type="button" disabled={desabilitado || pagina <= 1} onClick={() => irPara(pagina - 1)} aria-label="Página anterior">
            <ChevronLeft size={15} aria-hidden="true" />
          </button>

          <div className="hidden items-center gap-0.5 sm:flex">
            {visiveis.map((item) =>
              typeof item === 'number' ? (
                <button
                  key={item}
                  className={cn(botao, 'num', item === pagina && 'bg-accent-wash text-accent-ink hover:bg-accent-wash')}
                  type="button"
                  disabled={desabilitado}
                  onClick={() => irPara(item)}
                  aria-label={`Ir para a página ${item}`}
                  aria-current={item === pagina ? 'page' : undefined}
                >
                  {item}
                </button>
              ) : (
                <span key={item} className="px-1 text-sm text-ink-muted" aria-hidden="true">
                  …
                </span>
              ),
            )}
          </div>

          <button className={botao} type="button" disabled={desabilitado || pagina >= totalPaginas} onClick={() => irPara(pagina + 1)} aria-label="Próxima página">
            <ChevronRight size={15} aria-hidden="true" />
          </button>
          <button className={botao} type="button" disabled={desabilitado || pagina >= totalPaginas} onClick={() => irPara(totalPaginas)} aria-label="Última página">
            <ChevronsRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </nav>
  );
}
