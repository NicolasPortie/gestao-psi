import { MarcaEstado } from '../../../components/ui/marca-estado';
import { descreverEstado } from '../../../core/dominio/estado';
import { formatarDataHora } from '../../../core/formatacao/datas';
import { estadosConsulta } from '../agenda.rotulos';
import type { HistoricoConsultaItem } from '../agenda.types';

/** Movimentações da consulta em ordem cronológica; cada uma mostra a marca do estado alcançado. */
export function HistoricoConsulta({ itens }: { itens: HistoricoConsultaItem[] }) {
  if (itens.length === 0) return <p className="text-base text-ink-muted">Sem movimentações registradas.</p>;

  return (
    <ol className="grid">
      {itens.map((item, indice) => {
        const novo = descreverEstado(estadosConsulta, item.statusNovo);
        const anterior = item.statusAnterior ? descreverEstado(estadosConsulta, item.statusAnterior) : null;
        const ultimo = indice === itens.length - 1;
        return (
          <li key={`${item.criadoEm}-${indice}`} className="relative grid grid-cols-[1rem_1fr] gap-x-3 pb-5 last:pb-0">
            {ultimo ? null : <span aria-hidden="true" className="absolute left-[7.5px] top-5 bottom-0 w-px bg-line-strong" />}
            <MarcaEstado forma={novo.marca} tom={novo.tom} className="mt-0.5" />
            <div className="grid gap-0.5">
              <p className="text-base font-medium text-ink">
                {anterior ? `${anterior.rotulo} → ` : ''}
                {novo.rotulo}
              </p>
              <p className="text-sm text-ink-muted">
                <time dateTime={item.criadoEm}>{formatarDataHora(item.criadoEm)}</time>
              </p>
              {item.descricao ? <p className="text-sm text-ink-muted">{item.descricao}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
