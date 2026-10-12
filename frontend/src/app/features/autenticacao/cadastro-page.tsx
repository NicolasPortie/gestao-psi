import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { z } from 'zod';

import { Aviso } from '../../components/feedback/aviso';
import { Botao } from '../../components/ui/botao';
import { Campo, Entrada, OpcaoMarcavel } from '../../components/ui/campo';
import { criarConta } from '../../core/autenticacao/autenticacao.service';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import { formatarCrp } from '../../core/formatacao/pessoas';

const schema = z.object({
  nomeCompleto: z.string().trim().min(3, 'Informe seu nome completo.'),
  email: z.string().email('Informe um e-mail válido.'),
  crp: z.string().min(4, 'Informe seu CRP.'),
  senha: z.string().min(8, 'Use pelo menos 8 caracteres.'),
  aceitouTermos: z.boolean().refine((valor) => valor, 'Aceite os termos para continuar.'),
});
type Formulario = z.infer<typeof schema>;

export default function CadastroPage() {
  const navigate = useNavigate();
  const [erroApi, setErroApi] = useState('');
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Formulario>({
    resolver: zodResolver(schema),
    defaultValues: { nomeCompleto: '', email: '', crp: '', senha: '', aceitouTermos: false },
  });

  async function enviar(dados: Formulario) {
    setErroApi('');
    try {
      await criarConta(dados);
      await navigate('/painel', { replace: true });
    } catch (erro) {
      setErroApi(mensagemDeErro(erro, 'Não foi possível criar a conta. Tente novamente.'));
    }
  }

  return (
    <div className="grid gap-8">
      <header className="grid gap-1.5">
        <h1 className="text-2xl font-semibold tracking-[-0.015em]">Criar conta</h1>
        <p className="text-base text-ink-muted">Uma conta privada e isolada para o seu consultório.</p>
      </header>

      <form className="grid gap-4" onSubmit={(evento) => void handleSubmit(enviar)(evento)} noValidate>
        <Campo rotulo="Nome completo" erro={errors.nomeCompleto?.message}>
          <Entrada autoComplete="name" {...register('nomeCompleto')} />
        </Campo>
        <Campo rotulo="E-mail" erro={errors.email?.message}>
          <Entrada type="email" inputMode="email" autoComplete="email" {...register('email')} />
        </Campo>
        <Campo rotulo="CRP" dica="Número de registro no Conselho Regional de Psicologia." erro={errors.crp?.message}>
          <Entrada
            inputMode="numeric"
            autoComplete="off"
            placeholder="06/123456"
            {...register('crp', {
              onChange: (evento: ChangeEvent<HTMLInputElement>) => setValue('crp', formatarCrp(evento.target.value)),
            })}
          />
        </Campo>
        <Campo rotulo="Senha" dica="Mínimo de 8 caracteres." erro={errors.senha?.message}>
          <Entrada type="password" autoComplete="new-password" {...register('senha')} />
        </Campo>

        <div className="grid gap-1.5">
          <OpcaoMarcavel
            rotulo={
              <>
                Li e aceito os{' '}
                <Link to="/termos" target="_blank" rel="noreferrer" className="font-medium">
                  termos de uso
                </Link>{' '}
                e a{' '}
                <Link to="/privacidade" target="_blank" rel="noreferrer" className="font-medium">
                  política de privacidade
                </Link>
                .
              </>
            }
            aria-invalid={Boolean(errors.aceitouTermos) || undefined}
            {...register('aceitouTermos')}
          />
          {errors.aceitouTermos ? (
            <p role="alert" className="text-xs text-danger-ink">
              {errors.aceitouTermos.message}
            </p>
          ) : null}
        </div>

        {erroApi ? <Aviso tom="perigo">{erroApi}</Aviso> : null}

        <Botao type="submit" tamanho="grande" variante="primario" carregando={isSubmitting} className="mt-1 w-full">
          Criar conta
        </Botao>
      </form>

      <p className="text-center text-base text-ink-muted">
        Já tem conta?{' '}
        <Link to="/login" className="font-medium">
          Entrar
        </Link>
      </p>
    </div>
  );
}
