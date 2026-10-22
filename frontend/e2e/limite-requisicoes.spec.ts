import { expect, test } from '@playwright/test';

import { API, chamarApi, garantirConta, loginApi, senhaPadrao } from './apoio';

test.describe('Limite de requisições sem sessão', () => {
  test('inundar a recuperação de senha devolve 429 sem travar o login', async ({ request }) => {
    test.skip(test.info().project.name !== 'desktop', 'A cota é por IP; um projeto basta.');
    const conta = { nomeCompleto: 'Psicologo E2E Limite', email: 'e2e.limite@psique.local', crp: '06/999999', senha: senhaPadrao };
    await garantirConta(request, conta);

    // Uma execução anterior pode ter esgotado a cota deste minuto: espera a janela virar.
    test.setTimeout(150_000);
    const sonda = await request.post(`${API}/autenticacao/recuperacao-senha/redefinir`, { data: { token: 'sonda', novaSenha: 'SenhaQualquer123!' } });
    if (sonda.status() === 429) await new Promise((resolver) => setTimeout(resolver, 62_000));

    // Token inválido: cada chamada é recusada pelo serviço, e as que passam de 60 em um minuto, pelo limitador.
    const status: number[] = [];
    for (let tentativa = 0; tentativa < 70; tentativa++) {
      const resposta = await request.post(`${API}/autenticacao/recuperacao-senha/redefinir`, {
        data: { token: `token-invalido-${tentativa}`, novaSenha: 'SenhaQualquer123!' },
      });
      status.push(resposta.status());
    }
    expect(status.filter((codigo) => codigo === 429).length).toBeGreaterThan(0);
    expect(status.slice(0, 10).every((codigo) => codigo === 400)).toBe(true);

    const bloqueada = await request.post(`${API}/autenticacao/recuperacao-senha/redefinir`, {
      data: { token: 'outro-token', novaSenha: 'SenhaQualquer123!' },
    });
    expect(bloqueada.status()).toBe(429);
    expect(bloqueada.headers()['retry-after']).toBeDefined();
    const corpo = (await bloqueada.json()) as { sucesso: boolean; mensagem: string };
    expect(corpo.sucesso).toBe(false);
    expect(corpo.mensagem).toMatch(/Muitas requisições/);

    // O login usa outra cota e segue funcionando.
    await expect(loginApi(request, conta.email, conta.senha)).resolves.toBeTruthy();
    expect((await chamarApi(request, 'GET', '/saude')).ok()).toBe(true);
  });
});
