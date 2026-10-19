import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ChevronDown, ScrollText } from 'lucide-react';
import { Fragment, useState } from 'react';

import { EsqueletoLinhas } from '../../components/feedback/esqueleto';
import { EstadoErro, EstadoVazio } from '../../components/feedback/estados';
import { CabecalhoPagina, Pagina } from '../../components/layout/pagina';
import { Botao } from '../../components/ui/botao';
import { Campo, Entrada, OpcaoMarcavel, Selecao } from '../../components/ui/campo';
import { cn } from '../../components/ui/cn';
import { Etiqueta } from '../../components/ui/etiqueta';
import { Paginacao } from '../../components/ui/paginacao';
import {
  CabecalhoTabela,
  CelulaTabela,
  ColunaTabela,
  LinhaTabela,
  Tabela,
} from '../../components/ui/tabela';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import { useParametrosUrl } from '../../core/hooks/use-parametros-url';
import { formatarDataHora } from '../../core/formatacao/datas';
import { formatarNumero } from '../../core/formatacao/moeda';
import {
  auditoriaKeys,
  listarAuditoria,
  obterLogAuditoria,
  type LogAuditoriaDetalhe,
} from './auditoria.api';
import {
  compararDados,
  opcoesAcao,
  rotuloAcao,
  rotuloEntidade,
  rotuloResponsavel,
} from './auditoria.rotulos';

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

  const acao = params.get('acao') ?? '';
  const de = params.get('de') ?? '';
  const ate = params.get('ate') ?? '';
  const incluirTecnicos = params.get('tecnicos') === '1';
  const filtro = {
    tipoAcao: acao || undefined,
    incluirTecnicos,
    de: de ? new Date(`${de}T00:00:00`).toISOString() : undefined,
    ate: ate ? new Date(`${ate}T23:59:59`).toISOString() : undefined,
    pagina,
    tamanhoPagina: TAMANHO_PAGINA,
  };
  const filtrado = Boolean(acao || incluirTecnicos || de || ate);

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
        descricao="Quem fez o quê e quando, do mais recente para o mais antigo. Os registros não podem ser alterados nem apagados."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_11rem_11rem_auto] lg:items-end">
        <Campo rotulo="O que aconteceu">
          <Selecao
            opcoes={opcoesAcao}
            placeholder="Tudo"
            value={acao}
            onChange={(evento) => atualizar({ acao: evento.target.value || null, pagina: null })}
          />
        </Campo>
        <Campo rotulo="De">
          <Entrada
            type="date"
            value={de}
            onChange={(evento) => atualizar({ de: evento.target.value || null, pagina: null })}
          />
        </Campo>
        <Campo rotulo="Até">
          <Entrada
            type="date"
            value={ate}
            onChange={(evento) => atualizar({ ate: evento.target.value || null, pagina: null })}
          />
        </Campo>
        {filtrado ? (
          <Botao variante="discreto" onClick={limpar}>
            Limpar
          </Botao>
        ) : null}
        <OpcaoMarcavel
          className="sm:col-span-2 lg:col-span-4"
          rotulo="Incluir mensagens recebidas do WhatsApp"
          descricao="Uma linha por mensagem. Ficam ocultas para não esconder o que importa."
          checked={incluirTecnicos}
          onChange={(evento) =>
            atualizar({ tecnicos: evento.target.checked ? '1' : null, pagina: null })
          }
        />
      </div>

      {isPending ? (
        <EsqueletoLinhas quantidade={8} />
      ) : error && !data ? (
        <EstadoErro
          titulo="Auditoria indisponível"
          mensagem={mensagemDeErro(error, 'Tente novamente em instantes.')}
          aoTentarNovamente={() => void refetch()}
          recarregando={isFetching}
        />
      ) : data && data.itens.length === 0 ? (
        <EstadoVazio
          icone={ScrollText}
          titulo="Nenhum registro encontrado"
          descricao={
            filtrado
              ? 'Nada corresponde a esses filtros. Tente outro período ou outra ação.'
              : 'Quando algo importante acontecer na conta, aparece aqui.'
          }
        />
      ) : data ? (
        <div
          aria-busy={isFetching}
          className={
            isPlaceholderData
              ? 'opacity-60 transition-opacity duration-150'
              : 'transition-opacity duration-150'
          }
        >
          <Tabela rotulo="Registros de auditoria">
            <CabecalhoTabela>
              <tr>
                <ColunaTabela>Quando</ColunaTabela>
                <ColunaTabela>O que aconteceu</ColunaTabela>
                <ColunaTabela ocultarAte="md">Área</ColunaTabela>
                <ColunaTabela ocultarAte="lg">Quem</ColunaTabela>
                <ColunaTabela className="w-px">
                  <span className="sr-only">Detalhes</span>
                </ColunaTabela>
              </tr>
            </CabecalhoTabela>
            <tbody>
              {data.itens.map((log) => {
                const expandido = expandidoId === log.id;
                const detalhe = detalheQuery.data;
                const acaoLegivel = rotuloAcao(log.tipoAcao);
                return (
                  <Fragment key={log.id}>
                    <LinhaTabela>
                      <CelulaTabela className="num text-ink-muted sm:whitespace-nowrap">
                        {formatarDataHora(log.criadoEm)}
                      </CelulaTabela>
                      <CelulaTabela>
                        <span className="block font-medium text-ink [overflow-wrap:anywhere]">
                          {acaoLegivel}
                        </span>
                        {log.descricao && log.descricao !== acaoLegivel ? (
                          <span className="block max-w-xl text-sm text-ink-muted [overflow-wrap:anywhere]">
                            {log.descricao}
                          </span>
                        ) : null}
                      </CelulaTabela>
                      <CelulaTabela ocultarAte="md">
                        <Etiqueta>{rotuloEntidade(log.entidade, log.tipoAcao)}</Etiqueta>
                      </CelulaTabela>
                      <CelulaTabela ocultarAte="lg" className="text-ink-muted">
                        {rotuloResponsavel(log)}
                      </CelulaTabela>
                      <CelulaTabela className="text-right">
                        <Botao
                          variante="discreto"
                          tamanho="icone-pequeno"
                          aria-expanded={expandido}
                          aria-label={
                            expandido
                              ? `Ocultar detalhes de ${acaoLegivel}`
                              : `Ver detalhes de ${acaoLegivel}`
                          }
                          onClick={() => setExpandidoId(expandido ? null : log.id)}
                        >
                          <ChevronDown
                            size={16}
                            aria-hidden="true"
                            className={cn(
                              'transition-transform duration-200 ease-out',
                              expandido && 'rotate-180',
                            )}
                          />
                        </Botao>
                      </CelulaTabela>
                    </LinhaTabela>
                    {expandido ? (
                      <tr className="border-b border-line bg-rail">
                        <td colSpan={5} className="animar-surgir px-4 py-4">
                          {detalheQuery.isPending ? (
                            <p className="text-sm text-ink-muted">Carregando detalhes…</p>
                          ) : detalhe ? (
                            <DetalheRegistro detalhe={detalhe} />
                          ) : (
                            <p className="text-sm text-danger-ink">
                              Não foi possível carregar os detalhes.
                            </p>
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
            aoMudarPagina={(proxima) =>
              atualizar({ pagina: proxima === 1 ? null : String(proxima) })
            }
            desabilitado={isFetching}
          />
        </div>
      ) : null}
    </Pagina>
  );
}

/** O que mudou, campo a campo; o dado cru e a origem do acesso ficam recolhidos para quem precisar. */
function DetalheRegistro({ detalhe }: { detalhe: LogAuditoriaDetalhe }) {
  const mudancas = compararDados(detalhe.dadosAntesJson, detalhe.dadosDepoisJson);
  const origem = [detalhe.ip, detalhe.userAgent].filter(Boolean).join(' · ');

  return (
    <div className="grid gap-5 text-sm">
      {mudancas === null ? (
        <p className="text-ink-muted">Este registro não guarda os dados de antes e depois.</p>
      ) : mudancas.length === 0 ? (
        <p className="text-ink-muted">Nenhum campo foi alterado.</p>
      ) : (
        <div>
          <h3 className="text-xs font-medium text-ink-muted">O que mudou</h3>
          <dl className="mt-1 divide-y divide-line">
            {mudancas.map((mudanca) => (
              <div
                key={mudanca.campo}
                className="grid gap-1 py-2 sm:grid-cols-[12rem_minmax(0,1fr)]"
              >
                <dt className="font-medium text-ink">{mudanca.campo}</dt>
                <dd className="text-ink [overflow-wrap:anywhere]">
                  <span className="text-ink-muted">{mudanca.antes}</span>
                  <span aria-hidden="true" className="mx-2 text-ink-faint">
                    →
                  </span>
                  <span className="sr-only"> passou para </span>
                  {mudanca.depois}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <details>
        <summary className="cursor-pointer text-sm font-medium text-accent-ink">
          Detalhes técnicos
        </summary>
        <dl className="mt-3 grid gap-4 lg:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-ink-muted">Origem do acesso</dt>
            <dd className="mt-0.5 break-all text-ink">{origem || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-ink-muted">Código da ação e do registro</dt>
            <dd className="num mt-0.5 break-all text-ink">
              {[detalhe.tipoAcao, detalhe.entidadeId].filter(Boolean).join(' · ')}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-ink-muted">Dados antes</dt>
            <dd>
              <pre
                tabIndex={0}
                aria-label="Dados antes da ação"
                className="scroll-contido mt-0.5 max-h-56 overflow-auto whitespace-pre-wrap break-all rounded-md bg-paper p-3 text-xs text-ink"
              >
                {formatarJson(detalhe.dadosAntesJson)}
              </pre>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-ink-muted">Dados depois</dt>
            <dd>
              <pre
                tabIndex={0}
                aria-label="Dados depois da ação"
                className="scroll-contido mt-0.5 max-h-56 overflow-auto whitespace-pre-wrap break-all rounded-md bg-paper p-3 text-xs text-ink"
              >
                {formatarJson(detalhe.dadosDepoisJson)}
              </pre>
            </dd>
          </div>
        </dl>
      </details>
    </div>
  );
}
