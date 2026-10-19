import {
  CalendarCog,
  IdCard,
  KeyRound,
  MessageSquareText,
  Plug,
  ScrollText,
  UserCog,
  type LucideIcon,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router';

import { ContextoAlinhamentoPagina } from '../../components/layout/contexto-pagina';
import { cn } from '../../components/ui/cn';
import { usePermissoes } from '../../core/autenticacao/permissoes';
import type { PermissaoAcesso } from '../../core/dominio/permissao-acesso';

interface SecaoConfiguracao {
  rota: string;
  rotulo: string;
  icone: LucideIcon;
  /** Gestão da conta: Psicólogo e Administrador (o backend também exige). */
  gestao?: boolean;
  /** Permissão da equipe que libera a seção; sem ela, a seção some. */
  permissao?: PermissaoAcesso;
}

const grupos: Array<{ id: string; rotulo: string; secoes: SecaoConfiguracao[] }> = [
  {
    id: 'pessoal',
    rotulo: 'Minha conta',
    secoes: [{ rota: 'conta', rotulo: 'Conta e segurança', icone: KeyRound }],
  },
  {
    id: 'consultorio',
    rotulo: 'Consultório',
    secoes: [
      { rota: 'agenda', rotulo: 'Agenda', icone: CalendarCog, permissao: 'Agenda' },
      { rota: 'profissional', rotulo: 'Dados profissionais', icone: IdCard, gestao: true },
    ],
  },
  {
    id: 'acesso',
    rotulo: 'Equipe e segurança',
    secoes: [
      { rota: 'equipe', rotulo: 'Equipe', icone: UserCog, permissao: 'Equipe' },
      { rota: 'auditoria', rotulo: 'Auditoria', icone: ScrollText, permissao: 'Auditoria' },
    ],
  },
  {
    id: 'comunicacao',
    rotulo: 'Comunicação',
    secoes: [
      {
        rota: 'mensagens',
        rotulo: 'Modelos de mensagem',
        icone: MessageSquareText,
        permissao: 'Mensagens',
      },
      {
        rota: 'whatsapp',
        rotulo: 'Integração WhatsApp',
        icone: Plug,
        permissao: 'IntegracaoWhatsApp',
      },
    ],
  },
];

/** Hub das configurações: subnavegação lateral (faixa rolável no celular) e a seção ativa ao lado. */
export function ConfiguracoesLayout() {
  const { acessoGestao, pode } = usePermissoes();
  const visiveis = grupos
    .map((grupo) => ({
      ...grupo,
      secoes: grupo.secoes.filter(
        (secao) => (!secao.gestao || acessoGestao) && (!secao.permissao || pode(secao.permissao)),
      ),
    }))
    .filter((grupo) => grupo.secoes.length > 0);

  return (
    <ContextoAlinhamentoPagina value="inicio">
      <div className="mx-auto grid max-w-7xl 2xl:max-w-[90rem] grid-cols-[minmax(0,1fr)] gap-x-14 gap-y-6 lg:grid-cols-[13.5rem_minmax(0,1fr)]">
        <nav
          aria-label="Seções de configurações"
          className="min-w-0 lg:sticky lg:top-9 lg:self-start"
        >
          <p className="mb-2 text-sm font-medium text-ink-muted lg:px-2.5 lg:text-lg lg:font-semibold lg:text-ink">
            Configurações
          </p>
          <div className="sem-barra -mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
            <div className="flex gap-x-6 lg:grid lg:gap-y-4">
              {visiveis.map((grupo) => (
                <div key={grupo.id} className="flex shrink-0 gap-1 lg:grid lg:gap-0.5">
                  <p className="hidden px-2.5 pb-1 text-xs font-medium text-ink-faint lg:block">
                    {grupo.rotulo}
                  </p>
                  {grupo.secoes.map(({ rota, rotulo, icone: Icone }) => (
                    <NavLink
                      key={rota}
                      to={rota}
                      className={({ isActive }) =>
                        cn(
                          'flex h-8 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-md px-2.5 text-sm font-medium no-underline',
                          'transition-[background-color,color,scale] duration-150 ease-out active:scale-[0.98] pointer-coarse:h-11 pointer-coarse:text-base',
                          isActive
                            ? 'bg-accent-wash text-accent-ink'
                            : 'text-ink-muted hover:bg-hover hover:text-ink',
                        )
                      }
                    >
                      <Icone size={16} strokeWidth={1.75} className="shrink-0" aria-hidden="true" />
                      {rotulo}
                    </NavLink>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </nav>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </ContextoAlinhamentoPagina>
  );
}
