import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import LoginPage from './login-page';

describe('LoginPage', () => {
  it('orienta o usuario quando os campos obrigatorios estao invalidos', async () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);

    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Informe seu e-mail.')).toBeVisible();
    expect(screen.getByText('Informe sua senha.')).toBeVisible();
  });
});
