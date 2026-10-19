import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, redirect } from 'react-router';

import { CarregandoPagina } from './components/feedback/esqueleto';
import { LayoutAutenticacao } from './components/layout/layout-autenticacao';
import { LayoutLegal } from './components/layout/layout-legal';
import { Marca } from './components/layout/marca';
import { PaginaErro } from './components/layout/pagina-erro';
import { PaginaNaoEncontrada } from './components/layout/pagina-nao-encontrada';
import { ExigePermissao } from './components/layout/exige-permissao';
import { Shell } from './components/layout/shell';
import { ConfiguracoesLayout } from './features/configuracoes/configuracoes-layout';
import { obterEstadoSessao, restaurarSessao } from './core/autenticacao/autenticacao.service';
import type { PermissaoAcesso } from './core/dominio/permissao-acesso';

const LoginPage = lazy(() => import('./features/autenticacao/login-page'));
const CadastroPage = lazy(() => import('./features/autenticacao/cadastro-page'));
const RecuperarSenhaPage = lazy(() => import('./features/autenticacao/recuperar-senha-page'));
const RedefinirSenhaPage = lazy(() => import('./features/autenticacao/redefinir-senha-page'));
const PainelPage = lazy(() => import('./features/painel/painel-page'));
const ListaPacientesPage = lazy(() => import('./features/pacientes/lista-pacientes-page'));
const FichaPacientePage = lazy(() => import('./features/pacientes/ficha-paciente-page'));
const FormularioPacientePage = lazy(() => import('./features/pacientes/formulario-paciente-page'));
const AgendaPage = lazy(() => import('./features/agenda/agenda-page'));
const ConfiguracoesAgendaPage = lazy(() => import('./features/agenda/configuracoes-agenda-page'));
const NovaConsultaPage = lazy(() => import('./features/agenda/nova-consulta-page'));
const DetalheConsultaPage = lazy(() => import('./features/agenda/detalhe-consulta-page'));
const PagamentosPage = lazy(() => import('./features/pagamentos/pagamentos-page'));
const ReciboPage = lazy(() => import('./features/pagamentos/recibo-page'));
const ReciboMensalPage = lazy(() => import('./features/pagamentos/recibo-mensal-page'));
const ListaEsperaPage = lazy(() => import('./features/lista-espera/lista-espera-page'));
const LembretesPage = lazy(() => import('./features/lembretes/lembretes-page'));
const ModelosMensagemPage = lazy(() => import('./features/modelos-mensagem/modelos-mensagem-page'));
const NotificacoesPage = lazy(() => import('./features/notificacoes/notificacoes-page'));
const RelatoriosPage = lazy(() => import('./features/relatorios/relatorios-page'));
const ProntuarioPage = lazy(() => import('./features/sessoes/prontuario-page'));
const DocumentosPage = lazy(() => import('./features/documentos/documentos-page'));
const DocumentoDetalhePage = lazy(() => import('./features/documentos/documento-detalhe-page'));
const WhatsAppIntegracaoPage = lazy(() => import('./features/whatsapp/whatsapp-integracao-page'));
const WhatsAppConversasPage = lazy(() => import('./features/whatsapp/whatsapp-conversas-page'));
const AuditoriaPage = lazy(() => import('./features/auditoria/auditoria-page'));
const UsuariosPage = lazy(() => import('./features/usuarios/usuarios-page'));
const DadosProfissionaisPage = lazy(
  () => import('./features/dados-profissionais/dados-profissionais-page'),
);
const ContaPage = lazy(() => import('./features/conta/conta-page'));
const TermosPage = lazy(() => import('./features/legal/termos-page'));
const PrivacidadePage = lazy(() => import('./features/legal/privacidade-page'));

async function rotaProtegida() {
  return (await restaurarSessao()) ? null : redirect('/login');
}

async function rotaPublica() {
  if (obterEstadoSessao().status === 'autenticado' || (await restaurarSessao()))
    return redirect('/painel');
  return null;
}

/** Tela cheia enquanto a sessão é restaurada: só a marca, sem layout que depois mudaria. */
const restaurandoSessao = (
  <div role="status" className="grid min-h-dvh place-items-center bg-paper">
    <span className="animar-esqueleto">
      <Marca />
    </span>
    <span className="sr-only">Carregando…</span>
  </div>
);

const comSuspense = (elemento: ReactNode) => (
  <Suspense fallback={<CarregandoPagina />}>{elemento}</Suspense>
);

/** Página que exige uma permissão da equipe, além de estar autenticado. */
const comPermissao = (permissao: PermissaoAcesso, elemento: ReactNode) => (
  <ExigePermissao permissao={permissao}>{comSuspense(elemento)}</ExigePermissao>
);

export const router = createBrowserRouter([
  {
    loader: rotaPublica,
    hydrateFallbackElement: restaurandoSessao,
    element: <LayoutAutenticacao />,
    errorElement: <PaginaErro />,
    children: [
      { path: '/login', handle: { titulo: 'Entrar' }, element: comSuspense(<LoginPage />) },
      {
        path: '/cadastro',
        handle: { titulo: 'Criar conta' },
        element: comSuspense(<CadastroPage />),
      },
      {
        path: '/recuperar-senha',
        handle: { titulo: 'Recuperar senha' },
        element: comSuspense(<RecuperarSenhaPage />),
      },
      {
        path: '/redefinir-senha',
        handle: { titulo: 'Redefinir senha' },
        element: comSuspense(<RedefinirSenhaPage />),
      },
    ],
  },
  {
    loader: rotaProtegida,
    hydrateFallbackElement: restaurandoSessao,
    element: <Shell />,
    errorElement: <PaginaErro />,
    children: [
      { path: '/painel', handle: { titulo: 'Hoje' }, element: comSuspense(<PainelPage />) },
      {
        path: '/agenda',
        handle: { titulo: 'Agenda' },
        element: comPermissao('Agenda', <AgendaPage />),
      },
      {
        path: '/consultas/nova',
        handle: { titulo: 'Nova consulta' },
        element: comPermissao('Agenda', <NovaConsultaPage />),
      },
      {
        path: '/consultas/:id',
        handle: { titulo: 'Consulta' },
        element: comPermissao('Agenda', <DetalheConsultaPage />),
      },
      {
        path: '/pacientes',
        handle: { titulo: 'Pacientes' },
        element: comPermissao('Pacientes', <ListaPacientesPage />),
      },
      {
        path: '/pacientes/novo',
        handle: { titulo: 'Novo paciente' },
        element: comPermissao('Pacientes', <FormularioPacientePage />),
      },
      {
        path: '/pacientes/:id/prontuario',
        handle: { titulo: 'Prontuário' },
        element: comSuspense(<ProntuarioPage />),
      },
      {
        path: '/pacientes/:id/editar',
        handle: { titulo: 'Editar paciente' },
        element: comPermissao('Pacientes', <FormularioPacientePage />),
      },
      {
        path: '/pacientes/:id',
        handle: { titulo: 'Paciente' },
        element: comPermissao('Pacientes', <FichaPacientePage />),
      },
      {
        path: '/pagamentos',
        handle: { titulo: 'Financeiro' },
        element: comPermissao('Financeiro', <PagamentosPage />),
      },
      {
        path: '/pagamentos/:id/recibo',
        handle: { titulo: 'Recibo' },
        element: comPermissao('Financeiro', <ReciboPage />),
      },
      {
        path: '/pacientes/:id/recibo-mensal',
        handle: { titulo: 'Recibo do mês' },
        element: comPermissao('Financeiro', <ReciboMensalPage />),
      },
      {
        path: '/lista-espera',
        handle: { titulo: 'Lista de espera' },
        element: comPermissao('Agenda', <ListaEsperaPage />),
      },
      {
        path: '/conversas',
        handle: { titulo: 'Conversas' },
        element: comPermissao('Conversas', <WhatsAppConversasPage />),
      },
      {
        path: '/lembretes',
        handle: { titulo: 'Lembretes' },
        element: comPermissao('Mensagens', <LembretesPage />),
      },
      {
        path: '/documentos',
        handle: { titulo: 'Documentos' },
        element: comSuspense(<DocumentosPage />),
      },
      {
        path: '/documentos/:id',
        handle: { titulo: 'Documento' },
        element: comSuspense(<DocumentoDetalhePage />),
      },
      {
        path: '/relatorios',
        handle: { titulo: 'Relatórios' },
        element: comPermissao('Relatorios', <RelatoriosPage />),
      },
      {
        path: '/notificacoes',
        handle: { titulo: 'Notificações' },
        element: comSuspense(<NotificacoesPage />),
      },
      {
        path: '/configuracoes',
        element: <ConfiguracoesLayout />,
        children: [
          { index: true, element: <Navigate replace to="agenda" /> },
          {
            path: 'conta',
            handle: { titulo: 'Conta e segurança' },
            element: comSuspense(<ContaPage />),
          },
          {
            path: 'agenda',
            handle: { titulo: 'Configurações da agenda' },
            element: comPermissao('Agenda', <ConfiguracoesAgendaPage />),
          },
          {
            path: 'profissional',
            handle: { titulo: 'Dados profissionais' },
            element: comSuspense(<DadosProfissionaisPage />),
          },
          {
            path: 'equipe',
            handle: { titulo: 'Equipe' },
            element: comPermissao('Equipe', <UsuariosPage />),
          },
          {
            path: 'auditoria',
            handle: { titulo: 'Auditoria' },
            element: comPermissao('Auditoria', <AuditoriaPage />),
          },
          {
            path: 'mensagens',
            handle: { titulo: 'Modelos de mensagem' },
            element: comPermissao('Mensagens', <ModelosMensagemPage />),
          },
          {
            path: 'whatsapp',
            handle: { titulo: 'Integração WhatsApp' },
            element: comPermissao('IntegracaoWhatsApp', <WhatsAppIntegracaoPage />),
          },
        ],
      },
      // Endereços anteriores continuam funcionando para favoritos e links salvos.
      { path: '/usuarios', element: <Navigate replace to="/configuracoes/equipe" /> },
      {
        path: '/dados-profissionais',
        element: <Navigate replace to="/configuracoes/profissional" />,
      },
      { path: '/modelos-mensagem', element: <Navigate replace to="/configuracoes/mensagens" /> },
      { path: '/auditoria', element: <Navigate replace to="/configuracoes/auditoria" /> },
      { path: '/integracoes/whatsapp', element: <Navigate replace to="/configuracoes/whatsapp" /> },
      { path: '/integracoes/whatsapp/conversas', element: <Navigate replace to="/conversas" /> },
      { path: '*', handle: { titulo: 'Página não encontrada' }, element: <PaginaNaoEncontrada /> },
    ],
  },
  {
    // Documentos públicos: acessíveis com ou sem sessão, por isso fora dos grupos protegido e público.
    element: <LayoutLegal />,
    errorElement: <PaginaErro />,
    children: [
      {
        path: '/termos',
        handle: { titulo: 'Termos de uso' },
        element: comSuspense(<TermosPage />),
      },
      {
        path: '/privacidade',
        handle: { titulo: 'Política de privacidade' },
        element: comSuspense(<PrivacidadePage />),
      },
    ],
  },
  { path: '/', element: <Navigate replace to="/login" /> },
]);
