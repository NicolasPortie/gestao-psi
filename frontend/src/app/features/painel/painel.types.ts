export interface PainelResumo {
  usuario: { nomeCompleto: string; primeiroNome: string; perfil: string };
  indicadores: {
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
  };
  consultasHoje: Array<{
    id: string;
    paciente: string;
    horarioInicio: string;
    duracaoMinutos: number;
    tipoAtendimento: string;
    modalidade: string;
    status: string;
    podeRegistrarSessao: boolean;
  }>;
  visaoSemana: Array<{ data: string; rotulo: string; consultas: number }>;
  alertas: Array<{ tipo: string; titulo: string; mensagem: string; criadoEm: string; rota: string | null }>;
  prioridades: Array<{ titulo: string; mensagem: string; icone: string; tom: 'alerta' | 'erro' | 'atencao' | 'neutro' | 'ok'; rota: string; acao: string }>;
  acoesRapidas: Array<{ titulo: string; descricao: string; icone: string; rota: string; habilitada: boolean }>;
}
