import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState, type ChangeEvent } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';

import { Aviso } from '../../components/feedback/aviso';
import { CarregandoPagina } from '../../components/feedback/esqueleto';
import { EstadoErro } from '../../components/feedback/estados';
import { notificar } from '../../components/feedback/notificar';
import { CabecalhoPagina, Pagina, Secao } from '../../components/layout/pagina';
import { Botao, BotaoLink } from '../../components/ui/botao';
import { AreaTexto, Campo, Entrada, GrupoSegmentado, OpcaoMarcavel, Selecao } from '../../components/ui/campo';
import { Dica } from '../../components/ui/dica';
import { paraOpcoes } from '../../core/dominio/estado';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import { formatarCpf, formatarTelefone } from '../../core/formatacao/pessoas';
import { painelKeys } from '../painel/painel.api';
import { atualizarPaciente, criarPaciente, obterPacientePorId } from './pacientes.api';
import { pacientesKeys } from './pacientes.keys';
import { formularioParaAtualizarRequest, formularioParaCriarRequest, pacienteParaFormulario } from './pacientes.mapeadores';
import { estadosPaciente, rotulosTipoContato } from './pacientes.rotulos';
import { formularioPacienteSchema, valoresPadraoFormularioPaciente, type FormularioPacienteValores } from './pacientes.schemas';
import type { StatusPaciente, TipoContatoPaciente } from './pacientes.types';

const opcoesTipoContato = paraOpcoes(rotulosTipoContato);
const opcoesStatus = (Object.keys(estadosPaciente) as StatusPaciente[]).map((valor) => ({ valor, rotulo: estadosPaciente[valor].rotulo }));

function placeholderContato(tipo: TipoContatoPaciente): string {
  if (tipo === 'Email') return 'contato@exemplo.com.br';
  if (tipo === 'Responsavel') return 'Nome e telefone do responsável';
  return '(00) 00000-0000';
}

export default function FormularioPacientePage() {
  const { id } = useParams<{ id: string }>();
  const editando = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [erroApi, setErroApi] = useState('');

  const detalheQuery = useQuery({
    queryKey: pacientesKeys.detalhe(id ?? ''),
    queryFn: ({ signal }) => obterPacientePorId(id!, { signal }),
    enabled: editando,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormularioPacienteValores>({
    resolver: zodResolver(formularioPacienteSchema),
    defaultValues: valoresPadraoFormularioPaciente,
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'contatosAdicionais' });

  useEffect(() => {
    if (detalheQuery.data) reset(pacienteParaFormulario(detalheQuery.data));
  }, [detalheQuery.data, reset]);

  const salvar = useMutation({
    mutationFn: (valores: FormularioPacienteValores) =>
      editando && id ? atualizarPaciente(id, formularioParaAtualizarRequest(valores)) : criarPaciente(formularioParaCriarRequest(valores)),
    onSuccess: async (paciente) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: pacientesKeys.todos }),
        queryClient.invalidateQueries({ queryKey: painelKeys.todos }),
      ]);
      notificar.sucesso('Paciente salvo.');
      await navigate(`/pacientes/${paciente.id}`, { replace: true });
    },
    onError: (erro) => setErroApi(mensagemDeErro(erro, 'Não foi possível salvar o paciente.')),
  });

  function mascarar(campo: 'telefone' | 'whatsApp', valor: string) {
    setValue(campo, formatarTelefone(valor), { shouldDirty: true, shouldValidate: true });
  }

  if (editando && detalheQuery.isPending) return <CarregandoPagina rotulo="Carregando o paciente…" />;
  if (editando && detalheQuery.error) {
    return (
      <EstadoErro
        titulo="Não foi possível carregar o paciente"
        mensagem={mensagemDeErro(detalheQuery.error, 'Tente novamente em instantes.')}
        aoTentarNovamente={() => void detalheQuery.refetch()}
        acao={
          <BotaoLink to="/pacientes" variante="secundario">
            Voltar aos pacientes
          </BotaoLink>
        }
      />
    );
  }

  const salvando = isSubmitting || salvar.isPending;
  const destinoCancelar = editando ? `/pacientes/${id}` : '/pacientes';

  return (
    <Pagina largura="estreita">
      <CabecalhoPagina
        titulo={editando ? 'Editar paciente' : 'Novo paciente'}
        voltarPara={editando ? { para: `/pacientes/${id}`, rotulo: detalheQuery.data?.nomeCompleto ?? 'Paciente' } : { para: '/pacientes', rotulo: 'Pacientes' }}
        descricao="Somente dados administrativos. Anotações clínicas ficam no prontuário."
      />

      <form
        className="grid gap-10"
        noValidate
        onSubmit={(evento) => {
          setErroApi('');
          void handleSubmit((valores) => salvar.mutateAsync(valores).catch(() => undefined))(evento);
        }}
      >
        <Secao titulo="Identificação">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Nome completo" erro={errors.nomeCompleto?.message} className="sm:col-span-2">
              <Entrada autoComplete="off" placeholder="Ex.: Ana Luíza Silveira" {...register('nomeCompleto')} />
            </Campo>
            <Campo rotulo="Data de nascimento" opcional erro={errors.dataNascimento?.message}>
              <Entrada type="date" {...register('dataNascimento')} />
            </Campo>
            <Campo rotulo="CPF" opcional erro={errors.cpf?.message}>
              <Entrada
                inputMode="numeric"
                maxLength={14}
                placeholder="000.000.000-00"
                {...register('cpf', {
                  onChange: (evento: ChangeEvent<HTMLInputElement>) =>
                    setValue('cpf', formatarCpf(evento.target.value), { shouldDirty: true, shouldValidate: true }),
                })}
              />
            </Campo>
            {editando ? (
              <Campo rotulo="Estado do cadastro" grupo className="sm:col-span-2">
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <GrupoSegmentado rotulo="Estado do cadastro" valor={field.value} aoMudar={field.onChange} opcoes={opcoesStatus} />
                  )}
                />
              </Campo>
            ) : null}
          </div>
        </Secao>

        <Secao titulo="Contato" regua>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="WhatsApp" opcional erro={errors.whatsApp?.message}>
              <Entrada
                type="tel"
                inputMode="tel"
                autoComplete="off"
                maxLength={15}
                placeholder="(00) 00000-0000"
                {...register('whatsApp', { onChange: (evento: ChangeEvent<HTMLInputElement>) => mascarar('whatsApp', evento.target.value) })}
              />
            </Campo>
            <Campo rotulo="Telefone" opcional erro={errors.telefone?.message}>
              <Entrada
                type="tel"
                inputMode="tel"
                autoComplete="off"
                maxLength={15}
                placeholder="(00) 00000-0000"
                {...register('telefone', { onChange: (evento: ChangeEvent<HTMLInputElement>) => mascarar('telefone', evento.target.value) })}
              />
            </Campo>
            <Campo rotulo="E-mail" opcional erro={errors.email?.message} className="sm:col-span-2">
              <Entrada type="email" inputMode="email" autoComplete="off" placeholder="paciente@exemplo.com.br" {...register('email')} />
            </Campo>
          </div>
        </Secao>

        <Secao titulo="Contatos adicionais" regua descricao="Responsáveis, familiares ou outros números para falar com o paciente.">
          {fields.length > 0 ? (
            <ul className="grid gap-3">
              {fields.map((campo, indice) => (
                <li key={campo.id} className="grid grid-cols-[1fr_auto] items-start gap-x-2 gap-y-2 sm:grid-cols-[9.5rem_minmax(0,1fr)_auto_auto]">
                  <Campo rotulo={`Tipo do contato ${indice + 1}`} rotuloOculto>
                    <Selecao opcoes={opcoesTipoContato} {...register(`contatosAdicionais.${indice}.tipoContato`)} />
                  </Campo>
                  <Campo rotulo={`Valor do contato ${indice + 1}`} rotuloOculto className="col-span-2 sm:col-span-1">
                    <Entrada
                      placeholder={placeholderContato(campo.tipoContato)}
                      {...register(`contatosAdicionais.${indice}.valor`, {
                        onChange: (evento: ChangeEvent<HTMLInputElement>) => {
                          const tipo = getValues(`contatosAdicionais.${indice}.tipoContato`);
                          if (tipo === 'Telefone' || tipo === 'WhatsApp') {
                            setValue(`contatosAdicionais.${indice}.valor`, formatarTelefone(evento.target.value), { shouldDirty: true });
                          }
                        },
                      })}
                    />
                  </Campo>
                  <OpcaoMarcavel rotulo="Principal" className="h-9 items-center pointer-coarse:h-11" {...register(`contatosAdicionais.${indice}.principal`)} />
                  <Dica texto="Remover contato">
                    <Botao variante="perigo-discreto" tamanho="icone" aria-label={`Remover contato ${indice + 1}`} onClick={() => remove(indice)}>
                      <Trash2 size={16} aria-hidden="true" />
                    </Botao>
                  </Dica>
                </li>
              ))}
            </ul>
          ) : null}
          <Botao
            variante="secundario"
            className="w-fit"
            onClick={() => append({ tipoContato: 'Telefone', valor: '', principal: false })}
            disabled={fields.length >= 10}
          >
            <Plus size={16} aria-hidden="true" />
            Adicionar contato
          </Botao>
        </Secao>

        <Secao titulo="Observação administrativa" regua>
          <Campo rotulo="Observação" rotuloOculto erro={errors.observacaoAdministrativa?.message}>
            <AreaTexto rows={4} maxLength={2000} placeholder="Notas internas sobre o cadastro (preferências de contato, combinados administrativos)." {...register('observacaoAdministrativa')} />
          </Campo>
        </Secao>

        {erroApi ? <Aviso tom="perigo">{erroApi}</Aviso> : null}

        <div className="flex flex-col-reverse gap-2 border-t border-line pt-6 sm:flex-row sm:justify-end">
          <BotaoLink to={destinoCancelar} variante="secundario">
            Cancelar
          </BotaoLink>
          <Botao type="submit" variante="primario" carregando={salvando}>
            Salvar paciente
          </Botao>
        </div>
      </form>
    </Pagina>
  );
}
