import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';

import { Aviso } from '../../../components/feedback/aviso';
import { notificar } from '../../../components/feedback/notificar';
import { Botao } from '../../../components/ui/botao';
import { AreaTexto, Campo, Entrada, Selecao } from '../../../components/ui/campo';
import { Gaveta } from '../../../components/ui/dialogo';
import { paraOpcoes } from '../../../core/dominio/estado';
import { mensagemDeErro } from '../../../core/erros/mensagem-de-erro';
import { SeletorPaciente } from '../../pacientes/components/seletor-paciente';
import { criarDocumento, documentosKeys } from '../documentos.api';
import { rotulosTipoDocumento } from '../documentos.rotulos';

const tipos = [
  'Declaracao',
  'AtestadoPsicologico',
  'RelatorioPsicologico',
  'RelatorioMultiprofissional',
  'LaudoPsicologico',
  'ParecerPsicologico',
  'Encaminhamento',
  'ResumoAcompanhamento',
  'Devolutiva',
  'InformePsicologico',
  'Outro',
] as const;

const schema = z.object({
  pacienteId: z.string().min(1, 'Selecione o paciente.'),
  tipo: z.enum(tipos),
  titulo: z.string().trim().min(2, 'Informe o título.'),
  finalidade: z.string(),
  solicitante: z.string(),
  conteudo: z.string().trim().min(1, 'Escreva o conteúdo do documento.'),
});
type Formulario = z.infer<typeof schema>;

const iniciais: Formulario = { pacienteId: '', tipo: 'Declaracao', titulo: '', finalidade: '', solicitante: '', conteudo: '' };
const opcoesTipo = paraOpcoes(rotulosTipoDocumento);

export function GavetaDocumento({
  aberto,
  aoMudar,
  pacienteInicial,
}: {
  aberto: boolean;
  aoMudar: (aberto: boolean) => void;
  /** Abre com o paciente já escolhido (vindo da ficha). */
  pacienteInicial?: string;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [erroApi, setErroApi] = useState('');
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Formulario>({ resolver: zodResolver(schema), defaultValues: iniciais });

  useEffect(() => {
    if (aberto && pacienteInicial) reset({ ...iniciais, pacienteId: pacienteInicial });
  }, [aberto, pacienteInicial, reset]);

  const criar = useMutation({
    mutationFn: (valores: Formulario) =>
      criarDocumento({
        pacienteId: valores.pacienteId,
        tipo: valores.tipo,
        titulo: valores.titulo.trim(),
        finalidade: valores.finalidade.trim() || null,
        solicitante: valores.solicitante.trim() || null,
        conteudo: valores.conteudo,
      }),
    onSuccess: async (documento) => {
      await queryClient.invalidateQueries({ queryKey: documentosKeys.todos });
      notificar.sucesso('Rascunho criado.');
      reset(iniciais);
      aoMudar(false);
      await navigate(`/documentos/${documento.id}`);
    },
    onError: (erro) => setErroApi(mensagemDeErro(erro, 'Não foi possível criar o documento.')),
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
      largura="36rem"
      titulo="Novo documento"
      descricao="Cria um rascunho. O documento só ganha valor de entrega depois de finalizado."
      rodape={
        <>
          <Botao variante="secundario" onClick={() => alterarAbertura(false)}>
            Cancelar
          </Botao>
          <Botao type="submit" form="form-documento" variante="primario" carregando={criar.isPending}>
            Criar rascunho
          </Botao>
        </>
      }
    >
      <form
        id="form-documento"
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Tipo de documento">
            <Selecao opcoes={opcoesTipo} {...register('tipo')} />
          </Campo>
          <Campo rotulo="Título" erro={errors.titulo?.message}>
            <Entrada {...register('titulo')} />
          </Campo>
          <Campo rotulo="Finalidade" opcional>
            <Entrada {...register('finalidade')} />
          </Campo>
          <Campo rotulo="Solicitante" opcional>
            <Entrada {...register('solicitante')} />
          </Campo>
        </div>
        <Campo rotulo="Conteúdo" erro={errors.conteudo?.message}>
          <AreaTexto rows={10} {...register('conteudo')} />
        </Campo>
        {erroApi ? <Aviso tom="perigo">{erroApi}</Aviso> : null}
      </form>
    </Gaveta>
  );
}
