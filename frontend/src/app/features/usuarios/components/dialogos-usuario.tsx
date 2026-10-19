import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Aviso } from '../../../components/feedback/aviso';
import { notificar } from '../../../components/feedback/notificar';
import { Botao } from '../../../components/ui/botao';
import { Campo, Entrada } from '../../../components/ui/campo';
import { Dialogo } from '../../../components/ui/dialogo';
import { mensagemDeErro } from '../../../core/erros/mensagem-de-erro';
import {
  alterarPerfilUsuario,
  atualizarUsuario,
  redefinirSenhaUsuario,
  usuariosKeys,
  type Usuario,
} from '../usuarios.api';
import { escolhaDoUsuario, perfilDaEscolha } from '../perfil-escolha';
import { SeletorPerfil } from './seletor-perfil';

interface DialogoUsuarioProps {
  usuario: Usuario | null;
  aoFechar: () => void;
}

const schemaEdicao = z.object({
  nomeCompleto: z.string().trim().min(3, 'Informe o nome completo.'),
  telefone: z.string(),
});
type FormularioEdicao = z.infer<typeof schemaEdicao>;

export function DialogoEditarUsuario({ usuario, aoFechar }: DialogoUsuarioProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormularioEdicao>({
    resolver: zodResolver(schemaEdicao),
    defaultValues: { nomeCompleto: '', telefone: '' },
  });

  const salvar = useMutation({
    mutationFn: (valores: FormularioEdicao) =>
      atualizarUsuario(usuario!.id, {
        nomeCompleto: valores.nomeCompleto.trim(),
        telefone: valores.telefone.trim() || null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usuariosKeys.todos });
      notificar.sucesso('Dados do usuário atualizados.');
      aoFechar();
    },
  });
  const { reset: limparErro } = salvar;

  useEffect(() => {
    if (usuario) {
      reset({ nomeCompleto: usuario.nomeCompleto, telefone: usuario.telefone ?? '' });
      limparErro();
    }
  }, [usuario, reset, limparErro]);

  return (
    <Dialogo
      aberto={usuario !== null}
      aoMudar={(aberto) => !aberto && aoFechar()}
      titulo="Editar usuário"
      descricao={usuario?.email}
      rodape={
        <>
          <Botao variante="secundario" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao
            type="submit"
            form="form-editar-usuario"
            variante="primario"
            carregando={salvar.isPending}
          >
            Salvar
          </Botao>
        </>
      }
    >
      <form
        id="form-editar-usuario"
        className="grid gap-4"
        noValidate
        onSubmit={(evento) => void handleSubmit((valores) => salvar.mutate(valores))(evento)}
      >
        <Campo rotulo="Nome completo" erro={errors.nomeCompleto?.message}>
          <Entrada {...register('nomeCompleto')} />
        </Campo>
        <Campo rotulo="Telefone" opcional>
          <Entrada type="tel" {...register('telefone')} />
        </Campo>
        {salvar.isError ? (
          <Aviso tom="perigo">
            {mensagemDeErro(salvar.error, 'Não foi possível atualizar o usuário.')}
          </Aviso>
        ) : null}
      </form>
    </Dialogo>
  );
}

const schemaSenha = z.object({
  novaSenha: z.string().min(8, 'A nova senha deve ter pelo menos 8 caracteres.'),
});
type FormularioSenha = z.infer<typeof schemaSenha>;

export function DialogoSenhaUsuario({ usuario, aoFechar }: DialogoUsuarioProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormularioSenha>({
    resolver: zodResolver(schemaSenha),
    defaultValues: { novaSenha: '' },
  });

  const redefinir = useMutation({
    mutationFn: (valores: FormularioSenha) => redefinirSenhaUsuario(usuario!.id, valores.novaSenha),
    onSuccess: () => {
      notificar.sucesso('Senha redefinida.');
      aoFechar();
    },
  });
  const { reset: limparErro } = redefinir;

  useEffect(() => {
    if (usuario) {
      reset({ novaSenha: '' });
      limparErro();
    }
  }, [usuario, reset, limparErro]);

  return (
    <Dialogo
      aberto={usuario !== null}
      aoMudar={(aberto) => !aberto && aoFechar()}
      titulo="Redefinir senha"
      descricao={
        usuario
          ? `Defina uma nova senha para ${usuario.nomeCompleto}. Repasse-a por um canal seguro.`
          : undefined
      }
      rodape={
        <>
          <Botao variante="secundario" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao
            type="submit"
            form="form-senha-usuario"
            variante="primario"
            carregando={redefinir.isPending}
          >
            Redefinir senha
          </Botao>
        </>
      }
    >
      <form
        id="form-senha-usuario"
        className="grid gap-4"
        noValidate
        onSubmit={(evento) => void handleSubmit((valores) => redefinir.mutate(valores))(evento)}
      >
        <Campo rotulo="Nova senha" dica="Mínimo de 8 caracteres." erro={errors.novaSenha?.message}>
          <Entrada type="password" autoComplete="new-password" {...register('novaSenha')} />
        </Campo>
        {redefinir.isError ? (
          <Aviso tom="perigo">
            {mensagemDeErro(redefinir.error, 'Não foi possível redefinir a senha.')}
          </Aviso>
        ) : null}
      </form>
    </Dialogo>
  );
}

export function DialogoPerfilUsuario({ usuario, aoFechar }: DialogoUsuarioProps) {
  const queryClient = useQueryClient();
  // A escolha só vale para a pessoa em edição; ao abrir outra, volta ao perfil atual dela.
  const [livre, setLivre] = useState<{ id: string; valor: string } | null>(null);
  const escolha = usuario
    ? livre?.id === usuario.id
      ? livre.valor
      : escolhaDoUsuario(usuario)
    : 'Recepcionista';

  const alterar = useMutation({
    mutationFn: () => alterarPerfilUsuario(usuario!.id, perfilDaEscolha(escolha)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usuariosKeys.todos });
      notificar.sucesso('Perfil alterado. A pessoa precisa entrar de novo para valer.');
      aoFechar();
    },
  });
  const { reset: limparErro } = alterar;

  useEffect(() => {
    if (usuario) {
      limparErro();
    }
  }, [usuario, limparErro]);

  return (
    <Dialogo
      aberto={usuario !== null}
      aoMudar={(aberto) => !aberto && aoFechar()}
      titulo="Mudar perfil"
      descricao={
        usuario
          ? `O que ${usuario.nomeCompleto} pode abrir. A pessoa sai do sistema e precisa entrar de novo.`
          : undefined
      }
      rodape={
        <>
          <Botao variante="secundario" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao
            variante="primario"
            carregando={alterar.isPending}
            onClick={() => alterar.mutate()}
          >
            Mudar perfil
          </Botao>
        </>
      }
    >
      <div className="grid gap-4">
        <Campo rotulo="Perfil de acesso">
          <SeletorPerfil
            valor={escolha}
            aoMudar={(valor) => usuario && setLivre({ id: usuario.id, valor })}
          />
        </Campo>
        {alterar.isError ? (
          <Aviso tom="perigo">
            {mensagemDeErro(alterar.error, 'Não foi possível alterar o perfil.')}
          </Aviso>
        ) : null}
      </div>
    </Dialogo>
  );
}
