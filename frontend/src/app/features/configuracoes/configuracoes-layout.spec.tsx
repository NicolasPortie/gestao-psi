import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { usePermissoes } from '../../core/autenticacao/permissoes';
import { ConfiguracoesLayout } from './configuracoes-layout';

vi.mock('../../core/autenticacao/permissoes', () => ({ usePermissoes: vi.fn() }));

function renderHub() {
  render(
    <MemoryRouter initialEntries={['/configuracoes/agenda']}>
      <Routes>
        <Route path="/configuracoes" element={<ConfiguracoesLayout />}>
          <Route path="agenda" element={<p>Conteúdo da agenda</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
  return within(screen.getByRole('navigation', { name: 'Seções de configurações' }));
}

const semGestao = ['Auditoria', 'Equipe', 'IntegracaoWhatsApp'];
const permissoes = (acessoGestao: boolean) =>
  ({
    usuario: null,
    acessoClinico: acessoGestao,
    acessoGestao,
    pode: (permissao: string) => acessoGestao || !semGestao.includes(permissao),
  }) as unknown as ReturnType<typeof usePermissoes>;

describe('ConfiguracoesLayout', () => {
  beforeEach(() => {
    vi.mocked(usePermissoes).mockReset();
  });

  it('gestão da conta vê todas as seções', () => {
    vi.mocked(usePermissoes).mockReturnValue(permissoes(true));
    const nav = renderHub();

    for (const rotulo of [
      'Conta e segurança',
      'Agenda',
      'Dados profissionais',
      'Equipe',
      'Auditoria',
      'Modelos de mensagem',
      'Integração WhatsApp',
    ]) {
      expect(nav.getByRole('link', { name: rotulo })).toBeVisible();
    }
  });

  it('recepção vê só o que não é de gestão', () => {
    vi.mocked(usePermissoes).mockReturnValue(permissoes(false));
    const nav = renderHub();

    expect(nav.getByRole('link', { name: 'Conta e segurança' })).toBeVisible();
    expect(nav.getByRole('link', { name: 'Agenda' })).toBeVisible();
    expect(nav.getByRole('link', { name: 'Modelos de mensagem' })).toBeVisible();
    for (const rotulo of ['Dados profissionais', 'Equipe', 'Auditoria', 'Integração WhatsApp']) {
      expect(nav.queryByRole('link', { name: rotulo })).not.toBeInTheDocument();
    }
  });

  it('perfil personalizado vê só as seções que o perfil concede', () => {
    vi.mocked(usePermissoes).mockReturnValue({
      usuario: null,
      acessoClinico: false,
      acessoGestao: false,
      pode: (permissao) => permissao === 'Equipe',
    });
    const nav = renderHub();

    expect(nav.getByRole('link', { name: 'Equipe' })).toBeVisible();
    for (const rotulo of [
      'Agenda',
      'Auditoria',
      'Modelos de mensagem',
      'Integração WhatsApp',
      'Dados profissionais',
    ]) {
      expect(nav.queryByRole('link', { name: rotulo })).not.toBeInTheDocument();
    }
  });

  it('marca a seção ativa para leitores de tela', () => {
    vi.mocked(usePermissoes).mockReturnValue(permissoes(true));
    const nav = renderHub();

    expect(nav.getByRole('link', { name: 'Agenda' })).toHaveAttribute('aria-current', 'page');
    expect(nav.getByRole('link', { name: 'Equipe' })).not.toHaveAttribute('aria-current');
  });
});
