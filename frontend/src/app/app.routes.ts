import { Routes } from '@angular/router';
import { autenticadoGuard } from './core/guards/autenticado.guard';
import { naoAutenticadoGuard } from './core/guards/nao-autenticado.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [naoAutenticadoGuard],
    title: 'Login | GestãoPsi',
    loadComponent: () =>
      import('./features/autenticacao/pages/login/login').then((componente) => componente.Login),
  },
  {
    path: 'cadastro',
    canActivate: [naoAutenticadoGuard],
    title: 'Criar conta | GestãoPsi',
    loadComponent: () =>
      import('./features/autenticacao/pages/cadastro/cadastro').then(
        (componente) => componente.Cadastro,
      ),
  },
  {
    path: 'recuperar-senha',
    canActivate: [naoAutenticadoGuard],
    title: 'Recuperar senha | GestãoPsi',
    loadComponent: () =>
      import('./features/autenticacao/pages/recuperar-senha/recuperar-senha').then(
        (componente) => componente.RecuperarSenha,
      ),
  },
  {
    path: 'redefinir-senha',
    canActivate: [naoAutenticadoGuard],
    title: 'Redefinir senha | GestaoPsi',
    loadComponent: () =>
      import('./features/autenticacao/pages/redefinir-senha/redefinir-senha').then(
        (componente) => componente.RedefinirSenha,
      ),
  },
  {
    path: 'painel',
    title: 'Painel | GestaoPsi',
    canActivate: [autenticadoGuard],
    loadComponent: () =>
      import('./features/painel/pages/painel/painel').then((componente) => componente.Painel),
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
    loadComponent: () => import('./features/agenda/agenda').then((componente) => componente.Agenda),
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
    loadComponent: () => import('./features/agenda/nova-consulta').then((componente) => componente.NovaConsulta),
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
    loadComponent: () =>
      import('./features/pacientes/pages/lista-pacientes/lista-pacientes').then(
        (componente) => componente.ListaPacientes,
      ),
  },
  {
    path: 'pacientes/novo',
    title: 'Novo paciente | GestaoPsi',
    canActivate: [autenticadoGuard],
    loadComponent: () =>
      import('./features/pacientes/pages/formulario-paciente/formulario-paciente').then(
        (componente) => componente.FormularioPacienteComponent,
      ),
  },
  {
    path: 'pacientes/:id',
    title: 'Editar paciente | GestaoPsi',
    canActivate: [autenticadoGuard],
    loadComponent: () =>
      import('./features/pacientes/pages/formulario-paciente/formulario-paciente').then(
        (componente) => componente.FormularioPacienteComponent,
      ),
  },
  {
    path: 'pagamentos',
    title: 'Financeiro | GestaoPsi',
    canActivate: [autenticadoGuard],
    loadComponent: () => import('./features/pagamentos/pagamentos').then((componente) => componente.Pagamentos),
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
