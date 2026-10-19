import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Link2, MessageCircle, Send } from 'lucide-react';
import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link } from 'react-router';
import { usePermissoes } from '../../core/autenticacao/permissoes';

import { CarregandoPagina, EsqueletoLinhas } from '../../components/feedback/esqueleto';
import { EstadoErro, EstadoVazio } from '../../components/feedback/estados';
import { notificar } from '../../components/feedback/notificar';
import { CabecalhoPagina, Pagina } from '../../components/layout/pagina';
import { Botao, BotaoLink } from '../../components/ui/botao';
import { AreaTexto, OpcaoMarcavel } from '../../components/ui/campo';
import { cn } from '../../components/ui/cn';
import { Confirmacao } from '../../components/ui/dialogo';
import { EstadoRotulado, MarcaEstado } from '../../components/ui/marca-estado';
import { Paginacao } from '../../components/ui/paginacao';
import { descreverEstado } from '../../core/dominio/estado';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import { useParametrosUrl } from '../../core/hooks/use-parametros-url';
import { formatarTempoRelativo } from '../../core/formatacao/datas';
import { formatarTelefone } from '../../core/formatacao/pessoas';
import { SeletorPaciente } from '../pacientes/components/seletor-paciente';
import { painelKeys } from '../painel/painel.api';
import { FioDaConversa } from './components/fio-da-conversa';
import {
  assumirAtendimentoHumano,
  devolverConversaAoAssistente,
  enviarMensagemConversa,
  finalizarConversa,
  listarConversasWhatsApp,
  obterConversaWhatsApp,
  vincularPacienteConversa,
  whatsappKeys,
  type ConversaLista,
} from './whatsapp.api';
import { estadosConversa } from './whatsapp.rotulos';

const TAMANHO_PAGINA = 15;

const nomeDaConversa = (conversa: Pick<ConversaLista, 'nomeContato' | 'telefone'>) =>
  conversa.nomeContato ?? (formatarTelefone(conversa.telefone) || conversa.telefone);

export default function WhatsAppConversasPage() {
  const queryClient = useQueryClient();
  const { pode } = usePermissoes();
  const { params, atualizar, pagina } = useParametrosUrl();
  const apenasHumano = params.get('humano') === '1';
  const selecionadaId = params.get('conversa') ?? '';
  const [texto, setTexto] = useState('');
  const [pacienteParaVincular, setPacienteParaVincular] = useState('');
  const [finalizando, setFinalizando] = useState(false);

  const filtro = {
    ...(apenasHumano ? { atendimentoHumanoNecessario: true as const } : {}),
    pagina,
    tamanhoPagina: TAMANHO_PAGINA,
  };
  const listaQuery = useQuery({
    queryKey: whatsappKeys.conversas(filtro),
    queryFn: ({ signal }) => listarConversasWhatsApp(filtro, { signal }),
    placeholderData: keepPreviousData,
    refetchInterval: 20_000,
  });
  const detalheQuery = useQuery({
    queryKey: whatsappKeys.conversa(selecionadaId),
    queryFn: ({ signal }) => obterConversaWhatsApp(selecionadaId, { signal }),
    enabled: Boolean(selecionadaId),
    refetchInterval: 10_000,
  });

  async function atualizarDados() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: whatsappKeys.todos }),
      queryClient.invalidateQueries({ queryKey: painelKeys.todos }),
    ]);
  }

  const enviar = useMutation({
    mutationFn: () => enviarMensagemConversa(selecionadaId, texto.trim()),
    onSuccess: async () => {
      setTexto('');
      await atualizarDados();
    },
    onError: (erro) => notificar.erro(mensagemDeErro(erro, 'Não foi possível enviar a mensagem.')),
  });
  const assumir = useMutation({
    mutationFn: () => assumirAtendimentoHumano(selecionadaId),
    onSuccess: async () => {
      await atualizarDados();
      notificar.sucesso('Você assumiu a conversa. O assistente não responde mais nela.');
    },
    onError: (erro) => notificar.erro(mensagemDeErro(erro, 'Não foi possível assumir a conversa.')),
  });
  const devolver = useMutation({
    mutationFn: () => devolverConversaAoAssistente(selecionadaId),
    onSuccess: async () => {
      await atualizarDados();
      notificar.sucesso('O assistente voltou a responder esta conversa.');
    },
    onError: (erro) =>
      notificar.erro(mensagemDeErro(erro, 'Não foi possível devolver a conversa ao assistente.')),
  });
  const finalizar = useMutation({
    mutationFn: () => finalizarConversa(selecionadaId),
    onSuccess: async () => {
      await atualizarDados();
      notificar.sucesso('Conversa finalizada.');
      setFinalizando(false);
    },
    onError: (erro) => {
      notificar.erro(mensagemDeErro(erro, 'Não foi possível finalizar a conversa.'));
      setFinalizando(false);
    },
  });
  const vincular = useMutation({
    mutationFn: () => vincularPacienteConversa(selecionadaId, pacienteParaVincular),
    onSuccess: async () => {
      setPacienteParaVincular('');
      await atualizarDados();
      notificar.sucesso('Paciente vinculado à conversa.');
    },
    onError: (erro) =>
      notificar.erro(mensagemDeErro(erro, 'Não foi possível vincular o paciente.')),
  });

  function enviarMensagem(evento?: FormEvent) {
    evento?.preventDefault();
    if (texto.trim() && !enviar.isPending) enviar.mutate();
  }

  function aoTeclar(evento: KeyboardEvent<HTMLTextAreaElement>) {
    if (evento.key === 'Enter' && !evento.shiftKey && !evento.nativeEvent.isComposing) {
      evento.preventDefault();
      enviarMensagem();
    }
  }

  const conversas = listaQuery.data?.itens ?? [];
  const semConversas = listaQuery.isSuccess && conversas.length === 0 && !selecionadaId;
  const detalhe = detalheQuery.data;
  const encerrada =
    detalhe?.status === 'Finalizada' ||
    detalhe?.status === 'Expirada' ||
    detalhe?.status === 'Bloqueada';

  const painelLista = (
    <section
      aria-label="Lista de conversas"
      className={cn('flex min-h-0 flex-col', selecionadaId && 'max-lg:hidden')}
    >
      {listaQuery.isPending ? (
        <EsqueletoLinhas quantidade={6} />
      ) : listaQuery.error && !listaQuery.data ? (
        <EstadoErro
          titulo="Conversas indisponíveis"
          mensagem={mensagemDeErro(listaQuery.error, 'Tente novamente em instantes.')}
          aoTentarNovamente={() => void listaQuery.refetch()}
        />
      ) : conversas.length === 0 ? (
        <EstadoVazio
          compacto
          icone={MessageCircle}
          titulo={apenasHumano ? 'Nenhuma conversa esperando uma pessoa' : 'Sem conversas'}
          descricao="Quando alguém escrever para o número conectado, a conversa aparece aqui."
        />
      ) : (
        <>
          <ul className="scroll-contido min-h-0 flex-1 divide-y divide-line overflow-y-auto rounded-lg border border-line bg-surface">
            {conversas.map((conversa) => {
              const ativa = conversa.id === selecionadaId;
              return (
                <li key={conversa.id}>
                  <button
                    type="button"
                    aria-current={ativa ? 'true' : undefined}
                    onClick={() => atualizar({ conversa: conversa.id })}
                    className={cn(
                      'grid w-full grid-cols-[1fr_auto] gap-x-3 px-3 py-3 text-left transition-colors duration-150 ease-out hover:bg-hover',
                      ativa && 'bg-selected hover:bg-selected',
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {conversa.atendimentoHumanoNecessario ? (
                        <MarcaEstado forma="meio" tom="aviso" tamanho={14} />
                      ) : null}
                      <span className="truncate text-base font-medium text-ink">
                        {nomeDaConversa(conversa)}
                      </span>
                      {conversa.atendimentoHumanoNecessario ? (
                        <span className="sr-only"> (espera uma pessoa da equipe)</span>
                      ) : null}
                    </span>
                    <time
                      className="text-xs text-ink-muted"
                      dateTime={conversa.ultimaMensagemEm ?? undefined}
                    >
                      {formatarTempoRelativo(conversa.ultimaMensagemEm ?? conversa.criadoEm)}
                    </time>
                    <span className="col-span-2 truncate text-sm text-ink-muted">
                      {conversa.previaUltimaMensagem ??
                        descreverEstado(estadosConversa, conversa.status).rotulo}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <Paginacao
            variante="compacta"
            className="mt-2"
            pagina={listaQuery.data?.pagina ?? pagina}
            total={listaQuery.data?.total ?? 0}
            tamanhoPagina={listaQuery.data?.tamanhoPagina ?? TAMANHO_PAGINA}
            aoMudarPagina={(proxima) =>
              atualizar({ pagina: proxima === 1 ? null : String(proxima) })
            }
            desabilitado={listaQuery.isFetching}
          />
        </>
      )}
    </section>
  );

  const painelConversa = (
    <section
      aria-label="Conversa selecionada"
      className={cn(
        'flex min-h-0 flex-col border-line lg:border-l lg:pl-6',
        !selecionadaId && 'max-lg:hidden',
      )}
    >
      {!selecionadaId ? (
        <EstadoVazio
          compacto
          icone={MessageCircle}
          titulo="Selecione uma conversa"
          descricao="O histórico e as respostas aparecem aqui."
          className="my-auto"
        />
      ) : detalheQuery.isPending ? (
        <CarregandoPagina rotulo="Carregando a conversa…" />
      ) : detalheQuery.error || !detalhe ? (
        <EstadoErro
          titulo="Conversa indisponível"
          mensagem={mensagemDeErro(detalheQuery.error, 'Não foi possível abrir a conversa.')}
          aoTentarNovamente={() => void detalheQuery.refetch()}
        />
      ) : (
        <>
          <header className="grid gap-3 border-b border-line pb-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="grid min-w-0 gap-1">
                <Botao
                  variante="discreto"
                  tamanho="pequeno"
                  className="-ml-2 mb-1 w-fit lg:hidden"
                  onClick={() => atualizar({ conversa: null })}
                >
                  <ArrowLeft size={15} aria-hidden="true" />
                  Conversas
                </Botao>
                <h2 className="truncate text-lg font-semibold text-ink">
                  {nomeDaConversa(detalhe)}
                </h2>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
                  <EstadoRotulado
                    estado={descreverEstado(estadosConversa, detalhe.status)}
                    compacto
                  />
                  <span className="num">
                    {formatarTelefone(detalhe.telefone) || detalhe.telefone}
                  </span>
                  {detalhe.paciente && detalhe.pacienteId ? (
                    <Link
                      to={`/pacientes/${detalhe.pacienteId}`}
                      className="inline-flex items-center gap-1 font-medium"
                    >
                      <Link2 size={13} aria-hidden="true" />
                      {detalhe.paciente}
                    </Link>
                  ) : null}
                </p>
                {detalhe.motivoAtendimentoHumano ? (
                  <p className="text-sm text-warning-ink">
                    Por que está com a equipe: {detalhe.motivoAtendimentoHumano}
                  </p>
                ) : null}
              </div>
              {!encerrada ? (
                <div className="flex flex-wrap gap-2">
                  {detalhe.status !== 'AtendimentoHumano' ? (
                    <Botao
                      variante="secundario"
                      tamanho="pequeno"
                      carregando={assumir.isPending}
                      onClick={() => assumir.mutate()}
                    >
                      Assumir a conversa
                    </Botao>
                  ) : (
                    <Botao
                      variante="secundario"
                      tamanho="pequeno"
                      carregando={devolver.isPending}
                      onClick={() => devolver.mutate()}
                    >
                      Devolver ao assistente
                    </Botao>
                  )}
                  <Botao
                    variante="secundario"
                    tamanho="pequeno"
                    onClick={() => setFinalizando(true)}
                  >
                    Finalizar
                  </Botao>
                </div>
              ) : null}
            </div>

            {!detalhe.pacienteId ? (
              <div className="grid gap-2 rounded-md bg-rail p-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="grid gap-1.5">
                  <p className="text-sm font-medium text-ink">
                    Este contato ainda não está vinculado a um paciente.
                  </p>
                  <SeletorPaciente
                    valor={pacienteParaVincular}
                    aoMudar={setPacienteParaVincular}
                    placeholder="Buscar paciente para vincular…"
                  />
                </div>
                <Botao
                  variante="primario"
                  tamanho="medio"
                  disabled={!pacienteParaVincular}
                  carregando={vincular.isPending}
                  onClick={() => vincular.mutate()}
                >
                  Vincular
                </Botao>
              </div>
            ) : null}
          </header>

          <div
            className="scroll-contido min-h-64 flex-1 overflow-y-auto"
            tabIndex={0}
            aria-label="Mensagens da conversa"
          >
            <FioDaConversa mensagens={detalhe.mensagens} />
          </div>

          {encerrada ? (
            <p className="border-t border-line pt-3 text-sm text-ink-muted">
              Esta conversa está{' '}
              {descreverEstado(estadosConversa, detalhe.status).rotulo.toLowerCase()} e não aceita
              novas mensagens.
            </p>
          ) : (
            <form className="grid gap-2 border-t border-line pt-3" onSubmit={enviarMensagem}>
              {detalhe.status === 'Aberta' ? (
                <p className="text-sm text-ink-muted">
                  O assistente está respondendo. Ao enviar uma mensagem, ele para e a conversa fica
                  com a equipe.
                </p>
              ) : null}
              <div className="flex items-end gap-2">
                <label className="grid flex-1">
                  <span className="sr-only">Sua resposta</span>
                  <AreaTexto
                    rows={2}
                    value={texto}
                    onChange={(evento) => setTexto(evento.target.value)}
                    onKeyDown={aoTeclar}
                    placeholder="Escreva sua resposta…"
                    className="min-h-0 resize-none"
                  />
                </label>
                <Botao
                  type="submit"
                  variante="primario"
                  carregando={enviar.isPending}
                  disabled={!texto.trim()}
                  aria-label="Enviar mensagem"
                >
                  <Send size={16} aria-hidden="true" />
                  <span className="max-sm:sr-only">Enviar</span>
                </Botao>
              </div>
            </form>
          )}
        </>
      )}
    </section>
  );

  return (
    <Pagina largura="total" className="gap-6 lg:h-[calc(100dvh-5.5rem)]">
      <CabecalhoPagina
        titulo="Conversas"
        descricao="O assistente responde dúvidas de agenda. Quando alguém pede uma pessoa, a conversa passa para a equipe e aparece aqui. Assuntos clínicos não se tratam por WhatsApp."
        acoes={
          <OpcaoMarcavel
            tipo="interruptor"
            rotulo="Só as que esperam uma pessoa"
            checked={apenasHumano}
            onChange={(evento) =>
              atualizar({
                humano: evento.target.checked ? '1' : null,
                pagina: null,
                conversa: null,
              })
            }
            className="items-center"
          />
        }
      />
      {semConversas ? (
        <EstadoVazio
          icone={MessageCircle}
          titulo={apenasHumano ? 'Nenhuma conversa esperando uma pessoa' : 'Nenhuma conversa ainda'}
          descricao={
            apenasHumano
              ? 'Quando o assistente passar uma conversa para a equipe, ela aparece aqui.'
              : 'Quando alguém escrever para o número conectado, a conversa aparece aqui.'
          }
          acao={
            pode('IntegracaoWhatsApp') ? (
              <BotaoLink to="/configuracoes/whatsapp" variante="secundario">
                Configurar integração
              </BotaoLink>
            ) : undefined
          }
        />
      ) : (
        <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)]">
          {painelLista}
          {painelConversa}
        </div>
      )}

      <Confirmacao
        aberto={finalizando}
        aoMudar={setFinalizando}
        titulo="Finalizar esta conversa?"
        descricao="A conversa deixa de aceitar mensagens. Uma nova mensagem do contato abre outra conversa."
        rotuloConfirmar="Finalizar"
        carregando={finalizar.isPending}
        aoConfirmar={() => finalizar.mutate()}
      />
    </Pagina>
  );
}
