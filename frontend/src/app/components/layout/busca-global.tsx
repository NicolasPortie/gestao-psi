import { Dialog } from '@base-ui/react/dialog';
import { useQuery } from '@tanstack/react-query';
import { CalendarPlus, CornerDownLeft, Search, UserPlus, UserRound, type LucideIcon } from 'lucide-react';
import { useId, useState } from 'react';
import { useNavigate } from 'react-router';

import { usePermissoes } from '../../core/autenticacao/permissoes';
import { useDebounce } from '../../core/hooks/use-debounce';
import { listarPacientes } from '../../features/pacientes/pacientes.api';
import { pacientesKeys } from '../../features/pacientes/pacientes.keys';
import { cn } from '../ui/cn';
import { abrirBuscaGlobal, definirBuscaAberta, useBuscaAberta } from './busca-global.estado';
import { gruposPermitidos } from './navegacao';

interface Resultado {
  id: string;
  rotulo: string;
  detalhe?: string;
  icone: LucideIcon;
  rota: string;
}

const semAcento = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLocaleLowerCase('pt-BR');

/**
 * Busca de qualquer lugar, aberta pelo botão do topo: pacientes pelo nome, telefone ou e-mail, as áreas do menu e as
 * ações mais comuns. Setas escolhem, Enter abre, Esc fecha.
 */
export function BuscaGlobal() {
  const estaAberta = useBuscaAberta();
  const navigate = useNavigate();
  const permissoes = usePermissoes();
  const podePacientes = permissoes.pode('Pacientes');
  const [termo, setTermo] = useState('');
  const [ativo, setAtivo] = useState(0);
  const termoAtrasado = useDebounce(termo.trim(), 200);
  const idLista = useId();

  const filtro = { busca: termoAtrasado, status: 'Ativo' as const, pagina: 1, tamanhoPagina: 6 };
  const pacientesQuery = useQuery({
    queryKey: pacientesKeys.lista(filtro),
    queryFn: ({ signal }) => listarPacientes(filtro, { signal }),
    enabled: estaAberta && podePacientes && termoAtrasado.length >= 2,
  });

  const busca = semAcento(termo.trim());
  const acoes: Resultado[] = [
    ...(permissoes.pode('Agenda') ? [{ id: 'acao-consulta', rotulo: 'Nova consulta', icone: CalendarPlus, rota: '/consultas/nova' }] : []),
    ...(podePacientes ? [{ id: 'acao-paciente', rotulo: 'Novo paciente', icone: UserPlus, rota: '/pacientes/novo' }] : []),
  ];
  const areas: Resultado[] = gruposPermitidos(permissoes).flatMap((grupo) =>
    grupo.itens.map((item) => ({ id: `area-${item.rota}`, rotulo: item.rotulo, detalhe: grupo.rotulo, icone: item.icone, rota: item.rota })),
  );
  const pacientes: Resultado[] = (pacientesQuery.data?.itens ?? []).map((paciente) => ({
    id: `paciente-${paciente.id}`,
    rotulo: paciente.nomeCompleto,
    detalhe: 'Paciente',
    icone: UserRound,
    rota: `/pacientes/${paciente.id}`,
  }));
  const resultados = [
    ...pacientes,
    ...[...acoes, ...areas].filter((item) => !busca || semAcento(item.rotulo).includes(busca)),
  ];
  const indiceAtivo = Math.min(ativo, Math.max(resultados.length - 1, 0));

  function fechar() {
    definirBuscaAberta(false);
    setTermo('');
    setAtivo(0);
  }

  function abrir(resultado: Resultado | undefined) {
    if (!resultado) return;
    fechar();
    void navigate(resultado.rota);
  }

  return (
    <Dialog.Root open={estaAberta} onOpenChange={(valor) => (valor ? definirBuscaAberta(true) : fechar())}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fundo-overlay" />
        <Dialog.Popup className="busca-global fixed left-1/2 top-[12dvh] z-[61] grid w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-xl bg-overlay shadow-float outline-none">
          <Dialog.Title className="sr-only">Buscar no consultório</Dialog.Title>
          <div className="flex items-center gap-3 border-b border-line px-4">
            <Search size={18} className="shrink-0 text-ink-muted" aria-hidden="true" />
            <input
              autoFocus
              value={termo}
              onChange={(evento) => {
                setTermo(evento.target.value);
                setAtivo(0);
              }}
              onKeyDown={(evento) => {
                if (evento.key === 'ArrowDown') {
                  evento.preventDefault();
                  setAtivo((indice) => Math.min(indice + 1, resultados.length - 1));
                } else if (evento.key === 'ArrowUp') {
                  evento.preventDefault();
                  setAtivo((indice) => Math.max(indice - 1, 0));
                } else if (evento.key === 'Enter') {
                  evento.preventDefault();
                  abrir(resultados[indiceAtivo]);
                }
              }}
              role="combobox"
              aria-expanded="true"
              aria-controls={idLista}
              aria-activedescendant={resultados[indiceAtivo] ? `${idLista}-${resultados[indiceAtivo].id}` : undefined}
              aria-autocomplete="list"
              aria-label="Buscar pacientes, áreas e ações"
              placeholder="Buscar paciente, área ou ação…"
              className="h-14 min-w-0 flex-1 bg-transparent text-lg text-ink outline-none placeholder:text-ink-faint"
            />
            <kbd className="hidden rounded-sm border border-line px-1.5 text-xs text-ink-muted sm:inline">Esc</kbd>
          </div>
          <ul id={idLista} role="listbox" aria-label="Resultados" className="scroll-contido max-h-[min(24rem,60dvh)] overflow-y-auto p-1.5">
            {resultados.length === 0 ? (
              <li className="px-3 py-6 text-center text-base text-ink-muted" role="presentation">
                {pacientesQuery.isFetching ? 'Buscando…' : 'Nada encontrado.'}
              </li>
            ) : (
              resultados.map((resultado, indice) => {
                const Icone = resultado.icone;
                const selecionado = indice === indiceAtivo;
                return (
                  <li
                    key={resultado.id}
                    id={`${idLista}-${resultado.id}`}
                    role="option"
                    aria-selected={selecionado}
                    onMouseEnter={() => setAtivo(indice)}
                    onClick={() => abrir(resultado)}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-base text-ink',
                      selecionado && 'bg-selected',
                    )}
                  >
                    <Icone size={17} className="shrink-0 text-ink-muted" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">{resultado.rotulo}</span>
                    {resultado.detalhe ? <span className="shrink-0 text-sm text-ink-muted">{resultado.detalhe}</span> : null}
                    {selecionado ? <CornerDownLeft size={15} className="shrink-0 text-ink-muted" aria-hidden="true" /> : null}
                  </li>
                );
              })
            )}
          </ul>
          {podePacientes && termo.trim().length < 2 ? (
            <p className="border-t border-line px-4 py-2 text-sm text-ink-muted">Digite duas letras para buscar pacientes.</p>
          ) : null}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Gatilho da busca: o único jeito de abri-la (não há atalho de teclado). */
export function BotaoBuscaGlobal({ compacto = false }: { compacto?: boolean }) {
  if (compacto) {
    return (
      <button
        type="button"
        onClick={abrirBuscaGlobal}
        aria-label="Buscar"
        className="grid size-9 place-items-center rounded-md text-ink-muted transition-colors duration-150 hover:bg-hover hover:text-ink pointer-coarse:size-11"
      >
        <Search size={17} aria-hidden="true" />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={abrirBuscaGlobal}
      className="flex h-9 w-full items-center gap-2 rounded-md border border-line bg-field px-2.5 text-sm text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink"
    >
      <Search size={15} aria-hidden="true" />
      <span className="flex-1 text-left">Buscar paciente</span>
    </button>
  );
}
