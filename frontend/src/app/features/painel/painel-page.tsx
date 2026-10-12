import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Link } from 'react-router';

import { EstadoErro } from '../../components/feedback/estados';
import { CarregandoPagina } from '../../components/feedback/esqueleto';
import { BotaoLink } from '../../components/ui/botao';
import { CabecalhoPagina, Pagina, Secao } from '../../components/layout/pagina';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import { formatarDiaCompleto } from '../../core/formatacao/datas';
import { capitalizar } from '../../core/formatacao/texto';
import { AgendaDeHoje } from './components/agenda-de-hoje';
import { AlertasRecentes } from './components/alertas-recentes';
import { FilaDeAtencao } from './components/fila-de-atencao';
import { ReguaDoDia } from './components/regua-do-dia';
import { SemanaEmBarras } from './components/semana-em-barras';
import { obterResumoPainel, painelKeys } from './painel.api';
import { resumoDoDia, saudacao } from './painel.apresentacao';

export default function PainelPage() {
  const { data, error, isPending, isFetching, refetch } = useQuery({
    queryKey: painelKeys.resumo(),
    queryFn: ({ signal }) => obterResumoPainel({ signal }),
  });

  if (isPending) return <CarregandoPagina rotulo="Carregando o seu dia…" />;
  if (error || !data) {
    return (
      <EstadoErro
        titulo="Não foi possível abrir o painel"
        mensagem={mensagemDeErro(error, 'Tente novamente em instantes.')}
        aoTentarNovamente={() => void refetch()}
        recarregando={isFetching}
      />
    );
  }

  const agora = new Date();
  const atalhos = data.acoesRapidas.filter((acao) => acao.habilitada);

  return (
    <Pagina largura="ampla">
      <CabecalhoPagina
        titulo="Hoje"
        meta={capitalizar(formatarDiaCompleto(agora))}
        descricao={`${saudacao(agora.getHours())}, ${data.usuario.primeiroNome}. ${resumoDoDia(data.indicadores)}`}
        acoes={
          <>
            <BotaoLink to="/agenda" variante="secundario">
              Abrir agenda
            </BotaoLink>
            <BotaoLink to="/consultas/nova" variante="primario">
              <Plus size={16} aria-hidden="true" />
              Nova consulta
            </BotaoLink>
          </>
        }
      />

      <div className="grid gap-x-14 gap-y-10 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <Secao id="agenda-hoje" titulo="Agenda de hoje">
          <ReguaDoDia consultas={data.consultasHoje} />
          <AgendaDeHoje consultas={data.consultasHoje} />
        </Secao>

        <div className="grid content-start gap-10">
          <Secao id="atencao" titulo="Atenção">
            <FilaDeAtencao prioridades={data.prioridades} />
          </Secao>

          <Secao id="semana" titulo="Próximos dias" acoes={<Link to="/agenda" className="text-sm font-medium">Ver agenda</Link>}>
            <SemanaEmBarras dias={data.visaoSemana} />
          </Secao>

          <Secao id="alertas" titulo="Alertas recentes" acoes={<Link to="/notificacoes" className="text-sm font-medium">Ver todos</Link>}>
            <AlertasRecentes alertas={data.alertas} />
          </Secao>

          {atalhos.length > 0 ? (
            <Secao id="atalhos" titulo="Atalhos">
              <ul className="grid gap-1">
                {atalhos.map((atalho) => (
                  <li key={atalho.rota}>
                    <Link
                      to={atalho.rota}
                      className="grid gap-0.5 rounded-md px-2 py-2 text-ink no-underline transition-colors duration-150 ease-out hover:bg-hover"
                    >
                      <span className="text-base font-medium">{atalho.titulo}</span>
                      <span className="text-sm text-ink-muted">{atalho.descricao}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Secao>
          ) : null}
        </div>
      </div>
    </Pagina>
  );
}
