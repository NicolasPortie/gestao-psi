import type { ListarPacientesFiltro } from './pacientes.types';

export const pacientesKeys = {
  todos: ['pacientes'] as const,
  listagens: () => [...pacientesKeys.todos, 'lista'] as const,
  lista: (filtro: ListarPacientesFiltro) =>
    [
      ...pacientesKeys.listagens(),
      {
        busca: filtro.busca?.trim() || '',
        status: filtro.status || '',
        pagina: filtro.pagina ?? 1,
        tamanhoPagina: filtro.tamanhoPagina ?? 20,
        semConsultaHaDias: filtro.semConsultaHaDias ?? 0,
      },
    ] as const,
  detalhes: () => [...pacientesKeys.todos, 'detalhe'] as const,
  detalhe: (id: string) => [...pacientesKeys.detalhes(), id] as const,
};
