import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ErroApi } from '../../core/api/resposta-api';
import { alterarSenha } from '../../core/autenticacao/autenticacao.service';
import ContaPage from './conta-page';

vi.mock('../../core/autenticacao/autenticacao.service', () => ({
  alterarSenha: vi.fn(),
  useSessao: () => ({
    status: 'autenticado',
    accessToken: 'token',
    usuario: { id: 'u1', nomeCompleto: 'Helena Duarte', email: 'helena@exemplo.com.br', perfil: 'Psicologo' },
  }),
}));

function renderConta() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <ContaPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function preencher(atual: string, nova: string, confirmacao: string) {
  await userEvent.type(screen.getByLabelText('Senha atual'), atual);
  await userEvent.type(screen.getByLabelText('Nova senha'), nova);
  await userEvent.type(screen.getByLabelText('Confirmar nova senha'), confirmacao);
  await userEvent.click(screen.getByRole('button', { name: 'Alterar senha' }));
}

describe('ContaPage', () => {
  beforeEach(() => {
    vi.mocked(alterarSenha).mockReset();
  });

  it('mostra os dados de acesso do usuário logado', () => {
    renderConta();

    expect(screen.getByText('Helena Duarte')).toBeVisible();
    expect(screen.getByText('helena@exemplo.com.br')).toBeVisible();
    expect(screen.getByText('Psicólogo')).toBeVisible();
  });

  it('valida tamanho, confirmação e senha repetida antes de chamar a API', async () => {
    renderConta();

    await preencher('senha-antiga', 'curta', 'outra');
    expect(await screen.findByText('Use pelo menos 8 caracteres.')).toBeVisible();
    expect(screen.getByText('As senhas não coincidem.')).toBeVisible();
    expect(alterarSenha).not.toHaveBeenCalled();
  });

  it('recusa nova senha igual à atual', async () => {
    renderConta();

    await preencher('senha-antiga', 'senha-antiga', 'senha-antiga');
    expect(await screen.findByText('A nova senha deve ser diferente da atual.')).toBeVisible();
    expect(alterarSenha).not.toHaveBeenCalled();
  });

  it('envia a troca e limpa os campos ao concluir', async () => {
    vi.mocked(alterarSenha).mockResolvedValue(undefined);
    renderConta();

    await preencher('senha-antiga', 'senha-nova-segura', 'senha-nova-segura');

    await waitFor(() => expect(alterarSenha).toHaveBeenCalledWith('senha-antiga', 'senha-nova-segura'));
    await waitFor(() => expect(screen.getByLabelText('Senha atual')).toHaveValue(''));
    expect(screen.getByLabelText('Nova senha')).toHaveValue('');
  });

  it('mostra o erro do servidor e preserva o que foi digitado', async () => {
    vi.mocked(alterarSenha).mockRejectedValue(new ErroApi('A senha atual está incorreta.', 400, []));
    renderConta();

    await preencher('errada', 'senha-nova-segura', 'senha-nova-segura');

    expect(await screen.findByText('A senha atual está incorreta.')).toBeVisible();
    expect(screen.getByLabelText('Senha atual')).toHaveValue('errada');
  });
});
