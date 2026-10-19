export type StatusPaciente = 'Ativo' | 'Inativo' | 'Arquivado';
export type ModoCobranca = 'PorSessao' | 'Mensal';
export type TipoContatoPaciente = 'Telefone' | 'WhatsApp' | 'Email' | 'Responsavel' | 'Emergencia';

export interface ContatoPaciente {
  id?: string;
  tipoContato: TipoContatoPaciente;
  valor: string;
  principal: boolean;
  /** Quem atende neste contato (responsável legal, contato de emergência). */
  nome?: string | null;
}

export interface PacienteLista {
  id: string;
  nomeCompleto: string;
  dataNascimento: string | null;
  cpfMascarado: string | null;
  telefone: string | null;
  whatsApp: string | null;
  email: string | null;
  status: StatusPaciente;
  ultimaConsulta: string | null;
  proximaConsulta: string | null;
  criadoEm: string;
  atualizadoEm: string | null;
}

export interface PacienteDetalhe extends PacienteLista {
  cpf: string | null;
  observacaoAdministrativa: string | null;
  /** Valor combinado da sessão; padrão dos pagamentos criados ao agendar. */
  valorSessao: number | null;
  /** Por sessão (cobra cada sessão realizada) ou mensal (uma mensalidade com o valor combinado). */
  modoCobranca: ModoCobranca;
  /** Quando a equipe registrou o consentimento de tratamento de dados (LGPD). */
  consentimentoRegistradoEm: string | null;
  contatosAdicionais: ContatoPaciente[];
}

export interface PacientesResumo {
  ativos: number;
  inativos: number;
  arquivados: number;
}

export interface PacientesListagem {
  itens: PacienteLista[];
  resumo: PacientesResumo;
  total: number;
  pagina: number;
  tamanhoPagina: number;
}

export interface ListarPacientesFiltro {
  busca?: string;
  status?: StatusPaciente | '';
  /** Só quem já foi atendido e está sem consulta há este número de dias. */
  semConsultaHaDias?: number;
  pagina?: number;
  tamanhoPagina?: number;
}

export interface CriarPacienteRequest {
  nomeCompleto: string;
  dataNascimento: string | null;
  cpf: string | null;
  telefone: string | null;
  whatsApp: string | null;
  email: string | null;
  observacaoAdministrativa: string | null;
  valorSessao: number | null;
  modoCobranca: ModoCobranca;
  contatosAdicionais: Array<{
    tipoContato: TipoContatoPaciente;
    valor: string;
    principal: boolean;
    nome: string | null;
  }>;
}

export interface AtualizarPacienteRequest extends CriarPacienteRequest {
  status: StatusPaciente;
}

/** Pedido de acesso do titular (LGPD): só dados administrativos, nunca conteúdo clínico. */
export interface ExportacaoPaciente {
  geradoEm: string;
  cadastro: PacienteDetalhe;
  consultas: Array<{ inicioEm: string; fimEm: string; tipoAtendimento: string; modalidade: string; status: string }>;
  pagamentos: Array<{ valor: number; status: string; formaPagamento: string; vencimentoEm: string | null; pagoEm: string | null }>;
}
