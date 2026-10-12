import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import CadastroPage from '../autenticacao/cadastro-page';
import PrivacidadePage from './privacidade-page';
import TermosPage from './termos-page';

describe('documentos legais', () => {
  it('termos de uso trazem a versão, as seções numeradas e o caminho para a privacidade', () => {
    render(
      <MemoryRouter>
        <TermosPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Termos de uso' })).toBeVisible();
    expect(screen.getByText(/Versão 1\.0/)).toBeVisible();
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(9);
    expect(screen.getByRole('link', { name: 'política de privacidade' })).toHaveAttribute('href', '/privacidade');
  });

  it('política de privacidade explica papéis, proteção e direitos, com link para a conta', () => {
    render(
      <MemoryRouter>
        <PrivacidadePage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Política de privacidade' })).toBeVisible();
    expect(screen.getByRole('heading', { name: /Papéis no tratamento/ })).toBeVisible();
    expect(screen.getByRole('heading', { name: /Seus direitos/ })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Conta e segurança' })).toHaveAttribute('href', '/configuracoes/conta');
  });

  it('o cadastro leva aos dois documentos em nova aba, sem perder o formulário', () => {
    render(
      <MemoryRouter>
        <CadastroPage />
      </MemoryRouter>,
    );

    const termos = screen.getByRole('link', { name: 'termos de uso' });
    const privacidade = screen.getByRole('link', { name: 'política de privacidade' });
    expect(termos).toHaveAttribute('href', '/termos');
    expect(termos).toHaveAttribute('target', '_blank');
    expect(privacidade).toHaveAttribute('href', '/privacidade');
    expect(privacidade).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('checkbox', { name: /Li e aceito/ })).not.toBeChecked();
  });
});
