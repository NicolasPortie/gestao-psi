import { CalendarPlus } from 'lucide-react';
import { Fragment, useMemo } from 'react';

import { EstadoVazio } from '../../../components/feedback/estados';
import { BotaoLink } from '../../../components/ui/botao';
import { cn } from '../../../components/ui/cn';
import { EstadoRotulado } from '../../../components/ui/marca-estado';
import {
  CabecalhoTabela,
  CelulaTabela,
  ColunaTabela,
  LinhaTabela,
  LinkDaLinha,
  Tabela,
} from '../../../components/ui/tabela';
import { descreverEstado, rotuloDe } from '../../../core/dominio/estado';
import { useAgora } from '../../../core/hooks/use-agora';
import { estadosConsulta, rotulosModalidade } from '../../agenda/agenda.rotulos';
import { minutosDeHorario, situacoesDoDia, type SituacaoNoDia } from '../painel.apresentacao';
import type { PainelResumo } from '../painel.types';

type ConsultaDoDia = PainelResumo['consultasHoje'][number];

const legendaSituacao: Partial<Record<SituacaoNoDia, string>> = { andamento: 'Em andamento', proxima: 'Próxima' };

function MarcadorAgora({ rotulo }: { rotulo: string }) {
  return (
    <tr aria-hidden="true">
      <td colSpan={5} className="px-0 py-2">
        <div className="relative h-px bg-accent">
          <span className="num absolute -top-2.5 left-4 rounded-full bg-surface px-2 text-xs font-medium text-accent-ink sm:left-3">{rotulo}</span>
        </div>
      </td>
    </tr>
  );
}

/** Consultas do dia ordenadas por horário, com a linha de "agora" separando o que já passou do que vem. */
export function AgendaDeHoje({ consultas }: { consultas: ConsultaDoDia[] }) {
  const agora = useAgora();
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  const ordenadas = useMemo(
    () => [...consultas].sort((a, b) => minutosDeHorario(a.horarioInicio) - minutosDeHorario(b.horarioInicio)),
    [consultas],
  );

  if (ordenadas.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line px-4">
        <EstadoVazio
          compacto
          icone={CalendarPlus}
          titulo="Nenhuma consulta hoje"
          descricao="O dia está livre. Use o tempo para organizar os próximos atendimentos."
          acao={
            <BotaoLink to="/consultas/nova" variante="secundario">
              Agendar consulta
            </BotaoLink>
          }
        />
      </div>
    );
  }

  const situacoes = situacoesDoDia(ordenadas, minutosAgora);
  const primeiraNaoPassada = situacoes.findIndex((situacao) => situacao !== 'passada');
  const posicaoAgora = primeiraNaoPassada === -1 ? ordenadas.length : primeiraNaoPassada;
  const horaAtual = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(agora);

  return (
    <Tabela rotulo="Consultas de hoje">
      <CabecalhoTabela>
        <tr>
          <ColunaTabela className="w-24">Horário</ColunaTabela>
          <ColunaTabela>Paciente</ColunaTabela>
          <ColunaTabela ocultarAte="md">Atendimento</ColunaTabela>
          <ColunaTabela ocultarAte="sm">Estado</ColunaTabela>
          <ColunaTabela className="w-px">
            <span className="sr-only">Sessão</span>
          </ColunaTabela>
        </tr>
      </CabecalhoTabela>
      <tbody>
        {ordenadas.map((consulta, indice) => {
          const situacao = situacoes[indice] ?? 'futura';
          const estado = descreverEstado(estadosConsulta, consulta.status);
          const apagada = situacao === 'passada';
          return (
            <Fragment key={consulta.id}>
              {indice === posicaoAgora ? <MarcadorAgora rotulo={`Agora · ${horaAtual}`} /> : null}
              <LinhaTabela className={cn(situacao === 'proxima' && 'bg-accent-wash hover:bg-accent-wash', situacao === 'andamento' && 'bg-accent-wash hover:bg-accent-wash')}>
                <CelulaTabela className="whitespace-nowrap">
                  <span className={cn('num block text-base font-semibold', apagada ? 'text-ink-muted' : 'text-ink')}>{consulta.horarioInicio.slice(0, 5)}</span>
                  <span className="block text-xs text-accent-ink">{legendaSituacao[situacao] ?? <span className="num text-ink-muted">{consulta.duracaoMinutos} min</span>}</span>
                </CelulaTabela>
                <CelulaTabela>
                  <LinkDaLinha to={`/consultas/${consulta.id}`} className={cn(apagada && 'font-normal text-ink-muted')}>
                    {consulta.paciente}
                  </LinkDaLinha>
                  <span className="block text-sm text-ink-muted md:hidden">
                    {consulta.tipoAtendimento} · {rotuloDe(rotulosModalidade, consulta.modalidade)}
                  </span>
                  <span className="mt-1 block sm:hidden">
                    <EstadoRotulado estado={estado} compacto />
                  </span>
                </CelulaTabela>
                <CelulaTabela ocultarAte="md" className="text-ink-muted">
                  {consulta.tipoAtendimento} · {rotuloDe(rotulosModalidade, consulta.modalidade)}
                </CelulaTabela>
                <CelulaTabela ocultarAte="sm">
                  <EstadoRotulado estado={estado} />
                </CelulaTabela>
                <CelulaTabela className="whitespace-nowrap text-right">
                  {consulta.podeRegistrarSessao ? <span className="text-xs font-medium text-accent-ink">Registrar sessão</span> : null}
                </CelulaTabela>
              </LinhaTabela>
              {indice === ordenadas.length - 1 && posicaoAgora === ordenadas.length ? <MarcadorAgora rotulo={`Agora · ${horaAtual}`} /> : null}
            </Fragment>
          );
        })}
      </tbody>
    </Tabela>
  );
}
