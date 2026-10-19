import { Link } from 'react-router';

import { ItemLista, ListaRegulada, PainelVazio } from '../../../components/ui/lista';
import { formatarTempoRelativo } from '../../../core/formatacao/datas';
import type { PainelResumo } from '../painel.types';

export function AlertasRecentes({ alertas }: { alertas: PainelResumo['alertas'] }) {
  if (alertas.length === 0) {
    return <PainelVazio>Sem alertas recentes.</PainelVazio>;
  }

  return (
    <ListaRegulada>
      {alertas.map((alerta) => {
        const conteudo = (
          <>
            <span className="flex items-baseline justify-between gap-3">
              <span className="text-base font-medium text-ink">{alerta.titulo}</span>
              <time className="shrink-0 text-xs text-ink-muted" dateTime={alerta.criadoEm}>
                {formatarTempoRelativo(alerta.criadoEm)}
              </time>
            </span>
            <span className="mt-0.5 block text-sm text-ink-muted">{alerta.mensagem}</span>
          </>
        );
        return (
          <ItemLista key={`${alerta.criadoEm}-${alerta.titulo}`} className="py-3">
            {alerta.rota ? (
              <Link to={alerta.rota} className="block no-underline after:absolute after:inset-0 after:content-['']">
                {conteudo}
              </Link>
            ) : (
              conteudo
            )}
          </ItemLista>
        );
      })}
    </ListaRegulada>
  );
}
