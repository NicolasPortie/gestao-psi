/** Mensagem segura para exibir ao usuario; a API ja entrega texto tratado em ErroApi. */
export function mensagemDeErro(erro: unknown, padrao = 'Não foi possível concluir a operação. Tente novamente.'): string {
  return erro instanceof Error && erro.message.trim() ? erro.message : padrao;
}
