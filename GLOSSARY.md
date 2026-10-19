# Vínculo

Gestao de um consultorio de psicologo autonomo, com rotina administrativa e
registros clinicos separados por responsabilidade e permissao.

## Linguagem

**ContaPsicologo**: consultorio individual de um psicologo, ao qual pertencem os
usuarios, pacientes, agenda e registros. _Evitar_: usuario, clinica multi-profissional.

**Usuario**: pessoa que acessa uma conta com um perfil e permissoes determinados.
_Evitar_: conta.

**PerfilAcesso**: perfil criado pela propria conta, com nome e as permissoes administrativas que
concede a quem o recebe. Nunca inclui conteudo clinico. _Evitar_: papel, role.

**Paciente**: pessoa acompanhada no consultorio, com cadastro administrativo
vinculado a uma conta. _Evitar_: usuario.

**Agendamento**: ato de reservar um horario para atendimento.
_Evitar_: sessao.

**Consulta**: horario marcado entre paciente e psicologo, com modalidade e status.
_Evitar_: registro clinico.

**Sessao**: atendimento realizado pelo psicologo, documentado clinicamente.
_Evitar_: consulta futura.

**Prontuario**: conjunto de registros clinicos do acompanhamento de um paciente.
_Evitar_: cadastro administrativo.

**EvolucaoProntuario**: registro do desenvolvimento do acompanhamento no tempo.
_Evitar_: pagamento, historico de agenda.

**Retificacao**: correcao rastreavel de um registro clinico, que preserva o original.
_Evitar_: sobrescrita.

**Pagamento**: cobranca administrativa do paciente, com valor e situacao.
_Evitar_: assinatura SaaS.

**Bridge**: integracao que transporta mensagens administrativas de WhatsApp.
_Evitar_: terapeuta virtual.
