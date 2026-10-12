import { toast } from 'sonner';

/**
 * Confirmações passageiras. Sucesso e erro de ações pontuais usam toast;
 * erros de formulário e de carregamento ficam em linha, junto do conteúdo.
 */
export const notificar = {
  sucesso: (mensagem: string) => toast.success(mensagem),
  erro: (mensagem: string) => toast.error(mensagem),
  info: (mensagem: string) => toast(mensagem),
};
