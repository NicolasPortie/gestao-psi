import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { Esqueleto } from '../../../components/feedback/esqueleto';
import { Botao } from '../../../components/ui/botao';
import { usePermissoes } from '../../../core/autenticacao/permissoes';
import { formatarMesAno, paraCampoData } from '../../../core/formatacao/datas';
import { formatarMoeda } from '../../../core/formatacao/moeda';
import { capitalizar } from '../../../core/formatacao/texto';
import { agendaKeys, listarConsultas } from '../../agenda/agenda.api';
import { listarPagamentos, pagamentosKeys } from '../../pagamentos/pagamentos.api';

interface Indicador {
  rotulo: string;
  valor: string;
  detalhe?: string;
}

/**
 * O mês num relance, montado com o que a agenda e o financeiro já devolvem. Os relatórios oficiais,
 * calculados no servidor, ficam logo abaixo para imprimir.
 */
export function MesEmNumeros() {
  const { pode } = usePermissoes();
  const podeAgenda = pode('Agenda');
  const podeFinanceiro = pode('Financeiro');
  const [mes, setMes] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });
  const fim = new Date(mes.getFullYear(), mes.getMonth() + 1, 1);
  const mesAtual = mes.getFullYear() === new Date().getFullYear() && mes.getMonth() === new Date().getMonth();

  const consultasQuery = useQuery({
    queryKey: agendaKeys.consultas(mes.toISOString(), fim.toISOString()),
    queryFn: ({ signal }) => listarConsultas(mes.toISOString(), fim.toISOString(), { signal }),
    enabled: podeAgenda,
  });
  const filtroFinanceiro = { de: paraCampoData(mes), ate: paraCampoData(new Date(fim.getTime() - 86_400_000)), pagina: 1, tamanhoPagina: 5 };
  const financeiroQuery = useQuery({
    queryKey: pagamentosKeys.lista(filtroFinanceiro),
    queryFn: ({ signal }) => listarPagamentos(filtroFinanceiro, { signal }),
    enabled: podeFinanceiro,
  });

  if (!podeAgenda && !podeFinanceiro) return null;

  const consultas = consultasQuery.data ?? [];
  const realizadas = consultas.filter((consulta) => consulta.status === 'Realizada').length;
  const faltas = consultas.filter((consulta) => consulta.status === 'NaoCompareceu').length;
  const canceladas = consultas.filter((consulta) => consulta.status === 'Cancelada').length;
  const encerradas = realizadas + faltas;
  const pacientes = new Set(consultas.filter((consulta) => consulta.status === 'Realizada').map((consulta) => consulta.pacienteId)).size;

  const indicadores: Indicador[] = [
    ...(podeAgenda
      ? [
          { rotulo: 'Sessões realizadas', valor: String(realizadas), detalhe: pacientes > 0 ? `${pacientes} ${pacientes === 1 ? 'paciente' : 'pacientes'}` : undefined },
          { rotulo: 'Faltas', valor: String(faltas), detalhe: encerradas > 0 ? `${Math.round((faltas / encerradas) * 100)}% das sessões` : undefined },
          { rotulo: 'Cancelamentos', valor: String(canceladas) },
        ]
      : []),
    ...(podeFinanceiro && financeiroQuery.data
      ? [
          { rotulo: 'Recebido', valor: formatarMoeda(financeiroQuery.data.resumo.recebido) },
          {
            rotulo: 'A receber',
            valor: formatarMoeda(financeiroQuery.data.resumo.pendente),
            detalhe: financeiroQuery.data.resumo.vencido > 0 ? `${formatarMoeda(financeiroQuery.data.resumo.vencido)} vencido` : undefined,
          },
        ]
      : []),
  ];
  const carregando = (podeAgenda && consultasQuery.isPending) || (podeFinanceiro && financeiroQuery.isPending);

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
      {carregando ? (
        <Esqueleto className="h-24 rounded-lg" />
      ) : (
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-5" aria-busy={consultasQuery.isFetching || financeiroQuery.isFetching}>
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
