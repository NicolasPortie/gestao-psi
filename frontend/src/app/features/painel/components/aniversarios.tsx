import { Cake } from 'lucide-react';
import { Link } from 'react-router';

import { Secao } from '../../../components/layout/pagina';
import { ItemLista, ListaRegulada } from '../../../components/ui/lista';
import type { PainelAniversariante } from '../painel.types';

const diaMes = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });

/** Quem faz aniversário nos próximos 7 dias: um gesto pequeno que a equipe costuma querer lembrar. */
export function Aniversarios({ aniversariantes }: { aniversariantes: PainelAniversariante[] }) {
  if (aniversariantes.length === 0) return null;
  const hoje = new Date();
  const chaveHoje = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
  return (
    <Secao id="aniversarios" titulo="Aniversários da semana">
      <ListaRegulada>
        {aniversariantes.map((pessoa) => (
          <ItemLista key={pessoa.pacienteId} className="flex items-center justify-between gap-3 py-3">
            <span className="flex min-w-0 items-center gap-2">
              <Cake size={16} className="shrink-0 text-ink-muted" aria-hidden="true" />
              <Link to={`/pacientes/${pessoa.pacienteId}`} className="truncate font-medium text-ink no-underline hover:underline">
                {pessoa.paciente}
              </Link>
            </span>
            <span className="num shrink-0 text-sm text-ink-muted">
              {pessoa.data === chaveHoje ? 'Hoje' : diaMes.format(new Date(`${pessoa.data}T12:00:00`)).replace(/\./g, '')} · {pessoa.idade} anos
            </span>
          </ItemLista>
        ))}
      </ListaRegulada>
    </Secao>
  );
}
