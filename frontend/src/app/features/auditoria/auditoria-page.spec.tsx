import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import AuditoriaPage from './auditoria-page';

function renderAuditoria() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/configuracoes/auditoria']}>
        <AuditoriaPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const log = {
  id: 'l1',
  criadoEm: '2026-10-11T14:32:00Z',
  tipoAcao: 'ConsultaCriada',
  entidade: 'Consulta',
  entidadeId: 'c1',
  descricao: 'Consulta criada pelo painel.',
  ip: '127.0.0.1',
  userAgent: 'Mozilla',
  usuario: 'Helena Duarte',
};

function responder(itens: unknown[]) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      const detalhe = /\/auditoria\/l1$/.test(url);
      const dados = detalhe
        ? { ...log, dadosAntesJson: null, dadosDepoisJson: '{"status":"Agendada"}' }
        : { itens, total: itens.length, pagina: 1, tamanhoPagina: 20 };
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ sucesso: true, dados }) });
    }),
  );
}

describe('AuditoriaPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lista as ações com responsável e entidade', async () => {
    responder([log]);
    renderAuditoria();

    expect(await screen.findByText('ConsultaCriada')).toBeVisible();
    expect(screen.getByText('Consulta criada pelo painel.')).toBeVisible();
    expect(screen.getByText('Consulta')).toBeVisible();
  });

  it('abre e fecha o detalhe do registro com o dado depois da ação', async () => {
    responder([log]);
    renderAuditoria();

    const botao = await screen.findByRole('button', { name: 'Ver detalhe de ConsultaCriada' });
    expect(botao).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(botao);

    expect(await screen.findByText(/"status": "Agendada"/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Ocultar detalhe de ConsultaCriada' })).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(screen.getByRole('button', { name: 'Ocultar detalhe de ConsultaCriada' }));
    expect(screen.queryByText(/"status": "Agendada"/)).not.toBeInTheDocument();
  });

  it('mostra estado vazio quando não há registros', async () => {
    responder([]);
    renderAuditoria();

    expect(await screen.findByText('Nenhum registro encontrado')).toBeVisible();
  });
});
