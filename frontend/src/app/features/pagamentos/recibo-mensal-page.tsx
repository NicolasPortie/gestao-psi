import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Printer } from 'lucide-react';
import { useParams, useSearchParams } from 'react-router';

import { CarregandoPagina } from '../../components/feedback/esqueleto';
import { EstadoErro } from '../../components/feedback/estados';
import { CabecalhoPagina, Pagina } from '../../components/layout/pagina';
import { Botao, BotaoLink } from '../../components/ui/botao';
import { rotuloDe } from '../../core/dominio/estado';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import { reaisPorExtenso } from '../../core/formatacao/extenso';
import { formatarData, formatarMesAno } from '../../core/formatacao/datas';
import { formatarMoeda } from '../../core/formatacao/moeda';
import { formatarTelefone } from '../../core/formatacao/pessoas';
import { obterReciboMensal, pagamentosKeys } from './pagamentos.api';
import { rotulosFormaPagamento } from './pagamentos.rotulos';

const dataPorExtenso = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

function lerMes(valor: string | null) {
  const [ano, mes] = (valor ?? '').split('-').map(Number);
  const hoje = new Date();
  return ano && mes && mes >= 1 && mes <= 12 ? { ano, mes } : { ano: hoje.getFullYear(), mes: hoje.getMonth() + 1 };
}

/** Um recibo com todos os pagamentos recebidos do paciente no mês, para reembolso de convênio e imposto de renda. */
export default function ReciboMensalPage() {
  const { id = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const { ano, mes } = lerMes(params.get('mes'));
  const referencia = new Date(ano, mes - 1, 1);

  const reciboQuery = useQuery({
    queryKey: [...pagamentosKeys.todos, 'recibo-mensal', id, ano, mes],
    queryFn: ({ signal }) => obterReciboMensal(id, ano, mes, { signal }),
    enabled: Boolean(id),
    retry: false,
  });

  function irPara(deslocamento: number) {
    const alvo = new Date(ano, mes - 1 + deslocamento, 1);
    setParams({ mes: `${alvo.getFullYear()}-${String(alvo.getMonth() + 1).padStart(2, '0')}` }, { replace: true });
  }

  const navegacao = (
    <div className="nao-imprimir flex items-center gap-1" role="group" aria-label="Mês do recibo">
      <Botao variante="secundario" tamanho="icone" aria-label="Mês anterior" onClick={() => irPara(-1)}>
        <ChevronLeft size={16} aria-hidden="true" />
      </Botao>
      <span className="min-w-36 text-center text-base font-semibold text-ink">{formatarMesAno(referencia)}</span>
      <Botao variante="secundario" tamanho="icone" aria-label="Próximo mês" onClick={() => irPara(1)}>
        <ChevronRight size={16} aria-hidden="true" />
      </Botao>
    </div>
  );

  if (reciboQuery.isPending) return <CarregandoPagina rotulo="Preparando o recibo do mês…" />;

  return (
    <Pagina largura="estreita" className="gap-6">
      <CabecalhoPagina
        className="nao-imprimir"
        titulo="Recibo do mês"
        voltarPara={{ para: `/pacientes/${id}?aba=financeiro`, rotulo: 'Ficha do paciente' }}
        descricao="Todos os pagamentos recebidos no mês num só recibo. Imprima ou salve em PDF pelo navegador."
        acoes={
          reciboQuery.data ? (
            <Botao variante="primario" onClick={() => window.print()}>
              <Printer size={16} aria-hidden="true" />
              Imprimir
            </Botao>
          ) : undefined
        }
      />
      {navegacao}

      {reciboQuery.error || !reciboQuery.data ? (
        <EstadoErro
          titulo="Sem recibo para este mês"
          mensagem={mensagemDeErro(reciboQuery.error, 'Tente novamente em instantes.')}
          acao={
            <BotaoLink to={`/pacientes/${id}?aba=financeiro`} variante="secundario">
              Voltar à ficha
            </BotaoLink>
          }
        />
      ) : (
        <article className="grid gap-7 rounded-lg border border-line bg-surface p-6 text-ink sm:p-10 print:border-0 print:p-0">
          <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
            <div className="grid gap-1">
              <h2 className="text-2xl font-semibold">Recibo</h2>
              <p className="text-sm text-ink-muted">Referente a {formatarMesAno(referencia)}</p>
            </div>
            <p className="num text-2xl font-semibold">{formatarMoeda(reciboQuery.data.total)}</p>
          </header>

          <p className="max-w-[65ch] text-lg leading-8">
            Recebi de <strong className="font-semibold">{reciboQuery.data.paciente}</strong>
            {reciboQuery.data.pacienteCpf ? (
              <>
                , CPF <span className="num">{reciboQuery.data.pacienteCpf}</span>
              </>
            ) : null}
            , a importância de <strong className="num font-semibold">{formatarMoeda(reciboQuery.data.total)}</strong> ({reaisPorExtenso(reciboQuery.data.total)}),
            referente a atendimento psicológico conforme os itens abaixo.
          </p>

          <table className="w-full border-collapse text-left text-base">
            <thead>
              <tr className="border-b border-line text-sm text-ink-muted">
                <th className="py-2 pr-3 font-medium">Referência</th>
                <th className="py-2 pr-3 font-medium">Recebido em</th>
                <th className="py-2 pr-3 font-medium max-sm:hidden">Forma</th>
                <th className="py-2 text-right font-medium">Valor</th>
              </tr>
            </thead>
            <tbody>
              {reciboQuery.data.itens.map((item) => (
                <tr key={`${item.pagoEm}-${item.referencia}`} className="border-b border-line last:border-b-0">
                  <td className="py-2.5 pr-3">{item.referencia}</td>
                  <td className="num py-2.5 pr-3">{formatarData(item.pagoEm)}</td>
                  <td className="py-2.5 pr-3 max-sm:hidden">{rotuloDe(rotulosFormaPagamento, item.formaPagamento)}</td>
                  <td className="num py-2.5 text-right">{formatarMoeda(item.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-base text-ink-muted">Emitido em {dataPorExtenso.format(new Date())}.</p>

          <footer className="grid justify-items-start gap-1 pt-8">
            <span aria-hidden="true" className="mb-2 block h-px w-72 max-w-full bg-ink" />
            <span className="text-base font-semibold">{reciboQuery.data.profissional}</span>
            {reciboQuery.data.crp ? (
              <span className="text-sm text-ink-muted">
                CRP <span className="num">{reciboQuery.data.crp}</span>
              </span>
            ) : null}
            {reciboQuery.data.emailProfissional || reciboQuery.data.telefoneProfissional ? (
              <span className="text-sm text-ink-muted">
                {[reciboQuery.data.emailProfissional, reciboQuery.data.telefoneProfissional ? formatarTelefone(reciboQuery.data.telefoneProfissional) : null]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            ) : null}
          </footer>
        </article>
      )}
    </Pagina>
  );
}
