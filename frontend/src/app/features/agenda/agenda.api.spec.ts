import { afterEach, describe, expect, it, vi } from 'vitest';

import { alterarStatusConsulta, listarConsultas, remarcarConsulta } from './agenda.api';

describe('agenda.api', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('lista consultas por periodo', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          sucesso: true,
          dados: [{ id: '1', paciente: 'Ana', status: 'Agendada' }],
        }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const lista = await listarConsultas('2026-07-01T00:00:00.000Z', '2026-07-08T00:00:00.000Z');
    expect(lista).toHaveLength(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/consultas?inicio=');
  });

  it('altera status via PATCH', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ sucesso: true, dados: { id: '1', status: 'Confirmada' } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const consulta = await alterarStatusConsulta('1', { status: 'Confirmada' });
    expect(consulta.status).toBe('Confirmada');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/consultas/1/status'),
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('remarca via PATCH criando nova consulta', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ sucesso: true, dados: { id: '2', status: 'Agendada' } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const consulta = await remarcarConsulta('1', {
      novoInicioEm: '2026-08-13T14:00:00.000Z',
      novoFimEm: '2026-08-13T14:50:00.000Z',
    });
    expect(consulta.id).toBe('2');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/consultas/1/remarcar'),
      expect.objectContaining({ method: 'PATCH' }),
    );
  });
});
