import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ChevronDown, ScrollText } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';

import { EsqueletoLinhas } from '../../components/feedback/esqueleto';
import { EstadoErro, EstadoVazio } from '../../components/feedback/estados';
import { CabecalhoPagina, Pagina } from '../../components/layout/pagina';
import { Botao } from '../../components/ui/botao';
import { Campo, Entrada } from '../../components/ui/campo';
import { cn } from '../../components/ui/cn';
import { Etiqueta } from '../../components/ui/etiqueta';
import { Paginacao } from '../../components/ui/paginacao';
import { CabecalhoTabela, CelulaTabela, ColunaTabela, LinhaTabela, Tabela } from '../../components/ui/tabela';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import { useDebounce } from '../../core/hooks/use-debounce';
import { useParametrosUrl } from '../../core/hooks/use-parametros-url';
import { formatarDataHora } from '../../core/formatacao/datas';
import { formatarNumero } from '../../core/formatacao/moeda';
import { auditoriaKeys, listarAuditoria, obterLogAuditoria } from './auditoria.api';

const TAMANHO_PAGINA = 20;

/** JSON de "antes/depois" legível quando válido; texto original caso contrário. */
function formatarJson(texto: string | null) {
  if (!texto) return '—';
  try {
    return JSON.stringify(JSON.parse(texto), null, 2);
  } catch {
    return texto;
  }
}

export default function AuditoriaPage() {
  const { params, atualizar, limpar, pagina } = useParametrosUrl();
  const [expandidoId, setExpandidoId] = useState<string | null>(null);
  const [acaoDigitada, setAcaoDigitada] = useState(params.get('acao') ?? '');
  const [entidadeDigitada, setEntidadeDigitada] = useState(params.get('entidade') ?? '');
  const acao = useDebounce(acaoDigitada.trim(), 300);
  const entidade = useDebounce(entidadeDigitada.trim(), 300);

  useEffect(() => {
    if (acao === (params.get('acao') ?? '') && entidade === (params.get('entidade') ?? '')) return;
    atualizar({ acao: acao || null, entidade: entidade || null, pagina: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sincroniza apenas quando o texto estabiliza
  }, [acao, entidade]);

  const de = params.get('de') ?? '';
  const ate = params.get('ate') ?? '';
  const filtro = {
    tipoAcao: params.get('acao') || undefined,
    entidade: params.get('entidade') || undefined,
    de: de ? new Date(`${de}T00:00:00`).toISOString() : undefined,
    ate: ate ? new Date(`${ate}T23:59:59`).toISOString() : undefined,
    pagina,
    tamanhoPagina: TAMANHO_PAGINA,
  };
  const filtrado = Boolean(filtro.tipoAcao || filtro.entidade || de || ate);

  const listaQuery = useQuery({
    queryKey: auditoriaKeys.lista(filtro),
    queryFn: ({ signal }) => listarAuditoria(filtro, { signal }),
    placeholderData: keepPreviousData,
  });
  const detalheQuery = useQuery({
    queryKey: auditoriaKeys.detalhe(expandidoId ?? ''),
    queryFn: ({ signal }) => obterLogAuditoria(expandidoId!, { signal }),
    enabled: Boolean(expandidoId),
  });

  const { data, isPending, error, isFetching, isPlaceholderData, refetch } = listaQuery;

  return (
    <Pagina largura="ampla" className="gap-6">
      <CabecalhoPagina
        titulo="Auditoria"
        meta={data ? `${formatarNumero(data.total)} registros` : undefined}
        descricao="Ações importantes da conta, em ordem cronológica. Os registros não podem ser editados nem removidos."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_11rem_11rem_auto] lg:items-end">
        <Campo rotulo="Tipo de ação">
          <Entrada value={acaoDigitada} onChange={(evento) => setAcaoDigitada(evento.target.value)} placeholder="Ex.: ConsultaCriada" />
        </Campo>
        <Campo rotulo="Entidade">
          <Entrada value={entidadeDigitada} onChange={(evento) => setEntidadeDigitada(evento.target.value)} placeholder="Ex.: Consulta" />
        </Campo>
        <Campo rotulo="De">
          <Entrada type="date" value={de} onChange={(evento) => atualizar({ de: evento.target.value || null, pagina: null })} />
        </Campo>
        <Campo rotulo="Até">
          <Entrada type="date" value={ate} onChange={(evento) => atualizar({ ate: evento.target.value || null, pagina: null })} />
        </Campo>
        {filtrado ? (
          <Botao
            variante="discreto"
            onClick={() => {
              setAcaoDigitada('');
              setEntidadeDigitada('');
              limpar();
            }}
          >
            Limpar
          </Botao>
        ) : null}
      </div>

      {isPending ? (
        <EsqueletoLinhas quantidade={8} />
      ) : error && !data ? (
        <EstadoErro titulo="Auditoria indisponível" mensagem={mensagemDeErro(error, 'Tente novamente em instantes.')} aoTentarNovamente={() => void refetch()} recarregando={isFetching} />
      ) : data && data.itens.length === 0 ? (
        <EstadoVazio icone={ScrollText} titulo="Nenhum registro encontrado" descricao={filtrado ? 'Nenhum log corresponde aos filtros. Ajuste o período ou os termos.' : 'As ações da conta passam a ser registradas aqui.'} />
      ) : data ? (
        <div aria-busy={isFetching} className={isPlaceholderData ? 'opacity-60 transition-opacity duration-150' : 'transition-opacity duration-150'}>
          <Tabela rotulo="Registros de auditoria">
            <CabecalhoTabela>
              <tr>
                <ColunaTabela>Quando</ColunaTabela>
                <ColunaTabela>Ação</ColunaTabela>
                <ColunaTabela ocultarAte="md">Entidade</ColunaTabela>
                <ColunaTabela ocultarAte="lg">Responsável</ColunaTabela>
                <ColunaTabela className="w-px">
                  <span className="sr-only">Detalhe</span>
                </ColunaTabela>
              </tr>
            </CabecalhoTabela>
            <tbody>
              {data.itens.map((log) => {
                const expandido = expandidoId === log.id;
                const detalhe = detalheQuery.data;
                return (
                  <Fragment key={log.id}>
                    <LinhaTabela>
                      <CelulaTabela className="num text-ink-muted sm:whitespace-nowrap">{formatarDataHora(log.criadoEm)}</CelulaTabela>
                      <CelulaTabela>
                        <span className="block font-medium text-ink [overflow-wrap:anywhere]">{log.tipoAcao}</span>
                        {log.descricao ? <span className="block max-w-xl text-sm text-ink-muted [overflow-wrap:anywhere]">{log.descricao}</span> : null}
                      </CelulaTabela>
                      <CelulaTabela ocultarAte="md">
                        <Etiqueta>{log.entidade}</Etiqueta>
                      </CelulaTabela>
                      <CelulaTabela ocultarAte="lg" className="text-ink-muted">
                        {[log.usuario, log.ip].filter(Boolean).join(' · ') || 'Sistema'}
                      </CelulaTabela>
                      <CelulaTabela className="text-right">
                        <Botao
                          variante="discreto"
                          tamanho="icone-pequeno"
                          aria-expanded={expandido}
                          aria-label={expandido ? `Ocultar detalhe de ${log.tipoAcao}` : `Ver detalhe de ${log.tipoAcao}`}
                          onClick={() => setExpandidoId(expandido ? null : log.id)}
                        >
                          <ChevronDown size={16} aria-hidden="true" className={cn('transition-transform duration-200 ease-out', expandido && 'rotate-180')} />
                        </Botao>
                      </CelulaTabela>
                    </LinhaTabela>
                    {expandido ? (
                      <tr className="border-b border-line bg-rail">
                        <td colSpan={5} className="px-4 py-4">
                          {detalheQuery.isPending ? (
                            <p className="text-sm text-ink-muted">Carregando detalhe…</p>
                          ) : detalhe ? (
                            <dl className="grid gap-4 text-sm lg:grid-cols-2">
                              <div>
                                <dt className="text-xs font-medium text-ink-muted">Responsável e origem</dt>
                                <dd className="mt-0.5 break-all text-ink">{[detalhe.usuario ?? 'Sistema', detalhe.ip, detalhe.userAgent].filter(Boolean).join(' · ')}</dd>
                              </div>
                              <div>
                                <dt className="text-xs font-medium text-ink-muted">Registro afetado</dt>
                                <dd className="num mt-0.5 break-all text-ink">{detalhe.entidadeId ?? '—'}</dd>
                              </div>
                              <div>
                                <dt className="text-xs font-medium text-ink-muted">Antes</dt>
                                <dd><pre tabIndex={0} aria-label="Dados antes da ação" className="scroll-contido mt-0.5 max-h-56 overflow-auto whitespace-pre-wrap break-all rounded-md bg-paper p-3 text-xs text-ink">{formatarJson(detalhe.dadosAntesJson)}</pre></dd>
                              </div>
                              <div>
                                <dt className="text-xs font-medium text-ink-muted">Depois</dt>
                                <dd><pre tabIndex={0} aria-label="Dados depois da ação" className="scroll-contido mt-0.5 max-h-56 overflow-auto whitespace-pre-wrap break-all rounded-md bg-paper p-3 text-xs text-ink">{formatarJson(detalhe.dadosDepoisJson)}</pre></dd>
                              </div>
                            </dl>
                          ) : (
                            <p className="text-sm text-danger-ink">Não foi possível carregar o detalhe.</p>
                          )}
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </Tabela>
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
