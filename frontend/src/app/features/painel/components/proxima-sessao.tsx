import { ArrowRight, Video } from 'lucide-react';
import { Link } from 'react-router';

import { BotaoAncora, BotaoLink } from '../../../components/ui/botao';
import { EstadoRotulado } from '../../../components/ui/marca-estado';
import { descreverEstado, rotuloDe } from '../../../core/dominio/estado';
import { formatarHora } from '../../../core/formatacao/datas';
import { useAgora } from '../../../core/hooks/use-agora';
import { estadosConsulta, rotulosModalidade } from '../../agenda/agenda.rotulos';
import { quandoSera } from '../painel.apresentacao';
import type { PainelConsulta } from '../painel.types';

/** A sessão que vem a seguir, em destaque: quando, quem e o atalho para começar. */
export function ProximaSessao({ consulta }: { consulta: PainelConsulta }) {
  const agora = useAgora();
  const inicio = new Date(consulta.inicioEm);
  const fim = new Date(consulta.fimEm);
  const estado = descreverEstado(estadosConsulta, consulta.status);
  const linkOnline = consulta.linkOnline && /^https?:\/\//i.test(consulta.linkOnline) ? consulta.linkOnline : null;
  const emBreve = inicio.getTime() - agora.getTime() < 30 * 60_000;

  return (
    <section aria-labelledby="proxima-sessao-titulo" className="animar-revelar grid gap-4 rounded-lg border border-accent-line bg-accent-wash p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <p className="text-sm font-medium text-accent-ink">Próxima sessão · {quandoSera(inicio, fim, agora)}</p>
          <h2 id="proxima-sessao-titulo" className="text-xl font-semibold text-ink">
            <Link to={`/pacientes/${consulta.pacienteId}`} className="text-ink no-underline hover:underline">
              {consulta.paciente}
            </Link>
          </h2>
          <p className="text-base text-ink-muted">
            <span className="num">
              {formatarHora(inicio)}–{formatarHora(fim)}
            </span>{' '}
            · {consulta.tipoAtendimento} · {rotuloDe(rotulosModalidade, consulta.modalidade)}
          </p>
        </div>
        <EstadoRotulado estado={estado} />
      </div>
      <div className="flex flex-wrap gap-2">
        {linkOnline && emBreve ? (
          <BotaoAncora href={linkOnline} target="_blank" rel="noreferrer noopener" variante="primario">
            <Video size={16} aria-hidden="true" />
            Entrar na sessão
            <span className="sr-only">(abre em nova aba)</span>
          </BotaoAncora>
        ) : null}
        <BotaoLink to={`/consultas/${consulta.id}`} variante="secundario">
          Abrir consulta
          <ArrowRight size={16} aria-hidden="true" />
        </BotaoLink>
        <BotaoLink to={`/pacientes/${consulta.pacienteId}`} variante="discreto">
          Ficha do paciente
        </BotaoLink>
      </div>
    </section>
  );
}
