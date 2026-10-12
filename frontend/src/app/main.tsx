import '@fontsource-variable/hanken-grotesk';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import { iniciarTema } from './core/tema/tema';
import { Providers } from './providers';
import { router } from './router';
import './styles/index.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Elemento raiz da aplicação não encontrado.');
}

iniciarTema();

createRoot(root).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
);
