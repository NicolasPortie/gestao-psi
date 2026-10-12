import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Aviso } from '../../../components/feedback/aviso';
import { notificar } from '../../../components/feedback/notificar';
import { Botao } from '../../../components/ui/botao';
import { AreaTexto, Campo, GrupoSegmentado, Selecao } from '../../../components/ui/campo';
import { Gaveta } from '../../../components/ui/dialogo';
import { mensagemDeErro } from '../../../core/erros/mensagem-de-erro';
import { agendaKeys, listarTiposAtendimento } from '../../agenda/agenda.api';
import { SeletorPaciente } from '../../pacientes/components/seletor-paciente';
import { criarListaEspera, listaEsperaKeys } from '../lista-espera.api';
import { opcoesPrioridade } from '../lista-espera.rotulos';

const schema = z.object({
  pacienteId: z.string().min(1, 'Selecione o paciente.'),
  tipoAtendimentoId: z.string(),
  prioridade: z.number(),
  observacaoAdministrativa: z.string(),
});
type Formulario = z.infer<typeof schema>;
const iniciais: Formulario = { pacienteId: '', tipoAtendimentoId: '', prioridade: 2, observacaoAdministrativa: '' };

export function GavetaListaEspera({ aberto, aoMudar }: { aberto: boolean; aoMudar: (aberto: boolean) => void }) {
  const queryClient = useQueryClient();
  const [erroApi, setErroApi] = useState('');
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Formulario>({ resolver: zodResolver(schema), defaultValues: iniciais });

  const tiposQuery = useQuery({ queryKey: agendaKeys.tipos(), queryFn: ({ signal }) => listarTiposAtendimento({ signal }), enabled: aberto });
  const tipos = (tiposQuery.data ?? []).filter((tipo) => tipo.ativo);

  const criar = useMutation({
    mutationFn: (valores: Formulario) =>
      criarListaEspera({
        pacienteId: valores.pacienteId,
        tipoAtendimentoId: valores.tipoAtendimentoId || null,
        prioridade: valores.prioridade,
        observacaoAdministrativa: valores.observacaoAdministrativa.trim() || null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: listaEsperaKeys.todos });
      notificar.sucesso('Paciente incluído na lista de espera.');
      reset(iniciais);
      aoMudar(false);
    },
    onError: (erro) => setErroApi(mensagemDeErro(erro, 'Não foi possível incluir na lista de espera.')),
  });

  function alterarAbertura(proximo: boolean) {
    if (!proximo) {
      reset(iniciais);
      setErroApi('');
    }
    aoMudar(proximo);
  }

  return (
    <Gaveta
      aberto={aberto}
      aoMudar={alterarAbertura}
      titulo="Incluir na lista de espera"
      descricao="Pessoas aguardando uma vaga para serem chamadas quando um horário abrir."
      rodape={
        <>
          <Botao variante="secundario" onClick={() => alterarAbertura(false)}>
            Cancelar
          </Botao>
          <Botao type="submit" form="form-lista-espera" variante="primario" carregando={criar.isPending}>
            Incluir
          </Botao>
        </>
      }
    >
      <form
        id="form-lista-espera"
        className="grid gap-4"
        noValidate
        onSubmit={(evento) => {
          setErroApi('');
          void handleSubmit((valores) => criar.mutate(valores))(evento);
        }}
      >
        <Campo rotulo="Paciente" erro={errors.pacienteId?.message}>
          <Controller control={control} name="pacienteId" render={({ field }) => <SeletorPaciente valor={field.value} aoMudar={field.onChange} />} />
        </Campo>
        <Campo rotulo="Tipo de atendimento" opcional>
          <Selecao placeholder="Qualquer tipo" opcoes={tipos.map((tipo) => ({ valor: tipo.id, rotulo: tipo.nome }))} {...register('tipoAtendimentoId')} />
        </Campo>
        <Campo rotulo="Prioridade" grupo>
          <Controller
            control={control}
            name="prioridade"
            render={({ field }) => <GrupoSegmentado rotulo="Prioridade" valor={field.value} aoMudar={field.onChange} opcoes={opcoesPrioridade} />}
          />
        </Campo>
        <Campo rotulo="Observação" opcional>
          <AreaTexto rows={3} placeholder="Preferência de dia ou horário, urgência, indicação…" {...register('observacaoAdministrativa')} />
        </Campo>
        {erroApi ? <Aviso tom="perigo">{erroApi}</Aviso> : null}
      </form>
    </Gaveta>
  );
}
