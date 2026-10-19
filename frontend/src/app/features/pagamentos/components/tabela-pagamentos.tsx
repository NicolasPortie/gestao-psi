import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { notificar } from '../../../components/feedback/notificar';
import { Botao } from '../../../components/ui/botao';
import { Campo, GrupoSegmentado } from '../../../components/ui/campo';
import { Confirmacao } from '../../../components/ui/dialogo';
import { EstadoRotulado } from '../../../components/ui/marca-estado';
import { MenuAcoes, type ItemMenu } from '../../../components/ui/menu';
import { CabecalhoTabela, CelulaTabela, ColunaTabela, LinhaTabela, Tabela } from '../../../components/ui/tabela';
import { rotuloDe } from '../../../core/dominio/estado';
import { mensagemDeErro } from '../../../core/erros/mensagem-de-erro';
import { formatarData } from '../../../core/formatacao/datas';
import { formatarMoeda } from '../../../core/formatacao/moeda';
import { pacientesKeys } from '../../pacientes/pacientes.keys';
import { painelKeys } from '../../painel/painel.api';
import { alterarStatusPagamento, pagamentosKeys, type FormaPagamento, type Pagamento, type StatusPagamento } from '../pagamentos.api';
import { estadoDoPagamento, pagamentoEmAberto, rotulosFormaPagamento } from '../pagamentos.rotulos';

const formasRecebimento: FormaPagamento[] = ['Pix', 'Cartao', 'Dinheiro', 'Transferencia', 'Outro'];

const mensagens: Partial<Record<StatusPagamento, string>> = {
  Pago: 'Pagamento recebido.',
  Reembolsado: 'Pagamento reembolsado.',
  Cancelado: 'Pagamento cancelado.',
};

interface TabelaPagamentosProps {
  pagamentos: Pagamento[];
  /** Na ficha do paciente o nome é redundante. */
  mostrarPaciente?: boolean;
  rotulo?: string;
}

/**
 * Pagamentos com as ações do dia a dia: receber (escolhendo a forma), emitir recibo, reembolsar e cancelar.
 * O vencido é derivado na tela e aparece em tijolo.
 */
export function TabelaPagamentos({ pagamentos, mostrarPaciente = true, rotulo = 'Pagamentos' }: TabelaPagamentosProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [recebendo, setRecebendo] = useState<Pagamento | null>(null);
  const [forma, setForma] = useState<FormaPagamento>('Pix');
  const [pendente, setPendente] = useState<{ pagamento: Pagamento; status: 'Reembolsado' | 'Cancelado' } | null>(null);
  const hoje = new Date();

  const alterarStatus = useMutation({
    mutationFn: ({ id, novoStatus, formaPagamento }: { id: string; novoStatus: StatusPagamento; formaPagamento?: FormaPagamento }) =>
      alterarStatusPagamento(id, novoStatus, novoStatus === 'Pago' ? new Date().toISOString() : null, formaPagamento ?? null),
    onSuccess: async (_pagamento, { novoStatus }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: pagamentosKeys.todos }),
        queryClient.invalidateQueries({ queryKey: painelKeys.todos }),
        queryClient.invalidateQueries({ queryKey: pacientesKeys.todos }),
      ]);
      notificar.sucesso(mensagens[novoStatus] ?? 'Pagamento atualizado.');
      setPendente(null);
      setRecebendo(null);
    },
    onError: (erro) => {
      notificar.erro(mensagemDeErro(erro, 'Não foi possível atualizar o pagamento.'));
      setPendente(null);
    },
  });

  function abrirRecebimento(pagamento: Pagamento) {
    setForma(pagamento.formaPagamento === 'Manual' ? 'Pix' : pagamento.formaPagamento);
    setRecebendo(pagamento);
  }

  return (
    <>
      <Tabela rotulo={rotulo}>
        <CabecalhoTabela>
          <tr>
            <ColunaTabela>{mostrarPaciente ? 'Paciente' : 'Referente a'}</ColunaTabela>
            <ColunaTabela className="text-right">Valor</ColunaTabela>
            <ColunaTabela ocultarAte="md">Forma</ColunaTabela>
            <ColunaTabela ocultarAte="lg">Vencimento</ColunaTabela>
            <ColunaTabela ocultarAte="lg">Recebido em</ColunaTabela>
            <ColunaTabela ocultarAte="sm">Estado</ColunaTabela>
            <ColunaTabela className="w-px">
              <span className="sr-only">Ações</span>
            </ColunaTabela>
          </tr>
        </CabecalhoTabela>
        <tbody>
          {pagamentos.map((pagamento) => {
            const estado = estadoDoPagamento(pagamento, hoje);
            const emAberto = pagamentoEmAberto(pagamento.status);
            const referencia = pagamento.sessaoEm ? `Sessão de ${formatarData(pagamento.sessaoEm)}` : (pagamento.observacao ?? 'Cobrança avulsa');
            const itensMenu: ItemMenu[] = [
              ...(pagamento.status === 'Pago'
                ? [
                    { rotulo: 'Emitir recibo', aoSelecionar: () => void navigate(`/pagamentos/${pagamento.id}/recibo`) },
                    { rotulo: 'Reembolsar…', separador: true, aoSelecionar: () => setPendente({ pagamento, status: 'Reembolsado' as const }) },
                  ]
                : []),
              ...(emAberto ? [{ rotulo: 'Cancelar cobrança…', perigo: true, aoSelecionar: () => setPendente({ pagamento, status: 'Cancelado' as const }) }] : []),
              ...(pagamento.consultaId ? [{ rotulo: 'Abrir consulta', separador: true, aoSelecionar: () => void navigate(`/consultas/${pagamento.consultaId}`) }] : []),
            ];
            return (
              <LinhaTabela key={pagamento.id}>
                <CelulaTabela>
                  {mostrarPaciente ? (
                    <Link to={`/pacientes/${pagamento.pacienteId}?aba=financeiro`} className="font-medium text-ink no-underline hover:underline">
                      {pagamento.paciente}
                    </Link>
                  ) : null}
                  <span className={mostrarPaciente ? 'block max-w-40 truncate text-sm text-ink-muted sm:max-w-xs' : 'block font-medium text-ink'}>{referencia}</span>
                  <span className="mt-1 block sm:hidden">
                    <EstadoRotulado estado={estado} compacto />
                  </span>
                </CelulaTabela>
                <CelulaTabela className="num whitespace-nowrap text-right font-semibold">{formatarMoeda(pagamento.valor)}</CelulaTabela>
                <CelulaTabela ocultarAte="md" className="text-ink-muted">
                  {rotuloDe(rotulosFormaPagamento, pagamento.formaPagamento)}
                </CelulaTabela>
                <CelulaTabela ocultarAte="lg" className="num text-ink-muted">
                  {formatarData(pagamento.vencimentoEm, '—')}
                </CelulaTabela>
                <CelulaTabela ocultarAte="lg" className="num text-ink-muted">
                  {formatarData(pagamento.pagoEm, '—')}
                </CelulaTabela>
                <CelulaTabela ocultarAte="sm">
                  <EstadoRotulado estado={estado} compacto />
                </CelulaTabela>
                <CelulaTabela className="whitespace-nowrap text-right">
                  <div className="relative z-10 flex items-center justify-end gap-1">
                    {emAberto ? (
                      <Botao
                        variante="discreto"
                        tamanho="pequeno"
                        className="font-semibold text-accent-ink hover:bg-accent-wash hover:text-accent-ink max-sm:size-9 max-sm:px-0 max-sm:pointer-coarse:size-11"
                        onClick={() => abrirRecebimento(pagamento)}
                        aria-label={`Receber: ${formatarMoeda(pagamento.valor)} de ${pagamento.paciente}`}
                      >
                        <Check size={16} className="sm:hidden" aria-hidden="true" />
                        <span className="max-sm:hidden">Receber</span>
                      </Botao>
                    ) : null}
                    {itensMenu.length > 0 ? <MenuAcoes rotulo={`Mais ações do pagamento de ${pagamento.paciente}`} itens={itensMenu} /> : null}
                  </div>
                </CelulaTabela>
              </LinhaTabela>
            );
          })}
        </tbody>
      </Tabela>

      <Confirmacao
        aberto={recebendo !== null}
        aoMudar={(aberto) => !aberto && setRecebendo(null)}
        titulo="Registrar recebimento"
        descricao={recebendo ? `${formatarMoeda(recebendo.valor)} de ${recebendo.paciente}, recebido hoje.` : ''}
        rotuloConfirmar="Confirmar recebimento"
        rotuloCancelar="Voltar"
        carregando={alterarStatus.isPending}
        aoConfirmar={() => recebendo && alterarStatus.mutate({ id: recebendo.id, novoStatus: 'Pago', formaPagamento: forma })}
      >
        <Campo rotulo="Forma de pagamento" grupo>
          <GrupoSegmentado
            rotulo="Forma de pagamento"
            tamanho="pequeno"
            quebrar
            valor={forma}
            aoMudar={setForma}
            opcoes={formasRecebimento.map((valor) => ({ valor, rotulo: rotulosFormaPagamento[valor] }))}
          />
        </Campo>
      </Confirmacao>

      <Confirmacao
        aberto={pendente !== null}
        aoMudar={(aberto) => !aberto && setPendente(null)}
        titulo={pendente?.status === 'Reembolsado' ? 'Reembolsar este pagamento?' : 'Cancelar esta cobrança?'}
        descricao={
          pendente
            ? `${formatarMoeda(pendente.pagamento.valor)} de ${pendente.pagamento.paciente} será marcado como ${pendente.status === 'Reembolsado' ? 'reembolsado' : 'cancelado'}.`
            : ''
        }
        rotuloConfirmar={pendente?.status === 'Reembolsado' ? 'Reembolsar' : 'Cancelar cobrança'}
        rotuloCancelar="Voltar"
        perigoso={pendente?.status === 'Cancelado'}
        carregando={alterarStatus.isPending}
        aoConfirmar={() => pendente && alterarStatus.mutate({ id: pendente.pagamento.id, novoStatus: pendente.status })}
      />
    </>
  );
}
