import { ChevronDown, CircleAlert, Search, X } from 'lucide-react';
import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';

import type { OpcaoSelecao } from '../../core/dominio/estado';
import { cn } from './cn';
import { ContextoCampo, useCampo } from './campo-contexto';

interface CampoProps {
  rotulo: string;
  dica?: string;
  erro?: string;
  opcional?: boolean;
  /** Mantém o rótulo para leitores de tela, mas o oculta visualmente (ex.: campo de busca). */
  rotuloOculto?: boolean;
  /** Elemento alinhado à direita do rótulo (ex.: "Esqueci minha senha"). */
  acaoRotulo?: ReactNode;
  /** Para controles compostos (ex.: grupo de opções): o rótulo nomeia um grupo em vez de um único campo. */
  grupo?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Rótulo + dica + controle + erro, ligados por ids. O controle filho (Entrada,
 * Selecao, AreaTexto) herda id, aria-invalid e aria-describedby do contexto.
 */
export function Campo({ rotulo, dica, erro, opcional, rotuloOculto, acaoRotulo, grupo, className, children }: CampoProps) {
  const id = useId();
  const dicaId = dica ? `${id}-dica` : undefined;
  const erroId = erro ? `${id}-erro` : undefined;
  const descricao = [dicaId, erroId].filter(Boolean).join(' ') || undefined;

  return (
    <ContextoCampo value={{ id, invalido: Boolean(erro), descricao }}>
      <div
        role={grupo ? 'group' : undefined}
        aria-labelledby={grupo ? `${id}-rotulo` : undefined}
        className={cn('grid content-start gap-1.5', className)}
      >
        <div className={cn('flex items-baseline justify-between gap-3', rotuloOculto && 'sr-only')}>
          {grupo ? (
            <span id={`${id}-rotulo`} className="text-sm font-medium text-ink">
              {rotulo}
              {opcional ? <span className="ml-1.5 font-normal text-ink-muted">(opcional)</span> : null}
            </span>
          ) : (
            <label htmlFor={id} className="text-sm font-medium text-ink">
              {rotulo}
              {opcional ? <span className="ml-1.5 font-normal text-ink-muted">(opcional)</span> : null}
            </label>
          )}
          {acaoRotulo}
        </div>
        {dica ? (
          <p id={dicaId} className="-mt-0.5 text-xs text-ink-muted">
            {dica}
          </p>
        ) : null}
        {children}
        {erro ? (
          <p id={erroId} role="alert" className="animar-surgir flex items-start gap-1.5 text-xs text-danger-ink">
            <CircleAlert size={14} className="mt-px shrink-0" aria-hidden="true" />
            {erro}
          </p>
        ) : null}
      </div>
    </ContextoCampo>
  );
}

const estiloControle = cn(
  'w-full rounded-md border border-line-strong bg-field px-3 text-base text-ink',
  'h-9 pointer-coarse:h-11',
  'transition-[border-color,outline-color] duration-150 ease-out',
  'hover:border-ink-muted',
  'focus-visible:border-focus focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus',
  'disabled:cursor-not-allowed disabled:bg-hover disabled:text-ink-faint disabled:hover:border-line-strong',
  'aria-invalid:border-danger aria-invalid:focus-visible:outline-danger',
);

interface EntradaProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>;
  icone?: ReactNode;
  /** Controle à direita dentro do campo (ex.: mostrar senha, limpar). */
  acao?: ReactNode;
}

export function Entrada({ icone, acao, className, id, ...props }: EntradaProps) {
  const campo = useCampo(id);
  const entrada = (
    <input
      {...campo}
      {...props}
      className={cn(estiloControle, icone && 'pl-9', acao && 'pr-11', className)}
    />
  );
  if (!icone && !acao) return entrada;
  return (
    <div className="relative">
      {icone ? (
        <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-ink-muted" aria-hidden="true">
          {icone}
        </span>
      ) : null}
      {entrada}
      {acao ? <span className="absolute inset-y-0 right-1 flex items-center">{acao}</span> : null}
    </div>
  );
}

interface CampoBuscaProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> {
  valor: string;
  aoMudar: (valor: string) => void;
}

/** Busca textual com ícone e limpeza; o rótulo acessível vem do aria-label. */
export function CampoBusca({ valor, aoMudar, className, ...props }: CampoBuscaProps) {
  return (
    <Entrada
      type="search"
      role="searchbox"
      value={valor}
      onChange={(evento) => aoMudar(evento.target.value)}
      icone={<Search size={16} />}
      acao={
        valor ? (
          <button
            type="button"
            className="grid size-7 place-items-center rounded-sm text-ink-muted transition-colors duration-150 hover:bg-hover hover:text-ink pointer-coarse:size-9"
            aria-label="Limpar busca"
            onClick={() => aoMudar('')}
          >
            <X size={15} />
          </button>
        ) : null
      }
      className={cn('[&::-webkit-search-cancel-button]:hidden', className)}
      {...props}
    />
  );
}

interface SelecaoProps extends SelectHTMLAttributes<HTMLSelectElement> {
  ref?: Ref<HTMLSelectElement>;
  opcoes?: ReadonlyArray<OpcaoSelecao<string | number>>;
  /** Primeira opção vazia, ex.: "Selecione…". */
  placeholder?: string;
}

/** Seleção nativa estilizada: preserva teclado, leitores de tela e o seletor do sistema no celular. */
export function Selecao({ opcoes, placeholder, className, children, id, ...props }: SelecaoProps) {
  const campo = useCampo(id);
  return (
    <div className="relative">
      <select {...campo} {...props} className={cn(estiloControle, 'appearance-none pr-9', className)}>
        {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
        {opcoes?.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.rotulo}
          </option>
        ))}
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted"
        aria-hidden="true"
      />
    </div>
  );
}

interface AreaTextoProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: Ref<HTMLTextAreaElement>;
}

export function AreaTexto({ className, id, rows = 4, ...props }: AreaTextoProps) {
  const campo = useCampo(id);
  return (
    <textarea
      {...campo}
      rows={rows}
      {...props}
      className={cn(estiloControle, 'h-auto min-h-24 resize-y py-2 leading-6 pointer-coarse:h-auto', className)}
    />
  );
}

interface OpcaoMarcavelProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  ref?: Ref<HTMLInputElement>;
  rotulo: ReactNode;
  descricao?: ReactNode;
  tipo?: 'checkbox' | 'radio' | 'interruptor';
}

/** Caixa, opção ou interruptor com rótulo clicável e descrição opcional. */
export function OpcaoMarcavel({ rotulo, descricao, tipo = 'checkbox', className, id, ...props }: OpcaoMarcavelProps) {
  const gerado = useId();
  const idControle = id ?? gerado;
  const classeControle = tipo === 'checkbox' ? 'caixa' : tipo === 'radio' ? 'opcao' : 'interruptor';
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <input
        id={idControle}
        type={tipo === 'interruptor' ? 'checkbox' : tipo}
        role={tipo === 'interruptor' ? 'switch' : undefined}
        aria-describedby={descricao ? `${idControle}-descricao` : undefined}
        className={cn(classeControle, 'mt-px')}
        {...props}
      />
      <label htmlFor={idControle} className="grid cursor-pointer gap-0.5 text-base leading-5 text-ink">
        {rotulo}
        {descricao ? (
          <span id={`${idControle}-descricao`} className="text-sm text-ink-muted">
            {descricao}
          </span>
        ) : null}
      </label>
    </div>
  );
}

interface GrupoSegmentadoProps<Valor extends string | number> {
  rotulo: string;
  valor: Valor;
  aoMudar: (valor: Valor) => void;
  opcoes: ReadonlyArray<{ valor: Valor; rotulo: string; contagem?: number }>;
  tamanho?: 'pequeno' | 'medio';
  /** Em espaços estreitos (diálogos), as opções quebram linha em vez de rolar. */
  quebrar?: boolean;
  className?: string;
}

/**
 * Escolha única num trilho em pílula: a opção marcada sobe como uma pastilha clara sobre o trilho.
 * Navegação por setas é a nativa do radio.
 */
export function GrupoSegmentado<Valor extends string | number>({
  rotulo,
  valor,
  aoMudar,
  opcoes,
  tamanho = 'medio',
  quebrar = false,
  className,
}: GrupoSegmentadoProps<Valor>) {
  const nome = useId();
  return (
    <div
      role="radiogroup"
      aria-label={rotulo}
      className={cn('sem-barra flex max-w-full overflow-x-auto', className)}
    >
      <div className={cn('gap-0.5 bg-pressed p-1', quebrar ? 'flex flex-wrap rounded-2xl' : 'inline-flex rounded-full')}>
        {opcoes.map((opcao) => (
          <label key={String(opcao.valor)} className="relative cursor-pointer">
            <input
              type="radio"
              name={nome}
              value={String(opcao.valor)}
              checked={opcao.valor === valor}
              onChange={() => aoMudar(opcao.valor)}
              aria-label={opcao.contagem !== undefined ? `${opcao.rotulo} (${opcao.contagem})` : opcao.rotulo}
              className="peer sr-only"
            />
            <span
              className={cn(
                'flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 font-medium text-ink-muted',
                'transition-[background-color,color,box-shadow] duration-150 ease-out',
                'hover:text-ink peer-checked:bg-surface peer-checked:text-ink peer-checked:shadow-ring',
                'peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-2 peer-focus-visible:outline-focus',
                tamanho === 'pequeno' ? 'h-7 text-sm pointer-coarse:h-9' : 'h-8 text-sm pointer-coarse:h-10',
              )}
            >
              {opcao.rotulo}
              {opcao.contagem !== undefined ? (
                <span className="num min-w-5 rounded-full bg-hover px-1.5 text-center text-xs font-normal leading-5 text-ink-muted">
                  {opcao.contagem}
                </span>
              ) : null}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
