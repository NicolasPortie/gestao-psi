# Seguranca, Privacidade e Criptografia

## Objetivo

Este documento define regras de seguranca para dados sensiveis do GestaoPsi.

O sistema lida com dados pessoais, dados de saude, prontuario, documentos psicologicos e conversas administrativas.

## Principios

- dados clinicos sao sensiveis;
- dados devem ser escopados por `ContaPsicologoId`;
- senhas devem ser armazenadas apenas como hash;
- tokens e secrets devem ser criptografados;
- campos clinicos devem ser criptografados em repouso;
- trafego deve usar HTTPS/TLS;
- logs nao devem conter segredos ou conteudo clinico aberto;
- backups devem ser criptografados;
- exportacoes devem exigir permissao elevada.

## Senhas

Campo:

```txt
Usuarios.SenhaHash
```

Regras:

- usar Argon2id, bcrypt ou PBKDF2 com parametros fortes;
- nunca salvar senha em texto puro;
- nunca registrar senha em log;
- nunca retornar hash pela API.

## Campos Criptografados

Clinicos:

```txt
Prontuarios.ObservacaoGeral
Prontuarios.ResumoAcompanhamento
Prontuarios.ObjetivosAcompanhamento
Prontuarios.PlanoAcompanhamento
Prontuarios.HipotesesClinicas
RegistrosSessao.ObservacoesClinicas
RegistrosSessao.Evolucao
RegistrosSessao.Encaminhamentos
EvolucoesProntuario.Conteudo
EvolucoesProntuario.Resumo
DocumentosProntuario.Conteudo
VersoesDocumentoProntuario.Conteudo
```

Pessoais:

```txt
Pacientes.Cpf
Pacientes.ObservacaoAdministrativa
ContatosPaciente.Valor
DadosProfissionaisPsicologo.Crp
```

Integracoes:

```txt
IntegracoesWhatsApp.TokenCriptografado
MensagensWhatsApp.Conteudo
EventosBridgeWhatsApp.PayloadJson
SessoesBot.DadosTemporariosJson
```

Auditoria:

```txt
LogsAuditoria.DadosAntesJson
LogsAuditoria.DadosDepoisJson
```

## Hashes de Busca

Campos:

```txt
Pacientes.CpfHash
ContatosPaciente.ValorHash
DadosProfissionaisPsicologo.CrpHash
EventosBridgeWhatsApp.PayloadHash
RefreshTokens.TokenHash
```

Regras:

- normalizar antes do hash;
- CPF sem pontuacao;
- telefone com DDI/DDD normalizados;
- hash serve para busca/comparacao, nao para recuperar valor.

## Mascaramento

Campos:

```txt
CpfMascarado
CrpMascarado
ValorMascarado
TelefoneMascarado
TokenMascarado
```

Regras:

- listagens devem evitar documento completo;
- logs devem preferir valores mascarados;
- token nunca deve ser exibido completo.

## Chaves e Secrets

Regras:

- chave de criptografia nao fica hardcoded;
- usar secret manager ou variavel protegida;
- planejar rotacao futura de chaves;
- acesso a secrets restrito ao back-end.

## Auditoria

Logs devem registrar:

- conta;
- usuario;
- acao;
- entidade;
- entidade afetada;
- data/hora;
- IP;
- user agent.

Logs nao devem registrar:

- senha;
- token;
- chave;
- conteudo clinico completo em texto aberto.

## Backups e Exportacoes

Regras:

- backups criptografados;
- exportacoes de prontuario/documentos exigem permissao clinica;
- exportacao registra auditoria;
- arquivos temporarios expiram;
- exclusao de conta nao deve apagar prontuario sem regra clara de guarda.

## MFA

MFA/2FA e altamente recomendado para psicologos.

Pode ser fase futura, mas deve ser previsto na arquitetura de autenticacao.
