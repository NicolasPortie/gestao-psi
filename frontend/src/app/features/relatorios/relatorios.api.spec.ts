import { afterEach, describe, expect, it, vi } from 'vitest';

import { gerarRelatorio, listarCatalogoRelatorios } from './relatorios.api';

describe('relatorios.api', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('lista catalogo oficial', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            sucesso: true,
            dados: [{ codigo: 'agenda-periodo', nome: 'Agenda', descricao: 'x', exigePaciente: false }],
          }),
      }),
    );

    const catalogo = await listarCatalogoRelatorios();
    expect(catalogo[0]?.codigo).toBe('agenda-periodo');
  });

  it('gera relatorio com HTML do backend', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          sucesso: true,
          dados: {
            codigo: 'agenda-periodo',
            titulo: 'Agenda',
            html: '<html><body><h1>Oficial</h1></body></html>',
            geradoEm: '2026-07-17T12:00:00Z',
            periodoInicio: '2026-07-01T00:00:00Z',
            periodoFim: '2026-07-31T23:59:59Z',
          },
        }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const relatorio = await gerarRelatorio('agenda-periodo', {
      periodoInicio: '2026-07-01T00:00:00.000Z',
      periodoFim: '2026-07-31T23:59:59.000Z',
    });

    expect(relatorio.html).toContain('Oficial');
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/relatorios/agenda-periodo/gerar');
  });
});
