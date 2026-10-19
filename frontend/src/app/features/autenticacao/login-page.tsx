import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { z } from 'zod';

import { Aviso } from '../../components/feedback/aviso';
import { Botao } from '../../components/ui/botao';
import { Campo, Entrada } from '../../components/ui/campo';
import { entrar } from '../../core/autenticacao/autenticacao.service';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import { MARCA } from '../../core/marca';

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
    <div className="acesso-formulario grid gap-6 sm:gap-9">
      <header className="grid gap-3">
        <h1 className="max-w-80 text-balance font-display text-[2rem] font-medium leading-[1.1] tracking-[-0.025em] sm:text-[2.5rem]">Acessar meu consultório</h1>
        <p className="text-base text-ink-muted">Entre com o e-mail cadastrado no {MARCA.nome}.</p>
      </header>

      <form className="grid gap-5" onSubmit={(evento) => void handleSubmit(enviar)(evento)} noValidate>
        <Campo rotulo="E-mail" erro={errors.email?.message}>
          <Entrada className="h-12 pointer-coarse:h-12" type="email" inputMode="email" autoComplete="email" placeholder="voce@exemplo.com.br" {...register('email')} />
        </Campo>
        <Campo
          rotulo="Senha"
          erro={errors.senha?.message}
          acaoRotulo={
            <Link className="inline-flex min-h-11 items-center text-sm font-medium" to="/recuperar-senha">
              Esqueci minha senha
            </Link>
          }
        >
          <Entrada
            className="h-12 pointer-coarse:h-12"
            type={senhaVisivel ? 'text' : 'password'}
            autoComplete="current-password"
            {...register('senha')}
            acao={
              <button
                type="button"
                onClick={() => setSenhaVisivel((atual) => !atual)}
                aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={senhaVisivel}
                className="grid size-11 place-items-center rounded-md text-ink-muted transition-colors duration-150 hover:bg-hover hover:text-ink"
              >
                {senhaVisivel ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
              </button>
            }
          />
        </Campo>

        {erroApi ? <Aviso tom="perigo">{erroApi}</Aviso> : null}

        <Botao type="submit" tamanho="grande" variante="primario" carregando={isSubmitting} className="acesso-enviar mt-1 h-12 w-full">
          Entrar
          <ArrowRight className="acesso-seta" size={18} aria-hidden="true" />
        </Botao>
      </form>

      <p className="border-t border-line pt-4 text-base text-ink-muted sm:pt-6">
        Primeiro acesso?{' '}
        <Link to="/cadastro" className="inline-flex min-h-11 items-center font-medium">
          Criar conta
        </Link>
      </p>
    </div>
  );
}

