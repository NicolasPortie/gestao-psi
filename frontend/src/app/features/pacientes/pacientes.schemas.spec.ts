import { describe, expect, it } from 'vitest';

import { formularioPacienteSchema } from './pacientes.schemas';

describe('formularioPacienteSchema', () => {
  it('exige nome completo com pelo menos 3 caracteres', () => {
    const resultado = formularioPacienteSchema.safeParse({
      nomeCompleto: 'An',
      dataNascimento: '',
      cpf: '',
      telefone: '',
      whatsApp: '',
      email: '',
      status: 'Ativo',
      observacaoAdministrativa: '',
      contatosAdicionais: [],
    });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0]?.message).toBe('Informe o nome completo do paciente.');
    }
  });

  it('aceita e-mail vazio e rejeita e-mail invalido', () => {
    const valido = formularioPacienteSchema.safeParse({
      nomeCompleto: 'Ana Silva',
      dataNascimento: '',
      cpf: '',
      telefone: '',
      whatsApp: '',
      email: '',
      status: 'Ativo',
      observacaoAdministrativa: '',
      contatosAdicionais: [],
    });
    expect(valido.success).toBe(true);

    const invalido = formularioPacienteSchema.safeParse({
      nomeCompleto: 'Ana Silva',
      dataNascimento: '',
      cpf: '',
      telefone: '',
      whatsApp: '',
      email: 'sem-arroba',
      status: 'Ativo',
      observacaoAdministrativa: '',
      contatosAdicionais: [],
    });
    expect(invalido.success).toBe(false);
  });
});
