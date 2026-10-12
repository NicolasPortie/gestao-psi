import type { DescricaoEstado } from '../../core/dominio/estado';
import { MarcaEstado } from './marca-estado';

/** Chave das marcas usadas na tela. Ensina o vocabulário visual sem depender de cor. */
export function LegendaEstados({ estados }: { estados: DescricaoEstado[] }) {
  return (
    <ul aria-label="Legenda dos estados" className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-ink-muted">
      {estados.map((estado) => (
        <li key={estado.rotulo} className="inline-flex items-center gap-1.5">
          <MarcaEstado forma={estado.marca} tom={estado.tom} tamanho={14} />
          {estado.rotulo}
        </li>
      ))}
    </ul>
  );
}
