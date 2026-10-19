import { Link } from 'react-router';

import { cn } from '../../../components/ui/cn';
import { MarcaEstado } from '../../../components/ui/marca-estado';
import { descreverEstado } from '../../../core/dominio/estado';
import { formatarHora, mesmoDia, paraCampoData } from '../../../core/formatacao/datas';
import { estadosConsulta } from '../agenda.rotulos';
import type { Consulta } from '../agenda.types';

const nomesDias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const VISIVEIS_POR_DIA = 3;

interface VisaoMesProps {
  /** Dias da grade (semanas completas, de segunda a domingo). */
  dias: Date[];
  mes: number;
  consultas: Consulta[];
  mostrarEncerradas: boolean;
}

/** O mês num relance: quantas consultas por dia e as primeiras de cada um. Um dia leva à visão do dia. */
export function VisaoMes({ dias, mes, consultas, mostrarEncerradas }: VisaoMesProps) {
  const hoje = new Date();
  const ativas = consultas
    .filter((consulta) => mostrarEncerradas || (consulta.status !== 'Cancelada' && consulta.status !== 'Remarcada'))
    .sort((a, b) => a.inicioEm.localeCompare(b.inicioEm));

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="grid grid-cols-[repeat(7,minmax(0,1fr))] border-b border-line bg-rail/60" aria-hidden="true">
        {nomesDias.map((nome) => (
          <span key={nome} className="px-3 py-2 text-xs font-medium text-ink-muted">
            {nome}
          </span>
        ))}
      </div>
      <ol className="grid grid-cols-[repeat(7,minmax(0,1fr))]" aria-label="Dias do mês">
        {dias.map((dia, indice) => {
          const doDia = ativas.filter((consulta) => mesmoDia(new Date(consulta.inicioEm), dia));
          const foraDoMes = dia.getMonth() !== mes;
          const ehHoje = mesmoDia(dia, hoje);
          const rotulo = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(dia);
          return (
            <li
              key={dia.toISOString()}
              className={cn(
                'grid min-h-28 min-w-0 content-start gap-1 overflow-hidden border-line p-1.5',
                indice % 7 !== 6 && 'border-r',
                indice < dias.length - 7 && 'border-b',
                foraDoMes && 'bg-rail/50',
              )}
            >
              <Link
                to={`/agenda?visao=dia&data=${paraCampoData(dia)}`}
                aria-label={`${rotulo}: ${doDia.length === 0 ? 'livre' : `${doDia.length} ${doDia.length === 1 ? 'consulta' : 'consultas'}`}`}
                className={cn(
                  'num flex w-fit items-center gap-1.5 rounded-full px-1.5 py-0.5 text-sm no-underline transition-colors duration-150 hover:bg-hover',
                  ehHoje ? 'bg-accent font-semibold text-on-accent hover:bg-accent-hover' : foraDoMes ? 'text-ink-faint' : 'font-medium text-ink',
                )}
              >
                {dia.getDate()}
              </Link>
              <ul className="grid min-w-0 gap-0.5">
                {doDia.slice(0, VISIVEIS_POR_DIA).map((consulta) => {
                  const estado = descreverEstado(estadosConsulta, consulta.status);
                  return (
                    <li key={consulta.id} className="min-w-0">
                      <Link
                        to={`/consultas/${consulta.id}`}
                        className="flex min-w-0 items-center gap-1 rounded-sm px-1 py-0.5 text-xs text-ink no-underline hover:bg-hover"
                        title={`${formatarHora(consulta.inicioEm)} · ${consulta.paciente} · ${estado.rotulo}`}
                      >
                        <MarcaEstado forma={estado.marca} tom={estado.tom} tamanho={10} />
                        <span className="num shrink-0 text-ink-muted">{formatarHora(consulta.inicioEm)}</span>
                        <span className="truncate">{consulta.paciente}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {doDia.length > VISIVEIS_POR_DIA ? (
                <Link to={`/agenda?visao=dia&data=${paraCampoData(dia)}`} className="px-1 text-xs font-medium">
                  e mais {doDia.length - VISIVEIS_POR_DIA}
                </Link>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
