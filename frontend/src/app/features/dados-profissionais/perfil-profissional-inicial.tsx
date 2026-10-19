import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router';
import { z } from 'zod';

import { Aviso } from '../../components/feedback/aviso';
import { notificar } from '../../components/feedback/notificar';
import { Botao } from '../../components/ui/botao';
import { Campo, Entrada } from '../../components/ui/campo';
import { Dialogo } from '../../components/ui/dialogo';
import { atualizarNomeProfissionalNaSessao, useSessao } from '../../core/autenticacao/autenticacao.service';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import { formatarCrp } from '../../core/formatacao/pessoas';
import { painelKeys } from '../painel/painel.api';
import {
  adiarPerfilProfissional,
  dadosProfissionaisKeys,
  obterSituacaoPerfilProfissional,
  salvarDadosProfissionais,
  type SituacaoPerfilProfissional,
} from './dados-profissionais.api';

const schema = z.object({
  nomeProfissional: z.string().trim().min(3, 'Informe seu nome completo.').max(180, 'Use até 180 caracteres.'),
  crp: z.string().regex(/^\d{2}\/\d{4,6}$/, 'Informe o CRP com a região, como 06/123456.'),
});
type Formulario = z.infer<typeof schema>;

/** Complemento opcional após o cadastro; a escolha de adiar pertence à conta no servidor. */
export function PerfilProfissionalInicial() {
  const { usuario } = useSessao();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const [aberturaManual, setAberturaManual] = useState(false);
  const [fechadoLocalmente, setFechadoLocalmente] = useState(false);
  const [erroApi, setErroApi] = useState('');
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Formulario>({
    resolver: zodResolver(schema),
    defaultValues: { nomeProfissional: usuario?.nomeCompleto ?? '', crp: '' },
  });
  const chaveSituacao = dadosProfissionaisKeys.situacao(usuario?.id ?? '');
  const situacao = useQuery({
    queryKey: chaveSituacao,
    queryFn: ({ signal }) => obterSituacaoPerfilProfissional({ signal }),
    enabled: usuario?.perfil === 'Psicologo',
  });
  const aberto = aberturaManual || (!fechadoLocalmente && situacao.data?.sugerirPreenchimento === true);

  const salvar = useMutation({
    mutationFn: salvarDadosProfissionais,
    onSuccess: async (dados) => {
      atualizarNomeProfissionalNaSessao(dados.nomeProfissional);
      queryClient.setQueryData<SituacaoPerfilProfissional>(chaveSituacao, {
        pendente: false,
        sugerirPreenchimento: false,
      });
      setAberturaManual(false);
      setFechadoLocalmente(true);
      setErroApi('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: dadosProfissionaisKeys.todos }),
        queryClient.invalidateQueries({ queryKey: painelKeys.resumo() }),
      ]);
      notificar.sucesso('Perfil profissional completo.');
    },
    onError: (erro) => setErroApi(mensagemDeErro(erro, 'Não foi possível salvar seu perfil. Tente novamente.')),
  });
  const adiar = useMutation({
    mutationFn: adiarPerfilProfissional,
    onSuccess: () => {
      queryClient.setQueryData<SituacaoPerfilProfissional>(chaveSituacao, {
        pendente: true,
        sugerirPreenchimento: false,
      });
      setErroApi('');
    },
    onError: () =>
      setErroApi('Não conseguimos salvar sua preferência de preencher depois. Você pode continuar e tentar novamente.'),
    onSettled: () => {
      setAberturaManual(false);
      setFechadoLocalmente(true);
    },
  });
  const ocupado = salvar.isPending || adiar.isPending;
  function preencherDepois() {
    if (!ocupado) adiar.mutate();
  }

  if (usuario?.perfil !== 'Psicologo') return null;
  const mostrarLembrete = situacao.data?.pendente && (pathname === '/painel' || pathname.startsWith('/documentos'));
  return (
    <>
      {mostrarLembrete ? (
        <aside
          aria-label="Perfil profissional pendente"
          className="mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line pb-4"
        >
          <div className="grid gap-1">
            <p className="text-sm font-medium">Seu perfil profissional está incompleto</p>
            <p className="text-sm text-ink-muted">Adicione nome e CRP antes de finalizar documentos.</p>
          </div>
          <Botao
            variante="secundario"
            onClick={() => {
              setErroApi('');
              setAberturaManual(true);
            }}
          >
            Completar perfil
          </Botao>
        </aside>
      ) : null}
      {!aberto && erroApi ? (
        <div className="mb-4">
          <Aviso tom="perigo">{erroApi}</Aviso>
        </div>
      ) : null}
      <Dialogo
        aberto={aberto}
        aoMudar={(valor) => {
          if (!valor) preencherDepois();
        }}
        titulo="Complete seu perfil profissional"
        descricao="Como seu nome e CRP devem aparecer nos documentos? Você pode preencher agora ou continuar explorando."
        rodape={
          <>
            <Botao variante="discreto" disabled={ocupado} onClick={preencherDepois}>
              Preencher depois
            </Botao>
            <Botao
              type="submit"
              form="perfil-profissional-inicial"
              variante="primario"
              carregando={salvar.isPending}
              disabled={adiar.isPending}
            >
              Salvar e continuar
            </Botao>
          </>
        }
      >
        <form
          id="perfil-profissional-inicial"
          className="grid gap-5"
          noValidate
          onSubmit={(evento) => {
            if (!ocupado) void handleSubmit((valores) => salvar.mutate(valores))(evento);
            else evento.preventDefault();
          }}
        >
          <Campo rotulo="Nome completo" erro={errors.nomeProfissional?.message}>
            <Entrada autoComplete="name" className="h-12 pointer-coarse:h-12" {...register('nomeProfissional')} />
          </Campo>
          <Campo rotulo="CRP" dica="Região e número de registro no conselho." erro={errors.crp?.message}>
            <Entrada
              inputMode="numeric"
              autoComplete="off"
              placeholder="06/123456"
              className="h-12 pointer-coarse:h-12"
              {...register('crp', {
                onChange: (evento: ChangeEvent<HTMLInputElement>) =>
                  setValue('crp', formatarCrp(evento.target.value), { shouldDirty: true }),
              })}
            />
          </Campo>
          {erroApi ? <Aviso tom="perigo">{erroApi}</Aviso> : null}
        </form>
      </Dialogo>
    </>
  );
}
