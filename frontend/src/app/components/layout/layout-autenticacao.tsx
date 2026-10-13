import { Outlet } from 'react-router';

import { MARCA } from '../../core/marca';
import { useTituloRota } from '../../core/use-titulo-rota';
import { estadosConsulta } from '../../features/agenda/agenda.rotulos';
import { EstadoRotulado } from '../ui/marca-estado';
import { Marca } from './marca';

const sequencia = [estadosConsulta.Agendada, estadosConsulta.AguardandoConfirmacao, estadosConsulta.Confirmada, estadosConsulta.Realizada];

/**
 * Foto de ambiente: uma sala de atendimento com duas poltronas frente a frente, o vínculo em forma de
 * mobília. Decorativa, por isso sem texto alternativo. Origem e licença em docs/04-ux/imagens.md.
 */
const FOTO = {
  caminho: '/imagens/consultorio-poltronas',
  largura: 960,
  altura: 1440,
  /** Enquadramentos: as poltronas ficam no terço inferior da foto vertical, e a faixa do celular é mais baixa. */
  posicaoPainel: '50% 88%',
  posicaoFaixa: '50% 76%',
} as const;

function FotoAmbiente({ posicao, className }: { posicao: string; className?: string }) {
  return (
    <img
      src={`${FOTO.caminho}-${FOTO.largura}.webp`}
      srcSet={`${FOTO.caminho}-960.webp 960w, ${FOTO.caminho}-1440.webp 1440w`}
      sizes="(min-width: 1024px) 50vw, 100vw"
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
 * Moldura das telas de acesso. É a porta de uma ferramenta de trabalho: formulário à esquerda e, no
 * desktop, uma foto de ambiente de consultório e, abaixo dela, a promessa do produto e a sequência de
 * estados de uma consulta. No celular, uma faixa da mesma foto abre a tela.
 */
export function LayoutAutenticacao() {
  useTituloRota();
  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <main className="flex min-h-dvh flex-col px-5 py-6 sm:px-10 lg:px-16">
        <div className="-mx-5 -mt-6 mb-6 h-36 overflow-hidden bg-rail sm:-mx-10 sm:h-44 lg:hidden" aria-hidden="true">
          <FotoAmbiente posicao={FOTO.posicaoFaixa} className="size-full object-cover dark:brightness-[0.82]" />
        </div>
        <header>
          <Marca tamanho={32} />
        </header>
        <div className="flex flex-1 items-center py-10">
          <div className="mx-auto w-full max-w-[24rem]">
            <Outlet />
          </div>
        </div>
        <footer className="text-xs text-ink-muted">
          <p>© 2026 {MARCA.nome}. Cada conta é privada e isolada das demais.</p>
        </footer>
      </main>

      <aside aria-label={`Sobre o ${MARCA.nome}`} className="hidden border-l border-line bg-rail lg:flex lg:flex-col">
        <div className="relative min-h-64 flex-1 overflow-hidden bg-pressed">
          <FotoAmbiente posicao={FOTO.posicaoPainel} className="absolute inset-0 size-full object-cover dark:brightness-[0.82]" />
        </div>
        <div className="grid gap-4 px-10 py-8 xl:px-14">
          <p className="font-display text-3xl font-semibold leading-[1.12] tracking-[-0.02em] text-ink">{MARCA.chamada}</p>
          <p className="max-w-md text-base text-ink-muted">Agenda, pacientes, financeiro e registros em um só lugar, para você e para quem trabalha com você.</p>
          <ul className="grid max-w-md grid-cols-2 gap-x-6 gap-y-2.5 border-t border-line pt-4" aria-label="Estados de uma consulta">
            {sequencia.map((estado) => (
              <li key={estado.rotulo}>
                <EstadoRotulado estado={estado} />
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
