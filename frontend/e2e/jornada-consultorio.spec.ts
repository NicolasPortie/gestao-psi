import { expect, test, type Locator, type Page } from '@playwright/test';

import {
  API,
  chamarApi,
  entrar,
  garantirConta,
  horarioLivre,
  loginApi,
  observarConsole,
  semRuido,
  senhaPadrao,
} from './apoio';

const conta = {
  nomeCompleto: 'Psicologo QA Consultorio',
  email: process.env.E2E_QA_EMAIL ?? 'qa.consultorio@psique.local',
  crp: '06/123456',
  senha: process.env.E2E_QA_SENHA ?? senhaPadrao,
};
const bridgeToken = process.env.E2E_QA_BRIDGE_TOKEN ?? 'qa-bridge-token-seguro-1234567890';

async function garantirTipo(request: Parameters<typeof loginApi>[0], token: string) {
  const resposta = await chamarApi(request, 'POST', '/agenda/tipos-atendimento', token, {
    nome: `QA Tipo ${Date.now()}`,
    duracaoMinutos: 50,
    modalidadePadrao: 'Presencial',
    ativo: true,
  });
  expect(resposta.ok()).toBeTruthy();
  return ((await resposta.json()).dados as { id: string }).id;
}

async function garantirHorarios(request: Parameters<typeof loginApi>[0], token: string) {
  for (const dia of ['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta']) {
    await chamarApi(request, 'POST', '/agenda/horarios-disponiveis', token, {
      diaSemana: dia,
      horaInicio: '08:00:00',
      horaFim: '18:00:00',
      ativo: true,
    });
  }
}

async function garantirIntegracao(request: Parameters<typeof loginApi>[0], token: string) {
  const resposta = await chamarApi(request, 'PUT', '/whatsapp/integracao', token, {
    nome: 'Bridge QA',
    provedor: 'Bridge',
    urlBaseBridge: 'https://bridge-qa.local',
    token: bridgeToken,
    numeroWhatsApp: '5511888888888',
    ativo: true,
  });
  expect(resposta.ok()).toBeTruthy();
}

/** Escolhe um paciente no seletor com busca no servidor. A lista de opções abre num portal, fora do `escopo` do campo. */
async function escolherPaciente(pagina: Page, nome: string, escopo: Page | Locator = pagina) {
  await escopo.getByRole('combobox', { name: 'Paciente' }).fill(nome);
  await pagina.getByRole('option', { name: new RegExp(nome) }).click();
}

test.describe('Jornada do consultório', () => {
  test.beforeAll(async ({ request }) => {
    await garantirConta(request, conta);
    const token = await loginApi(request, conta.email, conta.senha);
    await garantirHorarios(request, token);
    await garantirIntegracao(request, token);
  });

  test('psicólogo: paciente > consulta > confirmar > remarcar > sessão > pagamento > relatório > auditoria', async ({ page, request }) => {
    const errosConsole: string[] = [];
    observarConsole(page, errosConsole);
    const token = await loginApi(request, conta.email, conta.senha);
    const tipoId = await garantirTipo(request, token);
    const nomePaciente = `QA Paciente ${Date.now()}`;

    await entrar(page, conta.email, conta.senha);

    // Paciente
    await page.goto('/pacientes/novo');
    await page.getByLabel('Nome completo').fill(nomePaciente);
    await page.getByLabel('WhatsApp').fill('11990000099');
    await page.getByRole('button', { name: 'Salvar paciente' }).click();
    await expect(page).toHaveURL(/\/pacientes\/[0-9a-f-]+$/i);
    await expect(page.getByRole('heading', { name: nomePaciente })).toBeVisible();
    const pacienteId = page.url().split('/').pop()!;

    // Consulta (a conta tem resíduo de execuções anteriores: sonda uma janela livre)
    const horario = await horarioLivre(request, token, 200, 14, 0);
    await page.goto('/consultas/nova');
    await escolherPaciente(page, nomePaciente);
    await page.getByLabel('Tipo de atendimento').selectOption(tipoId);
    await page.getByLabel('Data', { exact: true }).fill(horario.data);
    await page.getByLabel('Horário', { exact: true }).fill(horario.hora);
    await page.getByLabel('Cobrar já no agendamento').check();
    await page.getByLabel(/Valor da consulta/).fill('300');
    await page.getByRole('button', { name: 'Agendar consulta' }).click();
    await expect(page).toHaveURL(/\/consultas\/[0-9a-f-]+$/i);
    const consultaId = page.url().split('/').pop()!;
    await expect(page.getByText(/R\$\s*300,00/)).toBeVisible();

    // Confirmar
    await page.getByRole('button', { name: 'Confirmar consulta' }).click();
    await expect(page.getByText('Consulta confirmada.')).toBeVisible();
    await expect(page.getByText('Confirmada', { exact: true }).first()).toBeVisible();

    // Remarcar pelo diálogo (o novo horário também é sondado como livre)
    const diasAteHorario = Math.round((new Date(horario.iso).getTime() - Date.now()) / (24 * 3600 * 1000));
    const novoHorario = await horarioLivre(request, token, diasAteHorario + 1, 15, 0);
    await page.getByRole('button', { name: 'Mais ações' }).click();
    await page.getByRole('menuitem', { name: /^Remarcar/ }).click();
    const dialogo = page.getByRole('dialog', { name: 'Remarcar consulta' });
    await dialogo.getByLabel('Nova data').fill(novoHorario.data);
    await dialogo.getByLabel('Novo horário').fill(novoHorario.hora);
    await dialogo.getByRole('button', { name: 'Remarcar', exact: true }).click();
    await expect(page.getByText('Consulta remarcada.')).toBeVisible();
    await expect.poll(() => page.url().endsWith(`/consultas/${consultaId}`), { timeout: 15_000 }).toBeFalsy();
    await expect(page).toHaveURL(/\/consultas\/[0-9a-f-]+$/i);
    const novaConsultaId = page.url().split('/').pop()!;
    expect(novaConsultaId).not.toBe(consultaId);

    await page.goto(`/consultas/${consultaId}`);
    await expect(page.getByText('Remarcada', { exact: true }).first()).toBeVisible();

    // Sessão no prontuário: a folha abre já vinculada à consulta de origem
    await page.goto(`/pacientes/${pacienteId}/prontuario?consultaId=${novaConsultaId}`);
    const folhaSessao = page.getByRole('dialog', { name: 'Registrar sessão' });
    await folhaSessao.getByLabel('Observações clínicas').fill('QA: evolução satisfatória.');
    await folhaSessao.getByLabel(/^Evolução/).fill('QA: manter plano terapêutico.');
    await folhaSessao.getByRole('button', { name: 'Registrar sessão' }).click();
    await expect(page.getByText('Registro de sessão criado.')).toBeVisible();

    // Pagamento avulso, com vencimento distante para ficar no topo da lista
    // Todo o período: a cobrança vence em 2099, fora do mês corrente
    await page.goto('/pagamentos?mes=todos');
    await page.getByRole('button', { name: 'Nova cobrança' }).click();
    const folhaPagamento = page.getByRole('dialog', { name: 'Nova cobrança' });
    await escolherPaciente(page, nomePaciente, folhaPagamento);
    await folhaPagamento.getByLabel('Valor', { exact: true }).fill('250');
    await folhaPagamento.getByLabel(/Vencimento/).fill('2099-12-31');
    await folhaPagamento.getByRole('button', { name: 'Registrar', exact: true }).click();
    await expect(page.getByText('Cobrança registrada.')).toBeVisible();
    await page.getByRole('button', { name: new RegExp(`^Receber: .* de ${nomePaciente}$`) }).first().click();
    await expect(page.getByRole('alertdialog', { name: 'Registrar recebimento' })).toBeVisible();
    await page.getByRole('button', { name: 'Confirmar recebimento' }).click();
    await expect(page.getByText('Pagamento recebido.')).toBeVisible();

    // Relatório oficial do servidor
    await page.goto('/relatorios');
    await page.getByLabel('Relatório', { exact: true }).selectOption({ index: 1 });
    await page.getByRole('button', { name: 'Gerar relatório' }).click();
    await expect(page.locator('iframe[title]')).toBeVisible();

    // A auditoria rastreia a rotina
    await page.goto('/configuracoes/auditoria');
    await page.getByLabel('O que aconteceu').selectOption('ConsultaCriada');
    await expect(page.getByRole('table', { name: 'Registros de auditoria' }).getByText('Consulta marcada').first()).toBeVisible();

    expect(semRuido(errosConsole), `Erros de console: ${semRuido(errosConsole).join(' | ')}`).toEqual([]);
  });

  test('recepcionista: sem acesso clínico na interface e na API', async ({ page, request }) => {
    const errosConsole: string[] = [];
    observarConsole(page, errosConsole);
    const tokenPsicologo = await loginApi(request, conta.email, conta.senha);
    const emailRecepcao = `recep.${Date.now()}@psique.local`;
    const criar = await chamarApi(request, 'POST', '/usuarios', tokenPsicologo, {
      nomeCompleto: 'Recepcionista QA',
      email: emailRecepcao,
      senha: senhaPadrao,
      perfil: 'Recepcionista',
    });
    expect(criar.ok()).toBeTruthy();

    const paciente = await chamarApi(request, 'POST', '/pacientes', tokenPsicologo, { nomeCompleto: `QA Isolamento ${Date.now()}` });
    expect(paciente.ok()).toBeTruthy();
    const pacienteId = ((await paciente.json()).dados as { id: string }).id;

    await entrar(page, emailRecepcao, senhaPadrao);
    await page.goto(`/pacientes/${pacienteId}/prontuario`);
    await expect(page.getByRole('heading', { name: 'Acesso clínico necessário' })).toBeVisible();

    const tokenRecepcao = await loginApi(request, emailRecepcao, senhaPadrao);
    const clinico = await chamarApi(request, 'GET', `/sessoes/evolucoes/${pacienteId}`, tokenRecepcao);
    expect(clinico.status()).toBe(403);

    expect(semRuido(errosConsole), `Erros de console: ${semRuido(errosConsole).join(' | ')}`).toEqual([]);
  });

  test('bot do WhatsApp: horários > agendar > cancelar com as regras da agenda', async ({ request }) => {
    const token = await loginApi(request, conta.email, conta.senha);
    const telefone = `55119${String(Math.floor(10000000 + Math.random() * 89999999))}`;
    const paciente = await chamarApi(request, 'POST', '/pacientes', token, { nomeCompleto: `QA Bot ${Date.now()}`, telefone });
    expect(paciente.ok()).toBeTruthy();
    const pacienteBotId = ((await paciente.json()).dados as { id: string }).id;

    async function enviarAoBot(conteudo: string, sufixo: string) {
      const resposta = await request.fetch(`${API}/whatsapp/bridge/eventos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Psique-Bridge-Token': bridgeToken,
        },
        data: {
          eventoExternoId: `qa-${Date.now()}-${sufixo}`,
          tipoEvento: 'mensagem.recebida',
          telefone,
          nomeContato: 'QA Bot',
          conteudo,
          mensagemExternaId: `qa-msg-${Date.now()}-${sufixo}`,
        },
      });
      expect(resposta.ok()).toBeTruthy();
      return resposta.json();
    }

    await enviarAoBot('ola, quais horarios disponiveis?', 'h');

    const horario = await horarioLivre(request, token, 45, 10, 0);
    await enviarAoBot(`agendar ${horario.dma}`, 'a');

    const inicio = new Date(horario.iso);
    const lista = await chamarApi(
      request,
      'GET',
      `/consultas?inicio=${new Date(inicio.getTime() - 3600000).toISOString()}&fim=${new Date(inicio.getTime() + 55 * 60000).toISOString()}`,
      token,
    );
    expect(lista.ok()).toBeTruthy();
    const consultas = (await lista.json()).dados as Array<{ id: string; status: string }>;
    expect(consultas.length).toBeGreaterThan(0);

    await enviarAoBot(`cancelar ${horario.dma}`, 'c');
    const detalhe = await chamarApi(request, 'GET', `/consultas/${consultas[0]!.id}`, token);
    expect(detalhe.ok()).toBeTruthy();
    expect(((await detalhe.json()).dados as { status: string }).status).toBe('Cancelada');

    const conversas = await chamarApi(request, 'GET', '/whatsapp/conversas', token);
    expect(conversas.ok()).toBeTruthy();
    const pagina = (await conversas.json()).dados as { itens: Array<{ id: string; pacienteId: string | null }>; total: number };
    expect(pagina.total).toBeGreaterThan(0);
    const conversa = pagina.itens.find((item) => item.pacienteId === pacienteBotId);
    expect(conversa).toBeDefined();
    const completa = await chamarApi(request, 'GET', `/whatsapp/conversas/${conversa!.id}`, token);
    expect(((await completa.json()).dados as { mensagens: unknown[] }).mensagens.length).toBeGreaterThanOrEqual(6);
  });
});
