import { permissoesDoPerfil, type PermissaoAcesso } from '../dominio/permissao-acesso';
import { useSessao } from './autenticacao.service';

function normalizar(perfil: string | undefined) {
  return perfil?.trim().toLocaleLowerCase('pt-BR') ?? '';
}

/**
 * Permissões usadas somente para decidir o que mostrar.
 * A autorização real acontece no backend: ocultar um elemento nunca protege dados.
 */
export function usePermissoes() {
  const sessao = useSessao();
  const usuario = sessao.status === 'autenticado' ? sessao.usuario : null;
  const perfil = normalizar(usuario?.perfil);
  const acessoClinico = perfil === 'psicologo';
  const concedidas = new Set<string>(usuario?.permissoes ?? permissoesDoPerfil(usuario?.perfil));
  return {
    usuario,
    acessoClinico,
    acessoGestao: acessoClinico || perfil === 'administrador',
    pode: (permissao: PermissaoAcesso) => concedidas.has(permissao),
  };
}
