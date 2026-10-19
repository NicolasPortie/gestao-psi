import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock3, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { EsqueletoLinhas } from '../../components/feedback/esqueleto';
import { EstadoErro, EstadoVazio } from '../../components/feedback/estados';
import { notificar } from '../../components/feedback/notificar';
import { CabecalhoPagina, Pagina } from '../../components/layout/pagina';
import { Botao, BotaoLink } from '../../components/ui/botao';
import { GrupoSegmentado } from '../../components/ui/campo';
import { Confirmacao } from '../../components/ui/dialogo';
import { Etiqueta } from '../../components/ui/etiqueta';
import { EstadoRotulado } from '../../components/ui/marca-estado';
import { MenuAcoes } from '../../components/ui/menu';
import { Paginacao } from '../../components/ui/paginacao';
import { CabecalhoTabela, CelulaTabela, ColunaTabela, LinhaTabela, Tabela } from '../../components/ui/tabela';
import { descreverEstado } from '../../core/dominio/estado';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import { useParametrosUrl } from '../../core/hooks/use-parametros-url';
import { formatarData } from '../../core/formatacao/datas';
import { Aviso } from '../../components/feedback/aviso';
import { formatarDiaCompleto } from '../../core/formatacao/datas';
import { capitalizar } from '../../core/formatacao/texto';
import { GavetaListaEspera } from './components/gaveta-lista-espera';
import { alterarStatusListaEspera, listaEsperaKeys, listarListaEspera, type ListaEsperaItem, type StatusListaEspera } from './lista-espera.api';
import { estadosListaEspera, rotulosPrioridade } from './lista-espera.rotulos';

const statusValidos: StatusListaEspera[] = ['Aguardando', 'Contatado', 'Agendado', 'Cancelado', 'Expirado'];
const TAMANHO_PAGINA = 20;

const tomPrioridade = { 1: 'perigo', 2: 'aviso', 3: 'neutro' } as const;

export default function ListaEsperaPage() {
  const queryClient = useQueryClient();
  const { params, atualizar, lerOpcao, pagina } = useParametrosUrl();
  const [incluindo, setIncluindo] = useState(false);
  const [cancelando, setCancelando] = useState<ListaEsperaItem | null>(null);

  // Sem filtro explícito, a fila mostra quem ainda aguarda; "todos" é uma escolha explícita (?status=todos).
  const todos = params.get('status') === 'todos';
  const status: StatusListaEspera | '' = todos ? '' : lerOpcao('status', statusValidos) || 'Aguardando';
  const filtro = { status, pagina, tamanhoPagina: TAMANHO_PAGINA };

  const listaQuery = useQuery({
    queryKey: listaEsperaKeys.lista(filtro),
    queryFn: ({ signal }) => listarListaEspera(filtro, { signal }),
    placeholderData: keepPreviousData,
  });

  const alterar = useMutation({
    mutationFn: ({ id, novoStatus }: { id: string; novoStatus: StatusListaEspera }) => alterarStatusListaEspera(id, novoStatus),
    onSuccess: async (_resultado, { novoStatus }) => {
      await queryClient.invalidateQueries({ queryKey: listaEsperaKeys.todos });
      notificar.sucesso(novoStatus === 'Contatado' ? 'Marcado como contatado.' : 'Item cancelado.');
      setCancelando(null);
    },
    onError: (erro) => {
      notificar.erro(mensagemDeErro(erro, 'Não foi possível atualizar a lista de espera.'));
      setCancelando(null);
    },
  });

  const { data, isPending, error, isFetching, isPlaceholderData, refetch } = listaQuery;
  // Chegando de um cancelamento, a vaga liberada vai junto para o agendamento.
  const vaga = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(params.get('vaga') ?? '') ? (params.get('vaga') as string) : null;
  const sufixoVaga = vaga ? `&data=${vaga.slice(0, 10)}&hora=${vaga.slice(11, 16)}` : '';

  return (
    <Pagina largura="ampla" className="gap-6">
      <CabecalhoPagina
        titulo="Lista de espera"
        descricao="Quem aguarda uma vaga, por prioridade. Ao abrir um horário, agende direto daqui."
        acoes={
          <Botao variante="primario" onClick={() => setIncluindo(true)}>
            <Plus size={16} aria-hidden="true" />
            Incluir na lista
          </Botao>
        }
      />

      {vaga ? (
        <Aviso tom="info">
          Vaga liberada em {capitalizar(formatarDiaCompleto(new Date(`${vaga}:00`)))} às {vaga.slice(11, 16)}. Ao agendar alguém da lista, data e horário já vêm preenchidos.
        </Aviso>
      ) : null}

      <GrupoSegmentado
        rotulo="Filtrar por estado"
        valor={todos ? 'todos' : status}
        aoMudar={(valor) => atualizar({ status: valor === 'Aguardando' ? null : valor, pagina: null })}
        opcoes={[
          { valor: 'Aguardando', rotulo: 'Aguardando' },
          { valor: 'Contatado', rotulo: 'Contatados' },
          { valor: 'Agendado', rotulo: 'Agendados' },
          { valor: 'Cancelado', rotulo: 'Cancelados' },
          { valor: 'Expirado', rotulo: 'Expirados' },
          { valor: 'todos', rotulo: 'Todos' },
        ]}
      />

      {isPending ? (
        <EsqueletoLinhas quantidade={6} />
      ) : error && !data ? (
        <EstadoErro titulo="Lista de espera indisponível" mensagem={mensagemDeErro(error, 'Tente novamente em instantes.')} aoTentarNovamente={() => void refetch()} recarregando={isFetching} />
      ) : data && data.itens.length === 0 ? (
        <EstadoVazio
          icone={Clock3}
          titulo={status === 'Aguardando' ? 'Ninguém aguardando vaga' : 'Nada neste filtro'}
          descricao={status === 'Aguardando' ? 'Quando um paciente precisar esperar por um horário, inclua-o aqui para não perder o contato.' : 'Escolha outro estado para ver os demais itens.'}
          acao={
            <Botao variante="secundario" onClick={() => setIncluindo(true)}>
              Incluir na lista
            </Botao>
          }
        />
      ) : data ? (
        <div aria-busy={isFetching} className={isPlaceholderData ? 'opacity-60 transition-opacity duration-150' : 'transition-opacity duration-150'}>
          <Tabela rotulo="Lista de espera">
            <CabecalhoTabela>
              <tr>
                <ColunaTabela>Paciente</ColunaTabela>
                <ColunaTabela ocultarAte="md">Atendimento</ColunaTabela>
                <ColunaTabela ocultarAte="sm">Prioridade</ColunaTabela>
                <ColunaTabela ocultarAte="lg">Desde</ColunaTabela>
                <ColunaTabela ocultarAte="sm">Estado</ColunaTabela>
                <ColunaTabela className="w-px">
                  <span className="sr-only">Ações</span>
                </ColunaTabela>
              </tr>
            </CabecalhoTabela>
            <tbody>
              {data.itens.map((item) => {
                const aberto = item.status === 'Aguardando' || item.status === 'Contatado';
                return (
                  <LinhaTabela key={item.id}>
                    <CelulaTabela>
                      <Link to={`/pacientes/${item.pacienteId}`} className="font-medium text-ink no-underline hover:underline">
                        {item.paciente}
                      </Link>
                      <span className="block text-sm text-ink-muted md:hidden">{item.tipoAtendimento ?? 'Qualquer tipo'}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 sm:hidden">
                        <EstadoRotulado estado={descreverEstado(estadosListaEspera, item.status)} compacto />
                        <Etiqueta tom={tomPrioridade[item.prioridade as 1 | 2 | 3] ?? 'neutro'}>{rotulosPrioridade[item.prioridade] ?? `Nível ${item.prioridade}`}</Etiqueta>
                      </span>
                    </CelulaTabela>
                    <CelulaTabela ocultarAte="md" className="text-ink-muted">
                      {item.tipoAtendimento ?? 'Qualquer tipo'}
                    </CelulaTabela>
                    <CelulaTabela ocultarAte="sm">
                      <Etiqueta tom={tomPrioridade[item.prioridade as 1 | 2 | 3] ?? 'neutro'}>{rotulosPrioridade[item.prioridade] ?? `Nível ${item.prioridade}`}</Etiqueta>
                    </CelulaTabela>
                    <CelulaTabela ocultarAte="lg" className="num text-ink-muted">
                      {formatarData(item.criadoEm)}
                    </CelulaTabela>
                    <CelulaTabela ocultarAte="sm">
                      <EstadoRotulado estado={descreverEstado(estadosListaEspera, item.status)} compacto />
                    </CelulaTabela>
                    <CelulaTabela className="whitespace-nowrap text-right">
                      {aberto ? (
                        <div className="flex items-center justify-end gap-1">
                          <BotaoLink
                            to={`/consultas/nova?pacienteId=${item.pacienteId}&listaEsperaId=${item.id}${sufixoVaga}`}
                            variante="secundario"
                            tamanho="pequeno"
                            aria-label={`Agendar ${item.paciente}`}
                          >
                            Agendar
                          </BotaoLink>
                          <MenuAcoes
                            rotulo={`Mais ações para ${item.paciente}`}
                            itens={[
                              ...(item.status === 'Aguardando'
                                ? [{ rotulo: 'Marcar como contatado', aoSelecionar: () => alterar.mutate({ id: item.id, novoStatus: 'Contatado' }) }]
                                : []),
                              { rotulo: 'Cancelar item…', perigo: true, separador: item.status === 'Aguardando', aoSelecionar: () => setCancelando(item) },
                            ]}
                          />
                        </div>
                      ) : null}
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

      <GavetaListaEspera aberto={incluindo} aoMudar={setIncluindo} />

      <Confirmacao
        aberto={cancelando !== null}
        aoMudar={(aberto) => !aberto && setCancelando(null)}
        titulo="Cancelar este item da lista?"
        descricao={cancelando ? `${cancelando.paciente} deixa de aguardar vaga. Você pode incluí-lo novamente depois.` : ''}
        rotuloConfirmar="Cancelar item"
        rotuloCancelar="Voltar"
        perigoso
        carregando={alterar.isPending}
        aoConfirmar={() => cancelando && alterar.mutate({ id: cancelando.id, novoStatus: 'Cancelado' })}
      />
    </Pagina>
  );
}
