import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { Link } from 'react-router';

import { notificar } from '../../../components/feedback/notificar';
import { Secao } from '../../../components/layout/pagina';
import { Botao } from '../../../components/ui/botao';
import { ItemLista, ListaRegulada } from '../../../components/ui/lista';
import { formatarData, formatarDiaSemanaCurto, formatarHora } from '../../../core/formatacao/datas';
import { mensagemDeErro } from '../../../core/erros/mensagem-de-erro';
import { capitalizar, pluralizar } from '../../../core/formatacao/texto';
import { agendaKeys, alterarStatusConsulta } from '../../agenda/agenda.api';
import type { StatusConsulta } from '../../agenda/agenda.types';
import { pacientesKeys } from '../../pacientes/pacientes.keys';
import { painelKeys } from '../painel.api';
import type { PainelConsulta } from '../painel.types';

const VISIVEIS = 6;

/**
 * Fechamento do dia: sessões que já terminaram e ainda não dizem se aconteceram.
 * Um toque marca realizada ou falta; sem isso, contagens de sessões, faltas e cobranças ficam erradas.
 */
export function SessoesSemDesfecho({ consultas }: { consultas: PainelConsulta[] }) {
  const queryClient = useQueryClient();
  const registrar = useMutation({
    mutationFn: ({ id, status }: { id: string; status: StatusConsulta }) => alterarStatusConsulta(id, { status }),
    onSuccess: async (_consulta, { status }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: painelKeys.todos }),
        queryClient.invalidateQueries({ queryKey: agendaKeys.todos }),
        queryClient.invalidateQueries({ queryKey: pacientesKeys.todos }),
      ]);
      notificar.sucesso(status === 'Realizada' ? 'Sessão marcada como realizada.' : 'Falta registrada.');
    },
    onError: (erro) => notificar.erro(mensagemDeErro(erro, 'Não foi possível registrar o desfecho.')),
  });

  if (consultas.length === 0) return null;
  const visiveis = consultas.slice(0, VISIVEIS);

  return (
    <Secao
      id="sem-desfecho"
      titulo="Sessões para fechar"
      descricao={`${pluralizar(consultas.length, 'sessão já passou', 'sessões já passaram')} sem registro. Diga se aconteceu: isso acerta faltas, contagens e cobranças.`}
    >
      <ListaRegulada>
        {visiveis.map((consulta) => {
          const inicio = new Date(consulta.inicioEm);
          const ocupada = registrar.isPending && registrar.variables?.id === consulta.id;
          return (
            <ItemLista key={consulta.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <span className="grid min-w-0">
                <Link to={`/consultas/${consulta.id}`} className="truncate font-medium text-ink no-underline hover:underline">
                  {consulta.paciente}
                </Link>
                <span className="num text-sm text-ink-muted">
                  {capitalizar(formatarDiaSemanaCurto(inicio))}, {formatarData(inicio)} · {formatarHora(inicio)}
                </span>
              </span>
              <span className="flex gap-1.5">
                <Botao
                  variante="secundario"
                  tamanho="pequeno"
                  disabled={ocupada}
                  onClick={() => registrar.mutate({ id: consulta.id, status: 'Realizada' })}
                  aria-label={`Marcar sessão de ${consulta.paciente} como realizada`}
                >
                  <Check size={15} aria-hidden="true" />
                  Realizada
                </Botao>
                <Botao
                  variante="discreto"
                  tamanho="pequeno"
                  disabled={ocupada}
                  onClick={() => registrar.mutate({ id: consulta.id, status: 'NaoCompareceu' })}
                  aria-label={`Registrar falta de ${consulta.paciente}`}
                >
                  <X size={15} aria-hidden="true" />
                  Faltou
                </Botao>
              </span>
            </ItemLista>
          );
        })}
      </ListaRegulada>
      {consultas.length > VISIVEIS ? (
        <p className="text-sm text-ink-muted">
          E mais {pluralizar(consultas.length - VISIVEIS, 'sessão', 'sessões')}. Elas aparecem aqui conforme você fecha as primeiras.
        </p>
      ) : null}
    </Secao>
  );
}
