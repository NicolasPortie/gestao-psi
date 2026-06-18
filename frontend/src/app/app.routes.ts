import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Login | GestãoPsi',
    loadComponent: () =>
      import('./features/autenticacao/pages/login/login').then(
        (componente) => componente.Login,
      ),
  },
  {
    path: 'cadastro',
    title: 'Criar conta | GestãoPsi',
    loadComponent: () =>
      import('./features/autenticacao/pages/cadastro/cadastro').then(
        (componente) => componente.Cadastro,
      ),
  },
  {
    path: 'recuperar-senha',
    title: 'Recuperar senha | GestãoPsi',
    loadComponent: () =>
      import(
        './features/autenticacao/pages/recuperar-senha/recuperar-senha'
      ).then((componente) => componente.RecuperarSenha),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
