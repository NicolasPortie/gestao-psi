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

## Redis e Autenticacao

Redis deve armazenar apenas estado temporario com expiracao definida:

- contadores de tentativas de login;
- bloqueios temporarios;
- tokens de recuperacao armazenados somente como hash;
- refresh tokens armazenados somente como hash;
- indices de revogacao de sessoes;
- chaveiro compartilhado de Data Protection.

Regras:

- nunca armazenar senha no Redis;
- nunca armazenar token bruto no Redis;
- usar TTL em todas as chaves de autenticacao;
- tokens de recuperacao e refresh tokens devem ser de uso unico ou rotacionados;
- redefinir senha deve revogar sessoes anteriores;
- access tokens incluem `VersaoAutenticacao` do usuario; redefinicao de senha
  e mudanca de status incrementam essa versao e revogam refresh tokens;
- a validacao de cada JWT confirma usuario e conta ativos, perfil atual e versao;
- tokens anteriores a essa regra exigem renovacao de sessao;
- Redis deve exigir autenticacao e conexao protegida em producao;
- chaves Redis nao devem conter e-mail, CRP, CPF ou outro dado pessoal em texto aberto.

Para desenvolvimento local, o estado temporario de autenticacao pode rodar em memoria quando Redis nao estiver configurado. Esse modo nao e distribuido, nao sobrevive a reinicio da API e existe apenas para facilitar o desenvolvimento sem infraestrutura local adicional.

## MFA

MFA/2FA e altamente recomendado para psicologos.

Pode ser fase futura, mas deve ser previsto na arquitetura de autenticacao.

## Camada HTTP

Regras aplicadas na API e no servidor do front-end:

- respostas da API com `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer` e CSP `default-src 'none'`;
- CSP do front sem scripts embutidos, com `connect-src 'self'` e `frame-ancestors 'none'`;
- HSTS na API fora de Development e `Strict-Transport-Security` no terminador TLS em producao;
- limite de 60 requisicoes por minuto por IP nos endpoints sem sessao (cadastro, login, recuperacao e webhook do Bridge), alem das travas por conta e por e-mail;
- IP do cliente por `X-Forwarded-For` somente quando `Rede:ConfiarEmProxyReverso` esta ligado e a origem e uma rede privada;
- endpoint de saude anonimo sem detalhes da infraestrutura fora de Development;
- listagem de consultas com periodo maximo de 366 dias e filtro por paciente no servidor;
- troca de senha com a senha atual, limite de tentativas, revogacao das demais sessoes e auditoria (`AlteracaoSenha`).
