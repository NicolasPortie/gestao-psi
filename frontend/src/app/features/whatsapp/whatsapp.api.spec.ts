import { afterEach, describe, expect, it, vi } from 'vitest';

import { obterIntegracaoWhatsApp, salvarIntegracaoWhatsApp } from './whatsapp.api';

describe('whatsapp.api', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('obtem integracao com token mascarado', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            sucesso: true,
            dados: { id: '1', tokenMascarado: '****abcd', nome: 'Bridge' },
          }),
      }),
    );

    const integracao = await obterIntegracaoWhatsApp();
    expect(integracao?.tokenMascarado).toBe('****abcd');
  });

  it('salva integracao sem exigir token se vazio', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ sucesso: true, dados: { id: '1', tokenMascarado: '****' } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await salvarIntegracaoWhatsApp({
      nome: 'Bridge',
      provedor: 'Bridge',
      urlBaseBridge: 'https://bridge.local',
      token: null,
      numeroWhatsApp: '5511999999999',
      ativo: true,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/whatsapp/integracao'),
      expect.objectContaining({ method: 'PUT' }),
    );
  });
});
