import { RefreshCw, TriangleAlert, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Botao } from '../ui/botao';
import { cn } from '../ui/cn';

interface EstadoVazioProps {
  icone: LucideIcon;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  /** Versão enxuta para dentro de painéis e tabelas. */
  compacto?: boolean;
  className?: string;
}

/**
 * Estado vazio que ensina a próxima ação. O ícone fica num azulejo ainda por preencher: um quarto de
 * círculo suave ao fundo, a mesma ideia de "ainda sem marca" usada em todo o produto.
 */
export function EstadoVazio({ icone: Icone, titulo, descricao, acao, compacto = false, className }: EstadoVazioProps) {
  return (
    <div className={cn('mx-auto grid max-w-md justify-items-center gap-3 text-center', compacto ? 'py-8' : 'py-14', className)}>
      <span className="relative grid size-14 place-items-center overflow-hidden rounded-md bg-accent-wash text-accent-ink">
        <svg viewBox="0 0 56 56" aria-hidden="true" focusable="false" className="absolute inset-0 size-full">
          <path d="M56 56H8A48 48 0 0 1 56 8Z" className="fill-accent opacity-15" />
        </svg>
        <Icone size={22} aria-hidden="true" className="relative" />
      </span>
      <div className="grid gap-1">
        <h2 className="text-lg font-semibold text-ink">{titulo}</h2>
        {descricao ? <p className="text-base text-ink-muted">{descricao}</p> : null}
      </div>
      {acao ? <div className="mt-1 flex flex-wrap justify-center gap-2">{acao}</div> : null}
    </div>
  );
}

interface EstadoErroProps {
  titulo?: string;
  mensagem: string;
  aoTentarNovamente?: () => void;
  recarregando?: boolean;
  acao?: ReactNode;
  alinhar?: 'centro' | 'inicio';
  className?: string;
}

/** Falha de carregamento com a causa em linguagem simples e um caminho de recuperação. */
export function EstadoErro({
  titulo = 'Não foi possível carregar',
  mensagem,
  aoTentarNovamente,
  recarregando = false,
  acao,
  alinhar = 'centro',
  className,
}: EstadoErroProps) {
  const centro = alinhar === 'centro';
  return (
    <div
      role="alert"
      className={cn('grid max-w-md gap-3', centro ? 'mx-auto justify-items-center py-14 text-center' : 'justify-items-start', className)}
    >
      <span className="grid size-11 place-items-center rounded-full bg-danger-wash text-danger-ink">
        <TriangleAlert size={20} aria-hidden="true" />
      </span>
      <div className="grid gap-1">
        <h2 className="text-lg font-semibold text-ink">{titulo}</h2>
        <p className="text-base text-ink-muted">{mensagem}</p>
      </div>
      <div className={cn('mt-1 flex flex-wrap gap-2', centro && 'justify-center')}>
        {aoTentarNovamente ? (
          <Botao variante="secundario" onClick={aoTentarNovamente} carregando={recarregando}>
            <RefreshCw size={16} aria-hidden="true" />
            Tentar novamente
          </Botao>
        ) : null}
        {acao}
      </div>
    </div>
  );
}
