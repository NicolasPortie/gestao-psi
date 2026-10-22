# SaaS, Contas, Planos e Modulos

## Objetivo

Este documento descreve a parte SaaS da Psique.

O produto sera multi-conta. Cada psicologo tera sua propria `ContaPsicologo`.

## ContasPsicologo

`ContaPsicologo` e a raiz de isolamento do sistema.

Ela representa o consultorio individual de um psicologo autonomo.

Regras:

- todo usuario pertence a uma conta;
- todo paciente pertence a uma conta;
- todo prontuario pertence a uma conta;
- todo dado clinico deve ser filtrado pela conta autenticada;
- nenhum endpoint deve confiar em `ContaPsicologoId` enviado livremente pelo front-end.

## PlanosSaaS

Representa planos comerciais.

Campos principais:

```txt
Id
Nome
Descricao
PrecoMensal
PrecoAnual
Ativo
LimitePacientesAtivos
LimiteSessoesMes
CriadoEm
AtualizadoEm
```

Relacionamentos:

```txt
PlanoSaaS 1 -> N ContasPsicologo
PlanoSaaS 1 -> N AssinaturasSaaS
PlanoSaaS 1 -> N ModulosPlano
```

## ModulosSaaS

Representa funcionalidades habilitaveis.

Modulos previstos:

```txt
Agenda
Pacientes
Prontuario
Sessoes
DocumentosPsicologicos
Pagamentos
Relatorios
ListaEspera
Lembretes
WhatsAppBridge
ChatbotAdministrativo
IaAssistiva
```

## ModulosPlano

Associa planos a modulos.

```txt
PlanoSaaS 1 -> N ModulosPlano
ModuloSaaS 1 -> N ModulosPlano
```

## ModulosConta

Representa modulos habilitados para uma conta especifica.

Campos principais:

```txt
Id
ContaPsicologoId
ModuloSaaSId
Origem
ConfiguracaoJson
Ativo
HabilitadoEm
DesabilitadoEm
CriadoEm
AtualizadoEm
```

Regras:

- modulo habilitado nao substitui permissao de usuario;
- modulo de documentos nao libera acesso clinico para recepcionista;
- modulos podem ser habilitados por plano, cortesia, beta ou configuracao manual.

## AssinaturasSaaS

Representa a assinatura comercial da conta.

Campos principais:

```txt
Id
ContaPsicologoId
PlanoSaaSId
Status
CicloCobranca
ValorAtual
Moeda
InicioEm
FimTesteEm
ProximaCobrancaEm
CanceladaEm
ProvedorPagamento
AssinaturaExternaId
CriadoEm
AtualizadoEm
```

Relacionamentos:

```txt
ContaPsicologo 1 -> N AssinaturasSaaS historicas
ContaPsicologo 1 -> 0..1 AssinaturaSaaS ativa
AssinaturaSaaS 1 -> N FaturasSaaS
AssinaturaSaaS 1 -> N HistoricosAssinaturaSaaS
```

## FaturasSaaS

Representa cobrancas da assinatura da Psique.

Nao confundir com `Pagamentos`, que pertence ao financeiro do consultorio.

## Status

### StatusContaPsicologo

```txt
Ativa
EmTeste
Suspensa
Cancelada
Bloqueada
```

### StatusAssinaturaSaaS

```txt
Teste
Ativa
PagamentoPendente
Suspensa
Cancelada
Expirada
```

### StatusFaturaSaaS

```txt
Aberta
Paga
Vencida
Cancelada
Reembolsada
Falhou
```
