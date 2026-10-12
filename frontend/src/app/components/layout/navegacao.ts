import { Bell, CalendarDays, ClipboardList, Clock3, FileText, House, MessagesSquare, Settings, Users, Wallet, type LucideIcon } from 'lucide-react';

export interface ItemNavegacao {
  rota: string;
  rotulo: string;
  icone: LucideIcon;
  /** Conteúdo clínico: somente para o perfil Psicólogo (o backend também exige). */
  clinico?: boolean;
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
      { rota: '/agenda', rotulo: 'Agenda', icone: CalendarDays },
      { rota: '/pacientes', rotulo: 'Pacientes', icone: Users },
      { rota: '/pagamentos', rotulo: 'Financeiro', icone: Wallet },
      { rota: '/lista-espera', rotulo: 'Lista de espera', icone: Clock3 },
    ],
  },
  {
    id: 'comunicacao',
    rotulo: 'Comunicação',
    itens: [
      { rota: '/conversas', rotulo: 'Conversas', icone: MessagesSquare },
      { rota: '/lembretes', rotulo: 'Lembretes', icone: Bell },
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
      { rota: '/relatorios', rotulo: 'Relatórios', icone: ClipboardList },
      { rota: '/configuracoes', rotulo: 'Configurações', icone: Settings },
    ],
  },
];

/** Atalhos da barra inferior no celular; o restante vive na folha "Mais". */
export const rotasBarraInferior = ['/painel', '/agenda', '/pacientes', '/pagamentos'] as const;

export function gruposPermitidos(permissoes: { acessoClinico: boolean }) {
  return gruposNavegacao
    .map((grupo) => ({
      ...grupo,
      itens: grupo.itens.filter((item) => !item.clinico || permissoes.acessoClinico),
    }))
    .filter((grupo) => grupo.itens.length > 0);
}
