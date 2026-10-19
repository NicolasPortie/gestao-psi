export type ModalidadeAtendimento = 'Online' | 'Presencial' | 'Hibrido';
export type OrigemConsulta = 'Painel' | 'WhatsApp' | 'Chatbot' | 'Recepcionista' | 'Paciente' | 'Outro';
export type StatusConsulta =
  | 'AguardandoConfirmacao'
  | 'Agendada'
  | 'Confirmada'
  | 'Realizada'
  | 'Cancelada'
  | 'Remarcada'
  | 'NaoCompareceu';
export type DiaSemana = 'Domingo' | 'Segunda' | 'Terca' | 'Quarta' | 'Quinta' | 'Sexta' | 'Sabado';
export type CanalComunicacao = 'WhatsApp' | 'Email' | 'Sms' | 'Sistema' | 'Telefone';

export interface Consulta {
  id: string;
  pacienteId: string;
  paciente: string;
  tipoAtendimentoId: string;
  tipoAtendimento: string;
  inicioEm: string;
  fimEm: string;
  status: StatusConsulta;
  modalidade: ModalidadeAtendimento;
  linkOnline: string | null;
  enderecoAtendimento: string | null;
  observacaoAdministrativa: string | null;
  origem?: OrigemConsulta | null;
  justificativaCancelamento?: string | null;
  pagamentos?: PagamentoVinculado[];
  lembretes?: LembreteVinculado[];
  historico?: HistoricoConsultaItem[];
  /** Consultas criadas juntas (semanal ou quinzenal) compartilham a série. */
  serieId?: string | null;
  /** Quantas consultas em aberto vêm depois desta na série (só no detalhe). */
  proximasNaSerie?: number;
}

export type FrequenciaRecorrencia = 'Semanal' | 'Quinzenal';

export interface RecorrenciaConsulta {
  frequencia: FrequenciaRecorrencia;
  /** Total de consultas da série, contando a primeira. */
  ocorrencias: number;
}

export interface SerieConsultas {
  serieId: string | null;
  criadas: Consulta[];
  ignoradas: Array<{ inicioEm: string; motivo: string }>;
}

export interface PagamentoVinculado {
  id: string;
  valor: number;
  status: string;
}

export interface LembreteVinculado {
  id: string;
  status: string;
  agendadoPara: string;
}

export interface HistoricoConsultaItem {
  statusAnterior: StatusConsulta | null;
  statusNovo: StatusConsulta;
  descricao: string | null;
  criadoEm: string;
}

export interface CriarConsultaRequest {
  pacienteId: string;
  tipoAtendimentoId: string;
  listaEsperaId?: string | null;
  inicioEm: string;
  fimEm: string;
  modalidade: ModalidadeAtendimento;
  linkOnline?: string | null;
  enderecoAtendimento?: string | null;
  observacaoAdministrativa?: string | null;
  programarLembrete?: boolean | null;
  criarPagamentoPendente?: boolean;
  valorPagamento?: number | null;
  recorrencia?: RecorrenciaConsulta | null;
}

export interface AlterarStatusConsultaRequest {
  status: StatusConsulta;
  justificativa?: string | null;
}

export interface RemarcarConsultaRequest {
  novoInicioEm: string;
  novoFimEm: string;
  justificativa?: string | null;
}

export interface ConfiguracaoAtendimento {
  fusoHorario: string;
  duracaoPadraoMinutos: number;
  confirmacaoAutomaticaConsulta: boolean;
  antecedenciaMinimaAgendamentoHoras: number | null;
  antecedenciaCancelamentoHoras: number | null;
  antecedenciaRemarcacaoHoras: number | null;
  exigeJustificativaCancelamento: boolean;
  lembretesAutomaticosAtivos: boolean;
  programarLembreteAoCriarConsulta: boolean;
  programarLembreteAoConfirmar: boolean;
  antecedenciaLembreteHoras: number;
  canalLembretePadrao: CanalComunicacao;
  /** Cria a cobrança quando a sessão é marcada como realizada (paciente por sessão). */
  cobrarAoRealizar: boolean;
  /** Falta também gera cobrança. */
  cobrarFalta: boolean;
}

export interface TipoAtendimento {
  id: string;
  nome: string;
  descricao: string | null;
  duracaoMinutos: number;
  valorPadrao: number | null;
  modalidadePadrao: ModalidadeAtendimento;
  ativo: boolean;
}

export interface SalvarTipoAtendimentoRequest {
  nome: string;
  descricao?: string | null;
  duracaoMinutos: number;
  valorPadrao?: number | null;
  modalidadePadrao: ModalidadeAtendimento;
  ativo: boolean;
}

export interface HorarioDisponivel {
  id: string;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFim: string;
  ativo: boolean;
}

export interface SalvarHorarioDisponivelRequest {
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFim: string;
  ativo: boolean;
}

export interface BloqueioAgenda {
  id: string;
  titulo: string;
  descricao: string | null;
  inicioEm: string;
  fimEm: string;
  diaInteiro: boolean;
}

export interface SalvarBloqueioAgendaRequest {
  titulo: string;
  descricao?: string | null;
  inicioEm: string;
  fimEm: string;
  diaInteiro: boolean;
}
