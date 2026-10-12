import { Lock } from 'lucide-react';
import { useMemo, type MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router';

import { cn } from '../../../components/ui/cn';
import { RegiaoRolavel } from '../../../components/ui/regiao-rolavel';
import { MarcaEstado } from '../../../components/ui/marca-estado';
import { descreverEstado, type TomEstado } from '../../../core/dominio/estado';
import { useAgora } from '../../../core/hooks/use-agora';
import {
  formatarDiaSemanaCurto,
  formatarHora,
  mesmoDia,
  minutosDoDia,
  paraCampoData,
} from '../../../core/formatacao/datas';
import { capitalizar, pluralizar } from '../../../core/formatacao/texto';
import { estadosConsulta } from '../agenda.rotulos';
import { faixasDisponiveis, organizarEmColunas, type JanelaDaGrade } from '../agenda.layout';
import type { BloqueioAgenda, Consulta, HorarioDisponivel } from '../agenda.types';

/** Altura de uma hora na grade, em px. Uma consulta de 50 min ocupa ~58 px: cabem hora, nome e tipo. */
const ALTURA_HORA = 72;
const PASSO_CLIQUE_MIN = 30;

const estiloBloco: Record<TomEstado, string> = {
  acento: 'border-accent-line bg-accent-wash text-accent-ink',
  sucesso: 'border-success-line bg-success-wash text-success-ink',
  aviso: 'border-warning-line bg-warning-wash text-warning-ink',
  perigo: 'border-danger-line bg-danger-wash text-danger-ink',
  neutro: 'border-line-strong bg-field text-ink',
};

interface ConsultaNaGrade extends Consulta {
  inicio: Date;
  fim: Date;
}

interface BloqueioNaGrade extends BloqueioAgenda {
  inicio: Date;
  fim: Date;
}

interface GradeSemanalProps {
  dias: Date[];
  consultas: Consulta[];
  bloqueios: BloqueioAgenda[];
  horarios: HorarioDisponivel[];
  janela: JanelaDaGrade;
  mostrarEncerradas: boolean;
}

/** Recorta um intervalo ao dia exibido e o converte em minutos desde 00:00. */
function recortarNoDia(inicio: Date, fim: Date, dia: Date) {
  const inicioDoDia = new Date(dia);
  inicioDoDia.setHours(0, 0, 0, 0);
  const fimDoDia = new Date(inicioDoDia);
  fimDoDia.setDate(fimDoDia.getDate() + 1);
  const de = Math.max(inicio.getTime(), inicioDoDia.getTime());
  const ate = Math.min(fim.getTime(), fimDoDia.getTime());
  if (ate <= de) return null;
  return { de: (de - inicioDoDia.getTime()) / 60_000, ate: (ate - inicioDoDia.getTime()) / 60_000 };
}

/**
 * Semana em colunas com eixo de horas. Cada dia é uma região nomeada com uma lista de
 * compromissos; a posição vertical é só apresentação. Clique no vazio abre "Nova consulta".
 */
export function GradeSemanal({ dias, consultas, bloqueios, horarios, janela, mostrarEncerradas }: GradeSemanalProps) {
  const agora = useAgora();
  const navigate = useNavigate();
  const { horaInicial, horaFinal } = janela;
  const altura = (horaFinal - horaInicial) * ALTURA_HORA;
  const horas = Array.from({ length: horaFinal - horaInicial + 1 }, (_, indice) => horaInicial + indice);
  const topo = (minutos: number) => ((minutos - horaInicial * 60) / 60) * ALTURA_HORA;

  const visiveis = useMemo(
    () =>
      consultas
        .filter((consulta) => mostrarEncerradas || (consulta.status !== 'Cancelada' && consulta.status !== 'Remarcada'))
        .map<ConsultaNaGrade>((consulta) => ({ ...consulta, inicio: new Date(consulta.inicioEm), fim: new Date(consulta.fimEm) })),
    [consultas, mostrarEncerradas],
  );
  const bloqueiosNaGrade = useMemo(
    () => bloqueios.map<BloqueioNaGrade>((bloqueio) => ({ ...bloqueio, inicio: new Date(bloqueio.inicioEm), fim: new Date(bloqueio.fimEm) })),
    [bloqueios],
  );
  const temHorarios = horarios.some((horario) => horario.ativo);

  function aoClicarNoVazio(evento: MouseEvent<HTMLElement>, dia: Date) {
    if ((evento.target as HTMLElement).closest('a')) return;
    const retangulo = evento.currentTarget.getBoundingClientRect();
    const minutos = horaInicial * 60 + Math.floor((((evento.clientY - retangulo.top) / ALTURA_HORA) * 60) / PASSO_CLIQUE_MIN) * PASSO_CLIQUE_MIN;
    const hora = `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
    void navigate(`/consultas/nova?data=${paraCampoData(dia)}&hora=${hora}`);
  }

  return (
    <RegiaoRolavel rotulo="Grade semanal da agenda">
      <div
        className="grid min-w-[44rem] pb-2"
        style={{ gridTemplateColumns: `3rem repeat(${dias.length}, minmax(0, 1fr))` }}
      >
        <div aria-hidden="true" />
        {dias.map((dia) => {
          const doDia = visiveis.filter((consulta) => mesmoDia(consulta.inicio, dia) && consulta.status !== 'Cancelada' && consulta.status !== 'Remarcada');
          const hoje = mesmoDia(dia, agora);
          return (
            <div key={dia.toISOString()} className="flex items-center gap-2 border-b border-line-strong px-2 pb-2 pt-1">
              <span
                className={cn(
                  'num grid size-8 place-items-center rounded-full text-base font-semibold',
                  hoje ? 'bg-accent text-on-accent' : 'text-ink',
                )}
              >
                {dia.getDate()}
              </span>
              <span className="grid leading-tight">
                <span className={cn('text-sm font-medium', hoje ? 'text-accent-ink' : 'text-ink')}>{capitalizar(formatarDiaSemanaCurto(dia))}</span>
                <span className="text-xs text-ink-muted">{doDia.length === 0 ? 'Livre' : pluralizar(doDia.length, 'consulta')}</span>
              </span>
            </div>
          );
        })}

        <div aria-hidden="true" className="relative" style={{ height: altura }}>
          {horas.map((hora) => (
            <span
              key={hora}
              className="num absolute right-2 -translate-y-1/2 text-xs text-ink-muted"
              style={{ top: topo(hora * 60) }}
            >
              {String(hora).padStart(2, '0')}:00
            </span>
          ))}
        </div>

        {dias.map((dia) => {
          const hoje = mesmoDia(dia, agora);
          const faixas = faixasDisponiveis(horarios, dia);
          const consultasDoDia = organizarEmColunas(visiveis.filter((consulta) => recortarNoDia(consulta.inicio, consulta.fim, dia)));
          const bloqueiosDoDia = bloqueiosNaGrade.filter((bloqueio) => recortarNoDia(bloqueio.inicio, bloqueio.fim, dia));
          const minutosAgora = minutosDoDia(agora);
          const tituloDia = `${capitalizar(new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(dia))}`;

          return (
            <section
              key={dia.toISOString()}
              aria-label={`${tituloDia}, ${pluralizar(consultasDoDia.length, 'consulta')}`}
              className="relative border-l border-line bg-rail"
              style={{ height: altura }}
              onClick={(evento) => aoClicarNoVazio(evento, dia)}
              title="Clique em um horário livre para agendar"
            >
              {temHorarios
                ? faixas.map((faixa) => {
                    const de = Math.max(faixa.inicio, horaInicial * 60);
                    const ate = Math.min(faixa.fim, horaFinal * 60);
                    return ate > de ? (
                      <div key={faixa.inicio} aria-hidden="true" className="absolute inset-x-0 cursor-cell bg-paper" style={{ top: topo(de), height: topo(ate) - topo(de) }} />
                    ) : null;
                  })
                : null}
              {!temHorarios ? <div aria-hidden="true" className="absolute inset-0 cursor-cell bg-paper" /> : null}

              {horas.map((hora) => (
                <div key={hora} aria-hidden="true" className="pointer-events-none absolute inset-x-0 border-t border-line" style={{ top: topo(hora * 60) }} />
              ))}

              <ul className="contents">
                {bloqueiosDoDia.map((bloqueio) => {
                  const recorte = recortarNoDia(bloqueio.inicio, bloqueio.fim, dia);
                  if (!recorte) return null;
                  return (
                    <li
                      key={bloqueio.id}
                      className="pointer-events-none absolute inset-x-0.5 flex items-start gap-1 overflow-hidden rounded-sm border border-line-strong bg-pressed px-1.5 py-1 text-xs text-ink-muted"
                      style={{ top: topo(recorte.de), height: topo(recorte.ate) - topo(recorte.de) - 1 }}
                    >
                      <Lock size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{bloqueio.titulo}</span>
                    </li>
                  );
                })}

                {consultasDoDia.map(({ item: consulta, coluna, colunas }) => {
                  const recorte = recortarNoDia(consulta.inicio, consulta.fim, dia);
                  if (!recorte) return null;
                  const estado = descreverEstado(estadosConsulta, consulta.status);
                  const encerrada = consulta.status === 'Cancelada' || consulta.status === 'Remarcada';
                  const alturaBloco = Math.max(topo(recorte.ate) - topo(recorte.de) - 2, 24);
                  const compacto = alturaBloco < 46;
                  return (
                    <li
                      key={consulta.id}
                      className="absolute"
                      style={{
                        top: topo(recorte.de) + 1,
                        height: alturaBloco,
                        left: `calc(${(coluna / colunas) * 100}% + 2px)`,
                        width: `calc(${100 / colunas}% - 4px)`,
                      }}
                    >
                      <Link
                        to={`/consultas/${consulta.id}`}
                        aria-label={`${formatarHora(consulta.inicio)}, ${consulta.paciente}, ${estado.rotulo}`}
                        className={cn(
                          'group flex size-full flex-col justify-center overflow-hidden rounded-md border px-2 py-1 text-left no-underline',
                          'transition-[box-shadow,background-color] duration-150 ease-out hover:shadow-ring',
                          encerrada ? 'border-dashed border-line-strong bg-paper text-ink-muted' : estiloBloco[estado.tom],
                        )}
                      >
                        {compacto ? (
                          <span className="flex items-center gap-1.5">
                            <span className="num shrink-0 text-xs font-semibold">{formatarHora(consulta.inicio)}</span>
                            <span className={cn('min-w-0 flex-1 truncate text-sm font-medium', encerrada && 'line-through')}>{consulta.paciente}</span>
                            <MarcaEstado forma={estado.marca} tom={encerrada ? 'neutro' : estado.tom} tamanho={13} />
                          </span>
                        ) : (
                          <>
                            <span className="flex items-center justify-between gap-1">
                              <span className="num text-xs font-semibold">{formatarHora(consulta.inicio)}</span>
                              <MarcaEstado forma={estado.marca} tom={encerrada ? 'neutro' : estado.tom} tamanho={13} />
                            </span>
                            <span className={cn('truncate text-sm font-medium leading-[1.1]', encerrada && 'line-through')}>{consulta.paciente}</span>
                            <span className="truncate text-xs opacity-80">{consulta.tipoAtendimento}</span>
                          </>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {hoje && minutosAgora >= horaInicial * 60 && minutosAgora <= horaFinal * 60 ? (
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 z-10 h-px bg-ink" style={{ top: topo(minutosAgora) }}>
                  <span className="absolute -left-1 -top-[3px] size-[7px] rounded-full bg-ink" />
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </RegiaoRolavel>
  );
}
