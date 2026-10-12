import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, CircleCheck, ExternalLink, FileHeart, UserRound, UserX, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { CarregandoPagina } from '../../components/feedback/esqueleto';
import { EstadoErro } from '../../components/feedback/estados';
import { notificar } from '../../components/feedback/notificar';
import { CabecalhoPagina, Pagina, Secao } from '../../components/layout/pagina';
import { Botao, BotaoLink } from '../../components/ui/botao';
import { AreaTexto, Campo } from '../../components/ui/campo';
import { Confirmacao } from '../../components/ui/dialogo';
import { Dado, Ficha, ItemLista, ListaRegulada } from '../../components/ui/lista';
import { EstadoRotulado } from '../../components/ui/marca-estado';
import { MenuAcoes, type ItemMenu } from '../../components/ui/menu';
import { usePermissoes } from '../../core/autenticacao/permissoes';
import { descreverEstado, rotuloDe } from '../../core/dominio/estado';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import { formatarDataHora, formatarDiaCompleto, formatarIntervaloHora } from '../../core/formatacao/datas';
import { formatarMoeda } from '../../core/formatacao/moeda';
import { capitalizar } from '../../core/formatacao/texto';
import { lembretesKeys } from '../lembretes/lembretes.api';
import { estadosLembrete } from '../lembretes/lembretes.rotulos';
import { pagamentosKeys } from '../pagamentos/pagamentos.api';
import { estadosPagamento } from '../pagamentos/pagamentos.rotulos';
import { painelKeys } from '../painel/painel.api';
import { agendaKeys, alterarStatusConsulta, obterConsulta, obterConfiguracaoAgenda } from './agenda.api';
import { estadosConsulta, rotulosModalidade, rotulosOrigem } from './agenda.rotulos';
import { DialogoRemarcar } from './components/dialogo-remarcar';
import { HistoricoConsulta } from './components/historico-consulta';
import type { StatusConsulta } from './agenda.types';

const consultaFinalizada = (status: StatusConsulta) =>
  status === 'Cancelada' || status === 'Remarcada' || status === 'Realizada' || status === 'NaoCompareceu';

const mensagensStatus: Partial<Record<StatusConsulta, string>> = {
  Confirmada: 'Consulta confirmada.',
  Realizada: 'Consulta marcada como realizada.',
  Cancelada: 'Consulta cancelada.',
  NaoCompareceu: 'Não comparecimento registrado.',
};

type AcaoPendente = 'cancelar' | 'nao-compareceu' | null;

export default function DetalheConsultaPage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const { acessoClinico } = usePermissoes();
  const [acaoPendente, setAcaoPendente] = useState<AcaoPendente>(null);
  const [remarcando, setRemarcando] = useState(false);
  const [justificativa, setJustificativa] = useState('');
  const [erroAcao, setErroAcao] = useState('');

  const consultaQuery = useQuery({
    queryKey: agendaKeys.consulta(id),
    queryFn: ({ signal }) => obterConsulta(id, { signal }),
    enabled: Boolean(id),
  });
  const configQuery = useQuery({ queryKey: agendaKeys.configuracao(), queryFn: ({ signal }) => obterConfiguracaoAgenda({ signal }) });

  const alterarStatus = useMutation({
    mutationFn: ({ status, motivo }: { status: StatusConsulta; motivo?: string }) =>
      alterarStatusConsulta(id, { status, justificativa: motivo?.trim() || null }),
    onSuccess: async (_resultado, { status }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: agendaKeys.todos }),
        queryClient.invalidateQueries({ queryKey: painelKeys.todos }),
        queryClient.invalidateQueries({ queryKey: pagamentosKeys.todos }),
        queryClient.invalidateQueries({ queryKey: lembretesKeys.todos }),
      ]);
      notificar.sucesso(mensagensStatus[status] ?? 'Status atualizado.');
      fecharAcao();
    },
    onError: (erro) => {
      const mensagem = mensagemDeErro(erro, 'Não foi possível alterar o status.');
      if (acaoPendente) setErroAcao(mensagem);
      else notificar.erro(mensagem);
    },
  });

  function fecharAcao() {
    setAcaoPendente(null);
    setJustificativa('');
    setErroAcao('');
  }

  if (consultaQuery.isPending) return <CarregandoPagina rotulo="Carregando a consulta…" />;
  if (consultaQuery.error || !consultaQuery.data) {
    return (
      <EstadoErro
        titulo="Consulta indisponível"
        mensagem={mensagemDeErro(consultaQuery.error, 'Não encontramos esta consulta.')}
        aoTentarNovamente={() => void consultaQuery.refetch()}
        acao={
          <BotaoLink to="/agenda" variante="secundario">
            Voltar à agenda
          </BotaoLink>
        }
      />
    );
  }

  const consulta = consultaQuery.data;
  const estado = descreverEstado(estadosConsulta, consulta.status);
  const finalizada = consultaFinalizada(consulta.status);
  const exigeJustificativa = configQuery.data?.exigeJustificativaCancelamento ?? false;
  const urlSessaoOnline = consulta.linkOnline && /^https?:\/\//i.test(consulta.linkOnline) ? consulta.linkOnline : null;
  const linkProntuario = `/pacientes/${consulta.pacienteId}/prontuario?consultaId=${consulta.id}`;

  const acoesSecundarias: ItemMenu[] = [
    ...(!finalizada
      ? [
          { rotulo: 'Remarcar…', icone: <CalendarClock size={16} />, aoSelecionar: () => setRemarcando(true) },
          ...(consulta.status !== 'Confirmada'
            ? [{ rotulo: 'Marcar como realizada', icone: <CircleCheck size={16} />, aoSelecionar: () => alterarStatus.mutate({ status: 'Realizada' }) }]
            : []),
          { rotulo: 'Registrar não comparecimento…', icone: <UserX size={16} />, aoSelecionar: () => setAcaoPendente('nao-compareceu') },
          { rotulo: 'Cancelar consulta…', icone: <XCircle size={16} />, perigo: true, separador: true, aoSelecionar: () => setAcaoPendente('cancelar') },
        ]
      : []),
    { rotulo: 'Abrir cadastro do paciente', icone: <UserRound size={16} />, para: `/pacientes/${consulta.pacienteId}`, separador: !finalizada },
    ...(acessoClinico ? [{ rotulo: 'Registrar sessão', icone: <FileHeart size={16} />, para: linkProntuario }] : []),
  ];

  return (
    <Pagina largura="padrao">
      <CabecalhoPagina
        titulo={consulta.paciente}
        voltarPara={{ para: '/agenda', rotulo: 'Agenda' }}
        meta={
          <span className="grid gap-1.5">
            <span>
              {capitalizar(formatarDiaCompleto(consulta.inicioEm))} ·{' '}
              <span className="num">{formatarIntervaloHora(consulta.inicioEm, consulta.fimEm)}</span>
            </span>
            <EstadoRotulado estado={estado} key={consulta.status} animar />
          </span>
        }
        acoes={
          <>
            <MenuAcoes itens={acoesSecundarias} rotulo="Mais ações da consulta" gatilho={<Botao variante="secundario">Mais ações</Botao>} />
            {!finalizada && consulta.status !== 'Confirmada' ? (
              <Botao variante="primario" carregando={alterarStatus.isPending} onClick={() => alterarStatus.mutate({ status: 'Confirmada' })}>
                Confirmar consulta
              </Botao>
            ) : null}
            {!finalizada && consulta.status === 'Confirmada' ? (
              <Botao variante="primario" carregando={alterarStatus.isPending} onClick={() => alterarStatus.mutate({ status: 'Realizada' })}>
                Marcar como realizada
              </Botao>
            ) : null}
            {finalizada && consulta.status === 'Realizada' && acessoClinico ? (
              <BotaoLink to={linkProntuario} variante="primario">
                Registrar sessão
              </BotaoLink>
            ) : null}
          </>
        }
      />

      <div className="grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid content-start gap-10">
          <Secao titulo="Detalhes">
            <Ficha>
              <Dado rotulo="Tipo de atendimento">{consulta.tipoAtendimento}</Dado>
              <Dado rotulo="Modalidade">{rotuloDe(rotulosModalidade, consulta.modalidade)}</Dado>
              <Dado rotulo={consulta.linkOnline ? 'Sessão online' : 'Endereço'}>
                {urlSessaoOnline ? (
                  <a href={urlSessaoOnline} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 break-all">
                    {consulta.linkOnline}
                    <ExternalLink size={14} aria-hidden="true" />
                    <span className="sr-only">(abre em nova aba)</span>
                  </a>
                ) : (
                  (consulta.linkOnline ?? consulta.enderecoAtendimento ?? 'Não informado')
                )}
              </Dado>
              {consulta.origem ? <Dado rotulo="Origem">{rotuloDe(rotulosOrigem, consulta.origem)}</Dado> : null}
              <Dado rotulo="Observação administrativa" largo>
                {consulta.observacaoAdministrativa ?? <span className="text-ink-muted">Sem observação.</span>}
              </Dado>
              {consulta.justificativaCancelamento ? (
                <Dado rotulo="Justificativa" largo>
                  {consulta.justificativaCancelamento}
                </Dado>
              ) : null}
            </Ficha>
          </Secao>

          <Secao titulo="Histórico" regua>
            <HistoricoConsulta itens={consulta.historico ?? []} />
          </Secao>
        </div>

        <aside className="grid content-start gap-10">
          <Secao titulo="Pagamentos" acoes={<Link to="/pagamentos" className="text-sm font-medium">Financeiro</Link>}>
            {consulta.pagamentos?.length ? (
              <ListaRegulada>
                {consulta.pagamentos.map((pagamento) => (
                  <ItemLista key={pagamento.id} className="flex items-center justify-between gap-3">
                    <span className="num text-base font-semibold">{formatarMoeda(pagamento.valor)}</span>
                    <EstadoRotulado estado={descreverEstado(estadosPagamento, pagamento.status)} compacto />
                  </ItemLista>
                ))}
              </ListaRegulada>
            ) : (
              <p className="text-base text-ink-muted">Nenhum pagamento vinculado.</p>
            )}
          </Secao>

          <Secao titulo="Lembretes" acoes={<Link to="/lembretes" className="text-sm font-medium">Ver todos</Link>}>
            {consulta.lembretes?.length ? (
              <ListaRegulada>
                {consulta.lembretes.map((lembrete) => (
                  <ItemLista key={lembrete.id} className="flex items-center justify-between gap-3">
                    <span className="num text-base">{formatarDataHora(lembrete.agendadoPara)}</span>
                    <EstadoRotulado estado={descreverEstado(estadosLembrete, lembrete.status)} compacto />
                  </ItemLista>
                ))}
              </ListaRegulada>
            ) : (
              <p className="text-base text-ink-muted">Nenhum lembrete programado.</p>
            )}
          </Secao>
        </aside>
      </div>

      <Confirmacao
        aberto={acaoPendente === 'cancelar'}
        aoMudar={(aberto) => !aberto && fecharAcao()}
        titulo="Cancelar esta consulta?"
        descricao={`A consulta de ${consulta.paciente} será marcada como cancelada e o horário ficará livre.`}
        rotuloConfirmar="Cancelar consulta"
        rotuloCancelar="Manter consulta"
        perigoso
        carregando={alterarStatus.isPending}
        aoConfirmar={() => {
          if (exigeJustificativa && !justificativa.trim()) {
            setErroAcao('Informe a justificativa do cancelamento.');
            return;
          }
          alterarStatus.mutate({ status: 'Cancelada', motivo: justificativa });
        }}
      >
        <div className="grid gap-3">
          <Campo rotulo="Justificativa" opcional={!exigeJustificativa} dica={exigeJustificativa ? 'Exigida pelas regras da agenda.' : undefined}>
            <AreaTexto rows={3} value={justificativa} onChange={(evento) => setJustificativa(evento.target.value)} />
          </Campo>
          {erroAcao ? <p role="alert" className="text-sm text-danger-ink">{erroAcao}</p> : null}
        </div>
      </Confirmacao>

      <Confirmacao
        aberto={acaoPendente === 'nao-compareceu'}
        aoMudar={(aberto) => !aberto && fecharAcao()}
        titulo="Registrar não comparecimento?"
        descricao={`${consulta.paciente} será registrado como ausente nesta consulta.`}
        rotuloConfirmar="Registrar ausência"
        carregando={alterarStatus.isPending}
        aoConfirmar={() => alterarStatus.mutate({ status: 'NaoCompareceu' })}
      >
        {erroAcao ? <p role="alert" className="text-sm text-danger-ink">{erroAcao}</p> : null}
      </Confirmacao>

      <DialogoRemarcar consulta={consulta} aberto={remarcando} aoMudar={setRemarcando} />
    </Pagina>
  );
}
