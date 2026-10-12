import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { CalendarDays, Plus, Settings } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';

import { Aviso } from '../../components/feedback/aviso';
import { CarregandoPagina } from '../../components/feedback/esqueleto';
import { EstadoErro } from '../../components/feedback/estados';
import { CabecalhoPagina, Pagina } from '../../components/layout/pagina';
import { Botao, BotaoLink } from '../../components/ui/botao';
import { OpcaoMarcavel } from '../../components/ui/campo';
import { LegendaEstados } from '../../components/ui/legenda-estados';
import { useMediaQuery } from '../../core/hooks/use-media-query';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import {
  adicionarDias,
  diasDoPeriodo,
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

/** Data do parâmetro `data` (AAAA-MM-DD) ao meio-dia, para evitar saltos de fuso; hoje se ausente ou inválida. */
function lerData(valor: string | null): Date {
  const candidata = valor ? new Date(`${valor}T12:00:00`) : null;
  return candidata && !Number.isNaN(candidata.getTime()) ? candidata : new Date();
}

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

  const referencia = useMemo(() => lerData(params.get('data')), [params]);
  const inicioSemana = useMemo(() => inicioDaSemanaIso(referencia), [referencia]);
  const fimSemana = useMemo(() => adicionarDias(inicioSemana, 7), [inicioSemana]);
  const hoje = inicioDoDia();
  const periodo = { inicio: inicioSemana.toISOString(), fim: fimSemana.toISOString() };

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
  const horariosQuery = useQuery({
    queryKey: agendaKeys.horarios(),
    queryFn: ({ signal }) => listarHorariosDisponiveis({ signal }),
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

  function irPara(dia: Date) {
    setParams(mesmoDia(dia, new Date()) ? {} : { data: paraCampoData(dia) }, { replace: true });
  }

  const semanaAtual = mesmoDia(inicioDaSemanaIso(new Date()), inicioSemana);
  const rotuloPeriodo = formatarPeriodo(inicioSemana, adicionarDias(inicioSemana, 6));
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

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <NavegacaoSemana
          aoAnterior={() => irPara(adicionarDias(referencia, -7))}
          aoProxima={() => irPara(adicionarDias(referencia, 7))}
          aoHoje={() => irPara(new Date())}
          desabilitarHoje={semanaAtual && mesmoDia(referencia, new Date())}
        />
        <OpcaoMarcavel
          tipo="interruptor"
          rotulo="Mostrar canceladas e remarcadas"
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
          <GradeSemanal
            dias={dias}
            consultas={consultas}
            bloqueios={bloqueios}
            horarios={horarios}
            janela={janela}
            mostrarEncerradas={mostrarEncerradas}
          />
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
