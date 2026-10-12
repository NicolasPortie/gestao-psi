import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ClipboardPen, FileHeart, NotebookPen } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router';

import { AcessoRestrito } from '../../components/feedback/acesso-restrito';
import { CarregandoPagina } from '../../components/feedback/esqueleto';
import { EstadoErro, EstadoVazio } from '../../components/feedback/estados';
import { CabecalhoPagina, Pagina, Secao } from '../../components/layout/pagina';
import { Botao, BotaoLink } from '../../components/ui/botao';
import { Etiqueta } from '../../components/ui/etiqueta';
import { ItemLista, ListaRegulada } from '../../components/ui/lista';
import { Paginacao } from '../../components/ui/paginacao';
import { usePermissoes } from '../../core/autenticacao/permissoes';
import { ErroApi } from '../../core/api/resposta-api';
import { rotuloDe } from '../../core/dominio/estado';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import { formatarDataHora } from '../../core/formatacao/datas';
import { pacientesKeys } from '../pacientes/pacientes.keys';
import { obterPacientePorId } from '../pacientes/pacientes.api';
import { GavetaEvolucao } from './components/gaveta-evolucao';
import { GavetaRegistroSessao } from './components/gaveta-registro-sessao';
import { listarEvolucoes, sessoesKeys } from './sessoes.api';
import { rotulosTipoEvolucao } from './sessoes.rotulos';

const TAMANHO_PAGINA = 10;

export default function ProntuarioPage() {
  const { id: pacienteId = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const { acessoClinico } = usePermissoes();
  const consultaDeOrigem = params.get('consultaId') ?? '';
  const [pagina, setPagina] = useState(1);
  const [novaEvolucao, setNovaEvolucao] = useState(false);
  // Chegando de uma consulta, a folha de registro de sessão já abre vinculada a ela.
  const [registrandoSessao, setRegistrandoSessao] = useState(Boolean(consultaDeOrigem));

  const pacienteQuery = useQuery({
    queryKey: pacientesKeys.detalhe(pacienteId),
    queryFn: ({ signal }) => obterPacientePorId(pacienteId, { signal }),
    enabled: Boolean(pacienteId) && acessoClinico,
  });
  const filtro = { pagina, tamanhoPagina: TAMANHO_PAGINA };
  const evolucoesQuery = useQuery({
    queryKey: sessoesKeys.evolucoes(pacienteId, filtro),
    queryFn: ({ signal }) => listarEvolucoes(pacienteId, filtro, { signal }),
    enabled: Boolean(pacienteId) && acessoClinico,
    placeholderData: keepPreviousData,
  });

  if (!acessoClinico) {
    return (
      <AcessoRestrito
        mensagem="O prontuário é restrito ao perfil Psicólogo. A autorização final é validada pelo servidor."
        acao={
          <BotaoLink to="/pacientes" variante="secundario">
            Voltar aos pacientes
          </BotaoLink>
        }
      />
    );
  }
  if (!pacienteId) return <Navigate to="/pacientes" replace />;
  if (pacienteQuery.isPending || evolucoesQuery.isPending) return <CarregandoPagina rotulo="Carregando o prontuário…" />;
  if (evolucoesQuery.error && !evolucoesQuery.data) {
    const status = evolucoesQuery.error instanceof ErroApi ? evolucoesQuery.error.status : 0;
    return (
      <EstadoErro
        titulo={status === 403 ? 'Sem permissão clínica' : 'Prontuário indisponível'}
        mensagem={mensagemDeErro(evolucoesQuery.error, 'Tente novamente em instantes.')}
        aoTentarNovamente={() => void evolucoesQuery.refetch()}
        recarregando={evolucoesQuery.isFetching}
      />
    );
  }

  const paciente = pacienteQuery.data;
  const evolucoes = evolucoesQuery.data?.itens ?? [];

  function fecharSessao(aberto: boolean) {
    setRegistrandoSessao(aberto);
    if (!aberto && consultaDeOrigem) {
      setParams({}, { replace: true });
    }
  }

  return (
    <Pagina largura="padrao">
      <CabecalhoPagina
        titulo="Prontuário"
        voltarPara={{ para: `/pacientes/${pacienteId}`, rotulo: paciente?.nomeCompleto ?? 'Paciente' }}
        meta={
          <span className="flex items-center gap-2 text-base">
            <FileHeart size={16} aria-hidden="true" />
            {paciente?.nomeCompleto ?? 'Paciente'}
          </span>
        }
        descricao="Conteúdo sensível, restrito ao psicólogo. Não é guardado em cache persistente do navegador."
        acoes={
          <>
            <Botao variante="secundario" onClick={() => setRegistrandoSessao(true)}>
              <ClipboardPen size={16} aria-hidden="true" />
              Registrar sessão
            </Botao>
            <Botao variante="primario" onClick={() => setNovaEvolucao(true)}>
              <NotebookPen size={16} aria-hidden="true" />
              Nova evolução
            </Botao>
          </>
        }
      />

      <Secao titulo="Evoluções" descricao="Do registro mais recente ao mais antigo.">
        {evolucoes.length === 0 ? (
          <EstadoVazio
            icone={FileHeart}
            titulo="Sem evoluções registradas"
            descricao="As anotações clínicas deste paciente aparecem aqui, em ordem cronológica."
            acao={
              <Botao variante="secundario" onClick={() => setNovaEvolucao(true)}>
                Registrar a primeira evolução
              </Botao>
            }
          />
        ) : (
          <div>
            <ListaRegulada>
              {evolucoes.map((evolucao) => (
                <ItemLista key={evolucao.id} className="grid gap-1.5 py-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Etiqueta tom="acento">{rotuloDe(rotulosTipoEvolucao, evolucao.tipo)}</Etiqueta>
                    <time className="num text-sm text-ink-muted" dateTime={evolucao.dataEvolucao}>
                      {formatarDataHora(evolucao.dataEvolucao)}
                    </time>
                  </div>
                  <p className="max-w-[70ch] whitespace-pre-wrap text-base leading-7 text-ink">{evolucao.conteudo}</p>
                </ItemLista>
              ))}
            </ListaRegulada>
            <Paginacao
              className="mt-2"
              pagina={evolucoesQuery.data?.pagina ?? pagina}
              total={evolucoesQuery.data?.total ?? 0}
              tamanhoPagina={evolucoesQuery.data?.tamanhoPagina ?? TAMANHO_PAGINA}
              aoMudarPagina={setPagina}
              desabilitado={evolucoesQuery.isFetching}
            />
          </div>
        )}
      </Secao>

      <GavetaEvolucao pacienteId={pacienteId} aberto={novaEvolucao} aoMudar={setNovaEvolucao} />
      <GavetaRegistroSessao pacienteId={pacienteId} consultaInicialId={consultaDeOrigem} aberto={registrandoSessao} aoMudar={fecharSessao} />
    </Pagina>
  );
}
