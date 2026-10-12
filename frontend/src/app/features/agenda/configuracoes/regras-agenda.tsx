import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { CarregandoPagina } from '../../../components/feedback/esqueleto';
import { EstadoErro } from '../../../components/feedback/estados';
import { notificar } from '../../../components/feedback/notificar';
import { Secao } from '../../../components/layout/pagina';
import { Botao } from '../../../components/ui/botao';
import { Campo, Entrada, OpcaoMarcavel, Selecao } from '../../../components/ui/campo';
import { mensagemDeErro } from '../../../core/erros/mensagem-de-erro';
import { agendaKeys, obterConfiguracaoAgenda, salvarConfiguracaoAgenda } from '../agenda.api';
import { canaisLembreteAutomatico, fusosHorarios, rotulosCanal } from '../agenda.rotulos';
import type { CanalComunicacao, ConfiguracaoAtendimento } from '../agenda.types';

const schema = z.object({
  fusoHorario: z.string().min(3, 'Selecione o fuso horário.'),
  duracaoPadraoMinutos: z.string().min(1, 'Informe a duração.'),
  confirmacaoAutomaticaConsulta: z.boolean(),
  antecedenciaMinimaAgendamentoHoras: z.string(),
  antecedenciaCancelamentoHoras: z.string(),
  antecedenciaRemarcacaoHoras: z.string(),
  exigeJustificativaCancelamento: z.boolean(),
  lembretesAutomaticosAtivos: z.boolean(),
  programarLembreteAoCriarConsulta: z.boolean(),
  programarLembreteAoConfirmar: z.boolean(),
  antecedenciaLembreteHoras: z.string().min(1, 'Informe a antecedência.'),
  canalLembretePadrao: z.enum(['WhatsApp', 'Email', 'Sms', 'Sistema', 'Telefone']),
});
type Formulario = z.infer<typeof schema>;

function numeroOpcional(valor: string): number | null {
  if (!valor.trim()) return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

function paraFormulario(config: ConfiguracaoAtendimento): Formulario {
  return {
    fusoHorario: config.fusoHorario || 'America/Sao_Paulo',
    duracaoPadraoMinutos: String(config.duracaoPadraoMinutos),
    confirmacaoAutomaticaConsulta: config.confirmacaoAutomaticaConsulta,
    antecedenciaMinimaAgendamentoHoras: config.antecedenciaMinimaAgendamentoHoras?.toString() ?? '',
    antecedenciaCancelamentoHoras: config.antecedenciaCancelamentoHoras?.toString() ?? '',
    antecedenciaRemarcacaoHoras: config.antecedenciaRemarcacaoHoras?.toString() ?? '',
    exigeJustificativaCancelamento: config.exigeJustificativaCancelamento,
    lembretesAutomaticosAtivos: config.lembretesAutomaticosAtivos,
    programarLembreteAoCriarConsulta: config.programarLembreteAoCriarConsulta,
    programarLembreteAoConfirmar: config.programarLembreteAoConfirmar,
    antecedenciaLembreteHoras: String(config.antecedenciaLembreteHoras),
    canalLembretePadrao: config.canalLembretePadrao,
  };
}

function paraRequisicao(valores: Formulario): ConfiguracaoAtendimento {
  return {
    fusoHorario: valores.fusoHorario,
    duracaoPadraoMinutos: Number(valores.duracaoPadraoMinutos),
    confirmacaoAutomaticaConsulta: valores.confirmacaoAutomaticaConsulta,
    antecedenciaMinimaAgendamentoHoras: numeroOpcional(valores.antecedenciaMinimaAgendamentoHoras),
    antecedenciaCancelamentoHoras: numeroOpcional(valores.antecedenciaCancelamentoHoras),
    antecedenciaRemarcacaoHoras: numeroOpcional(valores.antecedenciaRemarcacaoHoras),
    exigeJustificativaCancelamento: valores.exigeJustificativaCancelamento,
    lembretesAutomaticosAtivos: valores.lembretesAutomaticosAtivos,
    programarLembreteAoCriarConsulta: valores.programarLembreteAoCriarConsulta,
    programarLembreteAoConfirmar: valores.programarLembreteAoConfirmar,
    antecedenciaLembreteHoras: Number(valores.antecedenciaLembreteHoras),
    canalLembretePadrao: valores.canalLembretePadrao,
  };
}

export function RegrasAgenda() {
  const queryClient = useQueryClient();
  const configQuery = useQuery({ queryKey: agendaKeys.configuracao(), queryFn: ({ signal }) => obterConfiguracaoAgenda({ signal }) });
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<Formulario>({ resolver: zodResolver(schema) });

  const config = configQuery.data;
  useEffect(() => {
    if (config) reset(paraFormulario(config));
  }, [config, reset]);

  const salvar = useMutation({
    mutationFn: (valores: Formulario) => salvarConfiguracaoAgenda(paraRequisicao(valores)),
    onSuccess: async (salva) => {
      reset(paraFormulario(salva));
      await queryClient.invalidateQueries({ queryKey: agendaKeys.configuracao() });
      notificar.sucesso('Regras da agenda salvas.');
    },
    onError: (erro) => notificar.erro(mensagemDeErro(erro, 'Não foi possível salvar as regras.')),
  });

  const lembretesAtivos = useWatch({ control, name: 'lembretesAutomaticosAtivos' });
  const canalAtual: CanalComunicacao = useWatch({ control, name: 'canalLembretePadrao' }) ?? config?.canalLembretePadrao ?? 'Email';
  const canais = Array.from(new Set<CanalComunicacao>([...canaisLembreteAutomatico, canalAtual]));

  if (configQuery.isPending) return <CarregandoPagina rotulo="Carregando as regras…" />;
  if (configQuery.error && !config) {
    return (
      <EstadoErro
        mensagem={mensagemDeErro(configQuery.error, 'Tente novamente em instantes.')}
        aoTentarNovamente={() => void configQuery.refetch()}
        recarregando={configQuery.isFetching}
      />
    );
  }


  return (
    <form className="grid max-w-2xl gap-10" noValidate onSubmit={(evento) => void handleSubmit((valores) => salvar.mutate(valores))(evento)}>
      <Secao titulo="Atendimento" descricao="Valores padrão usados ao criar consultas e para interpretar os horários da agenda.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Fuso horário do consultório" erro={errors.fusoHorario?.message} className="sm:col-span-2">
            <Selecao opcoes={fusosHorarios} {...register('fusoHorario')} />
          </Campo>
          <Campo rotulo="Duração padrão da consulta" dica="Em minutos." erro={errors.duracaoPadraoMinutos?.message}>
            <Entrada type="number" inputMode="numeric" min="1" {...register('duracaoPadraoMinutos')} />
          </Campo>
        </div>
      </Secao>

      <Secao titulo="Prazos" regua descricao="Deixe em branco para não exigir antecedência.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo rotulo="Para agendar" dica="Horas de antecedência.">
            <Entrada type="number" inputMode="numeric" min="0" {...register('antecedenciaMinimaAgendamentoHoras')} />
          </Campo>
          <Campo rotulo="Para cancelar" dica="Horas de antecedência.">
            <Entrada type="number" inputMode="numeric" min="0" {...register('antecedenciaCancelamentoHoras')} />
          </Campo>
          <Campo rotulo="Para remarcar" dica="Horas de antecedência.">
            <Entrada type="number" inputMode="numeric" min="0" {...register('antecedenciaRemarcacaoHoras')} />
          </Campo>
        </div>
        <div className="mt-2 grid gap-4">
          <OpcaoMarcavel
            tipo="interruptor"
            rotulo="Exigir justificativa ao cancelar"
            descricao="O cancelamento só é aceito com um motivo registrado."
            {...register('exigeJustificativaCancelamento')}
          />
          <OpcaoMarcavel
            tipo="interruptor"
            rotulo="Confirmar consultas automaticamente"
            descricao="Novas consultas já entram como confirmadas, sem aguardar resposta."
            {...register('confirmacaoAutomaticaConsulta')}
          />
        </div>
      </Secao>

      <Secao titulo="Lembretes" regua descricao="Mensagens de lembrete enviadas ao paciente antes da consulta.">
        <div className="grid gap-4">
          <OpcaoMarcavel tipo="interruptor" rotulo="Enviar lembretes automáticos" {...register('lembretesAutomaticosAtivos')} />
          <div className={lembretesAtivos ? 'grid gap-4' : 'pointer-events-none grid gap-4 opacity-50'} aria-disabled={!lembretesAtivos}>
            <OpcaoMarcavel tipo="interruptor" rotulo="Programar ao criar a consulta" disabled={!lembretesAtivos} {...register('programarLembreteAoCriarConsulta')} />
            <OpcaoMarcavel tipo="interruptor" rotulo="Programar ao confirmar a consulta" disabled={!lembretesAtivos} {...register('programarLembreteAoConfirmar')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo rotulo="Antecedência do lembrete" dica="Horas antes da consulta." erro={errors.antecedenciaLembreteHoras?.message}>
                <Entrada type="number" inputMode="numeric" min="0" disabled={!lembretesAtivos} {...register('antecedenciaLembreteHoras')} />
              </Campo>
              <Campo rotulo="Canal padrão" dica="WhatsApp depende de uma conversa ativa e é enviado por Conversas.">
                <Selecao
                  disabled={!lembretesAtivos}
                  opcoes={canais.map((canal) => ({ valor: canal, rotulo: rotulosCanal[canal] }))}
                  {...register('canalLembretePadrao')}
                />
              </Campo>
            </div>
          </div>
        </div>
      </Secao>

      <div className="flex items-center gap-3 border-t border-line pt-6">
        <Botao type="submit" variante="primario" carregando={salvar.isPending} disabled={!isDirty}>
          Salvar regras
        </Botao>
        {isDirty ? <span className="text-sm text-ink-muted">Há alterações não salvas.</span> : null}
      </div>
    </form>
  );
}
