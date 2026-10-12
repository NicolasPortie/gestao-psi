import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { Aviso } from '../../../components/feedback/aviso';
import { CarregandoPagina } from '../../../components/feedback/esqueleto';
import { EstadoErro } from '../../../components/feedback/estados';
import { notificar } from '../../../components/feedback/notificar';
import { Botao } from '../../../components/ui/botao';
import { Entrada } from '../../../components/ui/campo';
import { OpcaoMarcavel } from '../../../components/ui/campo';
import { Dica } from '../../../components/ui/dica';
import { mensagemDeErro } from '../../../core/erros/mensagem-de-erro';
import { agendaKeys, listarHorariosDisponiveis, salvarHorarioDisponivel } from '../agenda.api';
import { rotulosDiaSemana } from '../agenda.rotulos';
import type { DiaSemana, HorarioDisponivel } from '../agenda.types';

/** Segunda a domingo, a ordem em que a agenda é lida. */
const ordemDaSemana: DiaSemana[] = ['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado', 'Domingo'];

const curto = (horario: string) => horario.slice(0, 5);
const completo = (horario: string) => (horario.length === 5 ? `${horario}:00` : horario);

interface EditorFaixaProps {
  inicial?: { inicio: string; fim: string };
  salvando: boolean;
  erro: string;
  aoSalvar: (inicio: string, fim: string) => void;
  aoCancelar: () => void;
}

function EditorFaixa({ inicial, salvando, erro, aoSalvar, aoCancelar }: EditorFaixaProps) {
  const [inicio, setInicio] = useState(inicial?.inicio ?? '08:00');
  const [fim, setFim] = useState(inicial?.fim ?? '12:00');
  const [erroLocal, setErroLocal] = useState('');

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (!inicio || !fim || fim <= inicio) {
      setErroLocal('O fim deve ser depois do início.');
      return;
    }
    setErroLocal('');
    aoSalvar(inicio, fim);
  }

  return (
    <form onSubmit={enviar} className="grid gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-ink-muted">
          Das
          <Entrada type="time" value={inicio} onChange={(evento) => setInicio(evento.target.value)} className="w-28" aria-label="Início do horário" />
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-muted">
          às
          <Entrada type="time" value={fim} onChange={(evento) => setFim(evento.target.value)} className="w-28" aria-label="Fim do horário" />
        </label>
        <Botao type="submit" variante="primario" tamanho="pequeno" carregando={salvando}>
          Salvar
        </Botao>
        <Botao variante="discreto" tamanho="pequeno" onClick={aoCancelar}>
          Cancelar
        </Botao>
      </div>
      {erroLocal || erro ? <Aviso tom="perigo">{erroLocal || erro}</Aviso> : null}
    </form>
  );
}

export function HorariosAtendimento() {
  const queryClient = useQueryClient();
  const [editando, setEditando] = useState<string | null>(null); // id da faixa, ou `novo:<dia>`
  const [erroApi, setErroApi] = useState('');
  const horariosQuery = useQuery({ queryKey: agendaKeys.horarios(), queryFn: ({ signal }) => listarHorariosDisponiveis({ signal }) });

  const salvar = useMutation({
    mutationFn: ({ id, dia, inicio, fim, ativo }: { id: string | null; dia: DiaSemana; inicio: string; fim: string; ativo: boolean }) =>
      salvarHorarioDisponivel(id, { diaSemana: dia, horaInicio: completo(inicio), horaFim: completo(fim), ativo }),
    onSuccess: async (_resultado, variaveis) => {
      await queryClient.invalidateQueries({ queryKey: agendaKeys.horarios() });
      notificar.sucesso(variaveis.id ? 'Horário atualizado.' : 'Horário adicionado.');
      setEditando(null);
      setErroApi('');
    },
    onError: (erro) => {
      const mensagem = mensagemDeErro(erro, 'Não foi possível salvar o horário.');
      if (editando) setErroApi(mensagem);
      else notificar.erro(mensagem);
    },
  });

  if (horariosQuery.isPending) return <CarregandoPagina rotulo="Carregando os horários…" />;
  if (horariosQuery.error && !horariosQuery.data) {
    return <EstadoErro mensagem={mensagemDeErro(horariosQuery.error)} aoTentarNovamente={() => void horariosQuery.refetch()} />;
  }

  const horarios = horariosQuery.data ?? [];
  const porDia = (dia: DiaSemana) =>
    horarios.filter((horario) => horario.diaSemana === dia).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

  function alternar(horario: HorarioDisponivel) {
    salvar.mutate({ id: horario.id, dia: horario.diaSemana, inicio: curto(horario.horaInicio), fim: curto(horario.horaFim), ativo: !horario.ativo });
  }

  return (
    <div className="grid max-w-3xl gap-5">
      <p className="max-w-[60ch] text-base text-ink-muted">
        Os horários definem quando a agenda aceita consultas. Fora deles, o backend recusa o agendamento.
      </p>
      <ul className="divide-y divide-line border-y border-line">
        {ordemDaSemana.map((dia) => {
          const faixas = porDia(dia);
          const novo = editando === `novo:${dia}`;
          return (
            <li key={dia} className="grid gap-x-6 gap-y-2 py-4 sm:grid-cols-[9rem_1fr]">
              <h3 className="text-base font-medium text-ink">{rotulosDiaSemana[dia]}</h3>
              <div className="grid gap-2.5">
                {faixas.length === 0 && !novo ? <p className="text-base text-ink-muted">Sem atendimento</p> : null}
                {faixas.map((faixa) =>
                  editando === faixa.id ? (
                    <EditorFaixa
                      key={faixa.id}
                      inicial={{ inicio: curto(faixa.horaInicio), fim: curto(faixa.horaFim) }}
                      salvando={salvar.isPending}
                      erro={erroApi}
                      aoCancelar={() => {
                        setEditando(null);
                        setErroApi('');
                      }}
                      aoSalvar={(inicio, fim) => salvar.mutate({ id: faixa.id, dia, inicio, fim, ativo: faixa.ativo })}
                    />
                  ) : (
                    <div key={faixa.id} className="flex items-center justify-between gap-3">
                      <OpcaoMarcavel
                        tipo="interruptor"
                        checked={faixa.ativo}
                        onChange={() => alternar(faixa)}
                        disabled={salvar.isPending}
                        className="items-center"
                        rotulo={
                          <span className={faixa.ativo ? 'num' : 'num text-ink-muted line-through'}>
                            {curto(faixa.horaInicio)} – {curto(faixa.horaFim)}
                            {faixa.ativo ? null : <span className="ml-2 text-xs no-underline">(desativado)</span>}
                          </span>
                        }
                      />
                      <Dica texto="Editar horário">
                        <Botao
                          variante="discreto"
                          tamanho="icone-pequeno"
                          aria-label={`Editar ${curto(faixa.horaInicio)} às ${curto(faixa.horaFim)} de ${rotulosDiaSemana[dia]}`}
                          onClick={() => {
                            setErroApi('');
                            setEditando(faixa.id);
                          }}
                        >
                          <Pencil size={15} aria-hidden="true" />
                        </Botao>
                      </Dica>
                    </div>
                  ),
                )}
                {novo ? (
                  <EditorFaixa
                    salvando={salvar.isPending}
                    erro={erroApi}
                    aoCancelar={() => {
                      setEditando(null);
                      setErroApi('');
                    }}
                    aoSalvar={(inicio, fim) => salvar.mutate({ id: null, dia, inicio, fim, ativo: true })}
                  />
                ) : (
                  <Botao
                    variante="discreto"
                    tamanho="pequeno"
                    className="w-fit -ml-2.5"
                    onClick={() => {
                      setErroApi('');
                      setEditando(`novo:${dia}`);
                    }}
                  >
                    <Plus size={15} aria-hidden="true" />
                    Adicionar horário
                  </Botao>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
