export interface RespostaApi<T> {
  sucesso: boolean;
  dados?: T | null;
  mensagem?: string | null;
  erros?: string[] | null;
}

export class ErroApi extends Error {
  constructor(
    mensagem: string,
    readonly status: number,
    readonly erros: string[] = [],
  ) {
    super(mensagem);
    this.name = 'ErroApi';
  }
}

export function extrairDados<T>(resposta: RespostaApi<T>, mensagemPadrao: string): T {
  if (!resposta.sucesso || resposta.dados == null) {
    throw new ErroApi(resposta.erros?.[0] ?? resposta.mensagem ?? mensagemPadrao, 422, resposta.erros ?? []);
  }
  return resposta.dados;
}
