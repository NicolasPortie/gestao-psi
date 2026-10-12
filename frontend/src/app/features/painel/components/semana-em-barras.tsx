import { Link } from 'react-router';

import { formatarDataCurta, formatarDiaSemanaCurto, mesmoDia } from '../../../core/formatacao/datas';
import { capitalizar, pluralizar } from '../../../core/formatacao/texto';
import { cn } from '../../../components/ui/cn';
import type { PainelResumo } from '../painel.types';

/** Percentual preenchido da barra: proporcional ao dia mais cheio, com um mínimo visível quando há consultas. */
const preenchimento = (consultas: number, maior: number) => (consultas === 0 ? 0 : Math.max(8, Math.round((consultas / maior) * 100)));

/** Carga da semana: uma barra por dia, proporcional ao dia mais cheio. Mostra o dado, sem adornos. */
export function SemanaEmBarras({ dias }: { dias: PainelResumo['visaoSemana'] }) {
  const maior = Math.max(...dias.map((dia) => dia.consultas), 1);
  const hoje = new Date();

  return (
    <ul className="grid gap-1">
      {dias.map((dia) => {
        const data = new Date(`${dia.data}T12:00:00`);
        const ehHoje = mesmoDia(data, hoje);
        return (
          <li key={dia.data}>
            <Link
              to="/agenda"
              className="group grid grid-cols-[3.5rem_1fr_1.5rem] items-center gap-3 rounded-md px-1 py-1.5 text-ink no-underline transition-colors duration-150 ease-out hover:bg-hover"
            >
              <span className={cn('text-sm', ehHoje ? 'font-semibold text-ink' : 'text-ink-muted')}>
                {capitalizar(formatarDiaSemanaCurto(data))}{' '}
                <span className="num text-xs">{formatarDataCurta(data).split(' ')[0]}</span>
              </span>
              <span className="h-1.5 rounded-full bg-pressed" aria-hidden="true">
                <span
                  className={cn('block h-full rounded-full transition-[clip-path] duration-300 ease-out', ehHoje ? 'bg-accent' : 'bg-ink-faint')}
                  style={{ clipPath: `inset(0 ${100 - preenchimento(dia.consultas, maior)}% 0 0 round 9999px)` }}
                />
              </span>
              <span className="num text-right text-sm font-medium">
                {dia.consultas}
                <span className="sr-only"> {pluralizar(dia.consultas, 'consulta').replace(/^\d+ /, '')}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
