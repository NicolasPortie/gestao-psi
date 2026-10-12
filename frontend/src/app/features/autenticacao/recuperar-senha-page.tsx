import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { z } from 'zod';

import { Aviso } from '../../components/feedback/aviso';
import { Botao } from '../../components/ui/botao';
import { Campo, Entrada } from '../../components/ui/campo';
import { solicitarRecuperacaoSenha } from '../../core/autenticacao/autenticacao.service';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';

const schema = z.object({ email: z.string().email('Informe um e-mail válido.') });
type Formulario = z.infer<typeof schema>;

export default function RecuperarSenhaPage() {
  const [concluido, setConcluido] = useState(false);
  const [erroApi, setErroApi] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Formulario>({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  async function enviar({ email }: Formulario) {
    setErroApi('');
    try {
      await solicitarRecuperacaoSenha(email);
      setConcluido(true);
    } catch (erro) {
      setErroApi(mensagemDeErro(erro, 'Não foi possível enviar o link. Tente novamente.'));
    }
  }

  if (concluido) {
    return (
      <div className="grid gap-6">
        <span className="grid size-11 place-items-center rounded-full bg-accent-wash text-accent-ink">
          <MailCheck size={20} aria-hidden="true" />
        </span>
        <header className="grid gap-1.5">
          <h1 className="text-2xl font-semibold tracking-[-0.015em]">Verifique seu e-mail</h1>
          <p className="text-base text-ink-muted">
            Se existir uma conta com esse e-mail, enviaremos as instruções para redefinir a senha. O link vale uma única vez.
          </p>
        </header>
        <Link to="/login" className="font-medium">
          Voltar para entrar
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <header className="grid gap-1.5">
        <h1 className="text-2xl font-semibold tracking-[-0.015em]">Recuperar senha</h1>
        <p className="text-base text-ink-muted">
          Enviaremos um link de uso único, sem revelar se o e-mail está cadastrado.
        </p>
      </header>

      <form className="grid gap-4" onSubmit={(evento) => void handleSubmit(enviar)(evento)} noValidate>
        <Campo rotulo="E-mail" erro={errors.email?.message}>
          <Entrada type="email" inputMode="email" autoComplete="email" {...register('email')} />
        </Campo>
        {erroApi ? <Aviso tom="perigo">{erroApi}</Aviso> : null}
        <Botao type="submit" tamanho="grande" variante="primario" carregando={isSubmitting} className="w-full">
          Enviar link seguro
        </Botao>
      </form>

      <Link to="/login" className="text-center text-base font-medium">
        Voltar para entrar
      </Link>
    </div>
  );
}
