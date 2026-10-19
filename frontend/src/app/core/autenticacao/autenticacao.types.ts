export interface LoginRequest {
  email: string;
  senha: string;
}

export interface CriarContaRequest {
  tokenEmail: string;
  email: string;
  senha: string;
  aceitouTermos: boolean;
}

export interface UsuarioAutenticado {
  id: string;
  nomeCompleto: string;
  email: string;
  perfil: string;
  /** Lista enviada pelo servidor; ausente em sessões antigas. */
  permissoes?: string[];
  /** Nome do perfil de acesso criado pela conta, quando o perfil é personalizado. */
  nomeDoPerfil?: string | null;
}

export interface AutenticacaoResponse {
  accessToken: string;
  expiraEm: string;
  usuario: UsuarioAutenticado;
}

export type EstadoSessao =
  | { status: 'verificando'; usuario: null; accessToken: null }
  | { status: 'anonimo'; usuario: null; accessToken: null }
  | { status: 'autenticado'; usuario: UsuarioAutenticado; accessToken: string };
