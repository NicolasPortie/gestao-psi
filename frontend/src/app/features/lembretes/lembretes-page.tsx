import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, RotateCcw } from 'lucide-react';
import { Link } from 'react-router';

import { EsqueletoLinhas } from '../../components/feedback/esqueleto';
import { EstadoErro, EstadoVazio } from '../../components/feedback/estados';
import { notificar } from '../../components/feedback/notificar';
import { CabecalhoPagina, Pagina } from '../../components/layout/pagina';
import { Botao } from '../../components/ui/botao';
import { GrupoSegmentado } from '../../components/ui/campo';
import { EstadoRotulado } from '../../components/ui/marca-estado';
import { Paginacao } from '../../components/ui/paginacao';
import { CabecalhoTabela, CelulaTabela, ColunaTabela, LinhaTabela, Tabela } from '../../components/ui/tabela';
import { descreverEstado, rotuloDe } from '../../core/dominio/estado';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import { useParametrosUrl } from '../../core/hooks/use-parametros-url';
import { formatarDataHora } from '../../core/formatacao/datas';
import { rotulosCanal } from '../agenda/agenda.rotulos';
import {
  cancelarLembrete,
  indicadoresLembretes,
  lembretesKeys,
  listarLembretes,
  tentarNovamenteLembrete,
  type StatusLembrete,
} from './lembretes.api';
import { estadosLembrete, rotulosTipoLembrete } from './lembretes.rotulos';

const statusValidos: StatusLembrete[] = ['Agendado', 'Enviado', 'Falhou', 'Cancelado', 'Ignorado'];
const TAMANHO_PAGINA = 20;

export default function LembretesPage() {
  const queryClient = useQueryClient();
  const { atualizar, lerOpcao, pagina } = useParametrosUrl();
  const status = lerOpcao('status', statusValidos);
  const filtro = { status, pagina, tamanhoPagina: TAMANHO_PAGINA };

  const listaQuery = useQuery({
    queryKey: lembretesKeys.lista(filtro),
    queryFn: ({ signal }) => listarLembretes(filtro, { signal }),
    placeholderData: keepPreviousData,
  });
  const indicadoresQuery = useQuery({ queryKey: lembretesKeys.indicadores(), queryFn: ({ signal }) => indicadoresLembretes({ signal }) });

  const acao = useMutation({
    mutationFn: ({ id, tipo }: { id: string; tipo: 'cancelar' | 'reenviar' }) => (tipo === 'cancelar' ? cancelarLembrete(id) : tentarNovamenteLembrete(id)),
    onSuccess: async (_resultado, { tipo }) => {
      await queryClient.invalidateQueries({ queryKey: lembretesKeys.todos });
      notificar.sucesso(tipo === 'cancelar' ? 'Lembrete cancelado.' : 'Reenvio solicitado.');
    },
    onError: (erro) => notificar.erro(mensagemDeErro(erro, 'Não foi possível concluir a operação.')),
  });

  const indicadores = indicadoresQuery.data;
  const { data, isPending, error, isFetching, isPlaceholderData, refetch } = listaQuery;

  return (
    <Pagina largura="ampla" className="gap-6">
      <CabecalhoPagina titulo="Lembretes" descricao="Mensagens de lembrete e confirmação: o que está programado, o que foi enviado e o que falhou." />

      <GrupoSegmentado
        rotulo="Filtrar por estado"
        valor={status}
        aoMudar={(valor) => atualizar({ status: valor || null, pagina: null })}
        opcoes={[
          { valor: '', rotulo: 'Todos' },
          { valor: 'Agendado', rotulo: 'Programados', contagem: indicadores?.programados },
          { valor: 'Enviado', rotulo: 'Enviados', contagem: indicadores?.enviados },
          { valor: 'Falhou', rotulo: 'Falharam', contagem: indicadores?.falhos },
          { valor: 'Cancelado', rotulo: 'Cancelados', contagem: indicadores?.cancelados },
        ]}
      />

      {isPending ? (
        <EsqueletoLinhas quantidade={8} />
      ) : error && !data ? (
        <EstadoErro titulo="Lembretes indisponíveis" mensagem={mensagemDeErro(error, 'Tente novamente em instantes.')} aoTentarNovamente={() => void refetch()} recarregando={isFetching} />
      ) : data && data.itens.length === 0 ? (
        <EstadoVazio
          icone={Bell}
          titulo={status ? 'Nenhum lembrete neste filtro' : 'Nenhum lembrete ainda'}
          descricao={status ? 'Escolha outro estado para ver os demais lembretes.' : 'Os lembretes são programados quando você agenda consultas, segundo as regras da agenda.'}
          acao={
            status ? (
              <Botao variante="secundario" onClick={() => atualizar({ status: null })}>
                Ver todos
              </Botao>
            ) : undefined
          }
        />
      ) : data ? (
        <div aria-busy={isFetching} className={isPlaceholderData ? 'opacity-60 transition-opacity duration-150' : 'transition-opacity duration-150'}>
          <Tabela rotulo="Lembretes">
            <CabecalhoTabela>
              <tr>
                <ColunaTabela className="w-full sm:w-auto">Paciente</ColunaTabela>
                <ColunaTabela ocultarAte="md">Mensagem</ColunaTabela>
                <ColunaTabela ocultarAte="sm">Programado para</ColunaTabela>
                <ColunaTabela ocultarAte="lg">Consulta</ColunaTabela>
                <ColunaTabela>Estado</ColunaTabela>
                <ColunaTabela className="w-px">
                  <span className="sr-only">Ações</span>
                </ColunaTabela>
              </tr>
            </CabecalhoTabela>
            <tbody>
              {data.itens.map((lembrete) => (
                <LinhaTabela key={lembrete.id}>
                  <CelulaTabela className="w-full sm:w-auto">
                    <Link to={`/consultas/${lembrete.consultaId}`} className="font-medium text-ink no-underline [overflow-wrap:anywhere] hover:underline">
                      {lembrete.paciente}
                    </Link>
                    <span className="block text-sm text-ink-muted md:hidden">{rotuloDe(rotulosTipoLembrete, lembrete.tipo)}</span>
                    <span className="num block text-sm text-ink-muted sm:hidden">{formatarDataHora(lembrete.agendadoPara)}</span>
                  </CelulaTabela>
                  <CelulaTabela ocultarAte="md" className="text-ink-muted">
                    {rotuloDe(rotulosTipoLembrete, lembrete.tipo)} · {rotuloDe(rotulosCanal, lembrete.canal)}
                  </CelulaTabela>
                  <CelulaTabela ocultarAte="sm" className="num text-ink-muted">
                    {formatarDataHora(lembrete.agendadoPara)}
                  </CelulaTabela>
                  <CelulaTabela ocultarAte="lg" className="num text-ink-muted">
                    {formatarDataHora(lembrete.consultaInicioEm)}
                  </CelulaTabela>
                  <CelulaTabela className="whitespace-nowrap">
                    <EstadoRotulado estado={descreverEstado(estadosLembrete, lembrete.status)} compacto />
                    {lembrete.erroEnvio ? <span className="mt-0.5 block max-w-40 whitespace-normal text-xs text-danger-ink sm:max-w-64">{lembrete.erroEnvio}</span> : null}
                  </CelulaTabela>
                  <CelulaTabela className="whitespace-nowrap text-right">
                    {lembrete.status === 'Falhou' ? (
                      <Botao
                        variante="secundario"
                        tamanho="pequeno"
                        className="max-sm:size-9 max-sm:px-0 max-sm:pointer-coarse:size-11"
                        disabled={acao.isPending}
                        onClick={() => acao.mutate({ id: lembrete.id, tipo: 'reenviar' })}
                      >
                        <RotateCcw size={14} aria-hidden="true" />
                        <span className="max-sm:sr-only">Tentar novamente</span>
                      </Botao>
                    ) : null}
                    {lembrete.status === 'Agendado' ? (
                      <Botao variante="discreto" tamanho="pequeno" className="max-sm:px-1.5" disabled={acao.isPending} onClick={() => acao.mutate({ id: lembrete.id, tipo: 'cancelar' })}>
                        Cancelar
                      </Botao>
                    ) : null}
                  </CelulaTabela>
                </LinhaTabela>
              ))}
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
