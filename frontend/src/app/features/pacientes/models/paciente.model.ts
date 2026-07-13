export type StatusPaciente = 'Ativo' | 'Inativo' | 'Arquivado';
export type TipoContatoPaciente = 'Telefone' | 'WhatsApp' | 'Email' | 'Responsavel';

export interface ContatoPaciente {
  id?: string;
  tipoContato: TipoContatoPaciente;
  valor: string;
  principal: boolean;
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
  pagina?: number;
  tamanhoPagina?: number;
}

export interface SalvarPacienteRequest {
  nomeCompleto: string;
  dataNascimento: string | null;
  cpf: string | null;
  telefone: string | null;
  whatsApp: string | null;
  email: string | null;
  observacaoAdministrativa: string | null;
  contatosAdicionais: ContatoPaciente[];
}

export interface AtualizarPacienteRequest extends SalvarPacienteRequest {
  status: StatusPaciente;
}
