import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, UserPlus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

import { EsqueletoLinhas } from '../../components/feedback/esqueleto';
import { EstadoErro, EstadoVazio } from '../../components/feedback/estados';
import { notificar } from '../../components/feedback/notificar';
import { CabecalhoPagina, Pagina } from '../../components/layout/pagina';
import { BotaoLink, Botao } from '../../components/ui/botao';
import { CampoBusca, GrupoSegmentado, OpcaoMarcavel } from '../../components/ui/campo';
import { EstadoRotulado } from '../../components/ui/marca-estado';
import { Avatar } from '../../components/ui/avatar';
import { MenuAcoes } from '../../components/ui/menu';
import { Paginacao } from '../../components/ui/paginacao';
import { CabecalhoTabela, CelulaTabela, ColunaTabela, LinhaTabela, LinkDaLinha, Tabela } from '../../components/ui/tabela';
import { useDebounce } from '../../core/hooks/use-debounce';
import { useParametrosUrl } from '../../core/hooks/use-parametros-url';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import { formatarDataHora } from '../../core/formatacao/datas';
import { pluralizar } from '../../core/formatacao/texto';
import { formatarTelefone, textoOuPadrao } from '../../core/formatacao/pessoas';
import { painelKeys } from '../painel/painel.api';
import { ativarPaciente, inativarPaciente, listarPacientes } from './pacientes.api';
import { pacientesKeys } from './pacientes.keys';
import { estadosPaciente } from './pacientes.rotulos';
import type { PacienteLista, StatusPaciente } from './pacientes.types';

const TAMANHO_PAGINA = 20;
const statusValidos: StatusPaciente[] = ['Ativo', 'Inativo', 'Arquivado'];

function contatoPrincipal(paciente: PacienteLista) {
  return formatarTelefone(paciente.whatsApp ?? paciente.telefone) || textoOuPadrao(paciente.email, 'Sem contato');
}

export default function ListaPacientesPage() {
  const queryClient = useQueryClient();
  const { params, atualizar: atualizarParametros, limpar, lerOpcao, pagina } = useParametrosUrl();

  const status = lerOpcao('status', statusValidos);
  const busca = params.get('busca') ?? '';
  // "Sumidos": já foram atendidos e não têm consulta há 30 dias nem nada marcado.
  const sumidos = params.get('sumidos') === '1';

  // O campo de busca responde na hora; a URL e a consulta seguem com atraso.
  const [textoBusca, setTextoBusca] = useState(busca);
  const buscaAtrasada = useDebounce(textoBusca.trim(), 300);

  useEffect(() => {
    if (buscaAtrasada !== busca) atualizarParametros({ busca: buscaAtrasada || null, pagina: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reage somente ao termo digitado
  }, [buscaAtrasada]);

  const filtro = { busca, status, pagina, tamanhoPagina: TAMANHO_PAGINA, semConsultaHaDias: sumidos ? 30 : undefined };
  const { data, error, isPending, isFetching, isPlaceholderData, refetch } = useQuery({
    queryKey: pacientesKeys.lista(filtro),
    queryFn: ({ signal }) => listarPacientes(filtro, { signal }),
    placeholderData: keepPreviousData,
  });

  const alterarStatus = useMutation({
    mutationFn: (paciente: PacienteLista) => (paciente.status === 'Ativo' ? inativarPaciente(paciente.id) : ativarPaciente(paciente.id)),
    onSuccess: async (paciente) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: pacientesKeys.todos }),
        queryClient.invalidateQueries({ queryKey: painelKeys.todos }),
      ]);
      notificar.sucesso(paciente.status === 'Ativo' ? 'Paciente ativado.' : 'Paciente inativado.');
    },
    onError: (erro) => notificar.erro(mensagemDeErro(erro, 'Não foi possível alterar o paciente.')),
  });

  const resumo = data?.resumo;
  const total = (resumo?.ativos ?? 0) + (resumo?.inativos ?? 0) + (resumo?.arquivados ?? 0);
  const filtrado = Boolean(busca || status || sumidos);

  return (
    <Pagina largura="ampla" className="gap-6">
      <CabecalhoPagina
        titulo="Pacientes"
        meta={resumo ? `${pluralizar(total, 'cadastro')} · ${pluralizar(resumo.ativos, 'ativo')}` : undefined}
        acoes={
          <BotaoLink to="/pacientes/novo" variante="primario">
            <Plus size={16} aria-hidden="true" />
            Novo paciente
          </BotaoLink>
        }
      />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="w-full sm:max-w-sm">
            <CampoBusca
              valor={textoBusca}
              aoMudar={setTextoBusca}
              placeholder="Buscar por nome, e-mail ou telefone"
              aria-label="Buscar paciente"
            />
          </div>
          <GrupoSegmentado
            rotulo="Filtrar por estado"
            valor={status}
            aoMudar={(valor) => atualizarParametros({ status: valor || null, pagina: null })}
            opcoes={[
              { valor: '', rotulo: 'Todos', contagem: resumo ? total : undefined },
              { valor: 'Ativo', rotulo: 'Ativos', contagem: resumo?.ativos },
              { valor: 'Inativo', rotulo: 'Inativos', contagem: resumo?.inativos },
              { valor: 'Arquivado', rotulo: 'Arquivados', contagem: resumo?.arquivados },
            ]}
          />
        </div>
        <OpcaoMarcavel
          tipo="interruptor"
          rotulo="Só quem não vem há mais de 30 dias"
          descricao="Pacientes ativos já atendidos, sem consulta recente nem marcada. Bom momento para um contato."
          checked={sumidos}
          onChange={(evento) => atualizarParametros({ sumidos: evento.target.checked ? '1' : null, pagina: null })}
        />

        {isPending ? (
          <EsqueletoLinhas quantidade={8} />
        ) : error && !data ? (
          <EstadoErro
            titulo="Não foi possível abrir os pacientes"
            mensagem={mensagemDeErro(error, 'Tente novamente em instantes.')}
            aoTentarNovamente={() => void refetch()}
            recarregando={isFetching}
          />
        ) : data && data.itens.length === 0 ? (
          <EstadoVazio
            icone={filtrado ? Users : UserPlus}
            titulo={filtrado ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
            descricao={
              filtrado ? 'Ajuste a busca ou o filtro de estado para ver outros cadastros.' : 'Cadastre o primeiro paciente para começar a agendar e acompanhar a rotina.'
            }
            acao={
              filtrado ? (
                <Botao
                  variante="secundario"
                  onClick={() => {
                    setTextoBusca('');
                    limpar();
                  }}
                >
                  Limpar filtros
                </Botao>
              ) : (
                <BotaoLink to="/pacientes/novo" variante="secundario">
                  Cadastrar paciente
                </BotaoLink>
              )
            }
          />
        ) : data ? (
          <div aria-busy={isFetching} className={isPlaceholderData ? 'opacity-60 transition-opacity duration-150' : 'transition-opacity duration-150'}>
            <Tabela rotulo="Pacientes">
              <CabecalhoTabela>
                <tr>
                  <ColunaTabela>Paciente</ColunaTabela>
                  <ColunaTabela ocultarAte="md">Contato</ColunaTabela>
                  <ColunaTabela ocultarAte="lg">Última consulta</ColunaTabela>
                  <ColunaTabela ocultarAte="md">Próxima consulta</ColunaTabela>
                  <ColunaTabela ocultarAte="sm">Estado</ColunaTabela>
                  <ColunaTabela className="w-px">
                    <span className="sr-only">Ações</span>
                  </ColunaTabela>
                </tr>
              </CabecalhoTabela>
              <tbody>
                {data.itens.map((paciente) => (
                  <LinhaTabela key={paciente.id}>
                    <CelulaTabela>
                      <div className="flex items-center gap-3">
                        <Avatar nome={paciente.nomeCompleto} tamanho="grande" />
                        <div className="grid min-w-0">
                          <LinkDaLinha to={`/pacientes/${paciente.id}`} className="truncate">
                            {paciente.nomeCompleto}
                          </LinkDaLinha>
                          <span className="num truncate text-sm text-ink-muted md:hidden">{contatoPrincipal(paciente)}</span>
                          {paciente.proximaConsulta ? (
                            <span className="num truncate text-sm text-accent-ink md:hidden">Próxima: {formatarDataHora(paciente.proximaConsulta)}</span>
                          ) : null}
                        </div>
                      </div>
                    </CelulaTabela>
                    <CelulaTabela ocultarAte="md" className="num text-ink-muted">
                      {contatoPrincipal(paciente)}
                    </CelulaTabela>
                    <CelulaTabela ocultarAte="lg" className="num text-ink-muted">
                      {formatarDataHora(paciente.ultimaConsulta, 'Sem consulta')}
                    </CelulaTabela>
                    <CelulaTabela ocultarAte="md" className="num text-ink-muted">
                      {formatarDataHora(paciente.proximaConsulta, 'Nada agendado')}
                    </CelulaTabela>
                    <CelulaTabela ocultarAte="sm">
                      <EstadoRotulado estado={estadosPaciente[paciente.status]} compacto />
                    </CelulaTabela>
                    <CelulaTabela className="text-right">
                      <MenuAcoes
                        rotulo={`Ações de ${paciente.nomeCompleto}`}
                        className="relative z-10"
                        itens={[
                          { rotulo: 'Agendar consulta', para: `/consultas/nova?pacienteId=${paciente.id}` },
                          { rotulo: 'Editar cadastro', para: `/pacientes/${paciente.id}/editar` },
                          ...(paciente.status === 'Arquivado'
                            ? []
                            : [
                                {
                                  rotulo: paciente.status === 'Ativo' ? 'Inativar' : 'Ativar',
                                  separador: true,
                                  aoSelecionar: () => alterarStatus.mutate(paciente),
                                },
                              ]),
                        ]}
                      />
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
              aoMudarPagina={(proxima) => atualizarParametros({ pagina: proxima === 1 ? null : String(proxima) })}
              desabilitado={isFetching}
            />
          </div>
        ) : null}
      </div>
    </Pagina>
  );
}
