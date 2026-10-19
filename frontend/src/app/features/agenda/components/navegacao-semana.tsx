import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Botao } from '../../../components/ui/botao';
import { Dica } from '../../../components/ui/dica';

interface NavegacaoSemanaProps {
  aoAnterior: () => void;
  aoProxima: () => void;
  aoHoje: () => void;
  desabilitarHoje?: boolean;
  /** Unidade da navegação, para os rótulos: semana (padrão), dia ou mês. */
  unidade?: 'semana' | 'dia' | 'mes';
}

const rotulos = {
  semana: ['Semana anterior', 'Próxima semana'],
  dia: ['Dia anterior', 'Próximo dia'],
  mes: ['Mês anterior', 'Próximo mês'],
} as const;

export function NavegacaoSemana({ aoAnterior, aoProxima, aoHoje, desabilitarHoje, unidade = 'semana' }: NavegacaoSemanaProps) {
  const [anterior, proxima] = rotulos[unidade];
  return (
    <div role="group" aria-label="Navegar na agenda" className="inline-flex items-center gap-1">
      <Dica texto={anterior}>
        <Botao variante="secundario" tamanho="icone" aria-label={anterior} onClick={aoAnterior}>
          <ChevronLeft size={17} aria-hidden="true" />
        </Botao>
      </Dica>
      <Botao variante="secundario" onClick={aoHoje} disabled={desabilitarHoje}>
        Hoje
      </Botao>
      <Dica texto={proxima}>
        <Botao variante="secundario" tamanho="icone" aria-label={proxima} onClick={aoProxima}>
          <ChevronRight size={17} aria-hidden="true" />
        </Botao>
      </Dica>
    </div>
  );
}
