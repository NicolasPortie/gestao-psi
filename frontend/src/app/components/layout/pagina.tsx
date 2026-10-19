import { ArrowLeft } from 'lucide-react';
import { use, type ReactNode } from 'react';
import { Link } from 'react-router';

import { cn } from '../ui/cn';
import { ContextoAlinhamentoPagina } from './contexto-pagina';

/** Em telas ultralargas (21:9) o conteúdo cresce com a janela, sem esticar formulários e texto corrido. */
const larguras = {
  estreita: 'max-w-2xl',
  padrao: 'max-w-5xl 2xl:max-w-6xl 3xl:max-w-7xl',
  ampla: 'max-w-7xl 2xl:max-w-[90rem] 3xl:max-w-[112rem]',
  total: 'max-w-none',
} as const;

interface PaginaProps {
  largura?: keyof typeof larguras;
  children: ReactNode;
  className?: string;
}

/** Moldura de conteúdo: define a largura útil e o ritmo vertical da tela. */
export function Pagina({ largura = 'padrao', children, className }: PaginaProps) {
  const alinhamento = use(ContextoAlinhamentoPagina);
  return (
    <div className={cn('animar-pagina flex w-full flex-col gap-10', alinhamento === 'inicio' ? 'mr-auto' : 'mx-auto', larguras[largura], className)}>
      {children}
    </div>
  );
}

interface CabecalhoPaginaProps {
  titulo: string;
  descricao?: ReactNode;
  acoes?: ReactNode;
  voltarPara?: { para: string; rotulo: string };
  /** Linha de contexto sob o título (data, contagem). */
  meta?: ReactNode;
  className?: string;
}

/** Título da tela, contexto e ações. A única ação preenchida da tela mora aqui. */
export function CabecalhoPagina({ titulo, descricao, acoes, voltarPara, meta, className }: CabecalhoPaginaProps) {
  return (
    <header className={cn('grid gap-3', className)}>
      {voltarPara ? (
        <Link
          to={voltarPara.para}
          className="-ml-1 inline-flex w-fit items-center gap-1.5 rounded-md px-1 py-0.5 text-sm text-ink-muted no-underline transition-colors duration-150 hover:text-ink"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          {voltarPara.rotulo}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="grid min-w-0 gap-1">
          <h1 className="text-2xl font-semibold tracking-[-0.015em] text-ink">{titulo}</h1>
          {meta ? <div className="text-base text-ink-muted">{meta}</div> : null}
          {descricao ? <p className="max-w-[60ch] text-base text-ink-muted">{descricao}</p> : null}
        </div>
        {acoes ? <div className="flex flex-wrap items-center gap-2">{acoes}</div> : null}
      </div>
    </header>
  );
}

interface SecaoProps {
  titulo?: string;
  descricao?: ReactNode;
  acoes?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Régua no topo separa blocos consecutivos da mesma tela. */
  regua?: boolean;
  /** Envolve o conteúdo num painel claro de cantos macios. */
  painel?: boolean;
  id?: string;
}

/** Bloco nomeado da tela: título, ações e conteúdo; o conteúdo pode morar num painel claro. */
export function Secao({ titulo, descricao, acoes, children, className, regua = false, painel = false, id }: SecaoProps) {
  const tituloId = id && titulo ? `${id}-titulo` : undefined;
  return (
    <section id={id} aria-labelledby={tituloId} className={cn('grid content-start gap-3', regua && 'border-t border-line pt-8', className)}>
      {titulo || acoes ? (
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div className="grid gap-0.5">
            {titulo ? (
              <h2 id={tituloId} className="text-lg font-semibold text-ink">
                {titulo}
              </h2>
            ) : null}
            {descricao ? <p className="max-w-[60ch] text-sm text-ink-muted">{descricao}</p> : null}
          </div>
          {acoes ? <div className="flex flex-wrap items-center gap-2">{acoes}</div> : null}
        </div>
      ) : null}
      {painel ? <div className="rounded-lg border border-line bg-surface p-4 sm:p-5">{children}</div> : children}
    </section>
  );
}
