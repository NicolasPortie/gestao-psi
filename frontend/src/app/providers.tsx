import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

import { ProvedorToasts } from './components/feedback/provedor-toasts';
import { ProvedorDicas } from './components/ui/dica';
import { obterEstadoSessao, observarSessao } from './core/autenticacao/autenticacao.service';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (tentativas, erro) => {
        if (erro instanceof Error && 'status' in erro && erro.status === 403) return false;
        return tentativas < 1;
      },
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: false },
  },
});

function identidadeSessao() {
  const sessao = obterEstadoSessao();
  return sessao.status === 'autenticado' ? `${sessao.usuario.id}:${sessao.usuario.perfil}` : null;
}

let identidadeAtual = identidadeSessao();
observarSessao(() => {
  const novaIdentidade = identidadeSessao();
  if (novaIdentidade !== identidadeAtual) {
    // clear cancela queries pendentes e remove dados e mutacoes da sessao anterior.
    queryClient.clear();
    identidadeAtual = novaIdentidade;
  }
});

export function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <ProvedorDicas delay={500} closeDelay={80}>
        {children}
      </ProvedorDicas>
      <ProvedorToasts />
    </QueryClientProvider>
  );
}
