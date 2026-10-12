import { Combobox } from '@base-ui/react/combobox';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronDown, LoaderCircle, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useCampo } from '../../../components/ui/campo-contexto';
import { cn } from '../../../components/ui/cn';
import { useDebounce } from '../../../core/hooks/use-debounce';
import { formatarTelefone, textoOuPadrao } from '../../../core/formatacao/pessoas';
import { listarPacientes, obterPacientePorId } from '../pacientes.api';
import { pacientesKeys } from '../pacientes.keys';
import type { StatusPaciente } from '../pacientes.types';

interface OpcaoPaciente {
  id: string;
  nome: string;
  contato: string;
}

interface SeletorPacienteProps {
  /** Id do paciente escolhido ('' quando nenhum). */
  valor: string;
  aoMudar: (id: string) => void;
  status?: StatusPaciente | '';
  placeholder?: string;
  className?: string;
}

/**
 * Escolha de paciente por busca no servidor (nome, CPF, contato). Substitui a lista
 * fixa de 100 itens: funciona com qualquer volume de cadastros e preserva teclado e leitor de tela.
 */
export function SeletorPaciente({ valor, aoMudar, status = 'Ativo', placeholder = 'Buscar paciente por nome…', className }: SeletorPacienteProps) {
  const campo = useCampo();
  const [busca, setBusca] = useState('');
  const termo = useDebounce(busca.trim(), 250);

  const resultados = useQuery({
    queryKey: pacientesKeys.lista({ busca: termo, status, pagina: 1, tamanhoPagina: 12 }),
    queryFn: ({ signal }) => listarPacientes({ busca: termo, status, pagina: 1, tamanhoPagina: 12 }, { signal }),
    staleTime: 15_000,
  });
  const escolhido = useQuery({
    queryKey: pacientesKeys.detalhe(valor),
    queryFn: ({ signal }) => obterPacientePorId(valor, { signal }),
    enabled: Boolean(valor),
  });

  const opcoes = useMemo<OpcaoPaciente[]>(() => {
    const lista = (resultados.data?.itens ?? []).map((paciente) => ({
      id: paciente.id,
      nome: paciente.nomeCompleto,
      contato: formatarTelefone(paciente.whatsApp ?? paciente.telefone) || textoOuPadrao(paciente.email, 'Sem contato'),
    }));
    const atual = escolhido.data;
    if (atual && !lista.some((opcao) => opcao.id === atual.id)) {
      lista.unshift({ id: atual.id, nome: atual.nomeCompleto, contato: formatarTelefone(atual.whatsApp ?? atual.telefone) || textoOuPadrao(atual.email, 'Sem contato') });
    }
    return lista;
  }, [resultados.data, escolhido.data]);

  const selecionado = opcoes.find((opcao) => opcao.id === valor) ?? null;
  const buscando = resultados.isFetching || busca.trim() !== termo;

  return (
    <Combobox.Root
      items={opcoes}
      value={selecionado}
      onValueChange={(opcao: OpcaoPaciente | null) => aoMudar(opcao?.id ?? '')}
      onInputValueChange={(texto, detalhes) => setBusca(detalhes.reason === 'item-press' ? '' : texto)}
      itemToStringLabel={(opcao: OpcaoPaciente) => opcao.nome}
      isItemEqualToValue={(a: OpcaoPaciente, b: OpcaoPaciente) => a.id === b.id}
      filter={null}
    >
      <Combobox.InputGroup
        className={cn(
          'relative flex h-9 w-full items-center rounded-md border border-line-strong bg-field pointer-coarse:h-11',
          'transition-[border-color,outline-color] duration-150 ease-out hover:border-ink-muted',
          'focus-within:border-focus focus-within:outline-2 focus-within:outline-focus',
          campo['aria-invalid'] && 'border-danger focus-within:outline-danger',
          className,
        )}
      >
        <Combobox.Input
          id={campo.id}
          aria-invalid={campo['aria-invalid']}
          aria-describedby={campo['aria-describedby']}
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 rounded-md border-0 bg-transparent pl-3 text-base text-ink outline-none placeholder:text-ink-faint"
        />
        <div className="flex items-center pr-1">
          {buscando ? <LoaderCircle size={15} className="animar-girar mr-1 text-ink-muted" aria-hidden="true" /> : null}
          <Combobox.Clear
            aria-label="Limpar paciente"
            className="grid size-7 place-items-center rounded-sm text-ink-muted transition-colors duration-150 hover:bg-hover hover:text-ink pointer-coarse:size-9"
          >
            <X size={15} aria-hidden="true" />
          </Combobox.Clear>
          <Combobox.Trigger
            aria-label="Abrir lista de pacientes"
            className="grid size-7 place-items-center rounded-sm text-ink-muted transition-colors duration-150 hover:bg-hover hover:text-ink pointer-coarse:size-9"
          >
            <ChevronDown size={16} aria-hidden="true" />
          </Combobox.Trigger>
        </div>
      </Combobox.InputGroup>

      <Combobox.Portal>
        <Combobox.Positioner sideOffset={6} className="z-[70] outline-none">
          <Combobox.Popup className="menu-popup w-(--anchor-width) max-w-(--available-width) p-1">
            <Combobox.Status>
              {resultados.isError ? (
                <p className="px-2.5 py-2 text-sm text-danger-ink">Não foi possível buscar pacientes.</p>
              ) : opcoes.length === 0 && !buscando ? (
                <p className="px-2.5 py-2 text-sm text-ink-muted">{termo ? `Nenhum paciente encontrado para “${termo}”.` : 'Nenhum paciente cadastrado.'}</p>
              ) : null}
            </Combobox.Status>
            <Combobox.List className="scroll-contido max-h-72 overflow-y-auto">
              {(opcao: OpcaoPaciente) => (
                <Combobox.Item key={opcao.id} value={opcao} className="item-menu items-start py-2">
                  <span className="mt-0.5 grid size-4 shrink-0 place-items-center">
                    <Combobox.ItemIndicator>
                      <Check size={15} className="text-accent" aria-hidden="true" />
                    </Combobox.ItemIndicator>
                  </span>
                  <span className="grid min-w-0">
                    <span className="truncate text-base font-medium">{opcao.nome}</span>
                    <span className="num truncate text-xs text-ink-muted">{opcao.contato}</span>
                  </span>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
