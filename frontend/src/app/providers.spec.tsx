import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { entrar, renovarSessao } from './core/autenticacao/autenticacao.service';
import { Providers } from './providers';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Cache de dados da sessao', () => {
  it('preserva dados na renovacao do mesmo usuario e descarta ao trocar de usuario', async () => {
    const sessao = (id: string) => new Response(JSON.stringify({
      sucesso: true,
      dados: {
        accessToken: `token-${id}`, expiraEm: '2099-01-01T00:00:00Z',
        usuario: { id, nomeCompleto: id, email: `${id}@example.test`, perfil: 'Psicologo' },
      },
    }), { status: 200 });
    vi.stubGlobal('fetch', vi.fn<typeof fetch>()
      .mockResolvedValueOnce(sessao('a'))
      .mockResolvedValueOnce(sessao('a'))
      .mockResolvedValueOnce(sessao('b')));
    let cache: QueryClient | undefined;
    function Consumidor() {
      cache = useQueryClient();
      return null;
    }
    render(<Providers><Consumidor /></Providers>);
    await entrar({ email: 'a@example.test', senha: 'SenhaDeTeste123!' });
    cache?.setQueryData(['pacientes'], 'dados da conta A');
    expect(await renovarSessao()).toBe(true);
    expect(cache?.getQueryData(['pacientes'])).toBe('dados da conta A');
    await entrar({ email: 'b@example.test', senha: 'SenhaDeTeste123!' });
    expect(cache?.getQueryData(['pacientes'])).toBeUndefined();
  });

  it('descarta os dados da conta quando a renovacao da sessao falha', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        sucesso: true,
        dados: {
          accessToken: 'token-conta-a', expiraEm: '2099-01-01T00:00:00Z',
          usuario: { id: 'usuario-a', nomeCompleto: 'Ana', email: 'ana@example.test', perfil: 'Psicologo' },
        },
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response('{}', { status: 401 }));
    vi.stubGlobal('fetch', fetchMock);
    let cache: QueryClient | undefined;
    function Consumidor() {
      cache = useQueryClient();
      return null;
    }
    render(<Providers><Consumidor /></Providers>);
    await entrar({ email: 'ana@example.test', senha: 'SenhaDeTeste123!' });
    cache?.setQueryData(['pacientes'], [{ nomeCompleto: 'Paciente da conta A' }]);

    expect(await renovarSessao()).toBe(false);
    expect(cache?.getQueryData(['pacientes'])).toBeUndefined();
  });
});
