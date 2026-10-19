import { afterEach, describe, expect, it, vi } from 'vitest';

import { ErroApi } from '../../core/api/resposta-api';
import {
  ativarPaciente,
  criarPaciente,
  listarPacientes,
  montarQueryListagem,
} from './pacientes.api';

describe('pacientes.api', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('monta a query de listagem com filtros e paginacao', () => {
    expect(
      montarQueryListagem({
        busca: '  Ana  ',
        status: 'Ativo',
        pagina: 2,
        tamanhoPagina: 10,
      }),
    ).toBe('pagina=2&tamanhoPagina=10&busca=Ana&status=Ativo');

    expect(montarQueryListagem({})).toBe('pagina=1&tamanhoPagina=20');
  });

  it('lista pacientes a partir do envelope de sucesso', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          sucesso: true,
          dados: {
            itens: [{ id: '1', nomeCompleto: 'Ana', status: 'Ativo' }],
            resumo: { ativos: 1, inativos: 0, arquivados: 0 },
            total: 1,
            pagina: 1,
            tamanhoPagina: 20,
          },
        }),

    });
    vi.stubGlobal('fetch', fetchMock);

    const listagem = await listarPacientes({ busca: 'Ana', status: 'Ativo' });

    expect(listagem.total).toBe(1);
    expect(listagem.itens[0]?.nomeCompleto).toBe('Ana');
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/pacientes?pagina=1&tamanhoPagina=20&busca=Ana&status=Ativo');
  });

  it('propaga erro de negocio ao criar paciente', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: () =>
          Promise.resolve({
            sucesso: false,
            mensagem: 'Ja existe um paciente com este CPF.',
            erros: ['Ja existe um paciente com este CPF.'],
          }),

      }),
    );

    await expect(
      criarPaciente({
        nomeCompleto: 'Ana',
        dataNascimento: null,
        cpf: '12345678901',
        telefone: null,
        whatsApp: null,
        email: null,
        observacaoAdministrativa: null,
        valorSessao: null,
        modoCobranca: 'PorSessao',
        contatosAdicionais: [],
      }),
    ).rejects.toEqual(
      new ErroApi('Ja existe um paciente com este CPF.', 422, ['Ja existe um paciente com este CPF.']),
    );
  });

  it('ativa paciente via PATCH tipado', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          sucesso: true,
          dados: { id: 'abc', nomeCompleto: 'Ana', status: 'Ativo' },
        }),

    });
    vi.stubGlobal('fetch', fetchMock);

    const paciente = await ativarPaciente('abc');

    expect(paciente.status).toBe('Ativo');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/pacientes/abc/ativar'),
      expect.objectContaining({ method: 'PATCH' }),
    );
  });
});
