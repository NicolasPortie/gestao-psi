import { expect, test, type Page } from '@playwright/test';

import { entrar, garantirConta, senhaPadrao } from './apoio';
import { preencherAcessoCadastro, simularEmailCadastro } from './cadastro-apoio';

const conta = {
  nomeCompleto: 'Psicologo E2E Acessibilidade',
  email: process.env.E2E_A11Y_EMAIL ?? 'e2e.acessibilidade@gestaopsi.local',
  crp: '06/777777',
  senha: process.env.E2E_A11Y_SENHA ?? senhaPadrao,
};

/** Bordas do recorte do sublinhado (esquerda e direita, em px) depois que a transição termina. */
async function recorteIndicador(page: Page) {
  return page.locator('.indicador-aba').evaluate(async (indicador) => {
    await Promise.all(indicador.getAnimations().map((animacao) => animacao.finished));
    const [, direita, , esquerda] = getComputedStyle(indicador).clipPath.match(/[\d.]+px/g)!.map(parseFloat);
    return { esquerda, direita };
  });
}

/** Distância da aba às bordas da área rolável da lista. */
async function posicaoAba(page: Page, nome: string) {
  return page.getByRole('tab', { name: nome }).evaluate((aba) => {
    const lista = aba.parentElement!;
    const esquerda = aba.getBoundingClientRect().left - lista.getBoundingClientRect().left + lista.scrollLeft;
    return { esquerda, direita: lista.scrollWidth - esquerda - aba.getBoundingClientRect().width };
  });
}

test.describe('Movimento', () => {
  test('o sublinhado das abas desliza até a aba escolhida', async ({ page, request }) => {
    await garantirConta(request, conta);
    await entrar(page, conta.email, conta.senha);
    await page.goto('/configuracoes/agenda');

    for (const nome of ['Bloqueios', 'Tipos de atendimento', 'Regras']) {
      await page.getByRole('tab', { name: nome }).click();
      const esperado = await posicaoAba(page, nome);
      // Tolerância de 1 px: a largura rolável da lista é arredondada para inteiro.
      await expect
        .poll(async () => {
          const recorte = await recorteIndicador(page);
          return Math.max(Math.abs(recorte.esquerda - esperado.esquerda), Math.abs(recorte.direita - esperado.direita));
        })
        .toBeLessThanOrEqual(1);
    }
  });

  test('o código responde a cada dígito, à recusa e à confirmação', async ({ page }) => {
    await simularEmailCadastro(page);
    // A criação da conta fica pendente para o estado "confirmado" poder ser observado.
    await page.route('**/autenticacao/cadastro', () => undefined);
    await page.goto('/cadastro');
    await preencherAcessoCadastro(page, 'movimento.e2e@gestaopsi.local');

    const codigo = page.getByLabel('Código de confirmação');
    const casas = page.locator('.casa-codigo');
    await expect(casas).toHaveCount(6);

    await codigo.pressSequentially('12');
    await expect(casas.nth(0)).toHaveText('1');
    await expect(casas.nth(1)).toHaveText('2');
    await expect(casas.nth(2)).toHaveAttribute('data-ativa', 'true');

    await codigo.fill('000000');
    await expect(page.getByText('Código inválido ou expirado.')).toBeVisible();
    await expect(page.locator('.entrada-codigo')).toHaveAttribute('data-estado', 'erro');

    await codigo.fill('123456');
    await expect(page.locator('.entrada-codigo')).toHaveAttribute('data-estado', 'confirmado');
    await expect(page.getByText('E-mail confirmado. Criando sua conta…')).toBeVisible();
  });

  test.describe('com movimento reduzido', () => {
    test.use({ contextOptions: { reducedMotion: 'reduce' } });

    test('as entradas de tela não deslocam nada', async ({ page, request }) => {
      await garantirConta(request, conta);
      await entrar(page, conta.email, conta.senha);
      await page.goto('/pacientes');
      await expect(page.getByRole('heading', { level: 1, name: 'Pacientes' })).toBeVisible();
      const nomes = await page
        .locator('.animar-pagina > *')
        .evaluateAll((filhos) => filhos.map((filho) => getComputedStyle(filho).animationName));
      expect(nomes.length).toBeGreaterThan(0);
      expect(nomes.every((nome) => nome === 'conteudo-entrar')).toBe(true);
    });
  });
});
