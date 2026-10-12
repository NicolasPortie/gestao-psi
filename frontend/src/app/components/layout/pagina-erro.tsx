import { isRouteErrorResponse, useRouteError } from 'react-router';

import { EstadoErro } from '../feedback/estados';
import { BotaoLink } from '../ui/botao';
import { Marca } from './marca';

/** Fallback de rota: erro de carregamento do módulo ou exceção de renderização. */
export function PaginaErro() {
  const erro = useRouteError();
  const mensagem = isRouteErrorResponse(erro)
    ? erro.statusText || 'A página solicitada não está disponível.'
    : erro instanceof Error
      ? erro.message
      : 'Ocorreu um erro inesperado.';

  return (
    <main className="grid min-h-dvh place-items-center bg-paper p-5">
      <div className="grid w-full max-w-md gap-6">
        <Marca />
        <EstadoErro
          alinhar="inicio"
          titulo="Não foi possível abrir esta página"
          mensagem={mensagem}
          acao={
            <BotaoLink to="/painel" variante="primario">
              Ir para Hoje
            </BotaoLink>
          }
        />
      </div>
    </main>
  );
}
