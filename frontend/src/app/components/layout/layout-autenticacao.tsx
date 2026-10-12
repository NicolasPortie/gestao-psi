import { Outlet } from 'react-router';

import { estadosConsulta } from '../../features/agenda/agenda.rotulos';
import { useTituloRota } from '../../core/use-titulo-rota';
import { EstadoRotulado } from '../ui/marca-estado';
import { Marca, SimboloMarca } from './marca';

const sequencia = [estadosConsulta.Agendada, estadosConsulta.AguardandoConfirmacao, estadosConsulta.Confirmada, estadosConsulta.Realizada];

/**
 * Moldura das telas de acesso. O palco mostra o vocabulário do produto, o estado
 * como marca de preenchimento, preenchendo-se em sequência uma única vez ao abrir.
 */
export function LayoutAutenticacao() {
  useTituloRota();
  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <main className="flex min-h-dvh flex-col px-5 py-6 sm:px-10 lg:px-16">
        <header>
          <Marca />
        </header>
        <div className="flex flex-1 items-center py-10">
          <div className="mx-auto w-full max-w-[24rem]">
            <Outlet />
          </div>
        </div>
        <footer className="text-xs text-ink-muted">
          <p>© 2026 GestãoPsi. Cada conta é privada e isolada das demais.</p>
        </footer>
      </main>

      <aside
        aria-label="Sobre o GestãoPsi"
        className="relative hidden overflow-hidden bg-stage text-stage-ink lg:flex lg:flex-col lg:justify-between lg:p-14 xl:p-20"
      >
        <SimboloMarca
          tamanho={420}
          className="pointer-events-none absolute bottom-14 right-14 text-stage-line [&_*]:stroke-[0.8]"
        />
        <div className="relative max-w-md">
          <p className="text-3xl font-semibold leading-[1.15] tracking-[-0.02em] xl:text-[2.125rem]">Seu consultório em ordem.</p>
          <p className="mt-4 text-lg text-stage-muted">
            Agenda, pacientes, financeiro e registros em um só lugar, com cada informação no estado em que ela está.
          </p>
        </div>

        <ul className="relative grid max-w-xs gap-0 border-t border-stage-line" aria-label="Estados de uma consulta">
          {sequencia.map((estado, indice) => (
            <li
              key={estado.rotulo}
              className="animar-revelar flex items-center border-b border-stage-line py-3.5 text-stage-ink"
              style={{ '--ordem': indice + 2 } as React.CSSProperties}
            >
              <EstadoRotulado estado={{ ...estado, tom: 'neutro' }} className="!text-stage-ink [--marca-contraste:var(--stage)] [&_svg]:!text-stage-ink" />
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
