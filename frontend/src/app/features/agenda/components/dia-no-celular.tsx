import { CalendarPlus, Lock } from 'lucide-react';
import { Link } from 'react-router';

import { EstadoVazio } from '../../../components/feedback/estados';
import { BotaoLink } from '../../../components/ui/botao';
import { cn } from '../../../components/ui/cn';
import { ItemLista, ListaRegulada } from '../../../components/ui/lista';
import { EstadoRotulado, MarcaEstado } from '../../../components/ui/marca-estado';
import { descreverEstado, rotuloDe } from '../../../core/dominio/estado';
import {
  formatarDiaSemanaCurto,
  formatarHora,
  formatarIntervaloHora,
  mesmoDia,
  paraCampoData,
} from '../../../core/formatacao/datas';
import { capitalizar } from '../../../core/formatacao/texto';
import { estadosConsulta, rotulosModalidade } from '../agenda.rotulos';
import type { BloqueioAgenda, Consulta } from '../agenda.types';

interface SeletorDeDiaProps {
  dias: Date[];
  selecionado: Date;
  consultas: Consulta[];
  hoje: Date;
  aoSelecionar: (dia: Date) => void;
}

/** Faixa de dias da semana para o celular. Uma bolha cheia indica que há compromisso no dia. */
export function SeletorDeDia({ dias, selecionado, consultas, hoje, aoSelecionar }: SeletorDeDiaProps) {
  return (
    <div role="group" aria-label="Dia da semana" className="grid grid-cols-7 gap-1">
      {dias.map((dia) => {
        const ativo = mesmoDia(dia, selecionado);
        const temCompromisso = consultas.some(
          (consulta) => mesmoDia(new Date(consulta.inicioEm), dia) && consulta.status !== 'Cancelada' && consulta.status !== 'Remarcada',
        );
        return (
          <button
            key={dia.toISOString()}
            type="button"
            aria-pressed={ativo}
            aria-label={`${capitalizar(new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(dia))}${temCompromisso ? ', com consultas' : ''}`}
            onClick={() => aoSelecionar(dia)}
            className={cn(
              'grid h-16 content-center justify-items-center gap-0.5 rounded-md border text-sm transition-[background-color,border-color,color,scale] duration-150 ease-out active:scale-[0.96]',
              ativo ? 'border-accent bg-accent-wash text-accent-ink' : 'border-transparent text-ink-muted hover:bg-hover',
            )}
          >
            <span className="text-xs font-medium">{capitalizar(formatarDiaSemanaCurto(dia)).slice(0, 3)}</span>
            <span className={cn('num grid size-7 place-items-center rounded-full text-base font-semibold', mesmoDia(dia, hoje) && !ativo && 'bg-accent text-on-accent')}>
              {dia.getDate()}
            </span>
            <MarcaEstado forma={temCompromisso ? 'cheio' : 'anel'} tom={temCompromisso ? 'acento' : 'neutro'} tamanho={8} className={cn(!temCompromisso && 'opacity-40')} />
          </button>
        );
      })}
    </div>
  );
}

interface DiaNoCelularProps {
  dia: Date;
  consultas: Consulta[];
  bloqueios: BloqueioAgenda[];
}

/** O dia selecionado como lista regulada, ordenada por horário. */
export function DiaNoCelular({ dia, consultas, bloqueios }: DiaNoCelularProps) {
  const doDia = consultas
    .filter((consulta) => mesmoDia(new Date(consulta.inicioEm), dia))
    .sort((a, b) => new Date(a.inicioEm).getTime() - new Date(b.inicioEm).getTime());
  const bloqueiosDoDia = bloqueios.filter((bloqueio) => new Date(bloqueio.inicioEm) <= new Date(dia.getTime() + 86_400_000) && new Date(bloqueio.fimEm) >= dia);

  if (doDia.length === 0 && bloqueiosDoDia.length === 0) {
    return (
      <EstadoVazio
        compacto
        icone={CalendarPlus}
        titulo="Dia livre"
        descricao="Nenhum compromisso neste dia."
        acao={
          <BotaoLink to={`/consultas/nova?data=${paraCampoData(dia)}`} variante="secundario">
            Agendar neste dia
          </BotaoLink>
        }
      />
    );
  }

  return (
    <ListaRegulada>
      {bloqueiosDoDia.map((bloqueio) => (
        <ItemLista key={bloqueio.id} className="flex items-center gap-3 text-ink-muted">
          <Lock size={16} aria-hidden="true" className="shrink-0" />
          <span className="grid">
            <span className="text-base font-medium">{bloqueio.titulo}</span>
            <span className="text-sm">Bloqueio · {formatarIntervaloHora(bloqueio.inicioEm, bloqueio.fimEm)}</span>
          </span>
        </ItemLista>
      ))}
      {doDia.map((consulta) => {
        const estado = descreverEstado(estadosConsulta, consulta.status);
        const encerrada = consulta.status === 'Cancelada' || consulta.status === 'Remarcada';
        return (
          <ItemLista key={consulta.id}>
            <Link to={`/consultas/${consulta.id}`} className="grid grid-cols-[3.5rem_1fr] gap-3 text-ink no-underline after:absolute after:inset-0 after:content-['']">
              <span className="num text-base font-semibold">{formatarHora(consulta.inicioEm)}</span>
              <span className="grid gap-0.5">
                <span className={cn('text-base font-medium', encerrada && 'text-ink-muted line-through')}>{consulta.paciente}</span>
                <span className="text-sm text-ink-muted">
                  {consulta.tipoAtendimento} · {rotuloDe(rotulosModalidade, consulta.modalidade)}
                </span>
                <EstadoRotulado estado={estado} compacto className="mt-1" />
              </span>
            </Link>
          </ItemLista>
        );
      })}
    </ListaRegulada>
  );
}
