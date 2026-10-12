import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { usePermissoes } from '../../core/autenticacao/permissoes';
import DocumentosPage from './documentos-page';

vi.mock('../../core/autenticacao/permissoes', () => ({ usePermissoes: vi.fn() }));

function renderDocumentos() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <DocumentosPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const permissoes = (acessoClinico: boolean) =>
  ({ usuario: null, acessoClinico, acessoGestao: acessoClinico }) as ReturnType<typeof usePermissoes>;

const documento = {
  id: 'd1',
  pacienteId: 'p1',
  paciente: 'Ana Silva',
  tipo: 'Declaracao',
  status: 'Rascunho',
  titulo: 'Declaração de comparecimento',
  finalidade: null,
  criadoEm: '2026-10-11T12:00:00Z',
  finalizadoEm: null,
};

function responder(itens: unknown[]) {
  const fetchSimulado = vi.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ sucesso: true, dados: { itens, total: itens.length, pagina: 1, tamanhoPagina: 20 } }),
    }),
  );
  vi.stubGlobal('fetch', fetchSimulado);
  return fetchSimulado;
}

describe('DocumentosPage', () => {
  beforeEach(() => {
    vi.mocked(usePermissoes).mockReset();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sem perfil clínico, mostra acesso restrito e não consulta a API', () => {
    vi.mocked(usePermissoes).mockReturnValue(permissoes(false));
    const fetchSimulado = responder([]);
    renderDocumentos();

    expect(screen.getByRole('heading', { name: 'Acesso clínico necessário' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Voltar para Hoje' })).toHaveAttribute('href', '/painel');
    expect(fetchSimulado).not.toHaveBeenCalled();
  });

  it('lista documentos com tipo, paciente, estado em texto e link para o detalhe', async () => {
    vi.mocked(usePermissoes).mockReturnValue(permissoes(true));
    responder([documento]);
    renderDocumentos();

    const link = await screen.findByRole('link', { name: 'Declaração de comparecimento' });
    expect(link).toHaveAttribute('href', '/documentos/d1');
    expect(screen.getAllByText('Ana Silva').length).toBeGreaterThan(0);
    expect(screen.getByText('Rascunho')).toBeVisible();
  });

  it('estado vazio orienta a criar o primeiro documento e abre a gaveta', async () => {
    vi.mocked(usePermissoes).mockReturnValue(permissoes(true));
    responder([]);
    renderDocumentos();

    expect(await screen.findByText('Nenhum documento ainda')).toBeVisible();
    await userEvent.click(screen.getAllByRole('button', { name: /Novo documento/ })[0]!);
    expect(await screen.findByRole('dialog', { name: 'Novo documento' })).toBeVisible();
  });
});
