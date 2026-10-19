import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent, type ComponentProps, type FormEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { z } from 'zod';

import { Aviso } from '../../components/feedback/aviso';
import { Botao } from '../../components/ui/botao';
import { Campo, Entrada, OpcaoMarcavel } from '../../components/ui/campo';
import { EntradaCodigo } from '../../components/ui/entrada-codigo';
import { MarcaEstado } from '../../components/ui/marca-estado';
import { ErroApi } from '../../core/api/resposta-api';
import {
  confirmarEmailCadastro,
  criarConta,
  solicitarCodigoCadastro,
  type CodigoCadastro,
} from '../../core/autenticacao/autenticacao.service';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';

const schema = z
  .object({
    email: z.string().trim().email('Informe um e-mail válido.').max(180, 'Use até 180 caracteres no e-mail.'),
    senha: z.string().min(8, 'Use pelo menos 8 caracteres.').max(200, 'Use até 200 caracteres na senha.'),
    confirmarSenha: z.string().min(1, 'Repita sua senha para confirmar.'),
    codigo: z.string().regex(/^\d{6}$/, 'Digite os 6 números do código recebido por e-mail.'),
    aceitouTermos: z.boolean().refine(Boolean, 'Aceite os termos para continuar.'),
  })
  .superRefine((dados, contexto) => {
    if (dados.senha !== dados.confirmarSenha)
      contexto.addIssue({
        code: 'custom',
        path: ['confirmarSenha'],
        message: 'As senhas não coincidem. Digite a mesma senha nos dois campos.',
      });
  });
type Formulario = z.infer<typeof schema>;

function EntradaSenha({ rotulo, ...props }: ComponentProps<typeof Entrada> & { rotulo: string }) {
  const [visivel, setVisivel] = useState(false);
  return (
    <Entrada
      {...props}
      className="h-12 pointer-coarse:h-12"
      type={visivel ? 'text' : 'password'}
      autoComplete="new-password"
      acao={
        <button
          type="button"
          aria-label={`${visivel ? 'Ocultar' : 'Mostrar'} ${rotulo}`}
          aria-pressed={visivel}
          onClick={() => setVisivel((atual) => !atual)}
          className="grid size-11 place-items-center rounded-md text-ink-muted hover:bg-hover hover:text-ink"
        >
          {visivel ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      }
    />
  );
}

export default function CadastroPage() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState<'acesso' | 'email'>('acesso');
  const [envio, setEnvio] = useState<CodigoCadastro | null>(null);
  const [comprovante, setComprovante] = useState<{ tokenEmail: string; email: string } | null>(null);
  const [processando, setProcessando] = useState(false);
  const [segundosReenvio, setSegundosReenvio] = useState(0);
  const [erroApi, setErroApi] = useState('');
  const [recusas, setRecusas] = useState(0);
  const [codigoRecusado, setCodigoRecusado] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);
  const {
    control,
    register,
    trigger,
    setValue,
    setFocus,
    getValues,
    formState: { errors },
  } = useForm<Formulario>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { email: '', senha: '', confirmarSenha: '', codigo: '', aceitouTermos: false },
  });
  const codigo = useWatch({ control, name: 'codigo' });

  /** Guarda só os dígitos e, ao completar o código, envia sem exigir o clique. */
  function definirCodigo(texto: string, formulario: HTMLFormElement | null, validar = false) {
    const digitos = texto.replace(/\D/g, '').slice(0, 6);
    setValue('codigo', digitos, { shouldValidate: validar });
    setCodigoRecusado(false);
    if (digitos.length === 6) formulario?.requestSubmit();
  }

  useEffect(() => {
    titulo.current?.focus();
  }, [etapa]);
  useEffect(() => {
    if (etapa !== 'email') return;
    const temporizador = window.setInterval(() => setSegundosReenvio((atual) => Math.max(0, atual - 1)), 1000);
    return () => window.clearInterval(temporizador);
  }, [etapa]);

  function corrigirAcesso() {
    setErroApi('');
    setEtapa('acesso');
  }

  async function enviarCodigo() {
    setErroApi('');
    setProcessando(true);
    try {
      const resposta = await solicitarCodigoCadastro(getValues('email').trim(), envio?.identificador);
      setEnvio(resposta);
      setSegundosReenvio(resposta.reenviarAposSegundos);
      setValue('codigo', '');
      setComprovante(null);
      setEtapa('email');
    } catch (erro) {
      setErroApi(mensagemDeErro(erro, 'Não foi possível enviar o código. Tente novamente.'));
    } finally {
      setProcessando(false);
    }
  }

  async function enviarEtapa(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (processando) return;
    if (etapa === 'acesso') {
      if (await trigger(['email', 'senha', 'confirmarSenha', 'aceitouTermos'], { shouldFocus: true }))
        await enviarCodigo();
      return;
    }
    if (!envio) return;
    if (!(await trigger('codigo', { shouldFocus: true }))) {
      setRecusas((atual) => atual + 1);
      return;
    }
    setErroApi('');
    setProcessando(true);
    try {
      const dados = getValues();
      let token = comprovante?.email === dados.email.trim().toLowerCase() ? comprovante.tokenEmail : null;
      if (!token) {
        const resposta = await confirmarEmailCadastro(dados.email.trim(), envio.identificador, dados.codigo).catch((erro: unknown) => {
          setCodigoRecusado(true);
          setRecusas((atual) => atual + 1);
          // Depois do balanço, as casas se esvaziam para a nova tentativa começar do primeiro dígito.
          window.setTimeout(() => {
            setValue('codigo', '');
            setFocus('codigo');
          }, 360);
          throw erro;
        });
        token = resposta.tokenEmail;
        setComprovante({ tokenEmail: token, email: dados.email.trim().toLowerCase() });
      }
      await criarConta({
        email: dados.email.trim(),
        senha: dados.senha,
        aceitouTermos: dados.aceitouTermos,
        tokenEmail: token,
      });
      await navigate('/painel', { replace: true });
    } catch (erro) {
      if (erro instanceof ErroApi && erro.status === 422) setComprovante(null);
      setErroApi(mensagemDeErro(erro, 'Não foi possível criar a conta. Tente novamente.'));
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div key={etapa} className="cadastro-etapa grid gap-6 sm:gap-8">
      <header className="grid gap-3">
        <h1 ref={titulo} tabIndex={-1} className="font-display text-3xl font-medium tracking-[-0.025em] outline-none">
          {etapa === 'acesso' ? 'Criar conta' : 'Confirme seu e-mail'}
        </h1>
        <p className="text-base text-ink-muted">
          {etapa === 'acesso'
            ? 'Crie seu acesso. Seus dados profissionais podem ficar para depois.'
            : 'Digite o código de 6 números para criar sua conta e entrar.'}
        </p>
      </header>
      <form className="grid gap-5" onSubmit={(evento) => void enviarEtapa(evento)} noValidate>
        {etapa === 'acesso' ? (
          <div key="acesso" className="grid gap-5">
            <Campo rotulo="E-mail" erro={errors.email?.message}>
              <Entrada
                className="h-12 pointer-coarse:h-12"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                {...register('email')}
              />
            </Campo>
            <Campo rotulo="Senha" erro={errors.senha?.message}>
              <EntradaSenha rotulo="senha" {...register('senha')} />
            </Campo>
            <Campo rotulo="Confirmar senha" erro={errors.confirmarSenha?.message}>
              <EntradaSenha rotulo="confirmação de senha" {...register('confirmarSenha')} />
            </Campo>
            <div className="grid gap-1.5">
              <OpcaoMarcavel
                rotulo={
                  <span>
                    Li e aceito os{' '}
                    <Link to="/termos" target="_blank" rel="noreferrer" className="font-medium">
                      termos de uso
                    </Link>{' '}
                    e a{' '}
                    <Link to="/privacidade" target="_blank" rel="noreferrer" className="font-medium">
                      política de privacidade
                    </Link>
                    .
                  </span>
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
          </div>
        ) : (
          <div key="email" className="grid gap-5">
            <div className="grid gap-1 border-b border-line pb-4">
              <p className="break-all font-medium">{getValues('email')}</p>
              <button
                type="button"
                disabled={processando}
                onClick={corrigirAcesso}
                className="min-h-11 justify-self-start text-sm font-medium text-accent-ink"
              >
                Corrigir e-mail
              </button>
            </div>
            <Campo
              rotulo="Código de confirmação"
              dica="Válido por 10 minutos. Você pode colar o código completo."
              erro={errors.codigo?.message}
            >
              <EntradaCodigo
                valor={codigo}
                estado={comprovante ? 'confirmado' : codigoRecusado ? 'erro' : 'padrao'}
                recusas={recusas}
                readOnly={Boolean(comprovante)}
                onPaste={(evento) => {
                  evento.preventDefault();
                  definirCodigo(evento.clipboardData.getData('text'), evento.currentTarget.form, true);
                }}
                {...register('codigo', {
                  onChange: (evento: ChangeEvent<HTMLInputElement>) => definirCodigo(evento.target.value, evento.target.form),
                })}
              />
            </Campo>
            {comprovante ? (
              <p role="status" className="animar-surgir -mt-2 flex items-center gap-2 text-sm font-medium text-success-ink">
                <MarcaEstado forma="check" tom="sucesso" animar />
                E-mail confirmado. Criando sua conta…
              </p>
            ) : null}
            <div className="grid gap-1 text-sm">
              <p className="text-ink-muted">Não recebeu? Confira também a pasta de spam.</p>
              <button
                type="button"
                disabled={processando || segundosReenvio > 0}
                onClick={() => void enviarCodigo()}
                className="min-h-11 justify-self-start font-medium text-accent-ink disabled:text-ink-muted"
              >
                {segundosReenvio > 0 ? `Reenviar em ${segundosReenvio}s` : 'Reenviar código'}
              </button>
            </div>
          </div>
        )}
        {erroApi ? <Aviso tom="perigo">{erroApi}</Aviso> : null}
        <div className="flex flex-col gap-2">
          <Botao
            type="submit"
            tamanho="grande"
            variante="primario"
            carregando={processando}
            className="acesso-enviar h-12 w-full"
          >
            {etapa === 'acesso' ? 'Criar conta' : 'Confirmar e criar conta'}
            <ArrowRight size={18} className="acesso-seta" aria-hidden="true" />
          </Botao>
          {etapa === 'email' ? (
            <Botao type="button" variante="discreto" disabled={processando} onClick={corrigirAcesso} className="h-11">
              <ArrowLeft size={16} aria-hidden="true" />
              Voltar
            </Botao>
          ) : null}
        </div>
      </form>
      <p className="border-t border-line pt-4 text-base text-ink-muted">
        Já tem conta?{' '}
        <Link to="/login" className="inline-flex min-h-11 items-center font-medium">
          Entrar
        </Link>
      </p>
    </div>
  );
}
