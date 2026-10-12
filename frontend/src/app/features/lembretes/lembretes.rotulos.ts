import type { DescricaoEstado } from '../../core/dominio/estado';
import type { StatusLembrete, TipoLembrete } from './lembretes.api';

export const estadosLembrete: Record<StatusLembrete, DescricaoEstado> = {
  Agendado: { rotulo: 'Programado', tom: 'neutro', marca: 'anel' },
  Enviado: { rotulo: 'Enviado', tom: 'sucesso', marca: 'check' },
  Falhou: { rotulo: 'Falhou', tom: 'perigo', marca: 'x' },
  Cancelado: { rotulo: 'Cancelado', tom: 'neutro', marca: 'riscado' },
  Ignorado: { rotulo: 'Ignorado', tom: 'neutro', marca: 'riscado' },
};

export const rotulosTipoLembrete: Record<TipoLembrete, string> = {
  ConfirmacaoConsulta: 'Confirmação de consulta',
  LembreteConsulta: 'Lembrete de consulta',
  CancelamentoConsulta: 'Cancelamento de consulta',
  RemarcacaoConsulta: 'Remarcação de consulta',
  PagamentoPendente: 'Pagamento pendente',
};
