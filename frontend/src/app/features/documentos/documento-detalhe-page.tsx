import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CircleCheck, Send } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router';
import { z } from 'zod';

import { AcessoRestrito } from '../../components/feedback/acesso-restrito';
import { Aviso } from '../../components/feedback/aviso';
import { CarregandoPagina } from '../../components/feedback/esqueleto';
import { EstadoErro } from '../../components/feedback/estados';
import { notificar } from '../../components/feedback/notificar';
import { CabecalhoPagina, Pagina, Secao } from '../../components/layout/pagina';
import { Botao, BotaoLink } from '../../components/ui/botao';
import { AreaTexto, Campo, Entrada, Selecao } from '../../components/ui/campo';
import { Confirmacao, Dialogo } from '../../components/ui/dialogo';
import { ItemLista, ListaRegulada } from '../../components/ui/lista';
import { EstadoRotulado } from '../../components/ui/marca-estado';
import { usePermissoes } from '../../core/autenticacao/permissoes';
import { descreverEstado, rotuloDe } from '../../core/dominio/estado';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import { formatarDataHora } from '../../core/formatacao/datas';
import { documentosKeys, finalizarDocumento, obterDocumento, registrarEntregaDocumento } from './documentos.api';
import { estadosDocumento, rotulosTipoDocumento } from './documentos.rotulos';

const tiposEntrega = [
  { valor: 'Presencial', rotulo: 'Em mãos' },
  { valor: 'Email', rotulo: 'E-mail' },
  { valor: 'WhatsApp', rotulo: 'WhatsApp' },
  { valor: 'PortalPaciente', rotulo: 'Portal do paciente' },
  { valor: 'Outro', rotulo: 'Outro meio' },
];
const rotulosEntrega = Object.fromEntries(tiposEntrega.map((tipo) => [tipo.valor, tipo.rotulo]));

const schemaEntrega = z.object({
  tipoEntrega: z.string().min(1),
  destinatario: z.string().max(180, 'Use até 180 caracteres.'),
  observacao: z.string().max(1000, 'Use até 1000 caracteres.'),
});
type FormularioEntrega = z.infer<typeof schemaEntrega>;

export default function DocumentoDetalhePage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const { acessoClinico } = usePermissoes();
  const [finalizando, setFinalizando] = useState(false);
  const [entregando, setEntregando] = useState(false);
  const [erroEntrega, setErroEntrega] = useState('');

  const documentoQuery = useQuery({
    queryKey: documentosKeys.detalhe(id),
    queryFn: ({ signal }) => obterDocumento(id, { signal }),
    enabled: acessoClinico && Boolean(id),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormularioEntrega>({ resolver: zodResolver(schemaEntrega), defaultValues: { tipoEntrega: 'Presencial', destinatario: '', observacao: '' } });

  const finalizar = useMutation({
    mutationFn: () => finalizarDocumento(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: documentosKeys.todos });
      notificar.sucesso('Documento finalizado.');
      setFinalizando(false);
    },
    onError: (erro) => {
      notificar.erro(mensagemDeErro(erro, 'Não foi possível finalizar o documento.'));
      setFinalizando(false);
    },
  });

  const entregar = useMutation({
    mutationFn: (valores: FormularioEntrega) =>
      registrarEntregaDocumento(id, {
        tipoEntrega: valores.tipoEntrega,
        destinatario: valores.destinatario.trim() || null,
        observacao: valores.observacao.trim() || null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: documentosKeys.todos });
      notificar.sucesso('Entrega registrada.');
      setEntregando(false);
      reset();
    },
    onError: (erro) => setErroEntrega(mensagemDeErro(erro, 'Não foi possível registrar a entrega.')),
  });

  if (!acessoClinico) {
    return (
      <AcessoRestrito
        mensagem="Documentos psicológicos são abertos só pelo psicólogo responsável."
        acao={
          <BotaoLink to="/painel" variante="secundario">
            Voltar para Hoje
          </BotaoLink>
        }
      />
    );
  }
  if (documentoQuery.isPending) return <CarregandoPagina rotulo="Carregando o documento…" />;
  if (documentoQuery.error || !documentoQuery.data) {
    return (
      <EstadoErro
        titulo="Documento indisponível"
        mensagem={mensagemDeErro(documentoQuery.error, 'Não encontramos este documento.')}
        aoTentarNovamente={() => void documentoQuery.refetch()}
        acao={
          <BotaoLink to="/documentos" variante="secundario">
            Voltar aos documentos
          </BotaoLink>
        }
      />
    );
  }

  const documento = documentoQuery.data;
  const editavel = documento.status === 'Rascunho' || documento.status === 'EmRevisao';

  return (
    <Pagina largura="padrao">
      <CabecalhoPagina
        titulo={documento.titulo}
        voltarPara={{ para: '/documentos', rotulo: 'Documentos' }}
        meta={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <EstadoRotulado estado={descreverEstado(estadosDocumento, documento.status)} />
            <span>{rotuloDe(rotulosTipoDocumento, documento.tipo)}</span>
            <Link to={`/pacientes/${documento.pacienteId}`} className="font-medium">
              {documento.paciente}
            </Link>
          </span>
        }
        acoes={
          <>
            {documento.status === 'Finalizado' ? (
              <Botao variante="primario" onClick={() => setEntregando(true)}>
                <Send size={16} aria-hidden="true" />
                Registrar entrega
              </Botao>
            ) : null}
            {editavel ? (
              <Botao variante="primario" onClick={() => setFinalizando(true)}>
                <CircleCheck size={16} aria-hidden="true" />
                Finalizar documento
              </Botao>
            ) : null}
          </>
        }
      />

      <div className="grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Secao titulo="Conteúdo" painel>
          {documento.finalidade || documento.solicitante ? (
            <p className="text-sm text-ink-muted">
              {documento.finalidade ? <>Finalidade: {documento.finalidade}. </> : null}
              {documento.solicitante ? <>Solicitante: {documento.solicitante}.</> : null}
            </p>
          ) : null}
          <article className="rounded-md border border-line bg-field px-6 py-5">
            <p className="max-w-[68ch] whitespace-pre-wrap text-base leading-7 text-ink">{documento.conteudo}</p>
          </article>
        </Secao>

        <aside className="grid content-start gap-10">
          <Secao titulo="Versões">
            <ListaRegulada>
              {documento.versoes.map((versao) => (
                <ItemLista key={versao.id} className="py-3">
                  <p className="text-base font-medium text-ink">
                    Versão <span className="num">{versao.numeroVersao}</span>
                  </p>
                  <p className="text-sm text-ink-muted">
                    <span className="num">{formatarDataHora(versao.criadoEm)}</span>
                    {versao.motivoAlteracao ? ` · ${versao.motivoAlteracao}` : ''}
                  </p>
                </ItemLista>
              ))}
            </ListaRegulada>
          </Secao>

          <Secao titulo="Entregas">
            {documento.entregas.length === 0 ? (
              <p className="text-base text-ink-muted">Nenhuma entrega registrada.</p>
            ) : (
              <ListaRegulada>
                {documento.entregas.map((entrega) => (
                  <ItemLista key={entrega.id} className="py-3">
                    <p className="text-base font-medium text-ink">{rotuloDe(rotulosEntrega, entrega.tipoEntrega)}</p>
                    <p className="text-sm text-ink-muted">
                      <span className="num">{formatarDataHora(entrega.entregueEm)}</span>
                      {entrega.destinatario ? ` · ${entrega.destinatario}` : ''}
                    </p>
                  </ItemLista>
                ))}
              </ListaRegulada>
            )}
          </Secao>
        </aside>
      </div>

      <Confirmacao
        aberto={finalizando}
        aoMudar={setFinalizando}
        titulo="Finalizar este documento?"
        descricao="Depois de finalizado, o conteúdo fica registrado como versão final rastreável e pode ser entregue. Ajustes posteriores geram retificação."
        rotuloConfirmar="Finalizar"
        carregando={finalizar.isPending}
        aoConfirmar={() => finalizar.mutate()}
      />

      <Dialogo
        aberto={entregando}
        aoMudar={(aberto) => {
          setEntregando(aberto);
          if (!aberto) {
            setErroEntrega('');
            reset();
          }
        }}
        titulo="Registrar entrega"
        descricao="Guarda o protocolo de quando e como o documento chegou ao destinatário."
        rodape={
          <>
            <Botao variante="secundario" onClick={() => setEntregando(false)}>
              Cancelar
            </Botao>
            <Botao type="submit" form="form-entrega" variante="primario" carregando={entregar.isPending}>
              Registrar
            </Botao>
          </>
        }
      >
        <form
          id="form-entrega"
          className="grid gap-4"
          noValidate
          onSubmit={(evento) => {
            setErroEntrega('');
            void handleSubmit((valores) => entregar.mutate(valores))(evento);
          }}
        >
          <Campo rotulo="Meio de entrega">
            <Selecao opcoes={tiposEntrega} {...register('tipoEntrega')} />
          </Campo>
          <Campo rotulo="Destinatário" opcional erro={errors.destinatario?.message}>
            <Entrada {...register('destinatario')} />
          </Campo>
          <Campo rotulo="Observação" opcional erro={errors.observacao?.message}>
            <AreaTexto rows={3} {...register('observacao')} />
          </Campo>
          {erroEntrega ? <Aviso tom="perigo">{erroEntrega}</Aviso> : null}
        </form>
      </Dialogo>
    </Pagina>
  );
}
