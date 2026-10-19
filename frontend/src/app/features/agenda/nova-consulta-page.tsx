import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';
import { z } from 'zod';

import { Aviso } from '../../components/feedback/aviso';
import { CarregandoPagina } from '../../components/feedback/esqueleto';
import { notificar } from '../../components/feedback/notificar';
import { CabecalhoPagina, Pagina, Secao } from '../../components/layout/pagina';
import { Botao, BotaoLink } from '../../components/ui/botao';
import { AreaTexto, Campo, Entrada, GrupoSegmentado, OpcaoMarcavel, Selecao } from '../../components/ui/campo';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import { formatarDataCurta, formatarHora } from '../../core/formatacao/datas';
import { formatarMoeda } from '../../core/formatacao/moeda';
import { pluralizar } from '../../core/formatacao/texto';
import { cn } from '../../components/ui/cn';
import { pagamentosKeys } from '../pagamentos/pagamentos.api';
import { SeletorPaciente } from '../pacientes/components/seletor-paciente';
import { obterPacientePorId } from '../pacientes/pacientes.api';
import { pacientesKeys } from '../pacientes/pacientes.keys';
import { painelKeys } from '../painel/painel.api';
import { agendaKeys, criarSerieConsultas, listarHorariosLivres, listarTiposAtendimento, obterConfiguracaoAgenda } from './agenda.api';
import { rotulosModalidade } from './agenda.rotulos';
import type { ModalidadeAtendimento } from './agenda.types';

const modalidades: ModalidadeAtendimento[] = ['Presencial', 'Online', 'Hibrido'];
const repeticoes = ['Nao', 'Semanal', 'Quinzenal'] as const;
const diaMesLongo = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' });
const rotulosRepeticao: Record<(typeof repeticoes)[number], string> = { Nao: 'Não repetir', Semanal: 'Toda semana', Quinzenal: 'A cada 15 dias' };

const schema = z
  .object({
    pacienteId: z.string().min(1, 'Selecione o paciente.'),
    tipoAtendimentoId: z.string().min(1, 'Selecione o tipo de atendimento.'),
    data: z.string().min(1, 'Informe a data.'),
    hora: z.string().min(1, 'Informe o horário.'),
    modalidade: z.enum(modalidades),
    linkOnline: z.string(),
    enderecoAtendimento: z.string(),
    observacaoAdministrativa: z.string(),
    programarLembrete: z.boolean(),
    criarPagamentoPendente: z.boolean(),
    valorPagamento: z.string(),
    repeticao: z.enum(repeticoes),
    ocorrencias: z.string(),
  })
  .refine((d) => d.repeticao === 'Nao' || (Number.isInteger(Number(d.ocorrencias)) && Number(d.ocorrencias) >= 2 && Number(d.ocorrencias) <= 52), {
    message: 'Escolha de 2 a 52 consultas.',
    path: ['ocorrencias'],
  })
  .refine((d) => !d.criarPagamentoPendente || d.valorPagamento.trim() === '' || Number(d.valorPagamento) > 0, {
    message: 'O valor deve ser maior que zero.',
    path: ['valorPagamento'],
  });

type Formulario = z.infer<typeof schema>;

export default function NovaConsultaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const [erroApi, setErroApi] = useState('');

  const tiposQuery = useQuery({ queryKey: agendaKeys.tipos(), queryFn: ({ signal }) => listarTiposAtendimento({ signal }) });
  const configQuery = useQuery({ queryKey: agendaKeys.configuracao(), queryFn: ({ signal }) => obterConfiguracaoAgenda({ signal }) });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<Formulario>({
    resolver: zodResolver(schema),
    defaultValues: {
      pacienteId: params.get('pacienteId') ?? '',
      tipoAtendimentoId: '',
      data: params.get('data') ?? '',
      hora: params.get('hora') ?? '',
      modalidade: 'Presencial',
      linkOnline: '',
      enderecoAtendimento: '',
      observacaoAdministrativa: '',
      programarLembrete: configQuery.data?.programarLembreteAoCriarConsulta ?? true,
      criarPagamentoPendente: false,
      valorPagamento: '',
      repeticao: 'Nao',
      ocorrencias: '8',
    },
  });

  const tiposAtivos = (tiposQuery.data ?? []).filter((tipo) => tipo.ativo);
  const tipoId = useWatch({ control, name: 'tipoAtendimentoId' });
  const data = useWatch({ control, name: 'data' });
  const hora = useWatch({ control, name: 'hora' });
  const modalidade = useWatch({ control, name: 'modalidade' });
  const cobrar = useWatch({ control, name: 'criarPagamentoPendente' });
  const pacienteId = useWatch({ control, name: 'pacienteId' });
  const repeticao = useWatch({ control, name: 'repeticao' });
  const ocorrencias = useWatch({ control, name: 'ocorrencias' });
  const tipo = tiposAtivos.find((candidato) => candidato.id === tipoId);
  const duracao = tipo?.duracaoMinutos ?? configQuery.data?.duracaoPadraoMinutos ?? 50;

  const pacienteQuery = useQuery({
    queryKey: pacientesKeys.detalhe(pacienteId),
    queryFn: ({ signal }) => obterPacientePorId(pacienteId, { signal }),
    enabled: Boolean(pacienteId),
  });
  const valorSessaoPaciente = pacienteQuery.data?.valorSessao ?? null;
  const mensalista = pacienteQuery.data?.modoCobranca === 'Mensal';

  // Horários livres do dia escolhido, já descontando consultas, bloqueios e a antecedência mínima.
  const livresQuery = useQuery({
    queryKey: agendaKeys.horariosLivres(data, duracao),
    queryFn: ({ signal }) => listarHorariosLivres(data, duracao, { signal }),
    enabled: /^\d{4}-\d{2}-\d{2}$/.test(data),
  });

  // O tipo escolhido sugere a modalidade, a menos que a pessoa já tenha escolhido uma.
  useEffect(() => {
    if (tipo && !dirtyFields.modalidade) setValue('modalidade', tipo.modalidadePadrao);
  }, [tipo, dirtyFields.modalidade, setValue]);

  const inicio = data && hora ? new Date(`${data}T${hora}:00`) : null;
  const fimPrevisto = inicio && !Number.isNaN(inicio.getTime()) ? new Date(inicio.getTime() + duracao * 60_000) : null;

  const mutacao = useMutation({
    mutationFn: criarSerieConsultas,
    onSuccess: async (serie, requisicao) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: agendaKeys.todos }),
        queryClient.invalidateQueries({ queryKey: painelKeys.todos }),
        queryClient.invalidateQueries({ queryKey: pacientesKeys.todos }),
        requisicao.criarPagamentoPendente ? queryClient.invalidateQueries({ queryKey: pagamentosKeys.todos }) : Promise.resolve(),
      ]);
      const [primeira] = serie.criadas;
      notificar.sucesso(serie.criadas.length > 1 ? `${pluralizar(serie.criadas.length, 'consulta')} agendadas.` : 'Consulta agendada.');
      if (serie.ignoradas.length > 0) {
        const datas = serie.ignoradas.map((item) => formatarDataCurta(item.inicioEm)).join(', ');
        notificar.info(`Ficaram de fora ${pluralizar(serie.ignoradas.length, 'data')} com o horário ocupado ou fora do atendimento: ${datas}.`);
      }
      if (primeira) await navigate(`/consultas/${primeira.id}`, { replace: true });
    },
    onError: (erro) => setErroApi(mensagemDeErro(erro, 'Não foi possível agendar a consulta.')),
  });

  async function enviar(valores: Formulario) {
    setErroApi('');
    const comeco = new Date(`${valores.data}T${valores.hora}:00`);
    if (Number.isNaN(comeco.getTime())) {
      setErroApi('Data ou horário inválidos.');
      return;
    }
    const mostraLink = valores.modalidade !== 'Presencial';
    const mostraEndereco = valores.modalidade !== 'Online';
    await mutacao.mutateAsync({
      pacienteId: valores.pacienteId,
      tipoAtendimentoId: valores.tipoAtendimentoId,
      listaEsperaId: params.get('listaEsperaId'),
      inicioEm: comeco.toISOString(),
      fimEm: new Date(comeco.getTime() + duracao * 60_000).toISOString(),
      modalidade: valores.modalidade,
      linkOnline: mostraLink ? valores.linkOnline.trim() || null : null,
      enderecoAtendimento: mostraEndereco ? valores.enderecoAtendimento.trim() || null : null,
      observacaoAdministrativa: valores.observacaoAdministrativa.trim() || null,
      programarLembrete: valores.programarLembrete,
      criarPagamentoPendente: valores.criarPagamentoPendente && !mensalista,
      valorPagamento: valores.valorPagamento.trim() ? Number(valores.valorPagamento) : null,
      recorrencia:
        valores.repeticao === 'Nao' ? null : { frequencia: valores.repeticao, ocorrencias: Number(valores.ocorrencias) },
    });
  }

  const livres = livresQuery.data ?? [];
  const totalSerie = Number(ocorrencias);
  const ultimaDaSerie =
    inicio && repeticao !== 'Nao' && totalSerie >= 2
      ? new Date(inicio.getTime() + (totalSerie - 1) * (repeticao === 'Quinzenal' ? 14 : 7) * 86_400_000)
      : null;

  if (tiposQuery.isPending || configQuery.isPending) return <CarregandoPagina rotulo="Preparando o formulário…" />;

  const salvando = isSubmitting || mutacao.isPending;

  return (
    <Pagina largura="estreita">
      <CabecalhoPagina
        titulo="Nova consulta"
        voltarPara={{ para: '/agenda', rotulo: 'Agenda' }}
        descricao="Escolha um dos horários livres ou digite outro. Para acompanhamento contínuo, repita a consulta toda semana."
      />

      <form className="grid gap-10" onSubmit={(evento) => void handleSubmit(enviar)(evento)} noValidate>
        <Secao titulo="Atendimento" painel>
          <div className="grid gap-4">
            <Campo rotulo="Paciente" erro={errors.pacienteId?.message}>
              <Controller
                control={control}
                name="pacienteId"
                render={({ field }) => <SeletorPaciente valor={field.value} aoMudar={field.onChange} />}
              />
            </Campo>
            <Campo
              rotulo="Tipo de atendimento"
              erro={errors.tipoAtendimentoId?.message}
              dica={tiposAtivos.length === 0 ? 'Nenhum tipo ativo. Cadastre um em Configurações.' : undefined}
            >
              <Selecao
                placeholder="Selecione…"
                opcoes={tiposAtivos.map((item) => ({ valor: item.id, rotulo: `${item.nome} · ${item.duracaoMinutos} min` }))}
                {...register('tipoAtendimentoId')}
              />
            </Campo>
            <Campo rotulo="Modalidade" grupo>
              <Controller
                control={control}
                name="modalidade"
                render={({ field }) => (
                  <GrupoSegmentado
                    rotulo="Modalidade"
                    valor={field.value}
                    aoMudar={field.onChange}
                    opcoes={modalidades.map((valor) => ({ valor, rotulo: rotulosModalidade[valor] }))}
                  />
                )}
              />
            </Campo>
          </div>
        </Secao>

        <Secao titulo="Data e horário" painel>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Data" erro={errors.data?.message}>
              <Entrada type="date" {...register('data')} />
            </Campo>
            <Campo rotulo="Horário" erro={errors.hora?.message}>
              <Entrada type="time" {...register('hora')} />
            </Campo>
          </div>
          {data && livresQuery.isSuccess ? (
            <div className="mt-4 grid gap-2">
              <p className="text-sm font-medium text-ink">Horários livres neste dia</p>
              {livres.length === 0 ? (
                <p className="text-sm text-ink-muted">Nenhum horário livre para {duracao} minutos. Escolha outro dia ou digite um horário.</p>
              ) : (
                <ul className="flex flex-wrap gap-1.5" aria-label="Horários livres">
                  {livres.map((livre) => (
                    <li key={livre}>
                      <button
                        type="button"
                        aria-pressed={hora === livre}
                        onClick={() => setValue('hora', livre, { shouldDirty: true, shouldValidate: true })}
                        className={cn(
                          'num h-8 rounded-full border px-3 text-sm font-medium transition-[background-color,border-color,color] duration-150 ease-out pointer-coarse:h-10',
                          hora === livre
                            ? 'border-accent bg-accent text-on-accent'
                            : 'border-line-strong bg-field text-ink hover:border-accent hover:bg-accent-wash',
                        )}
                      >
                        {livre}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
          <p className="mt-3 text-sm text-ink-muted" aria-live="polite">
            {fimPrevisto ? (
              <>
                Termina às <span className="num font-medium text-ink">{formatarHora(fimPrevisto)}</span> · <span className="num">{duracao}</span> minutos
              </>
            ) : (
              <>
                Duração prevista: <span className="num">{duracao}</span> minutos
              </>
            )}
          </p>

          <div className="mt-5 grid gap-4 border-t border-line pt-5">
            <Campo rotulo="Repetir" grupo>
              <Controller
                control={control}
                name="repeticao"
                render={({ field }) => (
                  <GrupoSegmentado
                    rotulo="Repetir"
                    valor={field.value}
                    aoMudar={field.onChange}
                    opcoes={repeticoes.map((valor) => ({ valor, rotulo: rotulosRepeticao[valor] }))}
                  />
                )}
              />
            </Campo>
            {repeticao !== 'Nao' ? (
              <Campo
                rotulo="Quantas consultas"
                erro={errors.ocorrencias?.message}
                dica={
                  ultimaDaSerie
                    ? `Da primeira até ${diaMesLongo.format(ultimaDaSerie)}. Datas com horário ocupado ficam de fora e você é avisado.`
                    : 'Contando a primeira. Datas com horário ocupado ficam de fora e você é avisado.'
                }
              >
                <Entrada type="number" inputMode="numeric" min={2} max={52} step={1} className="sm:max-w-40" {...register('ocorrencias')} />
              </Campo>
            ) : null}
          </div>
        </Secao>

        <Secao titulo="Local" painel>
          <div className="grid gap-4">
            {modalidade !== 'Presencial' ? (
              <Campo rotulo="Link da sessão online" opcional>
                <Entrada type="url" inputMode="url" placeholder="https://" {...register('linkOnline')} />
              </Campo>
            ) : null}
            {modalidade !== 'Online' ? (
              <Campo rotulo="Endereço do atendimento" opcional>
                <Entrada autoComplete="street-address" {...register('enderecoAtendimento')} />
              </Campo>
            ) : null}
            <Campo rotulo="Observação administrativa" opcional dica="Visível somente para a equipe do consultório. Não registre conteúdo clínico aqui.">
              <AreaTexto rows={3} maxLength={2000} {...register('observacaoAdministrativa')} />
            </Campo>
          </div>
        </Secao>

        <Secao titulo="Lembretes e cobrança" painel>
          <div className="grid gap-4">
            <OpcaoMarcavel
              tipo="interruptor"
              rotulo="Programar lembrete automático"
              descricao="O envio segue as regras de antecedência e canal configuradas na agenda."
              {...register('programarLembrete')}
            />
            {mensalista ? (
              <p className="text-sm text-ink-muted">Paciente com mensalidade: as sessões não são cobradas uma a uma.</p>
            ) : (
              <OpcaoMarcavel
                tipo="interruptor"
                rotulo="Cobrar já no agendamento"
                descricao={
                  configQuery.data?.cobrarAoRealizar
                    ? 'Sem isto, a cobrança é criada quando a sessão for marcada como realizada.'
                    : 'Registra a cobrança desta consulta no Financeiro.'
                }
                {...register('criarPagamentoPendente')}
              />
            )}
            {cobrar && !mensalista ? (
              <Campo
                rotulo="Valor da consulta"
                opcional
                dica={
                  valorSessaoPaciente != null
                    ? `Em branco, usa o valor combinado com o paciente: ${formatarMoeda(valorSessaoPaciente)}.`
                    : tipo?.valorPadrao != null
                      ? `Em branco, usa o valor padrão do tipo: ${formatarMoeda(tipo.valorPadrao)}.`
                      : 'Em branco, usa o valor padrão do tipo, quando houver.'
                }
                erro={errors.valorPagamento?.message}
                className="sm:max-w-56"
              >
                <Entrada type="number" inputMode="decimal" step="0.01" min="0" placeholder="0,00" {...register('valorPagamento')} />
              </Campo>
            ) : null}
          </div>
        </Secao>

        {erroApi ? <Aviso tom="perigo">{erroApi}</Aviso> : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <BotaoLink to="/agenda" variante="secundario">
            Cancelar
          </BotaoLink>
          <Botao type="submit" variante="primario" carregando={salvando}>
            {repeticao !== 'Nao' && totalSerie >= 2 ? `Agendar ${totalSerie} consultas` : 'Agendar consulta'}
          </Botao>
        </div>
      </form>
    </Pagina>
  );
}
