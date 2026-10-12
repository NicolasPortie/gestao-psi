import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Aviso } from '../../components/feedback/aviso';
import { CarregandoPagina } from '../../components/feedback/esqueleto';
import { EstadoErro } from '../../components/feedback/estados';
import { notificar } from '../../components/feedback/notificar';
import { CabecalhoPagina, Pagina } from '../../components/layout/pagina';
import { Botao } from '../../components/ui/botao';
import { AreaTexto, Campo, Entrada } from '../../components/ui/campo';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import { formatarCrp, formatarTelefone } from '../../core/formatacao/pessoas';
import { dadosProfissionaisKeys, obterDadosProfissionais, salvarDadosProfissionais } from './dados-profissionais.api';

const schema = z.object({
  nomeProfissional: z.string().trim().min(3, 'Informe o nome profissional.'),
  crp: z.string().min(4, 'Informe o CRP.'),
  bio: z.string().max(2000, 'Use até 2000 caracteres.'),
  emailProfissional: z.union([z.literal(''), z.string().email('Informe um e-mail válido.')]),
  telefoneProfissional: z.string().max(30, 'Use até 30 caracteres.'),
});
type Formulario = z.infer<typeof schema>;

const iniciais: Formulario = { nomeProfissional: '', crp: '', bio: '', emailProfissional: '', telefoneProfissional: '' };

export default function DadosProfissionaisPage() {
  const queryClient = useQueryClient();
  const [erroApi, setErroApi] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<Formulario>({ resolver: zodResolver(schema), defaultValues: iniciais });

  const dadosQuery = useQuery({ queryKey: dadosProfissionaisKeys.atual(), queryFn: ({ signal }) => obterDadosProfissionais({ signal }) });
  const atuais = dadosQuery.data;

  useEffect(() => {
    if (atuais) {
      reset({
        nomeProfissional: atuais.nomeProfissional,
        crp: '',
        bio: atuais.bio ?? '',
        emailProfissional: atuais.emailProfissional ?? '',
        telefoneProfissional: atuais.telefoneProfissional ?? '',
      });
    }
  }, [atuais, reset]);

  const salvar = useMutation({
    mutationFn: (valores: Formulario) =>
      salvarDadosProfissionais({
        nomeProfissional: valores.nomeProfissional.trim(),
        crp: valores.crp,
        bio: valores.bio.trim() || null,
        emailProfissional: valores.emailProfissional.trim() || null,
        telefoneProfissional: valores.telefoneProfissional.trim() || null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: dadosProfissionaisKeys.todos });
      notificar.sucesso('Dados profissionais salvos.');
      setErroApi('');
    },
    onError: (erro) => setErroApi(mensagemDeErro(erro, 'Não foi possível salvar os dados profissionais.')),
  });

  if (dadosQuery.isPending) return <CarregandoPagina rotulo="Carregando os dados profissionais…" />;
  if (dadosQuery.error) {
    return <EstadoErro titulo="Dados indisponíveis" mensagem={mensagemDeErro(dadosQuery.error, 'Tente novamente em instantes.')} aoTentarNovamente={() => void dadosQuery.refetch()} recarregando={dadosQuery.isFetching} />;
  }

  return (
    <Pagina largura="estreita">
      <CabecalhoPagina
        titulo="Dados profissionais"
        descricao="Identificação do psicólogo responsável pela conta. O CRP completo nunca é exibido, e ele é pedido novamente a cada alteração."
      />

      <form className="grid gap-4" noValidate onSubmit={(evento) => void handleSubmit((valores) => salvar.mutate(valores))(evento)}>
        <Campo rotulo="Nome profissional" erro={errors.nomeProfissional?.message}>
          <Entrada autoComplete="name" {...register('nomeProfissional')} />
        </Campo>
        <Campo
          rotulo="CRP"
          dica={atuais ? `Registro atual: ${atuais.crpMascarado}.` : undefined}
          erro={errors.crp?.message}
        >
          <Entrada
            inputMode="numeric"
            autoComplete="off"
            placeholder="06/123456"
            {...register('crp', { onChange: (evento: ChangeEvent<HTMLInputElement>) => setValue('crp', formatarCrp(evento.target.value), { shouldDirty: true }) })}
          />
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="E-mail profissional" opcional erro={errors.emailProfissional?.message}>
            <Entrada type="email" inputMode="email" {...register('emailProfissional')} />
          </Campo>
          <Campo rotulo="Telefone profissional" opcional erro={errors.telefoneProfissional?.message}>
            <Entrada
              type="tel"
              inputMode="tel"
              maxLength={15}
              {...register('telefoneProfissional', { onChange: (evento: ChangeEvent<HTMLInputElement>) => setValue('telefoneProfissional', formatarTelefone(evento.target.value), { shouldDirty: true }) })}
            />
          </Campo>
        </div>
        <Campo rotulo="Apresentação" opcional erro={errors.bio?.message}>
          <AreaTexto rows={5} maxLength={2000} {...register('bio')} />
        </Campo>
        {erroApi ? <Aviso tom="perigo">{erroApi}</Aviso> : null}
        <div className="flex items-center gap-3 border-t border-line pt-6">
          <Botao type="submit" variante="primario" carregando={salvar.isPending} disabled={!isDirty}>
            Salvar dados
          </Botao>
        </div>
      </form>
    </Pagina>
  );
}
