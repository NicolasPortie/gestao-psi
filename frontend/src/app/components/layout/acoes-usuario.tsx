import { useQueryClient } from '@tanstack/react-query';
import { IdCard, KeyRound, LogOut, Monitor, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router';

import { sair } from '../../core/autenticacao/autenticacao.service';
import { usePermissoes } from '../../core/autenticacao/permissoes';
import { definirPreferenciaTema, usePreferenciaTema, type PreferenciaTema } from '../../core/tema/tema';
import type { ItemMenu } from '../ui/menu';

const temas: Array<{ valor: PreferenciaTema; rotulo: string; icone: typeof Sun }> = [
  { valor: 'claro', rotulo: 'Tema claro', icone: Sun },
  { valor: 'escuro', rotulo: 'Tema escuro', icone: Moon },
  { valor: 'sistema', rotulo: 'Seguir o sistema', icone: Monitor },
];

/** Itens do menu da conta: segurança, dados profissionais, aparência e saída. Compartilhado por desktop e celular. */
export function useAcoesUsuario(): ItemMenu[] {
  const { acessoGestao } = usePermissoes();
  const preferencia = usePreferenciaTema();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function encerrarSessao() {
    await sair().catch(() => undefined);
    queryClient.clear();
    await navigate('/login', { replace: true });
  }

  return [
    { rotulo: 'Conta e segurança', icone: <KeyRound size={16} />, para: '/configuracoes/conta' },
    ...(acessoGestao ? [{ rotulo: 'Dados profissionais', icone: <IdCard size={16} />, para: '/configuracoes/profissional' }] : []),
    ...temas.map(({ valor, rotulo, icone: Icone }, indice) => ({
      rotulo,
      icone: <Icone size={16} />,
      selecionado: preferencia === valor,
      separador: indice === 0,
      aoSelecionar: () => definirPreferenciaTema(valor),
    })),
    { rotulo: 'Sair com segurança', icone: <LogOut size={16} />, perigo: true, separador: true, aoSelecionar: () => void encerrarSessao() },
  ];
}
