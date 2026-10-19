import type { OpcaoSelecao } from '../../core/dominio/estado';

/**
 * Ações registradas pelo back-end (`TipoAcao`), em linguagem de consultório.
 * O código original continua disponível no detalhe do registro.
 */
const rotulosAcao: Record<string, string> = {
  Login: 'Entrada no sistema',
  CriacaoConta: 'Conta criada',

  PacienteCriado: 'Paciente cadastrado',
  PacienteAtualizado: 'Dados do paciente alterados',

  ConsultaCriada: 'Consulta marcada',
  ConsultaCriadaBot: 'Consulta marcada pelo assistente',
  ConsultaRemarcada: 'Consulta remarcada',
  ConsultaRemarcadaBot: 'Consulta remarcada pelo assistente',
  ConsultaConfirmadaBot: 'Presença confirmada pelo assistente',
  ConsultaCanceladaBot: 'Consulta cancelada pelo assistente',
  StatusConsultaAlterado: 'Situação da consulta alterada',
  SerieConsultasCriada: 'Consultas repetidas marcadas',
  SerieConsultasCancelada: 'Consultas da série canceladas',

  RegistroSessaoCriado: 'Registro de sessão criado',
  EvolucaoProntuarioCriada: 'Evolução registrada no prontuário',

  DocumentoPsicologicoCriado: 'Documento criado',
  DocumentoPsicologicoAtualizado: 'Documento alterado',
  DocumentoPsicologicoFinalizado: 'Documento finalizado',
  EntregaDocumentoPsicologicoRegistrada: 'Entrega de documento registrada',

  PagamentoCriado: 'Pagamento registrado',
  PagamentoCriadoConsulta: 'Pagamento registrado na consulta',
  StatusPagamentoAlterado: 'Situação do pagamento alterada',
  ReciboEmitido: 'Recibo emitido',

  ListaEsperaCriada: 'Paciente colocado na lista de espera',
  ListaEsperaCriadaBot: 'Lista de espera: pedido feito pelo assistente',
  ListaEsperaAgendada: 'Paciente da lista de espera agendado',
  StatusListaEsperaAlterado: 'Situação na lista de espera alterada',

  BloqueioAgendaCriado: 'Horário bloqueado na agenda',
  BloqueioAgendaAtualizado: 'Bloqueio da agenda alterado',
  BloqueioAgendaRemovido: 'Bloqueio da agenda removido',
  HorarioDisponivelCriado: 'Horário de atendimento criado',
  HorarioDisponivelAtualizado: 'Horário de atendimento alterado',
  TipoAtendimentoCriado: 'Tipo de atendimento criado',
  TipoAtendimentoAtualizado: 'Tipo de atendimento alterado',
  ConfiguracaoAtendimentoAtualizada: 'Regras de atendimento alteradas',
  DadosProfissionaisCriados: 'Dados profissionais cadastrados',
  DadosProfissionaisAtualizados: 'Dados profissionais alterados',

  LembreteCriado: 'Lembrete criado',
  LembreteCancelado: 'Lembrete cancelado',
  LembreteEnviado: 'Lembrete enviado',
  LembreteEnviadoWhatsApp: 'Lembrete enviado pelo WhatsApp',
  LembreteFalhaEnvio: 'Falha ao enviar lembrete',
  LembreteIgnoradoWorker: 'Lembrete não enviado',
  LembreteExpirado: 'Lembrete encerrado após a consulta',
  LembreteEncerradoPorConsulta: 'Lembrete encerrado: a consulta mudou',
  LembreteReprocessamentoSolicitado: 'Reenvio de lembrete solicitado',
  LembreteAutomaticoProgramado: 'Lembrete automático programado',
  ModeloMensagemCriado: 'Modelo de mensagem criado',
  ModeloMensagemAtualizado: 'Modelo de mensagem alterado',
  ModeloMensagemAtivado: 'Modelo de mensagem ativado',
  ModeloMensagemInativado: 'Modelo de mensagem desativado',

  IntegracaoWhatsAppCriada: 'WhatsApp conectado',
  IntegracaoWhatsAppAtualizada: 'Conexão do WhatsApp alterada',
  IntegracaoWhatsAppAtivada: 'WhatsApp ativado',
  IntegracaoWhatsAppInativada: 'WhatsApp desativado',
  BridgeWhatsAppTesteOk: 'Teste de conexão do WhatsApp: funcionou',
  BridgeWhatsAppTesteFalha: 'Teste de conexão do WhatsApp: falhou',
  EventoBridgeProcessado: 'Mensagem recebida do WhatsApp',
  MensagemWhatsAppAdministrativaCriada: 'Mensagem enviada pelo WhatsApp',
  ConversaWhatsAppPacienteVinculado: 'Conversa vinculada a um paciente',
  ConversaWhatsAppAtendimentoHumano: 'Conversa passada para a equipe',
  ConversaWhatsAppDevolvidaAoAssistente: 'Conversa devolvida ao assistente',
  StatusConversaWhatsAppAlterado: 'Situação da conversa alterada',

  UsuarioCriado: 'Pessoa adicionada à equipe',
  UsuarioAtualizado: 'Dados da pessoa da equipe alterados',
  StatusUsuarioAlterado: 'Acesso da pessoa da equipe alterado',
  SenhaUsuarioRedefinida: 'Senha redefinida',
  UsuarioPerfilAlterado: 'Perfil da pessoa da equipe alterado',
  PerfilAcessoCriado: 'Perfil de acesso criado',
  PerfilAcessoAtualizado: 'Perfil de acesso alterado',
  PerfilAcessoRemovido: 'Perfil de acesso removido',

  RelatorioAdministrativoGerado: 'Relatório gerado',
};

const rotulosEntidade: Record<string, string> = {
  Usuario: 'Equipe',
  PerfilAcesso: 'Equipe',
  Paciente: 'Paciente',
  Consulta: 'Consulta',
  RegistroSessao: 'Sessão',
  Prontuario: 'Prontuário',
  EvolucaoProntuario: 'Prontuário',
  DocumentoProntuario: 'Documento',
  DocumentoPsicologico: 'Documento',
  Pagamento: 'Pagamento',
  ListaEspera: 'Lista de espera',
  BloqueioAgenda: 'Agenda',
  HorarioDisponivel: 'Agenda',
  TipoAtendimento: 'Agenda',
  ConfiguracaoAtendimento: 'Agenda',
  DadosProfissionaisPsicologo: 'Dados profissionais',
  Lembrete: 'Lembrete',
  ModeloMensagem: 'Modelo de mensagem',
  IntegracaoWhatsApp: 'WhatsApp',
  ConversaWhatsApp: 'WhatsApp',
  MensagemWhatsApp: 'WhatsApp',
  EventoBridgeWhatsApp: 'WhatsApp',
  RelatorioAdministrativo: 'Relatório',
  ContaPsicologo: 'Conta',
};

/** Ações geradas pelo funcionamento do WhatsApp, não por uma decisão de alguém. Ficam fora da lista por padrão. */
export const acoesTecnicas: ReadonlySet<string> = new Set(['EventoBridgeProcessado']);

/** "ConsultaCriadaBot" → "Consulta criada bot": último recurso para uma ação que ainda não tem rótulo. */
function separarPalavras(codigo: string) {
  const texto = codigo.replace(/([a-zà-ú])([A-Z])/g, '$1 $2').toLowerCase();
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function rotuloAcao(tipoAcao: string) {
  return rotulosAcao[tipoAcao] ?? separarPalavras(tipoAcao);
}

const acoesDeAcesso: ReadonlySet<string> = new Set([
  'Login',
  'CriacaoConta',
  'SenhaUsuarioRedefinida',
]);

/** A "área" da ação. Entrada no sistema e senha pertencem a Acesso, não a Equipe, apesar de a entidade ser Usuario. */
export function rotuloEntidade(entidade: string, tipoAcao?: string) {
  if (tipoAcao && acoesDeAcesso.has(tipoAcao)) return 'Acesso';
  return rotulosEntidade[entidade] ?? separarPalavras(entidade);
}

/** Ações sem pessoa responsável que são do assistente, não de uma rotina do sistema. */
const acoesDoAssistente: ReadonlySet<string> = new Set([
  'EventoBridgeProcessado',
  'ConversaWhatsAppAtendimentoHumano',
]);

/** Quem fez: a pessoa, o assistente do WhatsApp (ações `...Bot`) ou o sistema (rotinas automáticas). */
export function rotuloResponsavel(log: { tipoAcao: string; usuario: string | null }) {
  if (log.usuario) return log.usuario;
  return log.tipoAcao.endsWith('Bot') || acoesDoAssistente.has(log.tipoAcao)
    ? 'Assistente do WhatsApp'
    : 'Sistema';
}

/** Opções do filtro "O que aconteceu", sem as ações técnicas e sem repetir o mesmo rótulo. */
export const opcoesAcao: Array<OpcaoSelecao> = Object.entries(rotulosAcao)
  .filter(([codigo]) => !acoesTecnicas.has(codigo))
  .map(([valor, rotulo]) => ({ valor, rotulo }))
  .sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR'));

/** "nomeCompleto" / "NomeCompleto" → "Nome completo". */
export function rotuloCampo(campo: string) {
  return separarPalavras(campo);
}

export interface MudancaCampo {
  campo: string;
  antes: string;
  depois: string;
}

function exibirValor(valor: unknown) {
  if (valor === null || valor === undefined || valor === '') return '—';
  if (typeof valor === 'boolean') return valor ? 'Sim' : 'Não';
  if (typeof valor === 'string' || typeof valor === 'number') return String(valor);
  return JSON.stringify(valor);
}

function lerObjeto(json: string | null): Record<string, unknown> | null {
  if (!json) return null;
  try {
    const valor: unknown = JSON.parse(json);
    return valor && typeof valor === 'object' && !Array.isArray(valor)
      ? (valor as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/**
 * Campo a campo, o que mudou entre antes e depois. Devolve `null` quando os dados
 * não são objetos simples; a tela então mostra o conteúdo original.
 */
export function compararDados(
  antesJson: string | null,
  depoisJson: string | null,
): MudancaCampo[] | null {
  const antes = lerObjeto(antesJson);
  const depois = lerObjeto(depoisJson);
  if (!antes && !depois) return null;
  const campos = [...new Set([...Object.keys(antes ?? {}), ...Object.keys(depois ?? {})])];
  return campos
    .filter((campo) => JSON.stringify(antes?.[campo]) !== JSON.stringify(depois?.[campo]))
    .map((campo) => ({
      campo: rotuloCampo(campo),
      antes: exibirValor(antes?.[campo]),
      depois: exibirValor(depois?.[campo]),
    }));
}
