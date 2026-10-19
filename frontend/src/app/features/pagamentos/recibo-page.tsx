import { useQuery } from '@tanstack/react-query';
import { Printer } from 'lucide-react';
import { useParams } from 'react-router';

import { CarregandoPagina } from '../../components/feedback/esqueleto';
import { EstadoErro } from '../../components/feedback/estados';
import { CabecalhoPagina, Pagina } from '../../components/layout/pagina';
import { Botao, BotaoLink } from '../../components/ui/botao';
import { rotuloDe } from '../../core/dominio/estado';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import { reaisPorExtenso } from '../../core/formatacao/extenso';
import { formatarData } from '../../core/formatacao/datas';
import { formatarMoeda } from '../../core/formatacao/moeda';
import { formatarTelefone } from '../../core/formatacao/pessoas';
import { obterRecibo, pagamentosKeys } from './pagamentos.api';
import { rotulosFormaPagamento } from './pagamentos.rotulos';

const dataPorExtenso = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

/** Recibo de um pagamento recebido, pronto para imprimir ou salvar em PDF pelo navegador. */
export default function ReciboPage() {
  const { id = '' } = useParams();
  const reciboQuery = useQuery({
    queryKey: pagamentosKeys.recibo(id),
    queryFn: ({ signal }) => obterRecibo(id, { signal }),
    enabled: Boolean(id),
    staleTime: Infinity,
  });

  if (reciboQuery.isPending) return <CarregandoPagina rotulo="Preparando o recibo…" />;
  if (reciboQuery.error || !reciboQuery.data) {
    return (
      <EstadoErro
        titulo="Não foi possível emitir o recibo"
        mensagem={mensagemDeErro(reciboQuery.error, 'Tente novamente em instantes.')}
        aoTentarNovamente={() => void reciboQuery.refetch()}
        acao={
          <BotaoLink to="/pagamentos" variante="secundario">
            Voltar ao financeiro
          </BotaoLink>
        }
      />
    );
  }

  const recibo = reciboQuery.data;
  const forma = recibo.formaPagamento === 'Manual' ? null : rotuloDe(rotulosFormaPagamento, recibo.formaPagamento);
  const referente = recibo.sessaoEm
    ? `${recibo.tipoAtendimento ? recibo.tipoAtendimento.toLocaleLowerCase('pt-BR') : 'atendimento psicológico'}, sessão de ${formatarData(recibo.sessaoEm)}`
    : 'atendimento psicológico';

  return (
    <Pagina largura="estreita" className="gap-6 print:max-w-none">
      <CabecalhoPagina
        className="nao-imprimir"
        titulo="Recibo"
        voltarPara={{ para: '/pagamentos', rotulo: 'Financeiro' }}
        descricao="Confira os dados e imprima ou salve em PDF pelo navegador."
        acoes={
          <Botao variante="primario" onClick={() => window.print()}>
            <Printer size={16} aria-hidden="true" />
            Imprimir
          </Botao>
        }
      />

      <article className="grid gap-8 rounded-lg border border-line bg-surface p-6 text-ink sm:p-10 print:border-0 print:p-0">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
          <div className="grid gap-1">
            <h2 className="text-2xl font-semibold">Recibo</h2>
            <p className="num text-sm text-ink-muted">Nº {recibo.numero}</p>
          </div>
          <p className="num text-2xl font-semibold">{formatarMoeda(recibo.valor)}</p>
        </header>

        <p className="max-w-[65ch] text-lg leading-8">
          Recebi de <strong className="font-semibold">{recibo.paciente}</strong>
          {recibo.pacienteCpf ? (
            <>
              , CPF <span className="num">{recibo.pacienteCpf}</span>
            </>
          ) : null}
          , a importância de <strong className="num font-semibold">{formatarMoeda(recibo.valor)}</strong> ({reaisPorExtenso(recibo.valor)}), referente a {referente}.
        </p>

        <dl className="grid gap-1 text-base">
          {forma ? (
            <div className="flex gap-2">
              <dt className="text-ink-muted">Forma de pagamento:</dt>
              <dd>{forma}</dd>
            </div>
          ) : null}
          <div className="flex gap-2">
            <dt className="text-ink-muted">Data do recebimento:</dt>
            <dd className="num">{dataPorExtenso.format(new Date(recibo.pagoEm))}</dd>
          </div>
        </dl>

        <footer className="grid justify-items-start gap-1 pt-10">
          <span aria-hidden="true" className="mb-2 block h-px w-72 max-w-full bg-ink" />
          <span className="text-base font-semibold">{recibo.profissional}</span>
          {recibo.crp ? (
            <span className="text-sm text-ink-muted">
              CRP <span className="num">{recibo.crp}</span>
            </span>
          ) : null}
          {recibo.emailProfissional || recibo.telefoneProfissional ? (
            <span className="text-sm text-ink-muted">
              {[recibo.emailProfissional, recibo.telefoneProfissional ? formatarTelefone(recibo.telefoneProfissional) : null].filter(Boolean).join(' · ')}
            </span>
          ) : null}
        </footer>
      </article>
    </Pagina>
  );
}
