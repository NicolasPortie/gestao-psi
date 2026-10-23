import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { Esqueleto } from '../../../components/feedback/esqueleto';
import { Botao } from '../../../components/ui/botao';
import { usePermissoes } from '../../../core/autenticacao/permissoes';
import { formatarMesAno } from '../../../core/formatacao/datas';
import { formatarMoeda } from '../../../core/formatacao/moeda';
import { capitalizar, pluralizar } from '../../../core/formatacao/texto';
import { obterMesEmNumeros, relatoriosKeys } from '../relatorios.api';

interface Indicador {
  rotulo: string;
  valor: string;
  detalhe?: string;
}

/**
 * O mês num relance. Os números vêm prontos da API, calculados no fuso da conta; a tela só os apresenta.
 * Os relatórios oficiais, para imprimir, ficam logo abaixo.
 */
export function MesEmNumeros() {
  const { pode } = usePermissoes();
  const visivel = pode('Agenda') || pode('Financeiro');
  const [mes, setMes] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });
  const mesAtual = mes.getFullYear() === new Date().getFullYear() && mes.getMonth() === new Date().getMonth();
  const ano = mes.getFullYear();
  const numeroMes = mes.getMonth() + 1;

  const query = useQuery({
    queryKey: relatoriosKeys.mes(ano, numeroMes),
    queryFn: ({ signal }) => obterMesEmNumeros(ano, numeroMes, { signal }),
    enabled: visivel,
  });

  if (!visivel) return null;

  const dados = query.data;
  const indicadores: Indicador[] = [];
  if (dados?.sessoesRealizadas != null) {
    const pacientes = dados.pacientesAtendidos ?? 0;
    indicadores.push(
      { rotulo: 'Sessões realizadas', valor: String(dados.sessoesRealizadas), detalhe: pacientes > 0 ? pluralizar(pacientes, 'paciente') : undefined },
      { rotulo: 'Faltas', valor: String(dados.faltas ?? 0), detalhe: dados.percentualFaltas != null ? `${dados.percentualFaltas}% das sessões` : undefined },
      { rotulo: 'Cancelamentos', valor: String(dados.cancelamentos ?? 0) },
    );
  }
  if (dados?.recebido != null) {
    const vencido = dados.vencido ?? 0;
    indicadores.push(
      { rotulo: 'Recebido', valor: formatarMoeda(dados.recebido) },
      { rotulo: 'A receber', valor: formatarMoeda(dados.aReceber ?? 0), detalhe: vencido > 0 ? `${formatarMoeda(vencido)} vencido` : undefined },
    );
  }

  return (
    <section aria-labelledby="mes-em-numeros" className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="mes-em-numeros" className="text-lg font-semibold text-ink">
          {capitalizar(formatarMesAno(mes))}
        </h2>
        <div className="flex items-center gap-1">
          <Botao variante="secundario" tamanho="icone-pequeno" aria-label="Mês anterior" onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))}>
            <ChevronLeft size={16} aria-hidden="true" />
          </Botao>
          <Botao variante="secundario" tamanho="icone-pequeno" aria-label="Próximo mês" disabled={mesAtual} onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))}>
            <ChevronRight size={16} aria-hidden="true" />
          </Botao>
        </div>
      </div>
      {query.isPending ? (
        <Esqueleto className="h-24 rounded-lg" />
      ) : (
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-5" aria-busy={query.isFetching}>
          {indicadores.map((indicador) => (
            <div key={indicador.rotulo} className="grid content-start gap-1 bg-surface px-4 py-3.5">
              <dt className="text-sm text-ink-muted">{indicador.rotulo}</dt>
              <dd className="num text-xl font-semibold text-ink">{indicador.valor}</dd>
              {indicador.detalhe ? <dd className="text-sm text-ink-muted">{indicador.detalhe}</dd> : null}
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
