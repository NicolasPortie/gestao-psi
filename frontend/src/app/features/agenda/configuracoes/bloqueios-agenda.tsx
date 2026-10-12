import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarOff, Plus } from 'lucide-react';
import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { Aviso } from '../../../components/feedback/aviso';
import { CarregandoPagina } from '../../../components/feedback/esqueleto';
import { EstadoErro, EstadoVazio } from '../../../components/feedback/estados';
import { notificar } from '../../../components/feedback/notificar';
import { Botao } from '../../../components/ui/botao';
import { AreaTexto, Campo, Entrada, OpcaoMarcavel } from '../../../components/ui/campo';
import { Confirmacao, Gaveta } from '../../../components/ui/dialogo';
import { Etiqueta } from '../../../components/ui/etiqueta';
import { ItemLista, ListaRegulada } from '../../../components/ui/lista';
import { MenuAcoes } from '../../../components/ui/menu';
import { mensagemDeErro } from '../../../core/erros/mensagem-de-erro';
import { adicionarDias, formatarData, formatarDataHora, inicioDoDia, paraCampoData, paraCampoDataHora } from '../../../core/formatacao/datas';
import { agendaKeys, listarBloqueios, removerBloqueio, salvarBloqueio } from '../agenda.api';
import type { BloqueioAgenda } from '../agenda.types';

/** Quanto no futuro a lista alcança: bloqueios são sempre cadastrados com antecedência. */
const DIAS_A_FRENTE = 365;

const schema = z
  .object({
    titulo: z.string().trim().min(2, 'Informe um título.'),
    descricao: z.string(),
    diaInteiro: z.boolean(),
    inicio: z.string().min(1, 'Informe o início.'),
    fim: z.string().min(1, 'Informe o fim.'),
  })
  .refine((valores) => valores.fim >= valores.inicio, { path: ['fim'], message: 'O fim não pode ser antes do início.' });
type Formulario = z.infer<typeof schema>;

const iniciais: Formulario = { titulo: '', descricao: '', diaInteiro: false, inicio: '', fim: '' };

function paraFormulario(bloqueio: BloqueioAgenda): Formulario {
  const inicio = new Date(bloqueio.inicioEm);
  const fim = new Date(bloqueio.fimEm);
  return {
    titulo: bloqueio.titulo,
    descricao: bloqueio.descricao ?? '',
    diaInteiro: bloqueio.diaInteiro,
    inicio: bloqueio.diaInteiro ? paraCampoData(inicio) : paraCampoDataHora(inicio),
    fim: bloqueio.diaInteiro ? paraCampoData(fim) : paraCampoDataHora(fim),
  };
}

function paraRequisicao(valores: Formulario) {
  const inicio = valores.diaInteiro ? new Date(`${valores.inicio}T00:00:00`) : new Date(valores.inicio);
  const fim = valores.diaInteiro ? new Date(`${valores.fim}T23:59:59`) : new Date(valores.fim);
  return {
    titulo: valores.titulo.trim(),
    descricao: valores.descricao.trim() || null,
    inicioEm: inicio.toISOString(),
    fimEm: fim.toISOString(),
    diaInteiro: valores.diaInteiro,
  };
}

function GavetaBloqueio({ bloqueio, aberto, aoMudar }: { bloqueio: BloqueioAgenda | null; aberto: boolean; aoMudar: (aberto: boolean) => void }) {
  const queryClient = useQueryClient();
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<Formulario>({ resolver: zodResolver(schema), defaultValues: iniciais });

  const diaInteiro = useWatch({ control, name: 'diaInteiro' });

  const salvar = useMutation({
    mutationFn: (valores: Formulario) => salvarBloqueio(bloqueio?.id ?? null, paraRequisicao(valores)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: agendaKeys.todos });
      notificar.sucesso(bloqueio ? 'Bloqueio atualizado.' : 'Bloqueio criado.');
      aoMudar(false);
    },
  });
  const erroApi = salvar.isError ? mensagemDeErro(salvar.error, 'Não foi possível salvar o bloqueio.') : '';
  const { reset: limparErro } = salvar;

  useEffect(() => {
    if (aberto) {
      reset(bloqueio ? paraFormulario(bloqueio) : iniciais);
      limparErro();
    }
  }, [aberto, bloqueio, reset, limparErro]);

  /** Ao trocar entre "dia inteiro" e horário, converte os valores para o formato do outro campo. */
  function alternarDiaInteiro(proximo: boolean) {
    const { inicio, fim } = getValues();
    const converter = (valor: string) => (proximo ? valor.slice(0, 10) : valor ? `${valor}T08:00` : '');
    setValue('inicio', converter(inicio));
    setValue('fim', converter(fim));
  }

  return (
    <Gaveta
      aberto={aberto}
      aoMudar={aoMudar}
      titulo={bloqueio ? 'Editar bloqueio' : 'Novo bloqueio'}
      descricao="Períodos em que a agenda não aceita consultas: férias, congressos, compromissos."
      rodape={
        <>
          <Botao variante="secundario" onClick={() => aoMudar(false)}>
            Cancelar
          </Botao>
          <Botao type="submit" form="form-bloqueio" variante="primario" carregando={salvar.isPending}>
            Salvar
          </Botao>
        </>
      }
    >
      <form id="form-bloqueio" className="grid gap-4" noValidate onSubmit={(evento) => void handleSubmit((valores) => salvar.mutate(valores))(evento)}>
        <Campo rotulo="Título" erro={errors.titulo?.message}>
          <Entrada placeholder="Ex.: Férias" {...register('titulo')} />
        </Campo>
        <OpcaoMarcavel
          tipo="interruptor"
          rotulo="Dia inteiro"
          {...register('diaInteiro', { onChange: (evento: ChangeEvent<HTMLInputElement>) => alternarDiaInteiro(evento.target.checked) })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo={diaInteiro ? 'Primeiro dia' : 'Início'} erro={errors.inicio?.message}>
            <Entrada type={diaInteiro ? 'date' : 'datetime-local'} {...register('inicio')} />
          </Campo>
          <Campo rotulo={diaInteiro ? 'Último dia' : 'Fim'} erro={errors.fim?.message}>
            <Entrada type={diaInteiro ? 'date' : 'datetime-local'} {...register('fim')} />
          </Campo>
        </div>
        <Campo rotulo="Descrição" opcional>
          <AreaTexto rows={3} {...register('descricao')} />
        </Campo>
        {erroApi ? <Aviso tom="perigo">{erroApi}</Aviso> : null}
      </form>
    </Gaveta>
  );
}

export function BloqueiosAgenda() {
  const queryClient = useQueryClient();
  const [edicao, setEdicao] = useState<{ bloqueio: BloqueioAgenda | null } | null>(null);
  const [remocao, setRemocao] = useState<BloqueioAgenda | null>(null);

  const periodo = useMemo(() => {
    const inicio = inicioDoDia();
    return { inicio: inicio.toISOString(), fim: adicionarDias(inicio, DIAS_A_FRENTE).toISOString() };
  }, []);

  const bloqueiosQuery = useQuery({
    queryKey: agendaKeys.bloqueios(periodo.inicio, periodo.fim),
    queryFn: ({ signal }) => listarBloqueios(periodo.inicio, periodo.fim, { signal }),
  });

  const remover = useMutation({
    mutationFn: (bloqueio: BloqueioAgenda) => removerBloqueio(bloqueio.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: agendaKeys.todos });
      notificar.sucesso('Bloqueio removido.');
      setRemocao(null);
    },
    onError: (erro) => {
      notificar.erro(mensagemDeErro(erro, 'Não foi possível remover o bloqueio.'));
      setRemocao(null);
    },
  });

  if (bloqueiosQuery.isPending) return <CarregandoPagina rotulo="Carregando os bloqueios…" />;
  if (bloqueiosQuery.error && !bloqueiosQuery.data) {
    return <EstadoErro mensagem={mensagemDeErro(bloqueiosQuery.error)} aoTentarNovamente={() => void bloqueiosQuery.refetch()} />;
  }

  const bloqueios = [...(bloqueiosQuery.data ?? [])].sort((a, b) => new Date(a.inicioEm).getTime() - new Date(b.inicioEm).getTime());

  return (
    <div className="grid max-w-3xl gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-[60ch] text-base text-ink-muted">Bloqueios dos próximos 12 meses. Eles aparecem na agenda e impedem novos agendamentos no período.</p>
        <Botao variante="primario" onClick={() => setEdicao({ bloqueio: null })}>
          <Plus size={16} aria-hidden="true" />
          Novo bloqueio
        </Botao>
      </div>

      {bloqueios.length === 0 ? (
        <EstadoVazio
          icone={CalendarOff}
          titulo="Nenhum bloqueio programado"
          descricao="Bloqueie férias, congressos ou qualquer período em que você não atenderá."
          acao={
            <Botao variante="secundario" onClick={() => setEdicao({ bloqueio: null })}>
              Criar um bloqueio
            </Botao>
          }
        />
      ) : (
        <ListaRegulada>
          {bloqueios.map((bloqueio) => (
            <ItemLista key={bloqueio.id} className="flex items-start justify-between gap-3">
              <div className="grid gap-0.5">
                <p className="flex flex-wrap items-center gap-2 text-base font-medium text-ink">
                  {bloqueio.titulo}
                  {bloqueio.diaInteiro ? <Etiqueta>Dia inteiro</Etiqueta> : null}
                </p>
                <p className="num text-sm text-ink-muted">
                  {bloqueio.diaInteiro
                    ? `${formatarData(bloqueio.inicioEm)} a ${formatarData(bloqueio.fimEm)}`
                    : `${formatarDataHora(bloqueio.inicioEm)} a ${formatarDataHora(bloqueio.fimEm)}`}
                </p>
                {bloqueio.descricao ? <p className="text-sm text-ink-muted">{bloqueio.descricao}</p> : null}
              </div>
              <MenuAcoes
                rotulo={`Ações do bloqueio ${bloqueio.titulo}`}
                itens={[
                  { rotulo: 'Editar', aoSelecionar: () => setEdicao({ bloqueio }) },
                  { rotulo: 'Remover', perigo: true, separador: true, aoSelecionar: () => setRemocao(bloqueio) },
                ]}
              />
            </ItemLista>
          ))}
        </ListaRegulada>
      )}

      <GavetaBloqueio bloqueio={edicao?.bloqueio ?? null} aberto={edicao !== null} aoMudar={(aberto) => !aberto && setEdicao(null)} />

      <Confirmacao
        aberto={remocao !== null}
        aoMudar={(aberto) => !aberto && setRemocao(null)}
        titulo="Remover este bloqueio?"
        descricao={remocao ? `O período “${remocao.titulo}” voltará a aceitar agendamentos.` : ''}
        rotuloConfirmar="Remover bloqueio"
        perigoso
        carregando={remover.isPending}
        aoConfirmar={() => remocao && remover.mutate(remocao)}
      />
    </div>
  );
}
