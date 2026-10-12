import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

/**
 * Filtros e paginação na URL: a tela fica compartilhável e o botão "voltar" funciona.
 * `atualizar` troca só as chaves informadas; valor vazio ou nulo remove o parâmetro.
 */
export function useParametrosUrl() {
  const [params, setParams] = useSearchParams();

  const atualizar = useCallback(
    (mudancas: Record<string, string | null | undefined>) => {
      setParams(
        (atuais) => {
          const proximos = new URLSearchParams(atuais);
          for (const [chave, valor] of Object.entries(mudancas)) {
            if (valor) proximos.set(chave, valor);
            else proximos.delete(chave);
          }
          return proximos;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const limpar = useCallback(() => setParams({}, { replace: true }), [setParams]);

  /** Lê um parâmetro restrito a um conjunto de valores válidos; ignora qualquer outro. */
  const lerOpcao = useCallback(
    <Valor extends string>(chave: string, validos: readonly Valor[]): Valor | '' => {
      const valor = params.get(chave);
      return validos.includes(valor as Valor) ? (valor as Valor) : '';
    },
    [params],
  );

  const pagina = Math.max(1, Number(params.get('pagina')) || 1);

  return { params, atualizar, limpar, lerOpcao, pagina };
}
