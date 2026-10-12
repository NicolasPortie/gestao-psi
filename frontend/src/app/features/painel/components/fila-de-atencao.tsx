import { ArrowRight, CircleCheck } from 'lucide-react';
import { Link } from 'react-router';

import { ListaRegulada, ItemLista } from '../../../components/ui/lista';
import { MarcaEstado } from '../../../components/ui/marca-estado';
import { estadoDaPrioridade } from '../painel.apresentacao';
import type { PainelResumo } from '../painel.types';

/** Pendências ranqueadas pela API. Cada linha leva direto ao lugar onde ela se resolve. */
export function FilaDeAtencao({ prioridades }: { prioridades: PainelResumo['prioridades'] }) {
  if (prioridades.length === 0) {
    return (
      <p className="flex items-center gap-2 border-y border-line py-4 text-base text-ink-muted">
        <CircleCheck size={18} className="text-success" aria-hidden="true" />
        Nada pendente por enquanto.
      </p>
    );
  }

  return (
    <ListaRegulada>
      {prioridades.map((prioridade) => {
        const estado = estadoDaPrioridade(prioridade.tom);
        return (
          <ItemLista key={`${prioridade.rota}-${prioridade.titulo}`} className="group">
            <Link to={prioridade.rota} className="grid grid-cols-[1rem_1fr] gap-x-3 text-ink no-underline after:absolute after:inset-0 after:content-['']">
              <MarcaEstado forma={estado.marca} tom={estado.tom} className="mt-0.5" />
              <span className="grid gap-0.5">
                <span className="text-base font-medium">{prioridade.titulo}</span>
                <span className="text-sm text-ink-muted">{prioridade.mensagem}</span>
                <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-accent-ink">
                  {prioridade.acao}
                  <ArrowRight size={14} aria-hidden="true" className="transition-transform duration-150 ease-out group-hover:translate-x-0.5" />
                </span>
              </span>
            </Link>
          </ItemLista>
        );
      })}
    </ListaRegulada>
  );
}
