/**
 * Vocabulario visual dos estados do consultorio.
 *
 * Cada estado e uma marca (forma) com um tom e um rotulo textual. A cor nunca e
 * o unico portador de significado: a forma e o texto sempre acompanham.
 * Os mapas por dominio vivem na feature dona do enum (ex.: agenda.rotulos.ts).
 */
export type TomEstado = 'neutro' | 'acento' | 'sucesso' | 'aviso' | 'perigo';

export type FormaMarca = 'anel' | 'meio' | 'cheio' | 'check' | 'riscado' | 'seta' | 'x' | 'ponto';

export interface DescricaoEstado {
  rotulo: string;
  tom: TomEstado;
  marca: FormaMarca;
}

export function descreverEstado<Chave extends string>(
  mapa: Record<Chave, DescricaoEstado>,
  valor: string | null | undefined,
): DescricaoEstado {
  const encontrado = valor ? (mapa as Record<string, DescricaoEstado | undefined>)[valor] : undefined;
  return encontrado ?? { rotulo: valor ?? 'Sem estado', tom: 'neutro', marca: 'anel' };
}

export interface OpcaoSelecao<Valor extends string | number = string> {
  valor: Valor;
  rotulo: string;
}

export function paraOpcoes<Chave extends string>(rotulos: Record<Chave, string>): Array<OpcaoSelecao<Chave>> {
  return (Object.entries(rotulos) as Array<[Chave, string]>).map(([valor, rotulo]) => ({ valor, rotulo }));
}

export function rotuloDe<Chave extends string>(rotulos: Record<Chave, string>, valor: string | null | undefined, padrao = '—') {
  return (valor ? (rotulos as Record<string, string | undefined>)[valor] : undefined) ?? valor ?? padrao;
}
