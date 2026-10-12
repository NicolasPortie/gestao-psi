import { z } from 'zod';

import type { StatusPaciente, TipoContatoPaciente } from './pacientes.types';

const tiposContato = ['Telefone', 'WhatsApp', 'Email', 'Responsavel'] as const satisfies readonly TipoContatoPaciente[];
const statusPaciente = ['Ativo', 'Inativo', 'Arquivado'] as const satisfies readonly StatusPaciente[];

const contatoAdicionalSchema = z.object({
  tipoContato: z.enum(tiposContato),
  valor: z.string(),
  principal: z.boolean(),
});

export const formularioPacienteSchema = z.object({
  nomeCompleto: z.string().trim().min(3, 'Informe o nome completo do paciente.'),
  dataNascimento: z.string(),
  cpf: z.string(),
  telefone: z.string(),
  whatsApp: z.string(),
  email: z
    .string()
    .trim()
    .refine((valor) => valor === '' || z.string().email().safeParse(valor).success, {
      message: 'Informe um e-mail válido.',
    }),
  status: z.enum(statusPaciente),
  observacaoAdministrativa: z.string().max(2000, 'A observação pode ter no máximo 2000 caracteres.'),
  contatosAdicionais: z.array(contatoAdicionalSchema).max(10),
});

export type FormularioPacienteValores = z.infer<typeof formularioPacienteSchema>;

export const valoresPadraoFormularioPaciente: FormularioPacienteValores = {
  nomeCompleto: '',
  dataNascimento: '',
  cpf: '',
  telefone: '',
  whatsApp: '',
  email: '',
  status: 'Ativo',
  observacaoAdministrativa: '',
  contatosAdicionais: [],
};
