import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { entrar, garantirConta, loginApi, semearDadosBasicos, senhaPadrao } from './apoio';

const conta = {
  nomeCompleto: 'Psicologo E2E Acessibilidade',
  email: process.env.E2E_A11Y_EMAIL ?? 'e2e.acessibilidade@gestaopsi.local',
  crp: '06/777777',
  senha: process.env.E2E_A11Y_SENHA ?? senhaPadrao,
};

/** Regras WCAG 2.x A e AA. As violações saem no relatório do teste com o seletor de cada elemento. */
async function violacoes(pagina: Page) {
  const resultado = await new AxeBuilder({ page: pagina }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  return resultado.violations.map((violacao) => ({
    regra: violacao.id,
    impacto: violacao.impact,
    ocorrencias: violacao.nodes.map((no) => no.target.join(' ')).slice(0, 5),
  }));
}

const publicas = ['/login', '/cadastro', '/recuperar-senha', '/termos', '/privacidade'];
const autenticadas = [
  '/painel',
  '/agenda',
  '/consultas/nova',
  '/pacientes',
  '/pacientes/novo',
  '/pagamentos',
  '/lista-espera',
  '/conversas',
  '/lembretes',
  '/documentos',
  '/relatorios',
  '/notificacoes',
  '/configuracoes/conta',
  '/configuracoes/agenda',
  '/configuracoes/profissional',
  '/configuracoes/equipe',
  '/configuracoes/auditoria',
  '/configuracoes/mensagens',
  '/configuracoes/whatsapp',
  '/isto-nao-existe',
];

for (const tema of ['light', 'dark'] as const) {
  test.describe(`Acessibilidade (WCAG AA) · tema ${tema === 'light' ? 'claro' : 'escuro'}`, () => {
    // Sem animações, o contraste medido não depende do instante em que as entradas escalonadas terminam.
    test.use({ colorScheme: tema, contextOptions: { reducedMotion: 'reduce' } });

    test.beforeAll(async ({ request }) => {
      await garantirConta(request, conta);
      await semearDadosBasicos(request, await loginApi(request, conta.email, conta.senha));
    });

    test('telas públicas não têm violações', async ({ page }) => {
      for (const rota of publicas) {
        await page.goto(rota);
        await page.waitForLoadState('networkidle');
        expect(await violacoes(page), rota).toEqual([]);
      }
    });

    test('telas autenticadas não têm violações', async ({ page }) => {
      await entrar(page, conta.email, conta.senha);
      for (const rota of autenticadas) {
        await page.goto(rota);
        await page.waitForLoadState('networkidle');
        expect(await violacoes(page), rota).toEqual([]);
      }
    });

    test('gavetas, diálogos e menus não têm violações', async ({ page }) => {
      await entrar(page, conta.email, conta.senha);

      await page.goto('/pagamentos');
      await page.getByRole('button', { name: 'Novo pagamento' }).first().click();
      await expect(page.getByRole('dialog', { name: 'Novo pagamento' })).toBeVisible();
      expect(await violacoes(page), 'gaveta de pagamento').toEqual([]);
      await page.keyboard.press('Escape');

      await page.goto('/documentos');
      await page.getByRole('button', { name: 'Novo documento' }).first().click();
      await expect(page.getByRole('dialog', { name: 'Novo documento' })).toBeVisible();
      expect(await violacoes(page), 'gaveta de documento').toEqual([]);
      await page.keyboard.press('Escape');

      await page.goto('/configuracoes/equipe');
      await page.getByRole('button', { name: /Adicionar|Novo|Convidar/ }).first().click();
      await expect(page.getByRole('dialog')).toBeVisible();
      expect(await violacoes(page), 'gaveta de usuário').toEqual([]);
    });
  });
}
