import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ListaPacientesPage from './lista-pacientes-page';

function renderLista(rota = '/pacientes') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[rota]}>
        <ListaPacientesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const paciente = {
  id: 'p1',
  nomeCompleto: 'Ana Silva',
  dataNascimento: null,
  cpfMascarado: '123.***.***-00',
  telefone: '11999999999',
  whatsApp: '11999999999',
  email: 'ana@email.com',
  status: 'Ativo',
  ultimaConsulta: null,
  proximaConsulta: null,
  criadoEm: '2026-01-01T00:00:00Z',
  atualizadoEm: null,
};

function responder(dados: unknown, ok = true) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok, status: ok ? 200 : 500, json: () => Promise.resolve(dados) }));
}

const listagem = (itens: unknown[], resumo = { ativos: itens.length, inativos: 0, arquivados: 0 }) => ({
  sucesso: true,
  dados: { itens, resumo, total: itens.length, pagina: 1, tamanhoPagina: 20 },
});

describe('ListaPacientesPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('convida a cadastrar o primeiro paciente quando não há cadastros', async () => {
    responder(listagem([]));
    renderLista();

    expect(await screen.findByText('Nenhum paciente cadastrado')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Cadastrar paciente' })).toHaveAttribute('href', '/pacientes/novo');
  });

  it('diferencia "sem resultados" de "sem cadastros" quando há filtro e permite limpá-lo', async () => {
    responder(listagem([]));
    renderLista('/pacientes?busca=zzz');

    expect(await screen.findByText('Nenhum paciente encontrado')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(await screen.findByText('Nenhum paciente cadastrado')).toBeVisible();
  });

  it('exibe erro recuperável quando a API falha', async () => {
    responder({ sucesso: false, mensagem: 'Falha temporária no servidor.', erros: ['Falha temporária no servidor.'] }, false);
    renderLista();

    expect(await screen.findByText('Não foi possível abrir os pacientes')).toBeVisible();
    expect(screen.getByText('Falha temporária no servidor.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
  });

  it('lista pacientes com contato formatado, estado e link para a ficha', async () => {
    responder(listagem([paciente]));
    renderLista();

    const link = await screen.findByRole('link', { name: 'Ana Silva' });
    expect(link).toHaveAttribute('href', '/pacientes/p1');
    expect(screen.getAllByText('(11) 99999-9999').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ativo').length).toBeGreaterThan(0);
    expect(screen.getByText('1 cadastro · 1 ativo')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Ações de Ana Silva' })).toBeVisible();
  });

  it('mostra contagens por estado no filtro', async () => {
    responder(listagem([paciente], { ativos: 1, inativos: 3, arquivados: 2 }));
    renderLista();

    await screen.findByRole('link', { name: 'Ana Silva' });
    const grupo = screen.getByRole('radiogroup', { name: 'Filtrar por estado' });
    expect(grupo).toHaveTextContent('Inativos3');
    expect(grupo).toHaveTextContent('Arquivados2');
    expect(screen.getByRole('radio', { name: /Todos/ })).toBeChecked();
  });
});
