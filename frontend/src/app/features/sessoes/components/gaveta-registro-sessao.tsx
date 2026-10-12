import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Aviso } from '../../../components/feedback/aviso';
import { notificar } from '../../../components/feedback/notificar';
import { Botao } from '../../../components/ui/botao';
import { AreaTexto, Campo, Selecao } from '../../../components/ui/campo';
import { Gaveta } from '../../../components/ui/dialogo';
import { descreverEstado } from '../../../core/dominio/estado';
import { mensagemDeErro } from '../../../core/erros/mensagem-de-erro';
import { adicionarDias, formatarDataHora, inicioDoDia } from '../../../core/formatacao/datas';
import { agendaKeys, listarConsultas, obterConsulta } from '../../agenda/agenda.api';
import { estadosConsulta } from '../../agenda/agenda.rotulos';
import { criarRegistroSessao, sessoesKeys } from '../sessoes.api';

const schema = z.object({
  consultaId: z.string().min(1, 'Selecione a consulta.'),
  observacoesClinicas: z.string(),
  evolucao: z.string(),
  encaminhamentos: z.string(),
});
type Formulario = z.infer<typeof schema>;

/** Quantos dias para trás a lista de consultas alcança; consultas mais antigas chegam por link da própria consulta. */
const DIAS_PARA_TRAS = 120;

interface GavetaRegistroSessaoProps {
  pacienteId: string;
  consultaInicialId: string;
  aberto: boolean;
  aoMudar: (aberto: boolean) => void;
}

/** Registro clínico de uma sessão realizada, sempre vinculado a uma consulta do paciente. */
export function GavetaRegistroSessao({ pacienteId, consultaInicialId, aberto, aoMudar }: GavetaRegistroSessaoProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Formulario>({
    resolver: zodResolver(schema),
    defaultValues: { consultaId: consultaInicialId, observacoesClinicas: '', evolucao: '', encaminhamentos: '' },
  });

  const periodo = useMemo(() => {
    const hoje = inicioDoDia();
    return { inicio: adicionarDias(hoje, -DIAS_PARA_TRAS).toISOString(), fim: adicionarDias(hoje, 2).toISOString() };
  }, []);

  const consultasQuery = useQuery({
    queryKey: agendaKeys.consultas(periodo.inicio, periodo.fim, pacienteId),
    queryFn: ({ signal }) => listarConsultas(periodo.inicio, periodo.fim, { signal, pacienteId }),
    enabled: aberto,
  });
  const inicialQuery = useQuery({
    queryKey: agendaKeys.consulta(consultaInicialId),
    queryFn: ({ signal }) => obterConsulta(consultaInicialId, { signal }),
    enabled: aberto && Boolean(consultaInicialId),
  });

  const opcoes = useMemo(() => {
    const lista = (consultasQuery.data ?? []).filter(
      (consulta) => consulta.status !== 'Cancelada' && consulta.status !== 'Remarcada',
    );
    const inicial = inicialQuery.data;
    if (inicial && inicial.pacienteId === pacienteId && !lista.some((consulta) => consulta.id === inicial.id)) lista.push(inicial);
    return lista.sort((a, b) => new Date(b.inicioEm).getTime() - new Date(a.inicioEm).getTime());
  }, [consultasQuery.data, inicialQuery.data, pacienteId]);

  // As opções chegam depois da abertura; reaplica a consulta de origem quando ela aparece na lista.
  useEffect(() => {
    if (aberto && consultaInicialId && opcoes.some((consulta) => consulta.id === consultaInicialId)) setValue('consultaId', consultaInicialId);
  }, [aberto, consultaInicialId, opcoes, setValue]);

  const salvar = useMutation({
    mutationFn: (valores: Formulario) =>
      criarRegistroSessao({
        consultaId: valores.consultaId,
        observacoesClinicas: valores.observacoesClinicas.trim() || null,
        evolucao: valores.evolucao.trim() || null,
        encaminhamentos: valores.encaminhamentos.trim() || null,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: sessoesKeys.todos }),
        queryClient.invalidateQueries({ queryKey: agendaKeys.todos }),
      ]);
      notificar.sucesso('Registro de sessão criado.');
      aoMudar(false);
    },
  });
  const erroApi = salvar.isError ? mensagemDeErro(salvar.error, 'Não foi possível registrar a sessão.') : '';
  const { reset: limparErro } = salvar;

  useEffect(() => {
    if (aberto) {
      reset({ consultaId: consultaInicialId, observacoesClinicas: '', evolucao: '', encaminhamentos: '' });
      limparErro();
    }
  }, [aberto, consultaInicialId, reset, limparErro]);

  return (
    <Gaveta
      aberto={aberto}
      aoMudar={aoMudar}
      largura="34rem"
      titulo="Registrar sessão"
      descricao="Anotações clínicas da sessão realizada. Ficam restritas ao psicólogo."
      rodape={
        <>
          <Botao variante="secundario" onClick={() => aoMudar(false)}>
            Cancelar
          </Botao>
          <Botao type="submit" form="form-sessao" variante="primario" carregando={salvar.isPending}>
            Registrar sessão
          </Botao>
        </>
      }
    >
      <form
        id="form-sessao"
        className="grid gap-4"
        noValidate
        onSubmit={(evento) => void handleSubmit((valores) => salvar.mutate(valores))(evento)}
      >
        <Campo
          rotulo="Consulta"
          erro={errors.consultaId?.message}
          dica={consultasQuery.isSuccess && opcoes.length === 0 ? 'Este paciente não tem consultas recentes para registrar.' : undefined}
        >
          <Selecao
            placeholder="Selecione a consulta…"
            opcoes={opcoes.map((consulta) => ({
              valor: consulta.id,
              rotulo: `${formatarDataHora(consulta.inicioEm)} · ${consulta.tipoAtendimento} · ${descreverEstado(estadosConsulta, consulta.status).rotulo}`,
            }))}
            {...register('consultaId')}
          />
        </Campo>
        <Campo rotulo="Observações clínicas" opcional>
          <AreaTexto rows={5} {...register('observacoesClinicas')} />
        </Campo>
        <Campo rotulo="Evolução" opcional>
          <AreaTexto rows={5} {...register('evolucao')} />
        </Campo>
        <Campo rotulo="Encaminhamentos" opcional>
          <AreaTexto rows={3} {...register('encaminhamentos')} />
        </Campo>
        {erroApi ? <Aviso tom="perigo">{erroApi}</Aviso> : null}
      </form>
    </Gaveta>
  );
}
