import { expect, test } from '@playwright/test';

import { chamarApi, entrar, garantirConta, horarioLivre, loginApi, observarConsole, semRuido, senhaPadrao } from './apoio';

const conta = {
  nomeCompleto: 'Psicologo E2E Rotas',
  email: process.env.E2E_EMAIL ?? 'e2e.rotas@gestaopsi.local',
  crp: '06/654321',
  senha: process.env.E2E_SENHA ?? senhaPadrao,
};

const rotas: Array<{ caminho: string; titulo: string | RegExp }> = [
  { caminho: '/painel', titulo: /^(Bom dia|Boa tarde|Boa noite)/ },
  { caminho: '/agenda', titulo: 'Agenda' },
  { caminho: '/consultas/nova', titulo: 'Nova consulta' },
  { caminho: '/pacientes', titulo: 'Pacientes' },
  { caminho: '/pagamentos', titulo: 'Financeiro' },
  { caminho: '/lista-espera', titulo: 'Lista de espera' },
  { caminho: '/conversas', titulo: 'Conversas' },
  { caminho: '/lembretes', titulo: 'Lembretes' },
  { caminho: '/documentos', titulo: 'Documentos' },
  { caminho: '/relatorios', titulo: 'Relatórios' },
  { caminho: '/notificacoes', titulo: 'Notificações' },
  { caminho: '/configuracoes/conta', titulo: 'Conta e segurança' },
  { caminho: '/configuracoes/agenda', titulo: 'Agenda' },
  { caminho: '/configuracoes/profissional', titulo: 'Dados profissionais' },
  { caminho: '/configuracoes/equipe', titulo: 'Equipe' },
  { caminho: '/configuracoes/auditoria', titulo: 'Auditoria' },
  { caminho: '/configuracoes/mensagens', titulo: 'Modelos de mensagem' },
  { caminho: '/configuracoes/whatsapp', titulo: 'Integração WhatsApp' },
];

/** Endereços anteriores à reorganização das configurações continuam funcionando. */
const redirecionamentos: Array<{ de: string; para: string }> = [
  { de: '/usuarios', para: '/configuracoes/equipe' },
  { de: '/dados-profissionais', para: '/configuracoes/profissional' },
  { de: '/modelos-mensagem', para: '/configuracoes/mensagens' },
  { de: '/auditoria', para: '/configuracoes/auditoria' },
  { de: '/integracoes/whatsapp', para: '/configuracoes/whatsapp' },
  { de: '/integracoes/whatsapp/conversas', para: '/conversas' },
];

test.describe('Rotas autenticadas', () => {
  test.beforeAll(async ({ request }) => {
    await garantirConta(request, conta);
  });

  test('cada tela carrega com seu título, sem erros de console', async ({ page }) => {
    const errosConsole: string[] = [];
    observarConsole(page, errosConsole);
    await entrar(page, conta.email, conta.senha);

    for (const rota of rotas) {
      await page.goto(rota.caminho);
      await expect(page.getByRole('heading', { level: 1, name: rota.titulo, exact: typeof rota.titulo === 'string' }), rota.caminho).toBeVisible();
    }

    expect(semRuido(errosConsole), `Erros de console: ${semRuido(errosConsole).join(' | ')}`).toEqual([]);
  });

  // 390 px é o celular de referência; 320 px é o menor aparelho que ainda precisa funcionar.
  for (const largura of [390, 320]) {
    test(`no celular de ${largura} px, nenhuma tela força rolagem horizontal`, async ({ page }) => {
      test.skip(test.info().project.name !== 'mobile', 'Verificação específica de telas estreitas.');
      await page.setViewportSize({ width: largura, height: 800 });
      await entrar(page, conta.email, conta.senha);

      for (const rota of rotas) {
        await page.goto(rota.caminho);
        await expect(page.getByRole('heading', { level: 1, name: rota.titulo, exact: typeof rota.titulo === 'string' }), rota.caminho).toBeVisible();
        const estouros = await page.evaluate(() => {
          const raiz = document.documentElement;
          // Faixas de rolagem declaradas (`sem-barra`) são intencionais; tabelas e a própria página não.
          const internos = Array.from(document.querySelectorAll<HTMLElement>('*')).filter((elemento) => {
            const overflow = getComputedStyle(elemento).overflowX;
            return (overflow === 'auto' || overflow === 'scroll') && !elemento.classList.contains('sem-barra') && elemento.scrollWidth > elemento.clientWidth + 1;
          });
          return { pagina: raiz.scrollWidth - raiz.clientWidth, internos: internos.map((elemento) => elemento.tagName.toLowerCase()) };
        });
        expect(estouros, `${rota.caminho} ultrapassa a largura da tela`).toEqual({ pagina: 0, internos: [] });
      }
    });
  }

  test('endereços antigos redirecionam para o novo lugar', async ({ page }) => {
    await entrar(page, conta.email, conta.senha);
    for (const { de, para } of redirecionamentos) {
      await page.goto(de);
      await expect(page, de).toHaveURL(new RegExp(`${para}$`));
    }
  });

  test('rota inexistente mostra a página 404 com caminho de volta', async ({ page }) => {
    await entrar(page, conta.email, conta.senha);
    await page.goto('/isto-nao-existe');
    await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible();
    await page.getByRole('link', { name: 'Ir para Hoje', exact: true }).click();
    await expect(page).toHaveURL(/\/painel$/);
  });

  test('cadastro de paciente aparece na lista e abre a ficha', async ({ page }) => {
    await entrar(page, conta.email, conta.senha);
    const nome = `Paciente E2E ${Date.now()}`;

    await page.goto('/pacientes/novo');
    await page.getByLabel('Nome completo').fill(nome);
    await page.getByLabel('WhatsApp').fill('11999887766');
    await page.getByRole('button', { name: 'Salvar paciente' }).click();
    await expect(page).toHaveURL(/\/pacientes\/[0-9a-f-]+$/i);
    await expect(page.getByRole('heading', { name: nome })).toBeVisible();

    await page.goto('/pacientes');
    await page.getByLabel('Buscar paciente').fill(nome);
    await expect(page).toHaveURL(/busca=/);
    await page.getByRole('link', { name: nome }).click();
    await expect(page.getByRole('heading', { name: nome })).toBeVisible();
  });

  test('remarcação cria nova consulta e preserva o histórico; conflito é recusado (API)', async ({ request }) => {
    const token = await loginApi(request, conta.email, conta.senha);

    const pacienteRes = await chamarApi(request, 'POST', '/pacientes', token, { nomeCompleto: `Paciente Remarcar ${Date.now()}`, whatsApp: '11999887766' });
    expect(pacienteRes.ok()).toBeTruthy();
    const pacienteId = ((await pacienteRes.json()).dados as { id: string }).id;

    const tipoRes = await chamarApi(request, 'POST', '/agenda/tipos-atendimento', token, {
      nome: `Tipo E2E ${Date.now()}`,
      duracaoMinutos: 50,
      modalidadePadrao: 'Presencial',
      ativo: true,
    });
    expect(tipoRes.ok()).toBeTruthy();
    const tipoId = ((await tipoRes.json()).dados as { id: string }).id;

    // Os projetos desktop e mobile dividem a conta: cada um parte de uma distância diferente.
    const diasBase = test.info().project.name === 'mobile' ? 120 : 30;
    const primeiro = await horarioLivre(request, token, diasBase, 10, 0);
    const agendar = (inicioIso: string) =>
      chamarApi(request, 'POST', '/consultas', token, {
        pacienteId,
        tipoAtendimentoId: tipoId,
        inicioEm: inicioIso,
        fimEm: new Date(new Date(inicioIso).getTime() + 50 * 60000).toISOString(),
        modalidade: 'Presencial',
      });

    const consultaRes = await agendar(primeiro.iso);
    expect(consultaRes.ok()).toBeTruthy();
    const consultaId = ((await consultaRes.json()).dados as { id: string }).id;

    const diasAtePrimeiro = Math.max(1, Math.round((new Date(primeiro.iso).getTime() - Date.now()) / (24 * 3600 * 1000)));
    const segundo = await horarioLivre(request, token, diasAtePrimeiro + 1, 10, 0);
    const remarcarRes = await chamarApi(request, 'PATCH', `/consultas/${consultaId}/remarcar`, token, {
      novoInicioEm: segundo.iso,
      novoFimEm: new Date(new Date(segundo.iso).getTime() + 50 * 60000).toISOString(),
    });
    expect(remarcarRes.ok()).toBeTruthy();
    const nova = (await remarcarRes.json()).dados as { id: string };
    expect(nova.id).not.toBe(consultaId);

    const antigaRes = await chamarApi(request, 'GET', `/consultas/${consultaId}`, token);
    expect(((await antigaRes.json()).dados as { status: string }).status).toBe('Remarcada');

    // Conflito: ocupar outro horário livre e remarcar para cima dele deve falhar.
    const diasAteSegundo = Math.max(1, Math.round((new Date(segundo.iso).getTime() - Date.now()) / (24 * 3600 * 1000)));
    const ocupado = await horarioLivre(request, token, diasAteSegundo + 1, 10, 0);
    expect((await agendar(ocupado.iso)).ok()).toBeTruthy();
    const conflitoRes = await chamarApi(request, 'PATCH', `/consultas/${nova.id}/remarcar`, token, {
      novoInicioEm: ocupado.iso,
      novoFimEm: new Date(new Date(ocupado.iso).getTime() + 50 * 60000).toISOString(),
    });
    expect(conflitoRes.ok()).toBeFalsy();
  });
});
