import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { z } from 'zod';

import { Aviso } from '../../components/feedback/aviso';
import { Botao } from '../../components/ui/botao';
import { Campo, Entrada } from '../../components/ui/campo';
import { entrar } from '../../core/autenticacao/autenticacao.service';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';

const schema = z.object({
  email: z.string().min(1, 'Informe seu e-mail.').email('Informe um e-mail válido.'),
  senha: z.string().min(1, 'Informe sua senha.'),
});
type FormularioLogin = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [erroApi, setErroApi] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormularioLogin>({ resolver: zodResolver(schema), defaultValues: { email: '', senha: '' } });

  async function enviar(dados: FormularioLogin) {
    setErroApi('');
    try {
      await entrar(dados);
      await navigate('/painel', { replace: true });
    } catch (erro) {
      setErroApi(mensagemDeErro(erro, 'Não foi possível entrar. Tente novamente.'));
    }
  }

  return (
    <div className="grid gap-8">
      <header className="grid gap-1.5">
        <h1 className="text-2xl font-semibold tracking-[-0.015em]">Entrar</h1>
        <p className="text-base text-ink-muted">Acesse o seu consultório.</p>
      </header>

      <form className="grid gap-4" onSubmit={(evento) => void handleSubmit(enviar)(evento)} noValidate>
        <Campo rotulo="E-mail" erro={errors.email?.message}>
          <Entrada type="email" inputMode="email" autoComplete="email" placeholder="voce@exemplo.com.br" {...register('email')} />
        </Campo>
        <Campo
          rotulo="Senha"
          erro={errors.senha?.message}
          acaoRotulo={
            <Link className="text-sm font-medium" to="/recuperar-senha">
              Esqueci minha senha
            </Link>
          }
        >
          <Entrada
            type={senhaVisivel ? 'text' : 'password'}
            autoComplete="current-password"
            {...register('senha')}
            acao={
              <button
                type="button"
                onClick={() => setSenhaVisivel((atual) => !atual)}
                aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={senhaVisivel}
                className="grid size-8 place-items-center rounded-md text-ink-muted transition-colors duration-150 hover:bg-hover hover:text-ink pointer-coarse:size-10"
              >
                {senhaVisivel ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
              </button>
            }
          />
        </Campo>

        {erroApi ? <Aviso tom="perigo">{erroApi}</Aviso> : null}

        <Botao type="submit" tamanho="grande" variante="primario" carregando={isSubmitting} className="mt-1 w-full">
          Entrar
        </Botao>
      </form>

      <p className="text-center text-base text-ink-muted">
        Ainda não tem conta?{' '}
        <Link to="/cadastro" className="font-medium">
          Criar conta
        </Link>
      </p>
    </div>
  );
}

