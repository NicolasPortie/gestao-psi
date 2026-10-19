import {
  Bell,
  CalendarDays,
  ClipboardList,
  Clock3,
  FileText,
  House,
  MessagesSquare,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

import type { PermissaoAcesso } from '../../core/dominio/permissao-acesso';

export interface ItemNavegacao {
  rota: string;
  rotulo: string;
  icone: LucideIcon;
  /** Conteúdo clínico: somente para o perfil Psicólogo (o backend também exige). */
  clinico?: boolean;
  /** Permissão administrativa que libera o item; sem ela, o item some. O backend também exige. */
  permissao?: PermissaoAcesso;
}

export interface GrupoNavegacao {
  id: string;
  rotulo: string;
  itens: ItemNavegacao[];
}

export const gruposNavegacao: GrupoNavegacao[] = [
  {
    id: 'rotina',
    rotulo: 'Rotina',
    itens: [
      { rota: '/painel', rotulo: 'Hoje', icone: House },
      { rota: '/agenda', rotulo: 'Agenda', icone: CalendarDays, permissao: 'Agenda' },
      { rota: '/pacientes', rotulo: 'Pacientes', icone: Users, permissao: 'Pacientes' },
      { rota: '/pagamentos', rotulo: 'Financeiro', icone: Wallet, permissao: 'Financeiro' },
      { rota: '/lista-espera', rotulo: 'Lista de espera', icone: Clock3, permissao: 'Agenda' },
    ],
  },
  {
    id: 'comunicacao',
    rotulo: 'Comunicação',
    itens: [
      { rota: '/conversas', rotulo: 'Conversas', icone: MessagesSquare, permissao: 'Conversas' },
      { rota: '/lembretes', rotulo: 'Lembretes', icone: Bell, permissao: 'Mensagens' },
    ],
  },
  {
    id: 'clinico',
    rotulo: 'Clínico',
    itens: [{ rota: '/documentos', rotulo: 'Documentos', icone: FileText, clinico: true }],
  },
  {
    id: 'consultorio',
    rotulo: 'Consultório',
    itens: [
      { rota: '/relatorios', rotulo: 'Relatórios', icone: ClipboardList, permissao: 'Relatorios' },
      { rota: '/configuracoes', rotulo: 'Configurações', icone: Settings },
    ],
  },
];

/** Atalhos da barra inferior no celular; o restante vive na folha "Mais". */
export const rotasBarraInferior = ['/painel', '/agenda', '/pacientes', '/pagamentos'] as const;

export interface PermissoesDeNavegacao {
  acessoClinico: boolean;
  pode: (permissao: PermissaoAcesso) => boolean;
}

export function itemPermitido(item: ItemNavegacao, permissoes: PermissoesDeNavegacao) {
  if (item.clinico && !permissoes.acessoClinico) return false;
  return !item.permissao || permissoes.pode(item.permissao);
}

export function gruposPermitidos(permissoes: PermissoesDeNavegacao) {
  return gruposNavegacao
    .map((grupo) => ({
      ...grupo,
      itens: grupo.itens.filter((item) => itemPermitido(item, permissoes)),
    }))
    .filter((grupo) => grupo.itens.length > 0);
}
