import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { usePermissoes } from '../../../core/autenticacao/permissoes';
import { MesEmNumeros } from './mes-em-numeros';

vi.mock('../../../core/autenticacao/permissoes', () => ({ usePermissoes: vi.fn() }));

function comPermissoes(areas: string[]) {
  vi.mocked(usePermissoes).mockReturnValue({ pode: (area: string) => areas.includes(area) } as unknown as ReturnType<typeof usePermissoes>);
}

function responder(dados: Record<string, unknown>) {
  const fetchSimulado = vi.fn<(url: string) => Promise<unknown>>(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ sucesso: true, dados }) }));
  vi.stubGlobal('fetch', fetchSimulado);
  return fetchSimulado;
}

function renderizar() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MesEmNumeros />
    </QueryClientProvider>,
  );
}

const numeros = {
  ano: 2026, mes: 10, sessoesRealizadas: 12, pacientesAtendidos: 5, faltas: 2, percentualFaltas: 14, cancelamentos: 1,
  recebido: 1800, aReceber: 540, vencido: 180,
};

describe('MesEmNumeros', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.mocked(usePermissoes).mockReset();
  });

  it('mostra os números calculados pela API, sem recalcular nada na tela', async () => {
    comPermissoes(['Agenda', 'Financeiro']);
    const fetchSimulado = responder(numeros);
    renderizar();

    expect(await screen.findByText('12')).toBeVisible();
    expect(screen.getByText('5 pacientes')).toBeVisible();
    expect(screen.getByText('14% das sessões')).toBeVisible();
    expect(screen.getByText(/180,00 vencido/)).toBeVisible();
    expect(String(fetchSimulado.mock.calls[0]?.[0])).toMatch(/\/relatorios\/mes-em-numeros\?ano=\d{4}&mes=\d{1,2}$/);
  });

  it('não mostra dinheiro quando a API não envia valores do financeiro', async () => {
    comPermissoes(['Agenda']);
    responder({ ...numeros, recebido: null, aReceber: null, vencido: null });
    renderizar();

    expect(await screen.findByText('Sessões realizadas')).toBeVisible();
    expect(screen.queryByText('Recebido')).not.toBeInTheDocument();
  });

  it('some para quem não vê agenda nem financeiro', () => {
    comPermissoes([]);
    const fetchSimulado = responder(numeros);
    const { container } = renderizar();

    expect(container).toBeEmptyDOMElement();
    expect(fetchSimulado).not.toHaveBeenCalled();
  });
});
