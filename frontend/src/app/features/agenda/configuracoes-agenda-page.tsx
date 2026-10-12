import { useSearchParams } from 'react-router';

import { CabecalhoPagina, Pagina } from '../../components/layout/pagina';
import { Abas, PainelAba } from '../../components/ui/abas';
import { BloqueiosAgenda } from './configuracoes/bloqueios-agenda';
import { HorariosAtendimento } from './configuracoes/horarios-atendimento';
import { RegrasAgenda } from './configuracoes/regras-agenda';
import { TiposAtendimento } from './configuracoes/tipos-atendimento';

const abas = [
  { valor: 'regras', rotulo: 'Regras' },
  { valor: 'tipos', rotulo: 'Tipos de atendimento' },
  { valor: 'horarios', rotulo: 'Horários' },
  { valor: 'bloqueios', rotulo: 'Bloqueios' },
];

export default function ConfiguracoesAgendaPage() {
  const [params, setParams] = useSearchParams();
  const abaAtual = abas.some((aba) => aba.valor === params.get('aba')) ? (params.get('aba') as string) : 'regras';

  return (
    <Pagina largura="padrao">
      <CabecalhoPagina titulo="Agenda" descricao="Como a agenda do consultório funciona: regras, tipos de atendimento, horários e bloqueios." />
      <Abas
        valor={abaAtual}
        aoMudar={(valor) => setParams(valor === 'regras' ? {} : { aba: valor }, { replace: true })}
        abas={abas}
        rotulo="Configurações da agenda"
      >
        <PainelAba valor="regras">
          <RegrasAgenda />
        </PainelAba>
        <PainelAba valor="tipos">
          <TiposAtendimento />
        </PainelAba>
        <PainelAba valor="horarios">
          <HorariosAtendimento />
        </PainelAba>
        <PainelAba valor="bloqueios">
          <BloqueiosAgenda />
        </PainelAba>
      </Abas>
    </Pagina>
  );
}
