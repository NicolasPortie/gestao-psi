import { afterEach, describe, expect, it, vi } from 'vitest';

import { alterarStatusPagamento, listarPagamentos } from './pagamentos.api';

describe('pagamentos.api', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('lista pagamentos do envelope paginado', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            sucesso: true,
            dados: {
              itens: [{ id: 'p1', valor: 150, status: 'Pendente' }],
              resumo: { recebido: 0, pendente: 150, reembolsado: 0, quantidade: 1 },
              total: 1,
              pagina: 1,
              tamanhoPagina: 20,
            },
          }),
      }),
    );

    const lista = await listarPagamentos();
    expect(lista.itens[0]?.valor).toBe(150);
    expect(lista.total).toBe(1);
  });

  it('envia status e paginacao na query', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          sucesso: true,
          dados: {
            itens: [],
            resumo: { recebido: 0, pendente: 0, reembolsado: 0, quantidade: 0 },
            total: 0,
            pagina: 2,
            tamanhoPagina: 10,
          },
        }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await listarPagamentos({ status: 'Pendente', pagina: 2, tamanhoPagina: 10 });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/pagamentos?'),
      expect.anything(),
    );
    const url = String(fetchMock.mock.calls[0]?.[0] ?? '');
    expect(url).toContain('status=Pendente');
    expect(url).toContain('pagina=2');
    expect(url).toContain('tamanhoPagina=10');
  });

  it('marca pagamento como pago', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ sucesso: true, dados: { id: 'p1', status: 'Pago' } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await alterarStatusPagamento('p1', 'Pago', '2026-07-17T12:00:00.000Z');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/pagamentos/p1/status'),
      expect.objectContaining({ method: 'PATCH' }),
    );
  });
});
