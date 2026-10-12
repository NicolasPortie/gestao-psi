import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Aviso } from '../../../components/feedback/aviso';
import { notificar } from '../../../components/feedback/notificar';
import { Botao } from '../../../components/ui/botao';
import { Campo, Entrada } from '../../../components/ui/campo';
import { Dialogo } from '../../../components/ui/dialogo';
import { mensagemDeErro } from '../../../core/erros/mensagem-de-erro';
import { atualizarUsuario, redefinirSenhaUsuario, usuariosKeys, type Usuario } from '../usuarios.api';

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
  } = useForm<FormularioEdicao>({ resolver: zodResolver(schemaEdicao), defaultValues: { nomeCompleto: '', telefone: '' } });

  const salvar = useMutation({
    mutationFn: (valores: FormularioEdicao) => atualizarUsuario(usuario!.id, { nomeCompleto: valores.nomeCompleto.trim(), telefone: valores.telefone.trim() || null }),
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
          <Botao type="submit" form="form-editar-usuario" variante="primario" carregando={salvar.isPending}>
            Salvar
          </Botao>
        </>
      }
    >
      <form id="form-editar-usuario" className="grid gap-4" noValidate onSubmit={(evento) => void handleSubmit((valores) => salvar.mutate(valores))(evento)}>
        <Campo rotulo="Nome completo" erro={errors.nomeCompleto?.message}>
          <Entrada {...register('nomeCompleto')} />
        </Campo>
        <Campo rotulo="Telefone" opcional>
          <Entrada type="tel" {...register('telefone')} />
        </Campo>
        {salvar.isError ? <Aviso tom="perigo">{mensagemDeErro(salvar.error, 'Não foi possível atualizar o usuário.')}</Aviso> : null}
      </form>
    </Dialogo>
  );
}

const schemaSenha = z.object({ novaSenha: z.string().min(8, 'A nova senha deve ter pelo menos 8 caracteres.') });
type FormularioSenha = z.infer<typeof schemaSenha>;

export function DialogoSenhaUsuario({ usuario, aoFechar }: DialogoUsuarioProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormularioSenha>({ resolver: zodResolver(schemaSenha), defaultValues: { novaSenha: '' } });

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
      descricao={usuario ? `Defina uma nova senha para ${usuario.nomeCompleto}. Repasse-a por um canal seguro.` : undefined}
      rodape={
        <>
          <Botao variante="secundario" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao type="submit" form="form-senha-usuario" variante="primario" carregando={redefinir.isPending}>
            Redefinir senha
          </Botao>
        </>
      }
    >
      <form id="form-senha-usuario" className="grid gap-4" noValidate onSubmit={(evento) => void handleSubmit((valores) => redefinir.mutate(valores))(evento)}>
        <Campo rotulo="Nova senha" dica="Mínimo de 8 caracteres." erro={errors.novaSenha?.message}>
          <Entrada type="password" autoComplete="new-password" {...register('novaSenha')} />
        </Campo>
        {redefinir.isError ? <Aviso tom="perigo">{mensagemDeErro(redefinir.error, 'Não foi possível redefinir a senha.')}</Aviso> : null}
      </form>
    </Dialogo>
  );
}
