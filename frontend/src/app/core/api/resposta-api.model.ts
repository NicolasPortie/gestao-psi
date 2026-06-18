export interface RespostaApi<T> {
  sucesso: boolean;
  dados: T | null;
  mensagem: string | null;
  erros: string[] | null;
}
