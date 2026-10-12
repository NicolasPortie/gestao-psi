import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Aviso } from '../../../components/feedback/aviso';
import { CarregandoPagina } from '../../../components/feedback/esqueleto';
import { EstadoErro, EstadoVazio } from '../../../components/feedback/estados';
import { notificar } from '../../../components/feedback/notificar';
import { Botao } from '../../../components/ui/botao';
import { AreaTexto, Campo, Entrada, GrupoSegmentado, OpcaoMarcavel } from '../../../components/ui/campo';
import { Gaveta } from '../../../components/ui/dialogo';
import { EstadoRotulado } from '../../../components/ui/marca-estado';
import { MenuAcoes } from '../../../components/ui/menu';
import { CabecalhoTabela, CelulaTabela, ColunaTabela, LinhaTabela, Tabela } from '../../../components/ui/tabela';
import { rotuloDe } from '../../../core/dominio/estado';
import { mensagemDeErro } from '../../../core/erros/mensagem-de-erro';
import { formatarMoeda } from '../../../core/formatacao/moeda';
import { agendaKeys, listarTiposAtendimento, salvarTipoAtendimento } from '../agenda.api';
import { estadoAtivo, rotulosModalidade } from '../agenda.rotulos';
import type { ModalidadeAtendimento, SalvarTipoAtendimentoRequest, TipoAtendimento } from '../agenda.types';

const modalidades: ModalidadeAtendimento[] = ['Presencial', 'Online', 'Hibrido'];

const schema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome do tipo.'),
  descricao: z.string(),
  duracaoMinutos: z.string().refine((valor) => Number(valor) > 0, 'Informe a duração em minutos.'),
  valorPadrao: z.string().refine((valor) => valor.trim() === '' || Number(valor) >= 0, 'Informe um valor válido.'),
  modalidadePadrao: z.enum(modalidades),
  ativo: z.boolean(),
});
type Formulario = z.infer<typeof schema>;

const valoresIniciais: Formulario = { nome: '', descricao: '', duracaoMinutos: '50', valorPadrao: '', modalidadePadrao: 'Presencial', ativo: true };

function paraFormulario(tipo: TipoAtendimento): Formulario {
  return {
    nome: tipo.nome,
    descricao: tipo.descricao ?? '',
    duracaoMinutos: String(tipo.duracaoMinutos),
    valorPadrao: tipo.valorPadrao?.toString() ?? '',
    modalidadePadrao: tipo.modalidadePadrao,
    ativo: tipo.ativo,
  };
}

function paraRequisicao(valores: Formulario): SalvarTipoAtendimentoRequest {
  return {
    nome: valores.nome.trim(),
    descricao: valores.descricao.trim() || null,
    duracaoMinutos: Number(valores.duracaoMinutos),
    valorPadrao: valores.valorPadrao.trim() ? Number(valores.valorPadrao) : null,
    modalidadePadrao: valores.modalidadePadrao,
    ativo: valores.ativo,
  };
}

function GavetaTipo({ tipo, aberto, aoMudar }: { tipo: TipoAtendimento | null; aberto: boolean; aoMudar: (aberto: boolean) => void }) {
  const queryClient = useQueryClient();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Formulario>({ resolver: zodResolver(schema), defaultValues: valoresIniciais });

  const salvar = useMutation({
    mutationFn: (valores: Formulario) => salvarTipoAtendimento(tipo?.id ?? null, paraRequisicao(valores)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: agendaKeys.tipos() });
      notificar.sucesso(tipo ? 'Tipo de atendimento atualizado.' : 'Tipo de atendimento criado.');
      aoMudar(false);
    },
  });
  const erroApi = salvar.isError ? mensagemDeErro(salvar.error, 'Não foi possível salvar o tipo de atendimento.') : '';
  const { reset: limparErro } = salvar;

  useEffect(() => {
    if (aberto) {
      reset(tipo ? paraFormulario(tipo) : valoresIniciais);
      limparErro();
    }
  }, [aberto, tipo, reset, limparErro]);

  return (
    <Gaveta
      aberto={aberto}
      aoMudar={aoMudar}
      titulo={tipo ? 'Editar tipo de atendimento' : 'Novo tipo de atendimento'}
      rodape={
        <>
          <Botao variante="secundario" onClick={() => aoMudar(false)}>
            Cancelar
          </Botao>
          <Botao type="submit" form="form-tipo" variante="primario" carregando={salvar.isPending}>
            Salvar
          </Botao>
        </>
      }
    >
      <form id="form-tipo" className="grid gap-4" noValidate onSubmit={(evento) => void handleSubmit((valores) => salvar.mutate(valores))(evento)}>
        <Campo rotulo="Nome" erro={errors.nome?.message}>
          <Entrada placeholder="Ex.: Psicoterapia individual" {...register('nome')} />
        </Campo>
        <Campo rotulo="Descrição" opcional>
          <AreaTexto rows={2} {...register('descricao')} />
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Duração" dica="Em minutos." erro={errors.duracaoMinutos?.message}>
            <Entrada type="number" inputMode="numeric" min="1" {...register('duracaoMinutos')} />
          </Campo>
          <Campo rotulo="Valor padrão" opcional erro={errors.valorPadrao?.message}>
            <Entrada type="number" inputMode="decimal" min="0" step="0.01" placeholder="0,00" {...register('valorPadrao')} />
          </Campo>
        </div>
        <Campo rotulo="Modalidade padrão" grupo>
          <Controller
            control={control}
            name="modalidadePadrao"
            render={({ field }) => (
              <GrupoSegmentado
                rotulo="Modalidade padrão"
                valor={field.value}
                aoMudar={field.onChange}
                opcoes={modalidades.map((valor) => ({ valor, rotulo: rotulosModalidade[valor] }))}
              />
            )}
          />
        </Campo>
        <OpcaoMarcavel tipo="interruptor" rotulo="Disponível para agendamento" descricao="Tipos inativos deixam de aparecer ao criar consultas." {...register('ativo')} />
        {erroApi ? <Aviso tom="perigo">{erroApi}</Aviso> : null}
      </form>
    </Gaveta>
  );
}

export function TiposAtendimento() {
  const queryClient = useQueryClient();
  const [edicao, setEdicao] = useState<{ tipo: TipoAtendimento | null } | null>(null);
  const tiposQuery = useQuery({ queryKey: agendaKeys.tipos(), queryFn: ({ signal }) => listarTiposAtendimento({ signal }) });

  const alternar = useMutation({
    mutationFn: (tipo: TipoAtendimento) => salvarTipoAtendimento(tipo.id, { ...paraRequisicao(paraFormulario(tipo)), ativo: !tipo.ativo }),
    onSuccess: async (tipo) => {
      await queryClient.invalidateQueries({ queryKey: agendaKeys.tipos() });
      notificar.sucesso(tipo.ativo ? 'Tipo ativado.' : 'Tipo desativado.');
    },
    onError: (erro) => notificar.erro(mensagemDeErro(erro, 'Não foi possível alterar o tipo.')),
  });

  if (tiposQuery.isPending) return <CarregandoPagina rotulo="Carregando os tipos…" />;
  if (tiposQuery.error && !tiposQuery.data) {
    return <EstadoErro mensagem={mensagemDeErro(tiposQuery.error)} aoTentarNovamente={() => void tiposQuery.refetch()} />;
  }

  const tipos = tiposQuery.data ?? [];

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-[60ch] text-base text-ink-muted">Cada tipo define a duração, a modalidade e o valor sugerido ao agendar.</p>
        <Botao variante="primario" onClick={() => setEdicao({ tipo: null })}>
          <Plus size={16} aria-hidden="true" />
          Novo tipo
        </Botao>
      </div>

      {tipos.length === 0 ? (
        <EstadoVazio
          icone={Tag}
          titulo="Nenhum tipo de atendimento"
          descricao="Cadastre os tipos de consulta que você oferece para agendar com a duração e o valor corretos."
          acao={
            <Botao variante="secundario" onClick={() => setEdicao({ tipo: null })}>
              Criar o primeiro tipo
            </Botao>
          }
        />
      ) : (
        <Tabela rotulo="Tipos de atendimento">
          <CabecalhoTabela>
            <tr>
              <ColunaTabela>Tipo</ColunaTabela>
              <ColunaTabela ocultarAte="sm">Duração</ColunaTabela>
              <ColunaTabela ocultarAte="md">Modalidade</ColunaTabela>
              <ColunaTabela ocultarAte="md">Valor padrão</ColunaTabela>
              <ColunaTabela>Estado</ColunaTabela>
              <ColunaTabela className="w-px">
                <span className="sr-only">Ações</span>
              </ColunaTabela>
            </tr>
          </CabecalhoTabela>
          <tbody>
            {tipos.map((tipo) => (
              <LinhaTabela key={tipo.id}>
                <CelulaTabela>
                  <span className="block text-base font-medium">{tipo.nome}</span>
                  {tipo.descricao ? <span className="block text-sm text-ink-muted">{tipo.descricao}</span> : null}
                  <span className="num block text-sm text-ink-muted sm:hidden">{tipo.duracaoMinutos} min</span>
                </CelulaTabela>
                <CelulaTabela ocultarAte="sm" className="num">
                  {tipo.duracaoMinutos} min
                </CelulaTabela>
                <CelulaTabela ocultarAte="md">{rotuloDe(rotulosModalidade, tipo.modalidadePadrao)}</CelulaTabela>
                <CelulaTabela ocultarAte="md" className="num">
                  {tipo.valorPadrao != null ? formatarMoeda(tipo.valorPadrao) : <span className="text-ink-muted">—</span>}
                </CelulaTabela>
                <CelulaTabela>
                  <EstadoRotulado estado={estadoAtivo(tipo.ativo)} compacto />
                </CelulaTabela>
                <CelulaTabela className="text-right">
                  <MenuAcoes
                    rotulo={`Ações de ${tipo.nome}`}
                    itens={[
                      { rotulo: 'Editar', aoSelecionar: () => setEdicao({ tipo }) },
                      { rotulo: tipo.ativo ? 'Desativar' : 'Ativar', aoSelecionar: () => alternar.mutate(tipo) },
                    ]}
                  />
                </CelulaTabela>
              </LinhaTabela>
            ))}
          </tbody>
        </Tabela>
      )}

      <GavetaTipo tipo={edicao?.tipo ?? null} aberto={edicao !== null} aoMudar={(aberto) => !aberto && setEdicao(null)} />
    </div>
  );
}
