import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';

import { usePermissoes } from '../../core/autenticacao/permissoes';
import type { PermissaoAcesso } from '../../core/dominio/permissao-acesso';
import { AcessoRestrito } from '../feedback/acesso-restrito';
import { Botao } from '../ui/botao';

/** Mostra a página só a quem tem a permissão; os demais veem um aviso claro. O servidor recusa o acesso de qualquer forma. */
export function ExigePermissao({
  permissao,
  children,
}: {
  permissao: PermissaoAcesso;
  children: ReactNode;
}) {
  const { pode } = usePermissoes();
  const navegar = useNavigate();
  if (pode(permissao)) return children;
  return (
    <AcessoRestrito
      titulo="Seu perfil não abre esta página"
      mensagem="Peça a quem cuida da equipe para incluir este acesso no seu perfil."
      acao={
        <Botao variante="secundario" onClick={() => void navegar('/painel')}>
          Voltar para Hoje
        </Botao>
      }
    />
  );
}
