import { describe, expect, it } from 'vitest';

import { gruposNavegacao, gruposPermitidos, rotasBarraInferior } from './navegacao';

const rotas = (acessoClinico: boolean) =>
  gruposPermitidos({ acessoClinico }).flatMap((grupo) => grupo.itens.map((item) => item.rota));

describe('navegação', () => {
  it('psicólogo vê a área clínica; perfis administrativos não', () => {
    expect(rotas(true)).toContain('/documentos');
    expect(rotas(false)).not.toContain('/documentos');
  });

  it('mantém o menu lateral enxuto, com as configurações reunidas em um só destino', () => {
    const todas = gruposNavegacao.flatMap((grupo) => grupo.itens);
    expect(todas.length).toBeLessThanOrEqual(11);
    expect(todas.filter((item) => item.rota.startsWith('/configuracoes'))).toHaveLength(1);
  });

  it('não repete destinos e os atalhos do celular existem no menu', () => {
    const todas = gruposNavegacao.flatMap((grupo) => grupo.itens.map((item) => item.rota));
    expect(new Set(todas).size).toBe(todas.length);
    for (const rota of rotasBarraInferior) expect(todas).toContain(rota);
  });

  it('descarta grupos que ficam sem itens para o perfil', () => {
    const grupos = gruposPermitidos({ acessoClinico: false }).map((grupo) => grupo.id);
    expect(grupos).not.toContain('clinico');
  });
});
