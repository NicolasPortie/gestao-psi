import { Routes } from '@angular/router';
import { autenticadoGuard } from './core/guards/autenticado.guard';

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
    path: 'painel',
    title: 'Painel | GestaoPsi',
    canActivate: [autenticadoGuard],
    loadComponent: () =>
      import('./features/painel/pages/painel/painel').then(
        (componente) => componente.Painel,
      ),
  },
  {
    path: 'agenda',
    title: 'Agenda | GestaoPsi',
    canActivate: [autenticadoGuard],
    data: {
      titulo: 'Agenda administrativa',
      icone: 'pi-calendar',
      etiqueta: 'Agenda',
    },
    loadComponent: () =>
      import('./features/modulos/pages/modulo-operacional/modulo-operacional').then(
        (componente) => componente.ModuloOperacional,
      ),
  },
  {
    path: 'consultas/nova',
    title: 'Nova consulta | GestaoPsi',
    canActivate: [autenticadoGuard],
    data: {
      titulo: 'Nova consulta',
      icone: 'pi-calendar-plus',
      etiqueta: 'Agenda',
    },
    loadComponent: () =>
      import('./features/modulos/pages/modulo-operacional/modulo-operacional').then(
        (componente) => componente.ModuloOperacional,
      ),
  },
  {
    path: 'consultas/:id',
    title: 'Detalhes da consulta | GestaoPsi',
    canActivate: [autenticadoGuard],
    data: {
      titulo: 'Detalhes da consulta',
      icone: 'pi-calendar-clock',
      etiqueta: 'Consulta',
    },
    loadComponent: () =>
      import('./features/modulos/pages/modulo-operacional/modulo-operacional').then(
        (componente) => componente.ModuloOperacional,
      ),
  },
  {
    path: 'pacientes',
    title: 'Pacientes | GestaoPsi',
    canActivate: [autenticadoGuard],
    data: {
      titulo: 'Pacientes',
      icone: 'pi-users',
      etiqueta: 'Pacientes',
    },
    loadComponent: () =>
      import('./features/modulos/pages/modulo-operacional/modulo-operacional').then(
        (componente) => componente.ModuloOperacional,
      ),
  },
  {
    path: 'pacientes/novo',
    title: 'Novo paciente | GestaoPsi',
    canActivate: [autenticadoGuard],
    data: {
      titulo: 'Cadastrar paciente',
      icone: 'pi-user-plus',
      etiqueta: 'Pacientes',
    },
    loadComponent: () =>
      import('./features/modulos/pages/modulo-operacional/modulo-operacional').then(
        (componente) => componente.ModuloOperacional,
      ),
  },
  {
    path: 'pagamentos',
    title: 'Financeiro | GestaoPsi',
    canActivate: [autenticadoGuard],
    data: {
      titulo: 'Financeiro administrativo',
      icone: 'pi-wallet',
      etiqueta: 'Financeiro',
    },
    loadComponent: () =>
      import('./features/modulos/pages/modulo-operacional/modulo-operacional').then(
        (componente) => componente.ModuloOperacional,
      ),
  },
  {
    path: 'documentos/novo',
    title: 'Novo documento | GestaoPsi',
    canActivate: [autenticadoGuard],
    data: {
      titulo: 'Novo documento psicologico',
      icone: 'pi-file-plus',
      etiqueta: 'Documentos',
    },
    loadComponent: () =>
      import('./features/modulos/pages/modulo-operacional/modulo-operacional').then(
        (componente) => componente.ModuloOperacional,
      ),
  },
  {
    path: 'integracoes/whatsapp/conversas',
    title: 'Conversas WhatsApp | GestaoPsi',
    canActivate: [autenticadoGuard],
    data: {
      titulo: 'Conversas WhatsApp',
      icone: 'pi-whatsapp',
      etiqueta: 'WhatsApp administrativo',
    },
    loadComponent: () =>
      import('./features/modulos/pages/modulo-operacional/modulo-operacional').then(
        (componente) => componente.ModuloOperacional,
      ),
  },
  {
    path: 'lembretes',
    title: 'Lembretes | GestaoPsi',
    canActivate: [autenticadoGuard],
    data: {
      titulo: 'Lembretes',
      icone: 'pi-send',
      etiqueta: 'Lembretes',
    },
    loadComponent: () =>
      import('./features/modulos/pages/modulo-operacional/modulo-operacional').then(
        (componente) => componente.ModuloOperacional,
      ),
  },
  {
    path: 'notificacoes',
    title: 'Notificacoes | GestaoPsi',
    canActivate: [autenticadoGuard],
    data: {
      titulo: 'Notificacoes',
      icone: 'pi-bell',
      etiqueta: 'Notificacoes',
    },
    loadComponent: () =>
      import('./features/modulos/pages/modulo-operacional/modulo-operacional').then(
        (componente) => componente.ModuloOperacional,
      ),
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
