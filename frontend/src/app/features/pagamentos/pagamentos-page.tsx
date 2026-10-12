import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Plus, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { EsqueletoLinhas } from '../../components/feedback/esqueleto';
import { EstadoErro, EstadoVazio } from '../../components/feedback/estados';
import { notificar } from '../../components/feedback/notificar';
import { CabecalhoPagina, Pagina } from '../../components/layout/pagina';
import { Botao } from '../../components/ui/botao';
import { GrupoSegmentado } from '../../components/ui/campo';
import { Confirmacao } from '../../components/ui/dialogo';
import { EstadoRotulado, MarcaEstado } from '../../components/ui/marca-estado';
import { MenuAcoes } from '../../components/ui/menu';
import { Paginacao } from '../../components/ui/paginacao';
import { CabecalhoTabela, CelulaTabela, ColunaTabela, LinhaTabela, Tabela } from '../../components/ui/tabela';
import { descreverEstado, rotuloDe } from '../../core/dominio/estado';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import { useParametrosUrl } from '../../core/hooks/use-parametros-url';
import { formatarData } from '../../core/formatacao/datas';
import { formatarMoeda } from '../../core/formatacao/moeda';
import { painelKeys } from '../painel/painel.api';
import { GavetaPagamento } from './components/gaveta-pagamento';
import { alterarStatusPagamento, listarPagamentos, pagamentosKeys, type Pagamento, type StatusPagamento } from './pagamentos.api';
import { estadosPagamento, pagamentoEmAberto, rotulosFormaPagamento } from './pagamentos.rotulos';

const statusValidos: StatusPagamento[] = ['Pendente', 'AguardandoConfirmacao', 'Pago', 'Reembolsado', 'Cancelado'];
const TAMANHO_PAGINA = 20;

const mensagens: Partial<Record<StatusPagamento, string>> = {
  Pago: 'Pagamento marcado como pago.',
  Reembolsado: 'Pagamento reembolsado.',
  Cancelado: 'Pagamento cancelado.',
};

export default function PagamentosPage() {
  const queryClient = useQueryClient();
  const { atualizar, lerOpcao, pagina } = useParametrosUrl();
  const [criando, setCriando] = useState(false);
  const [pendente, setPendente] = useState<{ pagamento: Pagamento; status: 'Reembolsado' | 'Cancelado' } | null>(null);

  const status = lerOpcao('status', statusValidos);
  const filtro = { status, pagina, tamanhoPagina: TAMANHO_PAGINA };

  const listaQuery = useQuery({
    queryKey: pagamentosKeys.lista(filtro),
    queryFn: ({ signal }) => listarPagamentos(filtro, { signal }),
    placeholderData: keepPreviousData,
  });

  const alterarStatus = useMutation({
    mutationFn: ({ id, novoStatus }: { id: string; novoStatus: StatusPagamento }) =>
      alterarStatusPagamento(id, novoStatus, novoStatus === 'Pago' ? new Date().toISOString() : null),
    onSuccess: async (_pagamento, { novoStatus }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: pagamentosKeys.todos }),
        queryClient.invalidateQueries({ queryKey: painelKeys.todos }),
      ]);
      notificar.sucesso(mensagens[novoStatus] ?? 'Status atualizado.');
      setPendente(null);
    },
    onError: (erro) => {
      notificar.erro(mensagemDeErro(erro, 'Não foi possível atualizar o pagamento.'));
      setPendente(null);
    },
  });

  const { data, isPending, error, isFetching, isPlaceholderData, refetch } = listaQuery;
  const resumo = data?.resumo;
  const filtrado = status !== '';

  return (
    <Pagina largura="ampla" className="gap-6">
      <CabecalhoPagina
        titulo="Financeiro"
        acoes={
          <Botao variante="primario" onClick={() => setCriando(true)}>
            <Plus size={16} aria-hidden="true" />
            Novo pagamento
          </Botao>
        }
        meta={
          resumo ? (
            <ul className="flex flex-wrap gap-x-6 gap-y-1.5" aria-label="Totais">
              {[
                { rotulo: 'Recebido', valor: resumo.recebido, estado: estadosPagamento.Pago },
                { rotulo: 'Pendente', valor: resumo.pendente, estado: estadosPagamento.Pendente },
                { rotulo: 'Reembolsado', valor: resumo.reembolsado, estado: estadosPagamento.Reembolsado },
              ].map(({ rotulo, valor, estado }) => (
                <li key={rotulo} className="inline-flex items-center gap-2 text-base">
                  <MarcaEstado forma={estado.marca} tom={estado.tom} />
                  <span className="text-ink-muted">{rotulo}</span>
                  <span className="num font-semibold text-ink">{formatarMoeda(valor)}</span>
                </li>
              ))}
            </ul>
          ) : undefined
        }
      />

      <GrupoSegmentado
        rotulo="Filtrar por estado"
        valor={status}
        aoMudar={(valor) => atualizar({ status: valor || null, pagina: null })}
        opcoes={[
          { valor: '', rotulo: 'Todos' },
          { valor: 'Pendente', rotulo: 'Pendentes' },
          { valor: 'Pago', rotulo: 'Pagos' },
          { valor: 'Reembolsado', rotulo: 'Reembolsados' },
          { valor: 'Cancelado', rotulo: 'Cancelados' },
        ]}
      />

      {isPending ? (
        <EsqueletoLinhas quantidade={8} />
      ) : error && !data ? (
        <EstadoErro titulo="Financeiro indisponível" mensagem={mensagemDeErro(error, 'Tente novamente em instantes.')} aoTentarNovamente={() => void refetch()} recarregando={isFetching} />
      ) : data && data.itens.length === 0 ? (
        <EstadoVazio
          icone={Wallet}
          titulo={filtrado ? 'Nenhum pagamento neste filtro' : 'Nenhum pagamento registrado'}
          descricao={filtrado ? 'Escolha outro estado para ver os demais pagamentos.' : 'Registre cobranças avulsas ou crie o pagamento ao agendar uma consulta.'}
          acao={
            filtrado ? (
              <Botao variante="secundario" onClick={() => atualizar({ status: null, pagina: null })}>
                Ver todos
              </Botao>
            ) : (
              <Botao variante="secundario" onClick={() => setCriando(true)}>
                Novo pagamento
              </Botao>
            )
          }
        />
      ) : data ? (
        <div aria-busy={isFetching} className={isPlaceholderData ? 'opacity-60 transition-opacity duration-150' : 'transition-opacity duration-150'}>
          <Tabela rotulo="Pagamentos">
            <CabecalhoTabela>
              <tr>
                <ColunaTabela>Paciente</ColunaTabela>
                <ColunaTabela className="text-right">Valor</ColunaTabela>
                <ColunaTabela ocultarAte="md">Forma</ColunaTabela>
                <ColunaTabela ocultarAte="lg">Vencimento</ColunaTabela>
                <ColunaTabela ocultarAte="lg">Pago em</ColunaTabela>
                <ColunaTabela ocultarAte="sm">Estado</ColunaTabela>
                <ColunaTabela className="w-px">
                  <span className="sr-only">Ações</span>
                </ColunaTabela>
              </tr>
            </CabecalhoTabela>
            <tbody>
              {data.itens.map((pagamento) => {
                const estado = descreverEstado(estadosPagamento, pagamento.status);
                const emAberto = pagamentoEmAberto(pagamento.status);
                return (
                  <LinhaTabela key={pagamento.id}>
                    <CelulaTabela>
                      <Link to={`/pacientes/${pagamento.pacienteId}`} className="font-medium text-ink no-underline hover:underline">
                        {pagamento.paciente}
                      </Link>
                      <span className="mt-0.5 block sm:hidden">
                        <EstadoRotulado estado={estado} compacto />
                      </span>
                      {pagamento.observacao ? <span className="block max-w-24 truncate text-sm text-ink-muted min-[400px]:max-w-32 sm:max-w-xs">{pagamento.observacao}</span> : null}
                    </CelulaTabela>
                    <CelulaTabela className="num whitespace-nowrap text-right font-semibold">{formatarMoeda(pagamento.valor)}</CelulaTabela>
                    <CelulaTabela ocultarAte="md" className="text-ink-muted">
                      {rotuloDe(rotulosFormaPagamento, pagamento.formaPagamento)}
                    </CelulaTabela>
                    <CelulaTabela ocultarAte="lg" className="num text-ink-muted">
                      {formatarData(pagamento.vencimentoEm, '—')}
                    </CelulaTabela>
                    <CelulaTabela ocultarAte="lg" className="num text-ink-muted">
                      {formatarData(pagamento.pagoEm, '—')}
                    </CelulaTabela>
                    <CelulaTabela ocultarAte="sm">
                      <EstadoRotulado estado={estado} compacto />
                    </CelulaTabela>
                    <CelulaTabela className="whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        {emAberto ? (
                          <Botao
                            variante="discreto"
                            tamanho="pequeno"
                            className="font-semibold text-accent-ink hover:bg-accent-wash hover:text-accent-ink max-sm:size-9 max-sm:px-0 max-sm:pointer-coarse:size-11"
                            disabled={alterarStatus.isPending}
                            onClick={() => alterarStatus.mutate({ id: pagamento.id, novoStatus: 'Pago' })}
                            aria-label={`Marcar pago: ${pagamento.paciente}`}
                          >
                            <Check size={16} className="sm:hidden" aria-hidden="true" />
                            <span className="max-sm:hidden">Marcar pago</span>
                          </Botao>
                        ) : null}
                        {emAberto || pagamento.status === 'Pago' ? (
                          <MenuAcoes
                            rotulo={`Mais ações do pagamento de ${pagamento.paciente}`}
                            itens={[
                              ...(pagamento.status === 'Pago'
                                ? [{ rotulo: 'Reembolsar…', aoSelecionar: () => setPendente({ pagamento, status: 'Reembolsado' as const }) }]
                                : [{ rotulo: 'Cancelar pagamento…', perigo: true, aoSelecionar: () => setPendente({ pagamento, status: 'Cancelado' as const }) }]),
                            ]}
                          />
                        ) : null}
                      </div>
                    </CelulaTabela>
                  </LinhaTabela>
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

      <GavetaPagamento aberto={criando} aoMudar={setCriando} />

      <Confirmacao
        aberto={pendente !== null}
        aoMudar={(aberto) => !aberto && setPendente(null)}
        titulo={pendente?.status === 'Reembolsado' ? 'Reembolsar este pagamento?' : 'Cancelar este pagamento?'}
        descricao={
          pendente
            ? `${formatarMoeda(pendente.pagamento.valor)} de ${pendente.pagamento.paciente} será marcado como ${pendente.status === 'Reembolsado' ? 'reembolsado' : 'cancelado'}.`
            : ''
        }
        rotuloConfirmar={pendente?.status === 'Reembolsado' ? 'Reembolsar' : 'Cancelar pagamento'}
        rotuloCancelar="Voltar"
        perigoso={pendente?.status === 'Cancelado'}
        carregando={alterarStatus.isPending}
        aoConfirmar={() => pendente && alterarStatus.mutate({ id: pendente.pagamento.id, novoStatus: pendente.status })}
      />
    </Pagina>
  );
}
