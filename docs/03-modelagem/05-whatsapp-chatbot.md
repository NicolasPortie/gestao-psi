# WhatsApp, Bridge e Chatbot Administrativo

## Objetivo

Este documento define a modelagem e as regras do WhatsApp e do chatbot administrativo.

O chatbot nao realiza atendimento psicologico.

## Papel do Chatbot

Pode fazer:

- agendar consulta;
- remarcar consulta;
- cancelar consulta;
- confirmar presenca;
- consultar horarios;
- enviar lembretes;
- responder duvidas administrativas;
- encaminhar para humano.

Nao pode fazer:

- terapia;
- diagnostico;
- interpretacao de sintomas;
- orientacao psicologica;
- gerar laudo ou relatorio;
- coletar relato intimo sem necessidade;
- conduzir crise clinica sem humano.

## Fluxo

```txt
Paciente no WhatsApp
  -> Bridge WhatsApp
  -> API do Vínculo
  -> Identificacao da ContaPsicologo
  -> Motor administrativo do bot
  -> Regras de agenda/consulta
  -> Bridge WhatsApp
  -> Paciente
```

## IntegracoesWhatsApp

Campos principais:

```txt
Id
ContaPsicologoId
Nome
Provedor
UrlBaseBridge
TokenCriptografado
NumeroWhatsApp
Status
Ativo
CriadoEm
AtualizadoEm
```

Regras:

- token criptografado;
- pertence a uma conta;
- webhook deve identificar a conta pela integracao/token;
- nao expor token pela API.

## ConversasWhatsApp

Campos principais:

```txt
Id
ContaPsicologoId
IntegracaoWhatsAppId
PacienteId
Telefone
NomeContato
Status
UltimaMensagemEm
AtendimentoHumanoNecessario
MotivoAtendimentoHumano
CriadoEm
AtualizadoEm
```

Regras:

- pode existir sem paciente vinculado;
- se detectar mensagem sensivel, marcar atendimento humano;
- listagens nao devem expor conteudo clinico.

## MensagensWhatsApp

Campos principais:

```txt
Id
ContaPsicologoId
ConversaWhatsAppId
MensagemExternaId
Direcao
TipoMensagem
Conteudo
Status
EnviadaEm
RecebidaEm
LidaEm
ErroEnvio
CriadoEm
```

Regras:

- conteudo criptografado;
- evitar armazenar relato clinico desnecessario;
- usar `MensagemExternaId` para idempotencia;
- considerar mascaramento/resumo/descarte para conteudo sensivel.

## EventosBridgeWhatsApp

Campos principais:

```txt
Id
ContaPsicologoId
IntegracaoWhatsAppId
EventoExternoId
TipoEvento
PayloadHash
PayloadJson
Processado
ProcessadoEm
ErroProcessamento
CriadoEm
```

Regras:

- payload criptografado ou minimizado;
- processamento idempotente;
- falhas rastreadas;
- eventos pertencem a conta.

## SessoesBot

Campos principais:

```txt
Id
ContaPsicologoId
ConversaWhatsAppId
PacienteId
IntencaoAtual
EtapaAtual
DadosTemporariosJson
Status
ExpiraEm
CriadoEm
AtualizadoEm
```

Regras:

- guardar apenas dados administrativos temporarios;
- expirar sessoes antigas;
- nao armazenar dados clinicos detalhados.
