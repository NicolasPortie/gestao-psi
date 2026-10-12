import { descreverEstado, type TomEstado } from '../../../core/dominio/estado';
import { useAgora } from '../../../core/hooks/use-agora';
import { cn } from '../../../components/ui/cn';
import { estadosConsulta } from '../../agenda/agenda.rotulos';
import { minutosDeHorario } from '../painel.apresentacao';
import type { PainelResumo } from '../painel.types';

const estiloBloco: Record<TomEstado, string> = {
  acento: 'border-accent bg-accent',
  sucesso: 'border-success bg-success',
  aviso: 'border-warning bg-warning-wash',
  perigo: 'border-danger bg-danger-wash',
  neutro: 'border-line-strong bg-hover',
};

/**
 * O dia em uma linha: horas como marcas de calibração e cada consulta como um bloco
 * posicionado por horário. Cheio = confirmado, vazado = ainda não firme. Decorativo:
 * a tabela logo abaixo carrega toda a informação.
 */
export function ReguaDoDia({ consultas }: { consultas: PainelResumo['consultasHoje'] }) {
  const agora = useAgora();
  if (consultas.length === 0) return null;

  const inicios = consultas.map((consulta) => minutosDeHorario(consulta.horarioInicio));
  const fins = consultas.map((consulta, indice) => (inicios[indice] ?? 0) + consulta.duracaoMinutos);
  const horaInicial = Math.max(6, Math.min(8, Math.floor(Math.min(...inicios) / 60)));
  const horaFinal = Math.min(22, Math.max(18, Math.ceil(Math.max(...fins) / 60)));
  const totalMinutos = (horaFinal - horaInicial) * 60;
  const posicao = (minutos: number) => `${((minutos - horaInicial * 60) / totalMinutos) * 100}%`;
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  const agoraNaJanela = minutosAgora >= horaInicial * 60 && minutosAgora <= horaFinal * 60;
  const horas = Array.from({ length: horaFinal - horaInicial + 1 }, (_, indice) => horaInicial + indice);

  return (
    <div aria-hidden="true" className="relative mt-1 h-14 select-none">
      <div className="absolute inset-x-0 top-0 h-7">
        {consultas.map((consulta, indice) => {
          const estado = descreverEstado(estadosConsulta, consulta.status);
          const inicio = inicios[indice] ?? 0;
          return (
            <span
              key={consulta.id}
              title={`${consulta.horarioInicio.slice(0, 5)} · ${consulta.paciente}`}
              className={cn('absolute top-0 h-7 rounded-sm border', estiloBloco[estado.tom])}
              style={{ left: posicao(inicio), width: `calc(${(consulta.duracaoMinutos / totalMinutos) * 100}% - 2px)` }}
            />
          );
        })}
        {agoraNaJanela ? (
          <span className="absolute -top-1.5 bottom-[-6px] w-0.5 rounded-full bg-ink" style={{ left: posicao(minutosAgora) }} />
        ) : null}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-6 border-t border-line-strong">
        {horas.map((hora) => (
          <span
            key={hora}
            className="absolute top-0 -translate-x-1/2"
            style={{ left: posicao(hora * 60) }}
          >
            <span className="mx-auto block h-1.5 w-px bg-line-strong" />
            <span className="num mt-0.5 block text-[0.6875rem] leading-none text-ink-muted">{String(hora).padStart(2, '0')}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
