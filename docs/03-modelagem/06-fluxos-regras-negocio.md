# Fluxos e Regras de Negocio

## Criacao de Conta

```txt
Psicologo cria cadastro
  -> cria ContaPsicologo
  -> cria Usuario principal com perfil Psicologo
  -> cria DadosProfissionaisPsicologo inicial ou pendente
  -> cria ConfiguracaoAtendimento padrao
  -> associa PlanoSaaS inicial, se aplicavel
  -> registra LogAuditoria
```

## Login e Resolucao da Conta

```txt
Usuario informa credenciais
  -> API valida login
  -> API verifica Status do Usuario
  -> API verifica Status da ContaPsicologo
  -> API inclui ContaPsicologoId e Perfil no token/sessao
  -> todas as consultas usam a conta autenticada como escopo
```

Regras:

- front-end nao decide a conta;
- API nunca deve aceitar `ContaPsicologoId` livre como permissao;
- services validam se entidades relacionadas pertencem a mesma conta.

## Cadastro de Paciente

```txt
Usuario informa dados administrativos
  -> API identifica conta autenticada
  -> valida dados
  -> cria Paciente com ContaPsicologoId
  -> cria Prontuario, se regra estiver ativa
  -> registra LogAuditoria
```

## Consulta pelo Painel

```txt
Usuario seleciona paciente, data e horario
  -> API valida paciente na conta
  -> API valida disponibilidade
  -> API valida bloqueios
  -> API cria Consulta
  -> API cria HistoricoConsulta
  -> API pode criar Pagamento pendente
  -> API registra LogAuditoria
```

## Registro de Sessao

```txt
Psicologo acessa consulta realizada
  -> API identifica ou cria Prontuario
  -> psicologo registra dados clinicos
  -> API cria RegistroSessao
  -> API pode criar EvolucaoProntuario vinculada
  -> API atualiza Consulta como Realizada
  -> API registra LogAuditoria
```

## Acompanhamento do Paciente

```txt
Psicologo acessa prontuario
  -> visualiza linha do tempo
  -> registra EvolucaoProntuario ou atualiza resumo
  -> API criptografa conteudo clinico
  -> API salva evolucao
  -> API registra auditoria
```

## Geracao de Documento

```txt
Psicologo seleciona tipo de documento
  -> escolhe fontes: sessoes, evolucoes, periodo ou resumo
  -> sistema monta rascunho
  -> psicologo revisa e edita
  -> psicologo finaliza/assina
  -> API cria versao final
  -> API registra auditoria
```

Regras:

- documento final nunca e emitido automaticamente;
- todo documento nasce como rascunho;
- documento entregue exige protocolo;
- fontes usadas devem ser rastreaveis.

## WhatsApp

```txt
Paciente envia mensagem
  -> Bridge chama webhook
  -> API identifica conta pela integracao
  -> API registra evento
  -> API registra mensagem
  -> bot identifica intencao administrativa
  -> API executa regra de agenda/consulta
  -> Bridge envia resposta
```

## Mensagem Sensivel

```txt
Paciente envia mensagem sensivel ou urgente
  -> bot detecta risco ou conteudo clinico
  -> bot nao realiza atendimento psicologico
  -> conversa marcada como AtendimentoHumanoNecessario
  -> psicologo recebe notificacao
```
