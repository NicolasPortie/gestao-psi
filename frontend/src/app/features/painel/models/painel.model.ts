export interface PainelResumo {
  usuario: PainelUsuario;
  indicadores: PainelIndicadores;
  consultasHoje: PainelConsultaHoje[];
  visaoSemana: PainelDiaSemana[];
  alertas: PainelAlerta[];
  prioridades: PainelPrioridade[];
  acoesRapidas: PainelAcaoRapida[];
}

export interface PainelUsuario {
  nomeCompleto: string;
  primeiroNome: string;
  perfil: string;
}

export interface PainelIndicadores {
  consultasHoje: number;
  consultasRestantesHoje: number;
  consultasAguardandoConfirmacao: number;
  pacientesAtivos: number;
  pagamentosPendentes: number;
  lembretesFalhosHoje: number;
  conversasWhatsappAbertas: number;
  conversasWhatsappAtendimentoHumano: number;
  notificacoesNaoLidas: number;
  progressoMensalPercentual: number;
}

export interface PainelConsultaHoje {
  id: string;
  paciente: string;
  horarioInicio: string;
  duracaoMinutos: number;
  tipoAtendimento: string;
  modalidade: string;
  status: string;
  podeRegistrarSessao: boolean;
}

export interface PainelDiaSemana {
  data: string;
  rotulo: string;
  consultas: number;
}

export interface PainelAlerta {
  tipo: string;
  titulo: string;
  mensagem: string;
  criadoEm: string;
  rota: string | null;
}

export interface PainelPrioridade {
  titulo: string;
  mensagem: string;
  icone: string;
  tom: 'alerta' | 'erro' | 'atencao' | 'neutro' | 'ok';
  rota: string;
  acao: string;
}

export interface PainelAcaoRapida {
  titulo: string;
  descricao: string;
  icone: string;
  rota: string;
  habilitada: boolean;
}
