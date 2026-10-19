import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { usePermissoes } from '../../core/autenticacao/permissoes';
import { PerfisAcessoSecao } from './perfis-acesso-secao';

vi.mock('../../core/autenticacao/permissoes', () => ({ usePermissoes: vi.fn() }));

const catalogo = [
  { valor: 'Agenda', rotulo: 'Agenda', descricao: 'Ver e marcar consultas.' },
  { valor: 'Pacientes', rotulo: 'Pacientes', descricao: 'Ver e editar cadastro.' },
  { valor: 'Auditoria', rotulo: 'Auditoria', descricao: 'Ver quem fez o quê.' },
];

const secretaria = { id: 'p1', nome: 'Secretária', descricao: 'Cuida da agenda.', permissoes: ['Agenda', 'Pacientes'], pessoas: 2 };

function responder(perfis: unknown[]) {
  const chamadas: Array<{ url: string; metodo: string; corpo: unknown }> = [];
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, init?: RequestInit) => {
      const metodo = init?.method ?? 'GET';
      chamadas.push({ url, metodo, corpo: init?.body ? JSON.parse(init.body as string) : undefined });
      const dados = url.endsWith('/permissoes') ? catalogo : metodo === 'GET' ? perfis : { ...secretaria };
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ sucesso: true, dados }) });
    }),
  );
  return chamadas;
}

function renderizar() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <PerfisAcessoSecao />
    </QueryClientProvider>,
  );
}

describe('PerfisAcessoSecao', () => {
  beforeEach(() => {
    // Quem cria o perfil tem Agenda e Pacientes, mas não Auditoria.
    vi.mocked(usePermissoes).mockReturnValue({
      usuario: null,
      acessoClinico: false,
      acessoGestao: false,
      pode: (permissao) => permissao !== 'Auditoria',
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lista os perfis com os acessos em palavras e quantas pessoas usam', async () => {
    responder([secretaria]);
    renderizar();

    expect(await screen.findByText('Secretária')).toBeVisible();
    expect(screen.getByText('2 pessoas')).toBeVisible();
    const acessos = within(screen.getByRole('list', { name: 'Acessos de Secretária' }));
    expect(acessos.getByText('Agenda')).toBeVisible();
    expect(acessos.getByText('Pacientes')).toBeVisible();
  });

  it('mostra um estado vazio que explica quando criar um perfil', async () => {
    responder([]);
    renderizar();

    expect(await screen.findByText('Nenhum perfil criado')).toBeVisible();
  });

  it('não deixa criar um perfil sem nenhum acesso', async () => {
    const chamadas = responder([]);
    renderizar();
    await userEvent.click(await screen.findByRole('button', { name: 'Novo perfil' }));

    await userEvent.type(await screen.findByLabelText('Nome do perfil'), 'Estagiária');
    await userEvent.click(screen.getByRole('button', { name: 'Criar perfil' }));

    expect(await screen.findByText('Marque pelo menos um acesso.')).toBeVisible();
    expect(chamadas.some((chamada) => chamada.metodo === 'POST')).toBe(false);
  });

  it('cria o perfil com os acessos marcados e bloqueia os que a pessoa não tem', async () => {
    const chamadas = responder([]);
    renderizar();
    await userEvent.click(await screen.findByRole('button', { name: 'Novo perfil' }));

    await userEvent.type(await screen.findByLabelText('Nome do perfil'), '  Estagiária ');
    expect(await screen.findByRole('checkbox', { name: /Auditoria/ })).toBeDisabled();
    await userEvent.click(await screen.findByRole('checkbox', { name: /Agenda/ }));
    expect(await screen.findByText(/também precisa do acesso a Pacientes/)).toBeVisible();
    await userEvent.click(screen.getByRole('checkbox', { name: /Pacientes/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Criar perfil' }));

    await vi.waitFor(() => expect(chamadas.some((chamada) => chamada.metodo === 'POST')).toBe(true));
    const envio = chamadas.find((chamada) => chamada.metodo === 'POST');
    expect(envio?.corpo).toEqual({ nome: 'Estagiária', descricao: null, permissoes: ['Agenda', 'Pacientes'] });
  });
});
