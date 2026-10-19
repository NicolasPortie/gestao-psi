import { zodResolver } from '@hookform/resolvers/zod';
import { CircleCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router';
import { z } from 'zod';

import { Aviso } from '../../components/feedback/aviso';
import { Botao, BotaoLink } from '../../components/ui/botao';
import { Campo, Entrada } from '../../components/ui/campo';
import { redefinirSenha } from '../../core/autenticacao/autenticacao.service';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';

const schema = z
  .object({ senha: z.string().min(8, 'Use pelo menos 8 caracteres.'), confirmacao: z.string() })
  .refine((dados) => dados.senha === dados.confirmacao, { path: ['confirmacao'], message: 'As senhas não coincidem.' });
type Formulario = z.infer<typeof schema>;

export default function RedefinirSenhaPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [concluido, setConcluido] = useState(false);
  const [erroApi, setErroApi] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Formulario>({ resolver: zodResolver(schema), defaultValues: { senha: '', confirmacao: '' } });

  async function enviar({ senha }: Formulario) {
    if (!token) {
      setErroApi('Link de redefinição inválido ou incompleto. Solicite um novo.');
      return;
    }
    setErroApi('');
    try {
      await redefinirSenha(token, senha);
      setConcluido(true);
    } catch (erro) {
      setErroApi(mensagemDeErro(erro, 'Não foi possível redefinir a senha. Solicite um novo link.'));
    }
  }

  if (concluido) {
    return (
      <div className="grid gap-6">
        <span className="grid size-11 place-items-center rounded-full bg-success-wash text-success-ink">
          <CircleCheck size={20} aria-hidden="true" />
        </span>
        <header className="grid gap-1.5">
          <h1 className="text-2xl font-semibold tracking-[-0.015em]">Senha atualizada</h1>
          <p className="text-base text-ink-muted">Você já pode entrar com a nova senha.</p>
        </header>
        <BotaoLink to="/login" variante="primario" tamanho="grande">
          Ir para entrar
        </BotaoLink>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <header className="grid gap-1.5">
        <h1 className="text-2xl font-semibold tracking-[-0.015em]">Definir nova senha</h1>
        <p className="text-base text-ink-muted">Por segurança, o link funciona uma única vez.</p>
      </header>

      {token ? null : <Aviso tom="aviso">Este link está incompleto. Solicite a recuperação de senha novamente.</Aviso>}

      <form className="grid gap-4" onSubmit={(evento) => void handleSubmit(enviar)(evento)} noValidate>
        <Campo rotulo="Nova senha" dica="Mínimo de 8 caracteres." erro={errors.senha?.message}>
          <Entrada type="password" autoComplete="new-password" {...register('senha')} />
        </Campo>
        <Campo rotulo="Confirmar senha" erro={errors.confirmacao?.message}>
          <Entrada type="password" autoComplete="new-password" {...register('confirmacao')} />
        </Campo>
        {erroApi ? <Aviso tom="perigo">{erroApi}</Aviso> : null}
        <Botao type="submit" tamanho="grande" variante="primario" carregando={isSubmitting} disabled={!token} className="w-full">
          Redefinir senha
        </Botao>
      </form>
    </div>
  );
}
