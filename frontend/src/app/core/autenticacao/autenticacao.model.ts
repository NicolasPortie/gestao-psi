export interface LoginRequest {
  email: string;
  senha: string;
}

export interface CriarContaRequest {
  nomeCompleto: string;
  email: string;
  crp: string;
  senha: string;
  aceitouTermos: boolean;
}

export interface SolicitarRecuperacaoSenhaRequest {
  email: string;
}

export interface UsuarioAutenticado {
  id: string;
  nomeCompleto: string;
  email: string;
  perfil: string;
}

export interface AutenticacaoResponse {
  accessToken: string;
  expiraEm: string;
  usuario: UsuarioAutenticado;
}
