import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BellRing, CheckCheck } from 'lucide-react';
import { Link } from 'react-router';

import { EsqueletoLinhas } from '../../components/feedback/esqueleto';
import { EstadoErro, EstadoVazio } from '../../components/feedback/estados';
import { notificar } from '../../components/feedback/notificar';
import { CabecalhoPagina, Pagina } from '../../components/layout/pagina';
import { Botao } from '../../components/ui/botao';
import { GrupoSegmentado } from '../../components/ui/campo';
import { ItemLista, ListaRegulada } from '../../components/ui/lista';
import { MarcaEstado } from '../../components/ui/marca-estado';
import { Paginacao } from '../../components/ui/paginacao';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import { useParametrosUrl } from '../../core/hooks/use-parametros-url';
import { formatarTempoRelativo, formatarDataHora } from '../../core/formatacao/datas';
import { painelKeys } from '../painel/painel.api';
import {
  contarNotificacoesNaoLidas,
  listarNotificacoes,
  marcarNotificacaoLida,
  marcarTodasNotificacoesLidas,
  notificacoesKeys,
} from './notificacoes.api';

const TAMANHO_PAGINA = 20;

/** Só caminhos internos viram links; qualquer outra origem é ignorada. */
const destinoInterno = (url: string | null) => (url && url.startsWith('/') && !url.startsWith('//') ? url : null);

export default function NotificacoesPage() {
  const queryClient = useQueryClient();
  const { params, atualizar, pagina } = useParametrosUrl();
  const apenasNaoLidas = params.get('filtro') === 'nao-lidas';
  const filtro = { pagina, tamanhoPagina: TAMANHO_PAGINA, ...(apenasNaoLidas ? { lida: false } : {}) };

  const listaQuery = useQuery({
    queryKey: notificacoesKeys.lista(filtro),
    queryFn: ({ signal }) => listarNotificacoes(filtro, { signal }),
    placeholderData: keepPreviousData,
  });
  const contagemQuery = useQuery({ queryKey: notificacoesKeys.contagem(), queryFn: ({ signal }) => contarNotificacoesNaoLidas({ signal }) });

  async function atualizarDados() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: notificacoesKeys.todos }),
      queryClient.invalidateQueries({ queryKey: painelKeys.todos }),
    ]);
  }

  const marcarUma = useMutation({
    mutationFn: marcarNotificacaoLida,
    onSuccess: atualizarDados,
    onError: (erro) => notificar.erro(mensagemDeErro(erro, 'Não foi possível marcar como lida.')),
  });
  const marcarTodas = useMutation({
    mutationFn: marcarTodasNotificacoesLidas,
    onSuccess: async () => {
      await atualizarDados();
      notificar.sucesso('Todas as notificações foram marcadas como lidas.');
    },
    onError: (erro) => notificar.erro(mensagemDeErro(erro, 'Não foi possível marcar todas como lidas.')),
  });

  const naoLidas = contagemQuery.data ?? 0;
  const { data, isPending, error, isFetching, isPlaceholderData, refetch } = listaQuery;

  return (
    <Pagina largura="padrao" className="gap-6">
      <CabecalhoPagina
        titulo="Notificações"
        meta={naoLidas > 0 ? `${naoLidas} ${naoLidas === 1 ? 'não lida' : 'não lidas'}` : 'Tudo em dia'}
        acoes={
          <Botao variante="secundario" disabled={naoLidas === 0} carregando={marcarTodas.isPending} onClick={() => marcarTodas.mutate()}>
            <CheckCheck size={16} aria-hidden="true" />
            Marcar todas como lidas
          </Botao>
        }
      />

      <GrupoSegmentado
        rotulo="Filtrar notificações"
        valor={apenasNaoLidas ? 'nao-lidas' : 'todas'}
        aoMudar={(valor) => atualizar({ filtro: valor === 'nao-lidas' ? 'nao-lidas' : null, pagina: null })}
        opcoes={[
          { valor: 'todas', rotulo: 'Todas' },
          { valor: 'nao-lidas', rotulo: 'Não lidas', contagem: naoLidas },
        ]}
      />

      {isPending ? (
        <EsqueletoLinhas quantidade={6} />
      ) : error && !data ? (
        <EstadoErro titulo="Notificações indisponíveis" mensagem={mensagemDeErro(error, 'Tente novamente em instantes.')} aoTentarNovamente={() => void refetch()} recarregando={isFetching} />
      ) : data && data.itens.length === 0 ? (
        <EstadoVazio
          icone={BellRing}
          titulo={apenasNaoLidas ? 'Nenhuma notificação pendente' : 'Sem notificações'}
          descricao="Quando houver algo que precise da sua atenção na rotina, aparece aqui."
        />
      ) : data ? (
        <div aria-busy={isFetching} className={isPlaceholderData ? 'opacity-60 transition-opacity duration-150' : 'transition-opacity duration-150'}>
          <ListaRegulada>
            {data.itens.map((item) => {
              const destino = destinoInterno(item.urlOrigem);
              return (
                <ItemLista key={item.id} className="grid grid-cols-[1rem_1fr_auto] items-start gap-x-3">
                  <MarcaEstado forma={item.lida ? 'anel' : 'cheio'} tom={item.lida ? 'neutro' : 'acento'} className="mt-1" />
                  <div className="grid min-w-0 gap-0.5">
                    <p className={item.lida ? 'text-base text-ink-muted' : 'text-base font-semibold text-ink'}>
                      {destino ? (
                        <Link to={destino} onClick={() => !item.lida && marcarUma.mutate(item.id)} className="text-inherit no-underline hover:underline">
                          {item.titulo}
                        </Link>
                      ) : (
                        item.titulo
                      )}
                      {item.lida ? null : <span className="sr-only"> (não lida)</span>}
                    </p>
                    <p className="text-sm text-ink-muted">{item.mensagem}</p>
                    <time className="text-xs text-ink-muted" dateTime={item.criadoEm} title={formatarDataHora(item.criadoEm)}>
                      {formatarTempoRelativo(item.criadoEm)}
                    </time>
                  </div>
                  {item.lida ? null : (
                    <Botao variante="discreto" tamanho="pequeno" disabled={marcarUma.isPending} onClick={() => marcarUma.mutate(item.id)}>
                      Marcar como lida
                    </Botao>
                  )}
                </ItemLista>
              );
            })}
          </ListaRegulada>
          <Paginacao
            className="mt-2"
            pagina={data.pagina}
            total={data.total}
            tamanhoPagina={data.tamanhoPagina}
            aoMudarPagina={(proxima) => atualizar({ pagina: proxima === 1 ? null : String(proxima) })}
            desabilitado={isFetching}
          />
        </div>
      ) : null}
    </Pagina>
  );
}
