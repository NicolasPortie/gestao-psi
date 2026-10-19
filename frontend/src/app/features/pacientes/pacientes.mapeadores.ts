import type { FormularioPacienteValores } from './pacientes.schemas';
import { formatarCpf, formatarTelefone } from '../../core/formatacao/pessoas';
import type {
  AtualizarPacienteRequest,
  CriarPacienteRequest,
  PacienteDetalhe,
  StatusPaciente,
} from './pacientes.types';

function valorOpcional(valor: string): string | null {
  const limpo = valor.trim();
  return limpo ? limpo : null;
}

export function pacienteParaFormulario(paciente: PacienteDetalhe): FormularioPacienteValores {
  return {
    nomeCompleto: paciente.nomeCompleto,
    dataNascimento: paciente.dataNascimento ?? '',
    cpf: formatarCpf(paciente.cpf ?? paciente.cpfMascarado),
    telefone: formatarTelefone(paciente.telefone),
    whatsApp: formatarTelefone(paciente.whatsApp),
    email: paciente.email ?? '',
    status: paciente.status,
    observacaoAdministrativa: paciente.observacaoAdministrativa ?? '',
    valorSessao: paciente.valorSessao != null ? String(paciente.valorSessao) : '',
    modoCobranca: paciente.modoCobranca ?? 'PorSessao',
    contatosAdicionais: (paciente.contatosAdicionais ?? []).map((contato) => ({
      tipoContato: contato.tipoContato,
      valor:
        contato.tipoContato === 'Email' || /[^\d]/.test(contato.valor) ? contato.valor : formatarTelefone(contato.valor),
      nome: contato.nome ?? '',
      principal: contato.principal,
    })),
  };
}

export function formularioParaCriarRequest(valores: FormularioPacienteValores): CriarPacienteRequest {
  return {
    nomeCompleto: valores.nomeCompleto.trim(),
    dataNascimento: valorOpcional(valores.dataNascimento),
    cpf: valorOpcional(valores.cpf),
    telefone: valorOpcional(valores.telefone),
    whatsApp: valorOpcional(valores.whatsApp),
    email: valorOpcional(valores.email),
    observacaoAdministrativa: valorOpcional(valores.observacaoAdministrativa),
    valorSessao: valores.valorSessao.trim() ? Number(valores.valorSessao.trim().replace(',', '.')) : null,
    modoCobranca: valores.modoCobranca,
    contatosAdicionais: valores.contatosAdicionais
      .filter((contato) => contato.valor.trim())
      .map((contato) => ({
        tipoContato: contato.tipoContato,
        valor: contato.valor.trim(),
        principal: contato.principal,
        nome: valorOpcional(contato.nome),
      })),
  };
}

export function formularioParaAtualizarRequest(
  valores: FormularioPacienteValores,
  status: StatusPaciente = valores.status,
): AtualizarPacienteRequest {
  return {
    ...formularioParaCriarRequest(valores),
    status,
  };
}
