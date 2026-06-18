# Modelagem do Banco de Dados

## Objetivo

Este documento descreve a modelagem principal do banco de dados do GestaoPsi.

O foco e organizar entidades, relacionamentos e cardinalidades do dominio.

## Decisao Principal

O GestaoPsi e um SaaS multi-conta.

Cada psicologo possui uma `ContaPsicologo`.

Toda entidade que armazena dados do consultorio deve ser escopada por `ContaPsicologoId`.

## Entidades Raiz

### ContasPsicologo

Representa a conta de um psicologo autonomo no SaaS.

Campos principais:

```txt
Id
NomeConta
Slug
EmailResponsavel
TelefoneResponsavel
DocumentoResponsavel
Status
PlanoSaaSId
CriadaEm
AtivadaEm
SuspensaEm
CanceladaEm
AtualizadoEm
```

Relacionamentos:

```txt
ContaPsicologo 1 -> N Usuarios
ContaPsicologo 1 -> 0..1 DadosProfissionaisPsicologo ativo
ContaPsicologo 1 -> N Pacientes
ContaPsicologo 1 -> N Consultas
ContaPsicologo 1 -> N Prontuarios
ContaPsicologo 1 -> N RegistrosSessao
ContaPsicologo 1 -> N Pagamentos
ContaPsicologo 1 -> N IntegracoesWhatsApp
ContaPsicologo 1 -> N LogsAuditoria
```

## Usuarios e Acesso

### Usuarios

Representa pessoas que acessam uma conta.

Campos principais:

```txt
Id
ContaPsicologoId
NomeCompleto
Email
SenhaHash
Telefone
Perfil
Status
UltimoAcessoEm
CriadoEm
AtualizadoEm
```

Perfis iniciais:

```txt
Psicologo
Recepcionista
Paciente
Administrador
```

Regras:

- `SenhaHash` nunca deve retornar pela API.
- usuario sempre pertence a uma conta.
- a conta autenticada deve vir da sessao/token, nao do front-end.
- recepcionista nao acessa prontuario ou documentos clinicos.

### DadosProfissionaisPsicologo

Campos principais:

```txt
Id
ContaPsicologoId
UsuarioId
Crp
CrpHash
CrpMascarado
NomeProfissional
Bio
EmailProfissional
TelefoneProfissional
Status
CriadoEm
AtualizadoEm
```

Relacionamentos:

```txt
ContaPsicologo 1 -> 0..1 DadosProfissionaisPsicologo ativo
Usuario 1 -> 0..1 DadosProfissionaisPsicologo
```

## Pacientes

### Pacientes

Campos principais:

```txt
Id
ContaPsicologoId
UsuarioId
NomeCompleto
DataNascimento
Cpf
CpfHash
CpfMascarado
Telefone
Email
Status
ObservacaoAdministrativa
CriadoEm
AtualizadoEm
```

Relacionamentos:

```txt
ContaPsicologo 1 -> N Pacientes
Paciente 1 -> N ContatosPaciente
Paciente 1 -> N Consultas
Paciente 1 -> 0..1 Prontuario ativo
Paciente 1 -> N Pagamentos
Paciente 1 -> N ConversasWhatsApp
```

### ContatosPaciente

Campos principais:

```txt
Id
ContaPsicologoId
PacienteId
TipoContato
Valor
ValorHash
ValorMascarado
Principal
CriadoEm
AtualizadoEm
```

Tipos:

```txt
Telefone
WhatsApp
Email
Responsavel
```

## Agenda e Consultas

### ConfiguracoesAtendimento

Campos principais:

```txt
Id
ContaPsicologoId
DuracaoPadraoMinutos
ConfirmacaoAutomaticaConsulta
PermiteListaEspera
PermiteAgendamentoWhatsApp
AntecedenciaMinimaAgendamentoHoras
AntecedenciaCancelamentoHoras
AntecedenciaRemarcacaoHoras
ExigeJustificativaCancelamento
Ativo
CriadoEm
AtualizadoEm
```

Regra:

```txt
ContaPsicologo 1 -> 0..1 ConfiguracaoAtendimento ativa
```

### TiposAtendimento

Campos principais:

```txt
Id
ContaPsicologoId
Nome
Descricao
DuracaoMinutos
ValorPadrao
ModalidadePadrao
Ativo
CriadoEm
AtualizadoEm
```

### HorariosDisponiveis

Campos principais:

```txt
Id
ContaPsicologoId
DiaSemana
HoraInicio
HoraFim
Ativo
CriadoEm
AtualizadoEm
```

### BloqueiosAgenda

Campos principais:

```txt
Id
ContaPsicologoId
Titulo
Descricao
InicioEm
FimEm
DiaInteiro
CriadoEm
AtualizadoEm
```

### Consultas

Campos principais:

```txt
Id
ContaPsicologoId
PacienteId
TipoAtendimentoId
InicioEm
FimEm
Status
Modalidade
Origem
LinkOnline
EnderecoAtendimento
ObservacaoAdministrativa
JustificativaCancelamento
CriadoEm
AtualizadoEm
```

Relacionamentos:

```txt
ContaPsicologo 1 -> N Consultas
Paciente 1 -> N Consultas
TipoAtendimento 1 -> N Consultas
Consulta 1 -> N HistoricosConsulta
Consulta 1 -> 0..1 RegistroSessao
Consulta 1 -> N Pagamentos
Consulta 1 -> N Lembretes
```

Regras:

- conflito de agenda sempre considera `ContaPsicologoId`.
- paciente, tipo de atendimento, pagamento e sessao devem pertencer a mesma conta.

## Financeiro do Consultorio

### Pagamentos

Campos principais:

```txt
Id
ContaPsicologoId
PacienteId
ConsultaId
Valor
Status
FormaPagamento
PagoEm
VencimentoEm
Observacao
CriadoEm
AtualizadoEm
```

Observacao:

`Pagamentos` representa pagamentos dos pacientes ao psicologo. Nao confundir com `FaturasSaaS`.

## Auditoria

### LogsAuditoria

Campos principais:

```txt
Id
ContaPsicologoId
UsuarioId
TipoAcao
Entidade
EntidadeId
Descricao
Ip
UserAgent
DadosAntesJson
DadosDepoisJson
CriadoEm
```

Regras:

- nao armazenar senha, token ou segredo.
- nao armazenar conteudo clinico completo em texto aberto.
- usar criptografia quando for necessario registrar dados sensiveis.

## Indices Recomendados

```txt
Pacientes:
  ContaPsicologoId + CpfHash unico quando CpfHash nao for nulo

TiposAtendimento:
  ContaPsicologoId + Nome unico

Consultas:
  ContaPsicologoId + InicioEm + FimEm
  ContaPsicologoId + PacienteId + InicioEm

Prontuarios:
  ContaPsicologoId + PacienteId unico para prontuario ativo

RegistrosSessao:
  ConsultaId unico
  ContaPsicologoId + PacienteId + DataSessao

IntegracoesWhatsApp:
  ContaPsicologoId + NumeroWhatsApp
```
