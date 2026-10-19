import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type ChangeEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Aviso } from '../../../components/feedback/aviso';
import { notificar } from '../../../components/feedback/notificar';
import { Botao } from '../../../components/ui/botao';
import { Campo, Entrada } from '../../../components/ui/campo';
import { Gaveta } from '../../../components/ui/dialogo';
import { mensagemDeErro } from '../../../core/erros/mensagem-de-erro';
import { formatarTelefone } from '../../../core/formatacao/pessoas';
import { criarUsuario, usuariosKeys } from '../usuarios.api';
import { perfilDaEscolha } from '../perfil-escolha';
import { SeletorPerfil } from './seletor-perfil';

const schema = z.object({
  nomeCompleto: z.string().trim().min(3, 'Informe o nome completo.'),
  email: z.string().email('Informe um e-mail válido.'),
  senha: z.string().min(8, 'Use pelo menos 8 caracteres.'),
  telefone: z.string(),
  perfil: z.string().min(1),
});
type Formulario = z.infer<typeof schema>;
const iniciais: Formulario = {
  nomeCompleto: '',
  email: '',
  senha: '',
  telefone: '',
  perfil: 'Recepcionista',
};

export function GavetaUsuario({
  aberto,
  aoMudar,
}: {
  aberto: boolean;
  aoMudar: (aberto: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [erroApi, setErroApi] = useState('');
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Formulario>({ resolver: zodResolver(schema), defaultValues: iniciais });

  const criar = useMutation({
    mutationFn: (valores: Formulario) =>
      criarUsuario({
        nomeCompleto: valores.nomeCompleto.trim(),
        email: valores.email.trim(),
        senha: valores.senha,
        telefone: valores.telefone.trim() || null,
        ...perfilDaEscolha(valores.perfil),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usuariosKeys.todos });
      notificar.sucesso('Pessoa adicionada à equipe.');
      reset(iniciais);
      aoMudar(false);
    },
    onError: (erro) => setErroApi(mensagemDeErro(erro, 'Não foi possível adicionar a pessoa.')),
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
      titulo="Nova pessoa na equipe"
      descricao="A pessoa entra com o e-mail e a senha inicial e só vê o que o perfil dela libera. Conteúdo clínico é sempre só do psicólogo."
      rodape={
        <>
          <Botao variante="secundario" onClick={() => alterarAbertura(false)}>
            Cancelar
          </Botao>
          <Botao type="submit" form="form-usuario" variante="primario" carregando={criar.isPending}>
            Adicionar à equipe
          </Botao>
        </>
      }
    >
      <form
        id="form-usuario"
        className="grid gap-4"
        noValidate
        onSubmit={(evento) => {
          setErroApi('');
          void handleSubmit((valores) => criar.mutate(valores))(evento);
        }}
      >
        <Campo rotulo="Nome completo" erro={errors.nomeCompleto?.message}>
          <Entrada autoComplete="off" {...register('nomeCompleto')} />
        </Campo>
        <Campo rotulo="E-mail" erro={errors.email?.message}>
          <Entrada type="email" autoComplete="off" {...register('email')} />
        </Campo>
        <Campo
          rotulo="Senha inicial"
          dica="Mínimo de 8 caracteres. A pessoa pode trocá-la depois."
          erro={errors.senha?.message}
        >
          <Entrada type="password" autoComplete="new-password" {...register('senha')} />
        </Campo>
        <Campo rotulo="Telefone" opcional>
          <Entrada
            type="tel"
            inputMode="tel"
            maxLength={15}
            placeholder="(00) 00000-0000"
            {...register('telefone', {
              onChange: (evento: ChangeEvent<HTMLInputElement>) =>
                setValue('telefone', formatarTelefone(evento.target.value)),
            })}
          />
        </Campo>
        <Campo rotulo="Perfil de acesso">
          <Controller
            control={control}
            name="perfil"
            render={({ field }) => <SeletorPerfil valor={field.value} aoMudar={field.onChange} />}
          />
        </Campo>
        {erroApi ? <Aviso tom="perigo">{erroApi}</Aviso> : null}
      </form>
    </Gaveta>
  );
}
