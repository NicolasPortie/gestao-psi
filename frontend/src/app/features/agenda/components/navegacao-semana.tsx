import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Botao } from '../../../components/ui/botao';
import { Dica } from '../../../components/ui/dica';

interface NavegacaoSemanaProps {
  aoAnterior: () => void;
  aoProxima: () => void;
  aoHoje: () => void;
  desabilitarHoje?: boolean;
}

export function NavegacaoSemana({ aoAnterior, aoProxima, aoHoje, desabilitarHoje }: NavegacaoSemanaProps) {
  return (
    <div role="group" aria-label="Navegar entre semanas" className="inline-flex items-center gap-1">
      <Dica texto="Semana anterior">
        <Botao variante="secundario" tamanho="icone" aria-label="Semana anterior" onClick={aoAnterior}>
          <ChevronLeft size={17} aria-hidden="true" />
        </Botao>
      </Dica>
      <Botao variante="secundario" onClick={aoHoje} disabled={desabilitarHoje}>
        Hoje
      </Botao>
      <Dica texto="Próxima semana">
        <Botao variante="secundario" tamanho="icone" aria-label="Próxima semana" onClick={aoProxima}>
          <ChevronRight size={17} aria-hidden="true" />
        </Botao>
      </Dica>
    </div>
  );
}
