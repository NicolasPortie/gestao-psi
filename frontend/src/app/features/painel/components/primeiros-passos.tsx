import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { Botao } from '../../../components/ui/botao';
import { cn } from '../../../components/ui/cn';
import type { PainelPrimeirosPassos } from '../painel.types';

const CHAVE_DISPENSA = 'gestaopsi:primeiros-passos-dispensado';

const passos: Array<{ chave: keyof PainelPrimeirosPassos; titulo: string; rota: string; opcional?: boolean }> = [
  { chave: 'dadosProfissionais', titulo: 'Preencher nome e CRP', rota: '/configuracoes/profissional' },
  { chave: 'horariosAtendimento', titulo: 'Definir os horários de atendimento', rota: '/configuracoes/agenda?aba=horarios' },
  { chave: 'tiposAtendimento', titulo: 'Cadastrar os tipos de atendimento e valores', rota: '/configuracoes/agenda?aba=tipos' },
  { chave: 'primeiroPaciente', titulo: 'Cadastrar o primeiro paciente', rota: '/pacientes/novo' },
  { chave: 'whatsApp', titulo: 'Conectar o WhatsApp do consultório', rota: '/configuracoes/whatsapp', opcional: true },
];

function lerDispensa() {
  try {
    return window.localStorage.getItem(CHAVE_DISPENSA) === '1';
  } catch {
    return false;
  }
}

/** Lista de começo para a conta nova; some sozinha quando os passos essenciais estão feitos, ou quando dispensada. */
export function PrimeirosPassos({ estado }: { estado: PainelPrimeirosPassos }) {
  const [dispensado, setDispensado] = useState(lerDispensa);
  const essenciais = passos.filter((passo) => !passo.opcional);
  const feitos = essenciais.filter((passo) => estado[passo.chave]).length;
  if (dispensado || feitos === essenciais.length) return null;

  function dispensar() {
    try {
      window.localStorage.setItem(CHAVE_DISPENSA, '1');
    } catch {
      // Sem armazenamento, some só até recarregar.
    }
    setDispensado(true);
  }

  return (
    <section aria-labelledby="primeiros-passos" className="grid gap-3 rounded-lg border border-line bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-0.5">
          <h2 id="primeiros-passos" className="text-lg font-semibold text-ink">
            Primeiros passos
          </h2>
          <p className="text-sm text-ink-muted">
            {feitos} de {essenciais.length} feitos. Com eles, agenda, cobranças e lembretes funcionam sozinhos.
          </p>
        </div>
        <Botao variante="discreto" tamanho="icone-pequeno" aria-label="Dispensar primeiros passos" onClick={dispensar}>
          <X size={16} aria-hidden="true" />
        </Botao>
      </div>
      <ol className="grid gap-1">
        {passos.map((passo) => {
          const feito = estado[passo.chave];
          return (
            <li key={passo.chave}>
              <Link
                to={passo.rota}
                className={cn(
                  'flex items-center gap-3 rounded-md px-2 py-2 no-underline transition-colors duration-150 ease-out hover:bg-hover',
                  feito ? 'text-ink-muted' : 'text-ink',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'grid size-6 shrink-0 place-items-center rounded-full border',
                    feito ? 'border-success bg-success text-on-accent' : 'border-line-strong',
                  )}
                >
                  {feito ? <Check size={14} /> : null}
                </span>
                <span className={cn('text-base', feito && 'line-through')}>{passo.titulo}</span>
                {passo.opcional ? <span className="text-sm text-ink-muted">(opcional)</span> : null}
                <span className="sr-only">{feito ? '(feito)' : '(a fazer)'}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
