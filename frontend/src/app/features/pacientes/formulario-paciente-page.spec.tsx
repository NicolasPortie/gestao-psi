import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import FormularioPacientePage from './formulario-paciente-page';

function renderNovo() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/pacientes/novo']}>
        <Routes>
          <Route path="/pacientes/novo" element={<FormularioPacientePage />} />
          <Route path="/pacientes/:id" element={<p>Ficha aberta</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('FormularioPacientePage', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('bloqueia o envio com nome inválido e orienta o preenchimento', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    renderNovo();

    await userEvent.click(screen.getByRole('button', { name: 'Salvar paciente' }));

    expect(await screen.findByText('Informe o nome completo do paciente.')).toBeVisible();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('aplica máscara de telefone e CPF enquanto a pessoa digita', async () => {
    renderNovo();

    await userEvent.type(screen.getByLabelText(/WhatsApp/), '11987654321');
    await userEvent.type(screen.getByLabelText(/CPF/), '12345678900');

    expect(screen.getByLabelText(/WhatsApp/)).toHaveValue('(11) 98765-4321');
    expect(screen.getByLabelText(/CPF/)).toHaveValue('123.456.789-00');
  });

  it('permite adicionar e remover contatos adicionais', async () => {
    renderNovo();

    await userEvent.click(screen.getByRole('button', { name: 'Adicionar contato' }));
    expect(screen.getByLabelText('Valor do contato 1')).toBeVisible();

    await userEvent.click(screen.getByRole('button', { name: 'Remover contato 1' }));
    expect(screen.queryByLabelText('Valor do contato 1')).not.toBeInTheDocument();
  });

  it('salva e abre a ficha do paciente criado', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ sucesso: true, dados: { id: 'novo-id', nomeCompleto: 'Beatriz Souza', contatosAdicionais: [] } }),
      }),
    );
    renderNovo();

    await userEvent.type(screen.getByLabelText('Nome completo'), 'Beatriz Souza');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar paciente' }));

    expect(await screen.findByText('Ficha aberta')).toBeVisible();
  });
});
