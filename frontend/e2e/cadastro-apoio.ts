import { expect, type Page } from '@playwright/test';
import { senhaPadrao } from './apoio';

/** Transporte de e-mail simulado só nos testes de interface; regras e consumo são testados no back-end. */
export async function simularEmailCadastro(page: Page) {
  await page.route('**/autenticacao/cadastro/codigo', (rota) =>
    rota.fulfill({
      json: {
        sucesso: true,
        dados: {
          identificador: 'a'.repeat(64),
          expiraEm: new Date(Date.now() + 600000).toISOString(),
          reenviarAposSegundos: 60,
        },
      },
    }),
  );
  await page.route('**/autenticacao/cadastro/confirmar-email', async (rota) => {
    const { codigo } = rota.request().postDataJSON() as { codigo: string };
    await rota.fulfill(
      codigo === '123456'
        ? {
            json: {
              sucesso: true,
              dados: {
                tokenEmail: 'b'.repeat(64),
                expiraEm: new Date(Date.now() + 1800000).toISOString(),
              },
            },
          }
        : { status: 400, json: { sucesso: false, mensagem: 'Código inválido ou expirado.' } },
    );
  });
}

export async function preencherAcessoCadastro(page: Page, email: string) {
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(senhaPadrao);
  await page.getByLabel('Confirmar senha', { exact: true }).fill(senhaPadrao);
  await page.getByRole('checkbox', { name: /Li e aceito/ }).check();
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Confirme seu e-mail' })).toBeVisible();
}

export async function confirmarEmailTeste(page: Page) {
  // O sexto dígito envia o código sozinho.
  await page.getByLabel('Código de confirmação').fill('123456');
}
