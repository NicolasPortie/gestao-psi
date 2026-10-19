import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { CalendarDays, Plus, Settings } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';

import { Aviso } from '../../components/feedback/aviso';
import { CarregandoPagina } from '../../components/feedback/esqueleto';
import { EstadoErro } from '../../components/feedback/estados';
import { CabecalhoPagina, Pagina } from '../../components/layout/pagina';
import { Botao, BotaoLink } from '../../components/ui/botao';
import { GrupoSegmentado, OpcaoMarcavel } from '../../components/ui/campo';
import { LegendaEstados } from '../../components/ui/legenda-estados';
import { useMediaQuery } from '../../core/hooks/use-media-query';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import {
  adicionarDias,
  diasDoPeriodo,
  formatarDiaCompleto,
  formatarMesAno,
  formatarPeriodo,
  inicioDoDia,
  mesmoDia,
  paraCampoData,
} from '../../core/formatacao/datas';
import { agendaKeys, listarBloqueios, listarConsultas, listarHorariosDisponiveis } from './agenda.api';
import { diasVisiveis, inicioDaSemanaIso, janelaDaGrade } from './agenda.layout';
import { estadosConsulta } from './agenda.rotulos';
import { DiaNoCelular, SeletorDeDia } from './components/dia-no-celular';
import { GradeSemanal } from './components/grade-semanal';
import { NavegacaoSemana } from './components/navegacao-semana';
import { VisaoMes } from './components/visao-mes';
import { capitalizar } from '../../core/formatacao/texto';

/** Data do parâmetro `data` (AAAA-MM-DD) ao meio-dia, para evitar saltos de fuso; hoje se ausente ou inválida. */
function lerData(valor: string | null): Date {
  const candidata = valor ? new Date(`${valor}T12:00:00`) : null;
  return candidata && !Number.isNaN(candidata.getTime()) ? candidata : new Date();
}

const visoes = ['semana', 'dia', 'mes'] as const;
type Visao = (typeof visoes)[number];

const indiceDia: Record<string, number> = { Domingo: 0, Segunda: 1, Terca: 2, Quarta: 3, Quinta: 4, Sexta: 5, Sabado: 6 };

const legenda = [
  estadosConsulta.Agendada,
  estadosConsulta.AguardandoConfirmacao,
  estadosConsulta.Confirmada,
  estadosConsulta.Realizada,
  estadosConsulta.NaoCompareceu,
];

export default function AgendaPage() {
  const [params, setParams] = useSearchParams();
  const largo = useMediaQuery('(min-width: 48rem)');
  const [mostrarEncerradas, setMostrarEncerradas] = useState(false);
  const visaoDaUrl = params.get('visao') as Visao | null;
  // No celular a agenda é sempre por dia (faixa da semana + lista do dia).
  const visao: Visao = largo && visaoDaUrl && visoes.includes(visaoDaUrl) ? visaoDaUrl : 'semana';

  const horariosQuery = useQuery({
    queryKey: agendaKeys.horarios(),
    queryFn: ({ signal }) => listarHorariosDisponiveis({ signal }),
  });

  // Sábado ou domingo sem atendimento: abrir a semana que vem, não a que acabou.
  const pularFimDeSemana = useMemo(() => {
    if (params.get('data') || params.get('visao') || !horariosQuery.data) return false;
    const diaHoje = new Date().getDay();
    if (diaHoje !== 0 && diaHoje !== 6) return false;
    const ativos = horariosQuery.data.filter((horario) => horario.ativo);
    return ativos.length > 0 && !ativos.some((horario) => indiceDia[horario.diaSemana] === diaHoje);
  }, [params, horariosQuery.data]);

  const referencia = useMemo(() => {
    const lida = lerData(params.get('data'));
    if (!pularFimDeSemana) return lida;
    const hojeData = new Date();
    return adicionarDias(hojeData, hojeData.getDay() === 0 ? 1 : 2);
  }, [params, pularFimDeSemana]);
  const inicioSemana = useMemo(() => inicioDaSemanaIso(referencia), [referencia]);
  const fimSemana = useMemo(() => adicionarDias(inicioSemana, 7), [inicioSemana]);
  const hoje = inicioDoDia();
  const inicioMes = useMemo(() => new Date(referencia.getFullYear(), referencia.getMonth(), 1), [referencia]);
  // O mês é mostrado em semanas completas, de segunda a domingo.
  const gradeMes = useMemo(() => {
    const inicio = inicioDaSemanaIso(inicioMes);
    const ultimo = new Date(inicioMes.getFullYear(), inicioMes.getMonth() + 1, 0);
    const fim = adicionarDias(inicioDaSemanaIso(ultimo), 7);
    return diasDoPeriodo(inicio, Math.round((fim.getTime() - inicio.getTime()) / 86_400_000));
  }, [inicioMes]);
  const periodo =
    visao === 'mes'
      ? { inicio: gradeMes[0]!.toISOString(), fim: adicionarDias(gradeMes[gradeMes.length - 1]!, 1).toISOString() }
      : visao === 'dia'
        ? { inicio: inicioDoDia(referencia).toISOString(), fim: adicionarDias(inicioDoDia(referencia), 1).toISOString() }
        : { inicio: inicioSemana.toISOString(), fim: fimSemana.toISOString() };

  const consultasQuery = useQuery({
    queryKey: agendaKeys.consultas(periodo.inicio, periodo.fim),
    queryFn: ({ signal }) => listarConsultas(periodo.inicio, periodo.fim, { signal }),
    placeholderData: keepPreviousData,
  });
  const bloqueiosQuery = useQuery({
    queryKey: agendaKeys.bloqueios(periodo.inicio, periodo.fim),
    queryFn: ({ signal }) => listarBloqueios(periodo.inicio, periodo.fim, { signal }),
    placeholderData: keepPreviousData,
  });
  const consultas = useMemo(() => consultasQuery.data ?? [], [consultasQuery.data]);
  const bloqueios = useMemo(() => bloqueiosQuery.data ?? [], [bloqueiosQuery.data]);
  const horarios = useMemo(() => horariosQuery.data ?? [], [horariosQuery.data]);

  const semana = useMemo(() => diasDoPeriodo(inicioSemana, 7), [inicioSemana]);
  const intervalos = useMemo(
    () =>
      [
        ...consultas.filter((consulta) => mostrarEncerradas || (consulta.status !== 'Cancelada' && consulta.status !== 'Remarcada')),
        ...bloqueios,
      ].map((item) => ({ inicio: new Date(item.inicioEm), fim: new Date(item.fimEm) })),
    [consultas, bloqueios, mostrarEncerradas],
  );
  const dias = useMemo(() => diasVisiveis(semana, horarios, intervalos), [semana, horarios, intervalos]);
  const janela = useMemo(() => janelaDaGrade(horarios, intervalos), [horarios, intervalos]);

  function irPara(dia: Date, proximaVisao: Visao = visao) {
    const proximos: Record<string, string> = {};
    if (!mesmoDia(dia, new Date())) proximos.data = paraCampoData(dia);
    if (proximaVisao !== 'semana') proximos.visao = proximaVisao;
    setParams(proximos, { replace: true });
  }

  function deslocar(sentido: 1 | -1) {
    if (visao === 'mes') irPara(new Date(referencia.getFullYear(), referencia.getMonth() + sentido, 1));
    else irPara(adicionarDias(referencia, visao === 'dia' ? sentido : 7 * sentido));
  }

  const semanaAtual = mesmoDia(inicioDaSemanaIso(new Date()), inicioSemana);
  const rotuloPeriodo =
    visao === 'mes'
      ? capitalizar(formatarMesAno(referencia))
      : visao === 'dia'
        ? capitalizar(formatarDiaCompleto(referencia))
        : formatarPeriodo(inicioSemana, adicionarDias(inicioSemana, 6));
  const diaSelecionado = semana.find((dia) => mesmoDia(dia, referencia)) ?? semana[0] ?? referencia;

  if (consultasQuery.isPending) return <CarregandoPagina rotulo="Carregando a agenda…" />;
  if (consultasQuery.error && !consultasQuery.data) {
    return (
      <EstadoErro
        titulo="Não foi possível abrir a agenda"
        mensagem={mensagemDeErro(consultasQuery.error, 'Tente novamente em instantes.')}
        aoTentarNovamente={() => void consultasQuery.refetch()}
        recarregando={consultasQuery.isFetching}
      />
    );
  }

  const semCompromissos = consultas.length === 0 && bloqueios.length === 0;

  return (
    <Pagina largura="total" className="gap-6">
      <CabecalhoPagina
        titulo="Agenda"
        meta={rotuloPeriodo}
        acoes={
          <>
            <BotaoLink to="/configuracoes/agenda" variante="secundario">
              <Settings size={16} aria-hidden="true" />
              <span className="max-sm:sr-only">Configurar</span>
            </BotaoLink>
            <BotaoLink to={`/consultas/nova?data=${paraCampoData(diaSelecionado)}`} variante="primario">
              <Plus size={16} aria-hidden="true" />
              Nova consulta
            </BotaoLink>
          </>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <NavegacaoSemana
          aoAnterior={() => deslocar(-1)}
          aoProxima={() => deslocar(1)}
          unidade={visao}
          aoHoje={() => irPara(new Date())}
          desabilitarHoje={(semanaAtual && mesmoDia(referencia, new Date())) || pularFimDeSemana}
        />
        {largo ? (
          <GrupoSegmentado
            rotulo="Visão da agenda"
            tamanho="pequeno"
            valor={visao}
            aoMudar={(proxima) => irPara(referencia, proxima)}
            opcoes={[
              { valor: 'dia', rotulo: 'Dia' },
              { valor: 'semana', rotulo: 'Semana' },
              { valor: 'mes', rotulo: 'Mês' },
            ]}
          />
        ) : null}
        <OpcaoMarcavel
          tipo="interruptor"
          rotulo={
            <>
              <span className="sm:hidden">Ver canceladas</span>
              <span className="max-sm:hidden">Mostrar canceladas e remarcadas</span>
            </>
          }
          checked={mostrarEncerradas}
          onChange={(evento) => setMostrarEncerradas(evento.target.checked)}
          className="items-center"
        />
      </div>

      {consultasQuery.error ? (
        <Aviso
          tom="perigo"
          acao={
            <Botao tamanho="pequeno" variante="secundario" onClick={() => void consultasQuery.refetch()}>
              Tentar novamente
            </Botao>
          }
        >
          Não foi possível atualizar esta semana. {mensagemDeErro(consultasQuery.error, '')}
        </Aviso>
      ) : null}

      {pularFimDeSemana ? (
        <Aviso tom="info">
          <span className="inline-flex items-center gap-2">
            <CalendarDays size={16} aria-hidden="true" />
            Hoje não há atendimento. Mostrando a próxima semana.
          </span>
        </Aviso>
      ) : null}

      {semCompromissos ? (
        <Aviso tom="info">
          <span className="inline-flex items-center gap-2">
            <CalendarDays size={16} aria-hidden="true" />
            Nenhum compromisso nesta semana. Clique em um horário livre para agendar.
          </span>
        </Aviso>
      ) : null}

      <div aria-busy={consultasQuery.isFetching} className={consultasQuery.isPlaceholderData ? 'opacity-60 transition-opacity duration-150' : 'transition-opacity duration-150'}>
        {largo ? (
          visao === 'mes' ? (
            <VisaoMes dias={gradeMes} mes={referencia.getMonth()} consultas={consultas} mostrarEncerradas={mostrarEncerradas} />
          ) : (
          <GradeSemanal
            dias={visao === 'dia' ? [inicioDoDia(referencia)] : dias}
            consultas={consultas}
            bloqueios={bloqueios}
            horarios={horarios}
            janela={janela}
            mostrarEncerradas={mostrarEncerradas}
          />
          )
        ) : (
          <div className="grid gap-4">
            <SeletorDeDia dias={semana} selecionado={diaSelecionado} consultas={consultas} hoje={hoje} aoSelecionar={irPara} />
            <DiaNoCelular
              dia={diaSelecionado}
              consultas={consultas.filter((consulta) => mostrarEncerradas || (consulta.status !== 'Cancelada' && consulta.status !== 'Remarcada'))}
              bloqueios={bloqueios}
            />
          </div>
        )}
      </div>

      <LegendaEstados estados={legenda} />
    </Pagina>
  );
}
