import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Aviso } from '../../../components/feedback/aviso';
import { notificar } from '../../../components/feedback/notificar';
import { Botao } from '../../../components/ui/botao';
import { Campo, Entrada, Selecao } from '../../../components/ui/campo';
import { Gaveta } from '../../../components/ui/dialogo';
import { paraOpcoes } from '../../../core/dominio/estado';
import { mensagemDeErro } from '../../../core/erros/mensagem-de-erro';
import { SeletorPaciente } from '../../pacientes/components/seletor-paciente';
import { painelKeys } from '../../painel/painel.api';
import { criarPagamento, pagamentosKeys } from '../pagamentos.api';
import { rotulosFormaPagamento } from '../pagamentos.rotulos';

const formas = ['Pix', 'Dinheiro', 'Cartao', 'Transferencia', 'Manual', 'Outro'] as const;

const schema = z.object({
  pacienteId: z.string().min(1, 'Selecione o paciente.'),
  valor: z.string().min(1, 'Informe o valor.').refine((v) => Number(v) > 0, 'O valor deve ser maior que zero.'),
  formaPagamento: z.enum(formas),
  vencimentoEm: z.string(),
  observacao: z.string(),
});
type Formulario = z.infer<typeof schema>;

const iniciais: Formulario = { pacienteId: '', valor: '', formaPagamento: 'Pix', vencimentoEm: '', observacao: '' };
const opcoesForma = paraOpcoes(rotulosFormaPagamento);

interface GavetaPagamentoProps {
  aberto: boolean;
  aoMudar: (aberto: boolean) => void;
}

/** Cobrança avulsa. Cobranças de consulta nascem na própria consulta (ao agendar ou ao realizar a sessão). */
export function GavetaPagamento({ aberto, aoMudar }: GavetaPagamentoProps) {
  const queryClient = useQueryClient();
  const [erroApi, setErroApi] = useState('');
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Formulario>({ resolver: zodResolver(schema), defaultValues: iniciais });

  const criar = useMutation({
    mutationFn: (valores: Formulario) =>
      criarPagamento({
        pacienteId: valores.pacienteId,
        valor: Number(valores.valor),
        formaPagamento: valores.formaPagamento,
        vencimentoEm: valores.vencimentoEm ? new Date(`${valores.vencimentoEm}T12:00:00`).toISOString() : null,
        observacao: valores.observacao.trim() || null,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: pagamentosKeys.todos }),
        queryClient.invalidateQueries({ queryKey: painelKeys.todos }),
      ]);
      notificar.sucesso('Cobrança registrada.');
      reset(iniciais);
      aoMudar(false);
    },
    onError: (erro) => setErroApi(mensagemDeErro(erro, 'Não foi possível registrar o pagamento.')),
  });

  function alterarAbertura(proximo: boolean) {
    if (!proximo) {
      reset(iniciais);
      setErroApi('');
    }
    aoMudar(proximo);
  }

  return (
    <Gaveta
      aberto={aberto}
      aoMudar={alterarAbertura}
      titulo="Nova cobrança"
      descricao="Registre uma cobrança avulsa para um paciente."
      rodape={
        <>
          <Botao variante="secundario" onClick={() => alterarAbertura(false)}>
            Cancelar
          </Botao>
          <Botao type="submit" form="form-pagamento" variante="primario" carregando={criar.isPending}>
            Registrar
          </Botao>
        </>
      }
    >
      <form
        id="form-pagamento"
        className="grid gap-4"
        noValidate
        onSubmit={(evento) => {
          setErroApi('');
          void handleSubmit((valores) => criar.mutate(valores))(evento);
        }}
      >
        <Campo rotulo="Paciente" erro={errors.pacienteId?.message}>
          <Controller control={control} name="pacienteId" render={({ field }) => <SeletorPaciente valor={field.value} aoMudar={field.onChange} />} />
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Valor" erro={errors.valor?.message}>
            <Entrada type="number" inputMode="decimal" step="0.01" min="0" placeholder="0,00" {...register('valor')} />
          </Campo>
          <Campo rotulo="Forma de pagamento">
            <Selecao opcoes={opcoesForma} {...register('formaPagamento')} />
          </Campo>
        </div>
        <Campo rotulo="Vencimento" opcional>
          <Entrada type="date" {...register('vencimentoEm')} />
        </Campo>
        <Campo rotulo="Observação" opcional>
          <Entrada {...register('observacao')} />
        </Campo>
        {erroApi ? <Aviso tom="perigo">{erroApi}</Aviso> : null}
      </form>
    </Gaveta>
  );
}
