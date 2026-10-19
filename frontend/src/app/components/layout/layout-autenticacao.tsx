import { Monitor, Moon, Sun } from 'lucide-react';
import { Link, Outlet } from 'react-router';

import { MARCA } from '../../core/marca';
import { definirPreferenciaTema, usePreferenciaTema } from '../../core/tema/tema';
import { useTituloRota } from '../../core/use-titulo-rota';
import { Botao } from '../ui/botao';
import { MenuAcoes } from '../ui/menu';
import { Marca } from './marca';

/**
 * Foto de ambiente: uma sala de atendimento com duas poltronas frente a frente, o vínculo em forma de
 * mobília. Decorativa, por isso sem texto alternativo. Origem e licença em docs/04-ux/imagens.md.
 */
const FOTO = {
  caminho: '/imagens/consultorio-poltronas',
  largura: 960,
  altura: 1440,
  /** Mantém a conversa entre as duas poltronas no foco do painel. */
  posicaoPainel: '50% 72%',
} as const;

function FotoAmbiente({ posicao, className }: { posicao: string; className?: string }) {
  return (
    <img
      src={`${FOTO.caminho}-${FOTO.largura}.webp`}
      srcSet={`${FOTO.caminho}-960.webp 960w, ${FOTO.caminho}-1440.webp 1440w`}
      sizes="(min-width: 1600px) 880px, (min-width: 1024px) 58vw, 100vw"
      width={FOTO.largura}
      height={FOTO.altura}
      alt=""
      decoding="async"
      style={{ objectPosition: posicao }}
      className={className}
    />
  );
}

/**
 * Acesso ao consultório: fotografia e formulário sob o mesmo cabeçalho.
 * A marca se forma uma vez na chegada; o formulário fica disponível desde o início.
 */
export function LayoutAutenticacao() {
  useTituloRota();
  const preferenciaTema = usePreferenciaTema();
  const IconeTema = preferenciaTema === 'escuro' ? Moon : preferenciaTema === 'claro' ? Sun : Monitor;

  return (
    <div className="mx-auto flex min-h-dvh max-w-[100rem] flex-col bg-paper px-5 sm:px-8 lg:px-10">
      <a href="#acesso" className="sr-only z-50 rounded-md bg-accent px-4 py-2 text-on-accent focus:not-sr-only focus:fixed focus:left-5 focus:top-5">Pular para o acesso</a>
      <header className="flex min-h-20 shrink-0 items-center justify-between gap-4 lg:min-h-28">
        <Marca tamanho={40} className="marca-acesso gap-2.5 [&>svg]:size-8 [&>span]:text-[1.75rem] lg:gap-3 lg:[&>svg]:size-10 lg:[&>span]:text-3xl" />
        <MenuAcoes
          gatilho={<Botao variante="discreto" tamanho="icone" aria-label="Alterar aparência" className="size-11"><IconeTema size={20} aria-hidden="true" /></Botao>}
          itens={[
            { rotulo: 'Tema claro', icone: <Sun size={16} />, selecionado: preferenciaTema === 'claro', aoSelecionar: () => definirPreferenciaTema('claro') },
            { rotulo: 'Tema escuro', icone: <Moon size={16} />, selecionado: preferenciaTema === 'escuro', aoSelecionar: () => definirPreferenciaTema('escuro') },
            { rotulo: 'Seguir o sistema', icone: <Monitor size={16} />, selecionado: preferenciaTema === 'sistema', aoSelecionar: () => definirPreferenciaTema('sistema') },
          ]}
        />
      </header>

      <div className="flex flex-1 flex-col pb-4 lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12 lg:pb-10 xl:gap-20">
        <div aria-hidden="true" className="hidden min-w-0 lg:block">
          <div className="acesso-fotografia sticky top-6 h-[calc(100dvh-9.5rem)] min-h-[34rem] overflow-hidden rounded-lg bg-rail">
            <FotoAmbiente posicao={FOTO.posicaoPainel} className="size-full object-cover dark:brightness-[0.82]" />
          </div>
        </div>

        <main id="acesso" tabIndex={-1} className="flex min-w-0 flex-1 flex-col outline-none lg:pr-4 xl:pr-10">
          <div className="flex flex-1 items-start pb-8 pt-6 sm:items-center sm:py-12 lg:py-12">
            <div className="mx-auto w-full max-w-[24rem]">
              <Outlet />
            </div>
          </div>
          <footer className="mx-auto flex w-full max-w-[24rem] flex-wrap items-center justify-between gap-x-3 gap-y-1 pb-[env(safe-area-inset-bottom)] text-xs text-ink-muted lg:mt-12">
          <p>© 2026 {MARCA.nome}</p>
          <nav aria-label="Informações legais" className="flex gap-4">
            <Link to="/privacidade" className="inline-flex min-h-11 items-center text-ink-muted hover:text-ink">Privacidade</Link>
            <Link to="/termos" className="inline-flex min-h-11 items-center text-ink-muted hover:text-ink">Termos de uso</Link>
          </nav>
          </footer>
        </main>
      </div>
    </div>
  );
}
