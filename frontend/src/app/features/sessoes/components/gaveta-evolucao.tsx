import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Aviso } from '../../../components/feedback/aviso';
import { notificar } from '../../../components/feedback/notificar';
import { Botao } from '../../../components/ui/botao';
import { AreaTexto, Campo, Entrada, Selecao } from '../../../components/ui/campo';
import { Gaveta } from '../../../components/ui/dialogo';
import { paraOpcoes } from '../../../core/dominio/estado';
import { mensagemDeErro } from '../../../core/erros/mensagem-de-erro';
import { paraCampoDataHora } from '../../../core/formatacao/datas';
import { criarEvolucao, sessoesKeys } from '../sessoes.api';
import { rotulosTipoEvolucao } from '../sessoes.rotulos';

const tipos = ['ObservacaoClinica', 'MarcoEvolutivo', 'HipoteseClinica', 'PlanoTerapeutico', 'Encaminhamento', 'RevisaoCaso'] as const;

const schema = z.object({
  tipo: z.enum(tipos),
  conteudo: z.string().trim().min(1, 'Escreva o conteúdo clínico.'),
  dataEvolucao: z.string().min(1, 'Informe a data.'),
});
type Formulario = z.infer<typeof schema>;

const opcoesTipo = paraOpcoes(rotulosTipoEvolucao);
const valoresIniciais = (): Formulario => ({ tipo: 'ObservacaoClinica', conteudo: '', dataEvolucao: paraCampoDataHora(new Date()) });

interface GavetaEvolucaoProps {
  pacienteId: string;
  aberto: boolean;
  aoMudar: (aberto: boolean) => void;
}

export function GavetaEvolucao({ pacienteId, aberto, aoMudar }: GavetaEvolucaoProps) {
  const queryClient = useQueryClient();
  const [erroApi, setErroApi] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Formulario>({ resolver: zodResolver(schema), defaultValues: valoresIniciais() });

  const salvar = useMutation({
    mutationFn: (valores: Formulario) =>
      criarEvolucao({ pacienteId, tipo: valores.tipo, conteudo: valores.conteudo, dataEvolucao: new Date(valores.dataEvolucao).toISOString() }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sessoesKeys.todos });
      notificar.sucesso('Evolução registrada.');
      reset(valoresIniciais());
      aoMudar(false);
    },
    onError: (erro) => setErroApi(mensagemDeErro(erro, 'Não foi possível registrar a evolução.')),
  });

  function alterarAbertura(proximo: boolean) {
    if (proximo) reset(valoresIniciais());
    else setErroApi('');
    aoMudar(proximo);
  }

  return (
    <Gaveta
      aberto={aberto}
      aoMudar={alterarAbertura}
      largura="34rem"
      titulo="Nova evolução"
      descricao="Registro do desenvolvimento do acompanhamento ao longo do tempo."
      rodape={
        <>
          <Botao variante="secundario" onClick={() => alterarAbertura(false)}>
            Cancelar
          </Botao>
          <Botao type="submit" form="form-evolucao" variante="primario" carregando={salvar.isPending}>
            Registrar evolução
          </Botao>
        </>
      }
    >
      <form
        id="form-evolucao"
        className="grid gap-4"
        noValidate
        onSubmit={(evento) => {
          setErroApi('');
          void handleSubmit((valores) => salvar.mutate(valores))(evento);
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Tipo de registro">
            <Selecao opcoes={opcoesTipo} {...register('tipo')} />
          </Campo>
          <Campo rotulo="Data e hora" erro={errors.dataEvolucao?.message}>
            <Entrada type="datetime-local" {...register('dataEvolucao')} />
          </Campo>
        </div>
        <Campo rotulo="Conteúdo clínico" erro={errors.conteudo?.message}>
          <AreaTexto rows={10} {...register('conteudo')} />
        </Campo>
        {erroApi ? <Aviso tom="perigo">{erroApi}</Aviso> : null}
      </form>
    </Gaveta>
  );
}
