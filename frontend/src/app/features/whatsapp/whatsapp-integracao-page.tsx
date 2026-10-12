import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessagesSquare, PlugZap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Aviso } from '../../components/feedback/aviso';
import { CarregandoPagina } from '../../components/feedback/esqueleto';
import { EstadoErro } from '../../components/feedback/estados';
import { notificar } from '../../components/feedback/notificar';
import { CabecalhoPagina, Pagina, Secao } from '../../components/layout/pagina';
import { Botao, BotaoLink } from '../../components/ui/botao';
import { Campo, Entrada, OpcaoMarcavel } from '../../components/ui/campo';
import { Dado, Ficha, ItemLista, ListaRegulada } from '../../components/ui/lista';
import { EstadoRotulado } from '../../components/ui/marca-estado';
import { descreverEstado } from '../../core/dominio/estado';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import { formatarDataHora } from '../../core/formatacao/datas';
import { listarEventosBridge, obterIntegracaoWhatsApp, salvarIntegracaoWhatsApp, testarConexaoWhatsApp, whatsappKeys } from './whatsapp.api';
import { estadosIntegracao } from './whatsapp.rotulos';

const schema = z.object({
  nome: z.string().trim().min(2, 'Informe um nome para a integração.'),
  provedor: z.string().trim().min(2, 'Informe o provedor.'),
  urlBaseBridge: z.string().trim().min(8, 'Informe o endereço do Bridge.'),
  token: z.string(),
  numeroWhatsApp: z.string().trim().min(8, 'Informe o número conectado.'),
  ativo: z.boolean(),
});
type Formulario = z.infer<typeof schema>;

const iniciais: Formulario = { nome: 'WhatsApp Bridge', provedor: 'Bridge', urlBaseBridge: '', token: '', numeroWhatsApp: '', ativo: true };

export default function WhatsAppIntegracaoPage() {
  const queryClient = useQueryClient();
  const [erroApi, setErroApi] = useState('');

  const integracaoQuery = useQuery({ queryKey: whatsappKeys.integracao(), queryFn: ({ signal }) => obterIntegracaoWhatsApp({ signal }) });
  const eventosQuery = useQuery({ queryKey: whatsappKeys.eventos(), queryFn: ({ signal }) => listarEventosBridge({ signal }) });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<Formulario>({ resolver: zodResolver(schema), defaultValues: iniciais });

  const integracao = integracaoQuery.data;
  useEffect(() => {
    if (integracao) {
      reset({
        nome: integracao.nome,
        provedor: integracao.provedor,
        urlBaseBridge: integracao.urlBaseBridge,
        token: '',
        numeroWhatsApp: integracao.numeroWhatsApp,
        ativo: integracao.ativo,
      });
    }
  }, [integracao, reset]);

  const salvar = useMutation({
    mutationFn: (valores: Formulario) =>
      salvarIntegracaoWhatsApp({
        nome: valores.nome.trim(),
        provedor: valores.provedor.trim(),
        urlBaseBridge: valores.urlBaseBridge.trim(),
        token: valores.token.trim() || null,
        numeroWhatsApp: valores.numeroWhatsApp.trim(),
        ativo: valores.ativo,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: whatsappKeys.integracao() });
      notificar.sucesso('Integração salva.');
      setErroApi('');
    },
    onError: (erro) => setErroApi(mensagemDeErro(erro, 'Não foi possível salvar a integração.')),
  });

  const testar = useMutation({
    mutationFn: testarConexaoWhatsApp,
    onSuccess: async (resultado) => {
      await queryClient.invalidateQueries({ queryKey: whatsappKeys.integracao() });
      if (resultado.sucesso) notificar.sucesso(resultado.mensagem);
      else notificar.erro(resultado.mensagem);
    },
    onError: (erro) => notificar.erro(mensagemDeErro(erro, 'Não foi possível testar a conexão.')),
  });

  if (integracaoQuery.isPending) return <CarregandoPagina rotulo="Carregando a integração…" />;
  if (integracaoQuery.error && integracaoQuery.data === undefined) {
    return <EstadoErro titulo="Integração indisponível" mensagem={mensagemDeErro(integracaoQuery.error, 'Tente novamente em instantes.')} aoTentarNovamente={() => void integracaoQuery.refetch()} />;
  }

  const eventos = (eventosQuery.data ?? []).slice(0, 15);

  return (
    <Pagina largura="padrao">
      <CabecalhoPagina
        titulo="Integração WhatsApp"
        descricao="Conecte o Bridge para receber e responder mensagens administrativas. A API nunca devolve o token completo."
        acoes={
          <BotaoLink to="/conversas" variante="secundario">
            <MessagesSquare size={16} aria-hidden="true" />
            Abrir conversas
          </BotaoLink>
        }
      />

      <div className="grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <form className="grid content-start gap-10" noValidate onSubmit={(evento) => void handleSubmit((valores) => salvar.mutate(valores))(evento)}>
          <Secao titulo="Conexão" descricao={integracao ? undefined : 'Nenhuma integração configurada ainda. Preencha os dados do Bridge para começar.'}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo rotulo="Nome" erro={errors.nome?.message}>
                <Entrada {...register('nome')} />
              </Campo>
              <Campo rotulo="Provedor" erro={errors.provedor?.message}>
                <Entrada {...register('provedor')} />
              </Campo>
              <Campo rotulo="Endereço do Bridge" erro={errors.urlBaseBridge?.message} className="sm:col-span-2">
                <Entrada type="url" inputMode="url" placeholder="https://" {...register('urlBaseBridge')} />
              </Campo>
              <Campo rotulo="Número do WhatsApp" erro={errors.numeroWhatsApp?.message}>
                <Entrada inputMode="tel" placeholder="5511999999999" {...register('numeroWhatsApp')} />
              </Campo>
              <Campo rotulo="Token de acesso" dica={integracao ? 'Em branco, mantém o token atual.' : undefined}>
                <Entrada type="password" autoComplete="new-password" {...register('token')} />
              </Campo>
            </div>
            <OpcaoMarcavel tipo="interruptor" rotulo="Integração ativa" descricao="Desativada, o Bridge não recebe nem envia mensagens." {...register('ativo')} />
            {erroApi ? <Aviso tom="perigo">{erroApi}</Aviso> : null}
            <div className="flex flex-wrap gap-2">
              <Botao type="submit" variante="primario" carregando={salvar.isPending} disabled={Boolean(integracao) && !isDirty}>
                Salvar integração
              </Botao>
              {integracao ? (
                <Botao variante="secundario" carregando={testar.isPending} onClick={() => testar.mutate()}>
                  <PlugZap size={16} aria-hidden="true" />
                  Testar conexão
                </Botao>
              ) : null}
            </div>
          </Secao>
        </form>

        <aside className="grid content-start gap-10">
          {integracao ? (
            <Secao titulo="Estado atual">
              <Ficha colunas={1}>
                <Dado rotulo="Situação">
                  <EstadoRotulado estado={descreverEstado(estadosIntegracao, integracao.status)} />
                </Dado>
                <Dado rotulo="Token">
                  <span className="num">{integracao.tokenMascarado}</span>
                </Dado>
                <Dado rotulo="Último teste de conexão">
                  <span className="num">{formatarDataHora(integracao.ultimaConexaoTestadaEm, 'Nunca testado')}</span>
                </Dado>
                {integracao.ultimoErro ? (
                  <Dado rotulo="Último erro">
                    <span className="text-danger-ink">{integracao.ultimoErro}</span>
                  </Dado>
                ) : null}
              </Ficha>
            </Secao>
          ) : null}

          <Secao titulo="Eventos recentes">
            {eventos.length === 0 ? (
              <p className="text-base text-ink-muted">Nenhum evento recebido do Bridge.</p>
            ) : (
              <ListaRegulada>
                {eventos.map((evento) => (
                  <ItemLista key={evento.id} className="py-3">
                    <p className="flex items-center justify-between gap-2 text-base">
                      <span className="truncate font-medium text-ink">{evento.tipoEvento}</span>
                      <EstadoRotulado
                        compacto
                        estado={evento.erroProcessamento ? { rotulo: 'Erro', tom: 'perigo', marca: 'x' } : evento.processado ? { rotulo: 'Processado', tom: 'sucesso', marca: 'check' } : { rotulo: 'Pendente', tom: 'aviso', marca: 'meio' }}
                      />
                    </p>
                    <p className="num text-xs text-ink-muted">{formatarDataHora(evento.criadoEm)}</p>
                    {evento.erroProcessamento ? <p className="text-xs text-danger-ink">{evento.erroProcessamento}</p> : null}
                  </ItemLista>
                ))}
              </ListaRegulada>
            )}
          </Secao>
        </aside>
      </div>
    </Pagina>
  );
}
