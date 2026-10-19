import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  confirmarEmailCadastro,
  criarConta,
  solicitarCodigoCadastro,
} from '../../core/autenticacao/autenticacao.service';
import CadastroPage from './cadastro-page';
vi.mock('../../core/autenticacao/autenticacao.service', () => ({
  criarConta: vi.fn(),
  solicitarCodigoCadastro: vi.fn(),
  confirmarEmailCadastro: vi.fn(),
}));
function renderCadastro() {
  render(
    <MemoryRouter initialEntries={['/cadastro']}>
      <Routes>
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="/painel" element={<h1>Hoje</h1>} />
      </Routes>
    </MemoryRouter>,
  );
  return userEvent.setup();
}
async function preencherAcesso(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('E-mail'), 'ana@exemplo.com.br');
  await user.type(screen.getByLabelText('Senha'), 'SenhaSegura123!');
  await user.type(screen.getByLabelText('Confirmar senha'), 'SenhaSegura123!');
  await user.click(screen.getByRole('checkbox', { name: /Li e aceito/ }));
}
describe('Cadastro sem identificação profissional obrigatória', () => {
  beforeEach(() => {
    vi.mocked(criarConta)
      .mockReset()
      .mockResolvedValue({
        accessToken: 'teste',
        expiraEm: '',
        usuario: { id: '1', nomeCompleto: '', email: 'ana@exemplo.com.br', perfil: 'Psicologo' },
      });
    vi.mocked(solicitarCodigoCadastro)
      .mockReset()
      .mockResolvedValue({
        identificador: 'envio-teste',
        expiraEm: new Date(Date.now() + 600000).toISOString(),
        reenviarAposSegundos: 60,
      });
    vi.mocked(confirmarEmailCadastro)
      .mockReset()
      .mockResolvedValue({
        tokenEmail: 'comprovante-teste',
        expiraEm: new Date(Date.now() + 1800000).toISOString(),
      });
  });
  it('exige senha coincidente e aceite antes de solicitar o código', async () => {
    const user = renderCadastro();
    await preencherAcesso(user);
    await user.clear(screen.getByLabelText('Confirmar senha'));
    await user.type(screen.getByLabelText('Confirmar senha'), 'OutraSenha123!');
    await user.click(screen.getByRole('checkbox', { name: /Li e aceito/ }));
    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'text');
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));
    expect(await screen.findByText(/As senhas não coincidem/)).toBeVisible();
    expect(screen.getByText('Aceite os termos para continuar.')).toBeVisible();
    expect(solicitarCodigoCadastro).not.toHaveBeenCalled();
  });
  it('confirma o código, cria apenas o acesso e abre o painel sem pedir nome ou CRP', async () => {
    const user = renderCadastro();
    await preencherAcesso(user);
    expect(screen.queryByLabelText('Nome completo')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('CRP')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));
    expect(criarConta).not.toHaveBeenCalled();
    // O sexto dígito envia o código sem exigir o clique.
    await user.type(await screen.findByLabelText('Código de confirmação'), '123456');
    expect(await screen.findByRole('heading', { name: 'Hoje' })).toBeVisible();
    expect(confirmarEmailCadastro).toHaveBeenCalledExactlyOnceWith(
      'ana@exemplo.com.br',
      'envio-teste',
      '123456',
    );
    expect(criarConta).toHaveBeenCalledExactlyOnceWith({
      email: 'ana@exemplo.com.br',
      senha: 'SenhaSegura123!',
      aceitouTermos: true,
      tokenEmail: 'comprovante-teste',
    });
  });
  it('não cria conta com código recusado e preserva dados ao corrigir o acesso', async () => {
    vi.mocked(confirmarEmailCadastro).mockRejectedValue(new Error('Código inválido ou expirado.'));
    const user = renderCadastro();
    await preencherAcesso(user);
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));
    // O sexto dígito envia o código sem exigir o clique.
    await user.type(await screen.findByLabelText('Código de confirmação'), '123456');
    expect(await screen.findByText('Código inválido ou expirado.')).toBeVisible();
    expect(criarConta).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Corrigir e-mail' }));
    expect(screen.getByLabelText('E-mail')).toHaveValue('ana@exemplo.com.br');
    expect(screen.getByLabelText('Senha')).toHaveValue('SenhaSegura123!');
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
  it('permanece no acesso sem anunciar envio quando a API falha', async () => {
    vi.mocked(solicitarCodigoCadastro).mockRejectedValue(new Error('Envio indisponível.'));
    const user = renderCadastro();
    await preencherAcesso(user);
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));
    expect(await screen.findByText('Envio indisponível.')).toBeVisible();
    expect(screen.getByLabelText('E-mail')).toHaveValue('ana@exemplo.com.br');
    expect(screen.queryByLabelText('Código de confirmação')).not.toBeInTheDocument();
    expect(criarConta).not.toHaveBeenCalled();
  });
  it('permite repetir a criação após falha sem consumir o mesmo código novamente', async () => {
    vi.mocked(criarConta).mockRejectedValueOnce(new Error('Tente novamente.'));
    const user = renderCadastro();
    await preencherAcesso(user);
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));
    // O sexto dígito envia o código sem exigir o clique.
    await user.type(await screen.findByLabelText('Código de confirmação'), '123456');
    expect(await screen.findByText('Tente novamente.')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Confirmar e criar conta' }));
    expect(await screen.findByRole('heading', { name: 'Hoje' })).toBeVisible();
    expect(confirmarEmailCadastro).toHaveBeenCalledTimes(1);
  });
});
