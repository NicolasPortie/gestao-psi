import { useState } from 'react';

import { notificar } from '../../components/feedback/notificar';
import { Secao } from '../../components/layout/pagina';
import { Campo, Selecao } from '../../components/ui/campo';
import { lerMinutosInatividade, salvarMinutosInatividade } from '../../core/privacidade/cortina';

const opcoes = [
  { valor: '0', rotulo: 'Nunca' },
  { valor: '5', rotulo: 'Depois de 5 minutos sem uso' },
  { valor: '10', rotulo: 'Depois de 10 minutos sem uso' },
  { valor: '15', rotulo: 'Depois de 15 minutos sem uso' },
  { valor: '30', rotulo: 'Depois de 30 minutos sem uso' },
];

/** Quando a tela se cobre sozinha. Vale para este navegador; o atalho Alt+Shift+P e o botão do olho funcionam sempre. */
export function PrivacidadeTela() {
  const [minutos, setMinutos] = useState(() => String(lerMinutosInatividade()));

  return (
    <Secao
      titulo="Privacidade da tela"
      painel
      descricao="Cobre a tela quando o paciente entra na sala ou o computador fica sozinho. Use o ícone do olho no topo ou Alt+Shift+P."
    >
      <Campo rotulo="Proteger automaticamente" dica="Vale para este navegador. A mudança passa a valer ao recarregar a página.">
        <Selecao
          value={minutos}
          opcoes={opcoes}
          onChange={(evento) => {
            setMinutos(evento.target.value);
            salvarMinutosInatividade(Number(evento.target.value));
            notificar.sucesso('Preferência salva.');
          }}
        />
      </Campo>
    </Secao>
  );
}
