import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';

import { Aviso } from '../../../components/feedback/aviso';
import { notificar } from '../../../components/feedback/notificar';
import { Botao } from '../../../components/ui/botao';
import { AreaTexto, Campo, Entrada } from '../../../components/ui/campo';
import { Dialogo } from '../../../components/ui/dialogo';
import { mensagemDeErro } from '../../../core/erros/mensagem-de-erro';
import { formatarHora } from '../../../core/formatacao/datas';
import { lembretesKeys } from '../../lembretes/lembretes.api';
import { painelKeys } from '../../painel/painel.api';
import { agendaKeys, remarcarConsulta } from '../agenda.api';
import type { Consulta } from '../agenda.types';

const schema = z.object({
  data: z.string().min(1, 'Informe a nova data.'),
  hora: z.string().min(1, 'Informe o novo horário.'),
  justificativa: z.string(),
});
type Formulario = z.infer<typeof schema>;

interface DialogoRemarcarProps {
  consulta: Consulta;
  aberto: boolean;
  aoMudar: (aberto: boolean) => void;
  /** Data e hora já escolhidas (ao arrastar na agenda). */
  sugestao?: { data: string; hora: string } | null;
  /** Depois de remarcar, abrir a nova consulta (padrão) ou ficar onde está. */
  abrirNovaConsulta?: boolean;
}

/**
 * Remarcar cria uma nova consulta e mantém esta no histórico como "Remarcada".
 * Disponibilidade, bloqueios, conflitos e prazo mínimo são decididos pelo backend.
 */
export function DialogoRemarcar({ consulta, aberto, aoMudar, sugestao = null, abrirNovaConsulta = true }: DialogoRemarcarProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [erroApi, setErroApi] = useState('');
  const duracaoMs = new Date(consulta.fimEm).getTime() - new Date(consulta.inicioEm).getTime();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Formulario>({ resolver: zodResolver(schema), defaultValues: { data: '', hora: '', justificativa: '' } });

  useEffect(() => {
    if (aberto && sugestao) reset({ data: sugestao.data, hora: sugestao.hora, justificativa: '' });
  }, [aberto, sugestao, reset]);

  const data = useWatch({ control, name: 'data' });
  const hora = useWatch({ control, name: 'hora' });
  const inicio = data && hora ? new Date(`${data}T${hora}:00`) : null;
  const fim = inicio && !Number.isNaN(inicio.getTime()) ? new Date(inicio.getTime() + duracaoMs) : null;

  const mutacao = useMutation({
    mutationFn: (valores: Formulario) => {
      const novoInicio = new Date(`${valores.data}T${valores.hora}:00`);
      return remarcarConsulta(consulta.id, {
        novoInicioEm: novoInicio.toISOString(),
        novoFimEm: new Date(novoInicio.getTime() + duracaoMs).toISOString(),
        justificativa: valores.justificativa.trim() || null,
      });
    },
    onSuccess: async (nova) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: agendaKeys.todos }),
        queryClient.invalidateQueries({ queryKey: painelKeys.todos }),
        queryClient.invalidateQueries({ queryKey: lembretesKeys.todos }),
      ]);
      notificar.sucesso('Consulta remarcada.');
      aoMudar(false);
      reset();
      if (abrirNovaConsulta) await navigate(`/consultas/${nova.id}`);
    },
    onError: (erro) => setErroApi(mensagemDeErro(erro, 'Não foi possível remarcar a consulta.')),
  });

  function alterarAbertura(proximo: boolean) {
    if (!proximo) {
      setErroApi('');
      reset();
    }
    aoMudar(proximo);
  }

  return (
    <Dialogo
      aberto={aberto}
      aoMudar={alterarAbertura}
      titulo="Remarcar consulta"
      descricao="Cria uma nova consulta no novo horário e mantém esta no histórico como remarcada."
      rodape={
        <>
          <Botao variante="secundario" onClick={() => alterarAbertura(false)}>
            Cancelar
          </Botao>
          <Botao variante="primario" carregando={mutacao.isPending} type="submit" form="form-remarcar">
            Remarcar
          </Botao>
        </>
      }
    >
      <form
        id="form-remarcar"
        className="grid gap-4"
        noValidate
        onSubmit={(evento) => {
          setErroApi('');
          void handleSubmit((valores) => mutacao.mutate(valores))(evento);
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Nova data" erro={errors.data?.message}>
            <Entrada type="date" {...register('data')} />
          </Campo>
          <Campo rotulo="Novo horário" erro={errors.hora?.message}>
            <Entrada type="time" {...register('hora')} />
          </Campo>
        </div>
        {fim ? (
          <p className="-mt-1 text-sm text-ink-muted" aria-live="polite">
            Termina às <span className="num font-medium text-ink">{formatarHora(fim)}</span>, mantendo a duração original.
          </p>
        ) : null}
        <Campo rotulo="Justificativa" opcional>
          <AreaTexto rows={3} {...register('justificativa')} />
        </Campo>
        {erroApi ? <Aviso tom="perigo">{erroApi}</Aviso> : null}
      </form>
    </Dialogo>
  );
}
