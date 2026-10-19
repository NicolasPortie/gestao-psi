import { useQuery } from '@tanstack/react-query';
import { ClipboardPen, FileHeart, NotebookPen } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router';

import { AcessoRestrito } from '../../components/feedback/acesso-restrito';
import { CarregandoPagina } from '../../components/feedback/esqueleto';
import { EstadoErro, EstadoVazio } from '../../components/feedback/estados';
import { CabecalhoPagina, Pagina, Secao } from '../../components/layout/pagina';
import { Botao, BotaoLink } from '../../components/ui/botao';
import { CampoBusca, GrupoSegmentado } from '../../components/ui/campo';
import { Etiqueta } from '../../components/ui/etiqueta';
import { ItemLista, ListaRegulada, PainelVazio } from '../../components/ui/lista';
import { usePermissoes } from '../../core/autenticacao/permissoes';
import { ErroApi } from '../../core/api/resposta-api';
import { rotuloDe } from '../../core/dominio/estado';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import { formatarData, formatarDataHora } from '../../core/formatacao/datas';
import { pluralizar } from '../../core/formatacao/texto';
import { pacientesKeys } from '../pacientes/pacientes.keys';
import { obterPacientePorId } from '../pacientes/pacientes.api';
import { GavetaEvolucao } from './components/gaveta-evolucao';
import { GavetaRegistroSessao } from './components/gaveta-registro-sessao';
import { filtrarLinhaDoTempo, montarLinhaDoTempo, planoAtual, type ItemLinhaDoTempo } from './prontuario.dados';
import { listarEvolucoes, listarRegistrosSessao, sessoesKeys } from './sessoes.api';
import { rotulosTipoEvolucao } from './sessoes.rotulos';

/** A API devolve até 100 por página; o prontuário carrega os 100 mais recentes de cada tipo. */
const LIMITE = 100;
type Filtro = 'tudo' | 'sessoes' | 'evolucoes';

function Trecho({ titulo, texto }: { titulo: string; texto: string | null }) {
  if (!texto?.trim()) return null;
  return (
    <div className="grid gap-0.5">
      <p className="text-sm font-medium text-ink-muted">{titulo}</p>
      <p className="max-w-[70ch] whitespace-pre-wrap text-base leading-7 text-ink">{texto}</p>
    </div>
  );
}

function ItemDoProntuario({ item }: { item: ItemLinhaDoTempo }) {
  if (item.tipo === 'sessao') {
    const { registro } = item;
    return (
      <ItemLista className="grid gap-3 py-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2">
            <Etiqueta tom="sucesso">Sessão</Etiqueta>
            <span className="num text-base font-medium text-ink">{formatarData(registro.dataSessao)}</span>
          </span>
          <time className="num text-sm text-ink-muted" dateTime={registro.dataSessao}>
            {formatarDataHora(registro.dataSessao)}
          </time>
        </div>
        <Trecho titulo="Observações clínicas" texto={registro.observacoesClinicas} />
        <Trecho titulo="Evolução" texto={registro.evolucao} />
        <Trecho titulo="Encaminhamentos" texto={registro.encaminhamentos} />
        {!registro.observacoesClinicas && !registro.evolucao && !registro.encaminhamentos ? (
          <p className="text-base text-ink-muted">Sessão registrada sem anotações.</p>
        ) : null}
      </ItemLista>
    );
  }
  const { evolucao } = item;
  return (
    <ItemLista className="grid gap-1.5 py-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Etiqueta tom="acento">{rotuloDe(rotulosTipoEvolucao, evolucao.tipo)}</Etiqueta>
        <time className="num text-sm text-ink-muted" dateTime={evolucao.dataEvolucao}>
          {formatarDataHora(evolucao.dataEvolucao)}
        </time>
      </div>
      <p className="max-w-[70ch] whitespace-pre-wrap text-base leading-7 text-ink">{evolucao.conteudo}</p>
    </ItemLista>
  );
}

export default function ProntuarioPage() {
  const { id: pacienteId = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const { acessoClinico } = usePermissoes();
  const consultaDeOrigem = params.get('consultaId') ?? '';
  const [novaEvolucao, setNovaEvolucao] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('tudo');
  // Chegando de uma consulta, a folha de registro de sessão já abre vinculada a ela.
  const [registrandoSessao, setRegistrandoSessao] = useState(Boolean(consultaDeOrigem));

  const habilitado = Boolean(pacienteId) && acessoClinico;
  const pacienteQuery = useQuery({
    queryKey: pacientesKeys.detalhe(pacienteId),
    queryFn: ({ signal }) => obterPacientePorId(pacienteId, { signal }),
    enabled: habilitado,
  });
  const pagina = { pagina: 1, tamanhoPagina: LIMITE };
  const evolucoesQuery = useQuery({
    queryKey: sessoesKeys.evolucoes(pacienteId, pagina),
    queryFn: ({ signal }) => listarEvolucoes(pacienteId, pagina, { signal }),
    enabled: habilitado,
  });
  const registrosQuery = useQuery({
    queryKey: sessoesKeys.registros(pacienteId, pagina),
    queryFn: ({ signal }) => listarRegistrosSessao(pacienteId, pagina, { signal }),
    enabled: habilitado,
  });

  if (!acessoClinico) {
    return (
      <AcessoRestrito
        mensagem="O prontuário é aberto só pelo psicólogo responsável."
        acao={
          <BotaoLink to="/pacientes" variante="secundario">
            Voltar aos pacientes
          </BotaoLink>
        }
      />
    );
  }
  if (!pacienteId) return <Navigate to="/pacientes" replace />;
  if (pacienteQuery.isPending || evolucoesQuery.isPending || registrosQuery.isPending) return <CarregandoPagina rotulo="Carregando o prontuário…" />;
  const erro = evolucoesQuery.error ?? registrosQuery.error;
  if (erro && (!evolucoesQuery.data || !registrosQuery.data)) {
    const status = erro instanceof ErroApi ? erro.status : 0;
    return (
      <EstadoErro
        titulo={status === 403 ? 'Sem permissão clínica' : 'Prontuário indisponível'}
        mensagem={mensagemDeErro(erro, 'Tente novamente em instantes.')}
        aoTentarNovamente={() => void Promise.all([evolucoesQuery.refetch(), registrosQuery.refetch()])}
        recarregando={evolucoesQuery.isFetching || registrosQuery.isFetching}
      />
    );
  }

  const paciente = pacienteQuery.data;
  const evolucoes = evolucoesQuery.data?.itens ?? [];
  const registros = registrosQuery.data?.itens ?? [];
  const totalSessoes = registrosQuery.data?.total ?? registros.length;
  const ultimaSessao = registros[0] ?? null;
  const plano = planoAtual(evolucoes);
  const linha = montarLinhaDoTempo(filtro === 'evolucoes' ? [] : registros, filtro === 'sessoes' ? [] : evolucoes);
  const visiveis = filtrarLinhaDoTempo(linha, busca);
  const truncado = (registrosQuery.data?.total ?? 0) > LIMITE || (evolucoesQuery.data?.total ?? 0) > LIMITE;

  function fecharSessao(aberto: boolean) {
    setRegistrandoSessao(aberto);
    if (!aberto && consultaDeOrigem) {
      setParams({}, { replace: true });
    }
  }

  return (
    <Pagina largura="padrao" className="gap-8">
      <CabecalhoPagina
        titulo="Prontuário"
        voltarPara={{ para: `/pacientes/${pacienteId}`, rotulo: paciente?.nomeCompleto ?? 'Paciente' }}
        meta={
          <span className="flex items-center gap-2 text-base">
            <FileHeart size={16} aria-hidden="true" />
            {paciente?.nomeCompleto ?? 'Paciente'}
          </span>
        }
        descricao="Conteúdo sigiloso, visível só para você. Nada daqui fica salvo neste navegador. O CFP exige guardar o prontuário por no mínimo 5 anos."
        acoes={
          <>
            <Botao variante="secundario" onClick={() => setNovaEvolucao(true)}>
              <NotebookPen size={16} aria-hidden="true" />
              Nova evolução
            </Botao>
            <Botao variante="primario" onClick={() => setRegistrandoSessao(true)}>
              <ClipboardPen size={16} aria-hidden="true" />
              Registrar sessão
            </Botao>
          </>
        }
      />

      <section aria-label="Resumo do acompanhamento" className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <dl className="grid grid-cols-2 gap-4 rounded-lg border border-line bg-surface p-4 sm:p-5">
          <div className="grid gap-0.5">
            <dt className="text-sm text-ink-muted">Sessões registradas</dt>
            <dd className="num text-xl font-semibold text-ink">{totalSessoes}</dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-sm text-ink-muted">Última sessão</dt>
            <dd className="num text-base font-medium text-ink">{ultimaSessao ? formatarData(ultimaSessao.dataSessao) : '—'}</dd>
          </div>
        </dl>
        <div className="grid content-start gap-1.5 rounded-lg border border-accent-line bg-accent-wash p-4 sm:p-5">
          <p className="text-sm font-medium text-accent-ink">Plano terapêutico atual</p>
          {plano ? (
            <>
              <p className="line-clamp-4 whitespace-pre-wrap text-base text-ink">{plano.conteudo}</p>
              <p className="num text-sm text-ink-muted">Desde {formatarData(plano.dataEvolucao)}</p>
            </>
          ) : (
            <p className="text-base text-ink-muted">Nenhum plano registrado. Use "Nova evolução" do tipo Plano terapêutico.</p>
          )}
        </div>
      </section>

      <Secao titulo="Linha do tempo" descricao="Sessões e evoluções, da mais recente à mais antiga.">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <GrupoSegmentado
            rotulo="Mostrar"
            valor={filtro}
            aoMudar={setFiltro}
            opcoes={[
              { valor: 'tudo', rotulo: 'Tudo', contagem: registros.length + evolucoes.length },
              { valor: 'sessoes', rotulo: 'Sessões', contagem: registros.length },
              { valor: 'evolucoes', rotulo: 'Evoluções', contagem: evolucoes.length },
            ]}
          />
          <div className="w-full sm:w-72">
            <CampoBusca valor={busca} aoMudar={setBusca} placeholder="Buscar no prontuário" aria-label="Buscar no prontuário" />
          </div>
        </div>

        {linha.length === 0 ? (
          <EstadoVazio
            icone={FileHeart}
            titulo="Prontuário ainda vazio"
            descricao="Registre a sessão depois de cada atendimento. Evoluções guardam marcos, hipóteses e o plano terapêutico."
            acao={
              <Botao variante="secundario" onClick={() => setRegistrandoSessao(true)}>
                Registrar a primeira sessão
              </Botao>
            }
          />
        ) : visiveis.length === 0 ? (
          <PainelVazio>Nada encontrado para "{busca}".</PainelVazio>
        ) : (
          <ListaRegulada aria-live="polite">
            {visiveis.map((item) => (
              <ItemDoProntuario key={`${item.tipo}-${item.id}`} item={item} />
            ))}
          </ListaRegulada>
        )}
        {busca.trim() && visiveis.length > 0 ? <p className="text-sm text-ink-muted">{pluralizar(visiveis.length, 'resultado')}.</p> : null}
        {truncado ? <p className="text-sm text-ink-muted">Mostrando os {LIMITE} registros mais recentes de cada tipo.</p> : null}
      </Secao>

      <GavetaEvolucao pacienteId={pacienteId} aberto={novaEvolucao} aoMudar={setNovaEvolucao} />
      <GavetaRegistroSessao pacienteId={pacienteId} consultaInicialId={consultaDeOrigem} aberto={registrandoSessao} aoMudar={fecharSessao} />
    </Pagina>
  );
}
