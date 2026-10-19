import { describe, expect, it } from 'vitest';

import { escolhaDoUsuario, perfilDaEscolha } from './perfil-escolha';

describe('escolha de perfil da equipe', () => {
  it('perfis do sistema viram o perfil sem perfil de acesso', () => {
    expect(perfilDaEscolha('Recepcionista')).toEqual({ perfil: 'Recepcionista', perfilAcessoId: null });
    expect(perfilDaEscolha('Administrador')).toEqual({ perfil: 'Administrador', perfilAcessoId: null });
  });

  it('perfil criado pela conta vira Personalizado com o id do perfil', () => {
    expect(perfilDaEscolha('personalizado:abc-123')).toEqual({ perfil: 'Personalizado', perfilAcessoId: 'abc-123' });
  });

  it('a escolha inicial de uma pessoa reflete o perfil atual dela', () => {
    expect(escolhaDoUsuario({ perfil: 'Administrador', perfilAcessoId: null })).toBe('Administrador');
    expect(escolhaDoUsuario({ perfil: 'Personalizado', perfilAcessoId: 'abc-123' })).toBe('personalizado:abc-123');
    expect(escolhaDoUsuario({ perfil: 'Recepcionista', perfilAcessoId: null })).toBe('Recepcionista');
  });
});
