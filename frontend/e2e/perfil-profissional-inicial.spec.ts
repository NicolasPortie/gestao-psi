import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { entrar, observarConsole, semRuido, senhaPadrao } from './apoio';

// Transporte simulado na interface; persistência e isolamento são testados em PerfilProfissionalInicialTests.
for (const tema of ['light', 'dark'] as const) {
  test.describe(`Perfil inicial · ${tema}`, () => {
    test.use({ colorScheme: tema, reducedMotion: 'reduce' });
    test('permite adiar, retomar e concluir sem bloquear o painel', async ({ page }, testInfo) => {
      let situacao = { pendente: true, sugerirPreenchimento: true };
      let adiamentos = 0;
      let recebido: unknown;
      const erros: string[] = [];
      observarConsole(page, erros);
      await page.route('**/dados-profissionais/situacao', (rota) =>
        rota.fulfill({ json: { sucesso: true, dados: situacao } }),
      );
      await page.route('**/dados-profissionais/adiar', (rota) => {
        adiamentos++;
        situacao = { pendente: true, sugerirPreenchimento: false };
        return rota.fulfill({ status: 204 });
      });
      await page.route('**/dados-profissionais', (rota) => {
        recebido = rota.request().postDataJSON();
        situacao = { pendente: false, sugerirPreenchimento: false };
        return rota.fulfill({
          json: {
            sucesso: true,
            dados: {
              id: 'teste',
              nomeProfissional: 'Ana Silva',
              crpMascarado: '****3456',
              bio: null,
              emailProfissional: null,
              telefoneProfissional: null,
            },
          },
        });
      });
      await entrar(page, 'e2e.acessibilidade@psique.local', senhaPadrao);
      const dialogo = page.getByRole('dialog', { name: 'Complete seu perfil profissional' });
      await expect(dialogo).toBeVisible();
      for (const largura of testInfo.project.name === 'mobile' ? [320, 390] : [1440]) {
        await page.setViewportSize({ width: largura, height: largura === 320 ? 568 : 844 });
        await expect(dialogo.getByRole('button', { name: 'Salvar e continuar' })).toBeInViewport();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        ).toBeTruthy();
        expect(
          (
            await new AxeBuilder({ page })
              .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
              .analyze()
          ).violations,
        ).toEqual([]);
        await page.screenshot({
          path: `../output/playwright/perfil-${tema}-${largura}.png`,
          fullPage: true,
        });
      }
      await dialogo.getByRole('button', { name: 'Preencher depois' }).click();
      await expect(dialogo).toBeHidden();
      expect(adiamentos).toBe(1);
      await page.reload();
      await expect(page.getByRole('heading', { level: 1, name: /^(Bom dia|Boa tarde|Boa noite)/ })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Completar perfil' })).toBeVisible();
      await expect(dialogo).toBeHidden();
      await page.getByRole('button', { name: 'Completar perfil' }).click();
      await dialogo.getByLabel('Nome completo').fill('Ana Silva');
      await dialogo.getByLabel('CRP').fill('06123456');
      await dialogo.getByRole('button', { name: 'Salvar e continuar' }).click();
      await expect(dialogo).toBeHidden();
      expect(recebido).toEqual({ nomeProfissional: 'Ana Silva', crp: '06/123456' });
      await expect(page.getByRole('button', { name: 'Completar perfil' })).toBeHidden();
      await page.reload();
      await expect(page.getByRole('heading', { level: 1, name: /^(Bom dia|Boa tarde|Boa noite)/ })).toBeVisible();
      await expect(dialogo).toBeHidden();
      await expect(page.getByRole('button', { name: 'Completar perfil' })).toBeHidden();
      expect(semRuido(erros)).toEqual([]);
    });
  });
}
