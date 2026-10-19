const PREFIXO = 'personalizado:';

/** Escolha de perfil: "Recepcionista", "Administrador" ou `personalizado:<id>` de um perfil criado pela conta. */
export type EscolhaPerfil = string;

export const prefixoPerfilPersonalizado = PREFIXO;

export function escolhaDoUsuario(usuario: {
  perfil: string;
  perfilAcessoId: string | null;
}): EscolhaPerfil {
  if (usuario.perfil === 'Personalizado' && usuario.perfilAcessoId)
    return `${PREFIXO}${usuario.perfilAcessoId}`;
  return usuario.perfil === 'Administrador' ? 'Administrador' : 'Recepcionista';
}

/** Traduz a escolha para o que a API espera. */
export function perfilDaEscolha(escolha: EscolhaPerfil) {
  if (escolha.startsWith(PREFIXO))
    return { perfil: 'Personalizado' as const, perfilAcessoId: escolha.slice(PREFIXO.length) };
  return {
    perfil: escolha === 'Administrador' ? ('Administrador' as const) : ('Recepcionista' as const),
    perfilAcessoId: null,
  };
}
