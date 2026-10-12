#!/usr/bin/env node
/**
 * Popula uma conta de demonstração com dados realistas, usando apenas a API pública.
 * Serve ao desenvolvimento local e a capturas de tela; nunca aponte para produção.
 *
 *   npm run seed:demo
 *   API_URL=http://localhost:5178/api/v1 npm run seed:demo
 *
 * As credenciais abaixo existem somente nesta conta local de demonstração.
 */
const API = process.env.API_URL ?? 'http://localhost:5178/api/v1';
const CONTA = {
  nomeCompleto: 'Helena Duarte',
  email: process.env.DEMO_EMAIL ?? 'helena.duarte@demo.gestaopsi.local',
  crp: '06/184392',
  senha: process.env.DEMO_SENHA ?? 'DemoGestaoPsi#2026',
};

if (!/localhost|127\.0\.0\.1/.test(API)) {
  console.error(`Recusado: ${API} não é um endereço local.`);
  process.exitCode = 1;
  throw new Error('API não local');
}

let token = '';

async function chamar(metodo, caminho, corpo, { tolerar = false } = {}) {
  const resposta = await fetch(`${API}${caminho}`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
  const texto = await resposta.text();
  const json = texto ? JSON.parse(texto) : null;
  if (!resposta.ok) {
    if (tolerar) return { erro: json?.erros?.[0] ?? json?.mensagem ?? `HTTP ${resposta.status}` };
    throw new Error(`${metodo} ${caminho} -> ${resposta.status}: ${json?.erros?.[0] ?? json?.mensagem ?? texto}`);
  }
  return json?.dados ?? json;
}

async function autenticar() {
  await chamar('POST', '/autenticacao/cadastro', { ...CONTA, aceitouTermos: true }, { tolerar: true });
  const sessao = await chamar('POST', '/autenticacao/login', { email: CONTA.email, senha: CONTA.senha });
  token = sessao.accessToken;
}

const dia = (deslocamento, hora, minuto = 0) => {
  const data = new Date();
  data.setDate(data.getDate() + deslocamento);
  data.setHours(hora, minuto, 0, 0);
  return data;
};


const pacientes = [
  ['Ana Luíza Silveira', '11987650012', 'ana.silveira@exemplo.com.br', '1991-04-12'],
  ['João Pedro Albuquerque', '11976540023', 'jp.albuquerque@exemplo.com.br', '1987-09-30'],
  ['Beatriz Nascimento', '21998761034', 'bia.nascimento@exemplo.com.br', '1995-01-22'],
  ['Carlos Eduardo Menezes', '31987652045', null, '1979-11-05'],
  ['Daniela Ferraz', '11965430056', 'dani.ferraz@exemplo.com.br', '1990-06-18'],
  ['Eduardo Tavares', '11954320067', null, '1984-03-27'],
  ['Fernanda Guimarães', '41987653078', 'fe.guimaraes@exemplo.com.br', '1998-12-09'],
  ['Gabriel Moreira', '11943210089', null, '2001-08-14'],
  ['Heloísa Prado', '19987654090', 'helo.prado@exemplo.com.br', '1993-02-03'],
  ['Igor Cavalcanti', '81987655101', null, '1986-07-21'],
  ['Juliana Rocha', '11932100112', 'ju.rocha@exemplo.com.br', '1992-10-30'],
  ['Lucas Andrade', '11921000123', null, '1989-05-16'],
  ['Mariana Teixeira', '21987656134', 'mari.teixeira@exemplo.com.br', '1996-09-08'],
  ['Rafael Siqueira', '11910900145', null, '1982-01-11'],
];

async function main() {
  await autenticar();
  const existentes = await chamar('GET', '/pacientes?pagina=1&tamanhoPagina=1');
  if ((existentes?.total ?? 0) > 0) {
    console.log('A conta de demonstração já tem dados; nada a fazer.');
    return;
  }

  console.log('Configurando agenda…');
  await chamar('PUT', '/agenda/configuracoes', {
    fusoHorario: 'America/Sao_Paulo',
    duracaoPadraoMinutos: 50,
    confirmacaoAutomaticaConsulta: false,
    antecedenciaMinimaAgendamentoHoras: null,
    antecedenciaCancelamentoHoras: 24,
    antecedenciaRemarcacaoHoras: 24,
    exigeJustificativaCancelamento: true,
    lembretesAutomaticosAtivos: true,
    programarLembreteAoCriarConsulta: true,
    programarLembreteAoConfirmar: true,
    antecedenciaLembreteHoras: 24,
    canalLembretePadrao: 'Email',
  });
  // Todos os dias têm horário para que a demonstração tenha movimento seja qual for o dia de hoje.
  for (const diaSemana of ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado']) {
    await chamar('POST', '/agenda/horarios-disponiveis', { diaSemana, horaInicio: '08:00:00', horaFim: '12:00:00', ativo: true });
    await chamar('POST', '/agenda/horarios-disponiveis', { diaSemana, horaInicio: '14:00:00', horaFim: '19:00:00', ativo: true });
  }

  const tipos = {};
  for (const [nome, duracao, valor, modalidade] of [
    ['Psicoterapia individual', 50, 180, 'Presencial'],
    ['Retorno', 30, 120, 'Online'],
    ['Avaliação inicial', 60, 220, 'Hibrido'],
    ['Terapia de casal', 80, 300, 'Presencial'],
  ]) {
    const tipo = await chamar('POST', '/agenda/tipos-atendimento', {
      nome,
      descricao: null,
      duracaoMinutos: duracao,
      valorPadrao: valor,
      modalidadePadrao: modalidade,
      ativo: true,
    });
    tipos[nome] = tipo.id;
  }

  console.log('Cadastrando pacientes…');
  const idsPaciente = [];
  for (const [nomeCompleto, whatsApp, email, dataNascimento] of pacientes) {
    const paciente = await chamar('POST', '/pacientes', {
      nomeCompleto,
      dataNascimento,
      cpf: null,
      telefone: null,
      whatsApp,
      email,
      observacaoAdministrativa: null,
      contatosAdicionais: [],
    });
    idsPaciente.push(paciente.id);
  }

  console.log('Agendando consultas…');
  const agendar = (indicePaciente, tipo, inicio, extras = {}) =>
    chamar(
      'POST',
      '/consultas',
      {
        pacienteId: idsPaciente[indicePaciente],
        tipoAtendimentoId: tipos[tipo],
        inicioEm: inicio.toISOString(),
        fimEm: new Date(inicio.getTime() + { 'Psicoterapia individual': 50, Retorno: 30, 'Avaliação inicial': 60, 'Terapia de casal': 80 }[tipo] * 60_000).toISOString(),
        modalidade: tipo === 'Retorno' ? 'Online' : tipo === 'Avaliação inicial' ? 'Hibrido' : 'Presencial',
        linkOnline: tipo === 'Retorno' ? 'https://meet.exemplo.com.br/helena-duarte' : null,
        enderecoAtendimento: tipo === 'Retorno' ? null : 'Rua das Acácias, 120 · sala 4',
        observacaoAdministrativa: null,
        programarLembrete: true,
        criarPagamentoPendente: true,
        valorPagamento: null,
        ...extras,
      },
      { tolerar: true },
    );

  const hoje = 0;
  const consultas = [];
  const grade = [
    [hoje, 9, 0, 0, 'Psicoterapia individual'],
    [hoje, 10, 0, 1, 'Retorno'],
    [hoje, 11, 0, 2, 'Avaliação inicial'],
    [hoje, 14, 30, 3, 'Psicoterapia individual'],
    [hoje, 16, 0, 4, 'Terapia de casal'],
    [hoje, 17, 30, 5, 'Retorno'],
    [(1), 9, 0, 6, 'Psicoterapia individual'],
    [(1), 10, 30, 7, 'Psicoterapia individual'],
    [(1), 15, 0, 8, 'Retorno'],
    [(2), 8, 30, 9, 'Psicoterapia individual'],
    [(2), 14, 0, 10, 'Avaliação inicial'],
    [(3), 9, 0, 11, 'Psicoterapia individual'],
    [(3), 16, 30, 12, 'Psicoterapia individual'],
    [(4), 11, 0, 13, 'Terapia de casal'],
    [(7), 9, 0, 0, 'Psicoterapia individual'],
    [(8), 10, 0, 1, 'Retorno'],
  ];
  for (const [deslocamento, hora, minuto, indicePaciente, tipo] of grade) {
    const resultado = await agendar(indicePaciente, tipo, dia(deslocamento, hora, minuto));
    if (resultado.erro) console.log(`  (consulta ignorada: ${resultado.erro})`);
    else consultas.push(resultado);
  }

  // Variedade de estados: confirmar algumas, cancelar uma, marcar uma como realizada.
  for (const [indice, status, justificativa] of [
    [0, 'Confirmada', null],
    [1, 'Confirmada', null],
    [3, 'Confirmada', null],
    [6, 'Confirmada', null],
    [8, 'Cancelada', 'Paciente avisou com antecedência.'],
  ]) {
    if (consultas[indice]) await chamar('PATCH', `/consultas/${consultas[indice].id}/status`, { status, justificativa }, { tolerar: true });
  }

  console.log('Lista de espera, modelos e financeiro…');
  await chamar('POST', '/lista-espera', { pacienteId: idsPaciente[9], tipoAtendimentoId: tipos['Psicoterapia individual'], prioridade: 1 }, { tolerar: true });
  await chamar('POST', '/lista-espera', { pacienteId: idsPaciente[11], tipoAtendimentoId: tipos.Retorno, prioridade: 2 }, { tolerar: true });
  await chamar('POST', '/lista-espera', { pacienteId: idsPaciente[13], tipoAtendimentoId: null, prioridade: 3 }, { tolerar: true });

  await chamar('POST', '/pagamentos', { pacienteId: idsPaciente[2], valor: 180, formaPagamento: 'Pix', vencimentoEm: dia(-3, 12).toISOString(), observacao: 'Sessão de setembro' }, { tolerar: true });
  const pago = await chamar('POST', '/pagamentos', { pacienteId: idsPaciente[4], valor: 220, formaPagamento: 'Cartao', vencimentoEm: dia(-5, 12).toISOString(), observacao: null }, { tolerar: true });
  if (pago?.id) await chamar('PATCH', `/pagamentos/${pago.id}/status`, { status: 'Pago', pagoEm: new Date().toISOString() }, { tolerar: true });
  const pago2 = await chamar('POST', '/pagamentos', { pacienteId: idsPaciente[6], valor: 180, formaPagamento: 'Pix', vencimentoEm: dia(-2, 12).toISOString(), observacao: null }, { tolerar: true });
  if (pago2?.id) await chamar('PATCH', `/pagamentos/${pago2.id}/status`, { status: 'Pago', pagoEm: new Date().toISOString() }, { tolerar: true });

  for (const [nome, tipo, canal, assunto, conteudo] of [
    ['Lembrete de consulta', 'LembreteConsulta', 'WhatsApp', null, 'Olá, {{paciente}}! Lembramos da sua consulta em {{data_consulta}} às {{hora_consulta}}.'],
    ['Confirmação de consulta', 'ConfirmacaoConsulta', 'Email', 'Confirmação da sua consulta', 'Olá, {{paciente}}. Sua consulta de {{data_consulta}} às {{hora_consulta}} está confirmada.'],
    ['Cobrança pendente', 'PagamentoPendente', 'WhatsApp', null, 'Olá, {{paciente}}. Há um pagamento pendente referente ao seu acompanhamento.'],
  ]) {
    await chamar('POST', '/modelos-mensagem', { nome, tipo, canal, assunto, conteudo, ativo: true }, { tolerar: true });
  }

  console.log('Prontuário…');
  const evolucoes = [
    ['ObservacaoClinica', 'Paciente relata melhora no sono após ajuste da rotina noturna. Mantém queixa de ansiedade em situações de trabalho.'],
    ['PlanoTerapeutico', 'Manter sessões semanais. Introduzir registro de pensamentos automáticos entre as sessões.'],
  ];
  for (const [tipo, conteudo] of evolucoes) {
    await chamar('POST', '/sessoes/evolucoes', { pacienteId: idsPaciente[0], tipo, conteudo, dataEvolucao: dia(-7, 10).toISOString() }, { tolerar: true });
  }
  await chamar('POST', '/documentos', {
    pacienteId: idsPaciente[0],
    tipo: 'Declaracao',
    titulo: 'Declaração de comparecimento',
    finalidade: 'Apresentação ao empregador',
    solicitante: 'Paciente',
    conteudo: 'Declaro, para os devidos fins, que Ana Luíza Silveira compareceu a atendimento psicológico nesta data.',
  }, { tolerar: true });

  console.log('Pronto. Entre com a conta de demonstração definida neste script.');
}

main().catch((erro) => {
  console.error(erro.message);
  process.exitCode = 1;
});
