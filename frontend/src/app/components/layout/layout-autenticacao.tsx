import { Outlet } from 'react-router';

import { MARCA } from '../../core/marca';
import { useTituloRota } from '../../core/use-titulo-rota';
import { estadosConsulta } from '../../features/agenda/agenda.rotulos';
import { EstadoRotulado } from '../ui/marca-estado';
import { Marca } from './marca';

const sequencia = [estadosConsulta.Agendada, estadosConsulta.AguardandoConfirmacao, estadosConsulta.Confirmada, estadosConsulta.Realizada];

/**
 * Moldura das telas de acesso. É a porta de uma ferramenta de trabalho: formulário à esquerda e, no
 * desktop, um painel sereno à direita com a promessa do produto e a sequência de estados de uma
 * consulta. Sem imagem decorativa: a única arte é a marca.
 */
export function LayoutAutenticacao() {
  useTituloRota();
  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <main className="flex min-h-dvh flex-col px-5 py-6 sm:px-10 lg:px-16">
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

      <aside aria-label={`Sobre o ${MARCA.nome}`} className="hidden border-l border-line bg-rail lg:flex lg:items-center lg:px-16 xl:px-24">
        <div className="grid max-w-md gap-6">
          <p className="font-display text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-ink">{MARCA.chamada}</p>
          <p className="text-lg text-ink-muted">Agenda, pacientes, financeiro e registros em um só lugar, para você e para quem trabalha com você.</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-line pt-5" aria-label="Estados de uma consulta">
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
