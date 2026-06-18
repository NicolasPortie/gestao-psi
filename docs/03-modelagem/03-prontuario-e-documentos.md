# Prontuario, Evolucao e Documentos Psicologicos

## Objetivo

Este documento define a modelagem e as regras de negocio do modulo clinico do GestaoPsi.

Este modulo e central para o produto.

Nao deve ser tratado como um campo simples de anotacoes.

## Separacao Fundamental

O sistema deve separar:

```txt
Cadastro administrativo do paciente
  -> dados pessoais
  -> contatos
  -> agenda
  -> pagamentos

Prontuario / registro documental
  -> acompanhamento clinico
  -> evolucoes
  -> sessoes
  -> procedimentos
  -> encaminhamentos
  -> documentos psicologicos
```

Recepcionistas podem acessar dados administrativos, mas nao acessam prontuario por padrao.

## Prontuarios

Representa o centro clinico do paciente.

Campos principais:

```txt
Id
ContaPsicologoId
PacienteId
Status
DataAbertura
DataEncerramento
ObservacaoGeral
ResumoAcompanhamento
ObjetivosAcompanhamento
PlanoAcompanhamento
HipotesesClinicas
MarcadoresJson
CriadoPorUsuarioId
CriadoEm
AtualizadoEm
```

Relacionamentos:

```txt
Paciente 1 -> 0..1 Prontuario ativo
Prontuario 1 -> N RegistrosSessao
Prontuario 1 -> N EvolucoesProntuario
Prontuario 1 -> N EventosProntuario
Prontuario 1 -> N DocumentosProntuario
Prontuario 1 -> N AnexosProntuario
Prontuario 1 -> N AcessosProntuario
```

Regras:

- prontuario pertence a uma conta;
- prontuario pertence a um paciente;
- prontuario deve ser acessado apenas por perfil clinico autorizado;
- campos clinicos devem ser criptografados;
- exclusao definitiva nao deve ser acao comum;
- encerramento preserva historico.

## RegistrosSessao

Representa o registro clinico de uma sessao especifica.

Campos principais:

```txt
Id
ContaPsicologoId
ProntuarioId
PacienteId
ConsultaId
TipoAtendimentoId
DataSessao
ObservacoesClinicas
Evolucao
Encaminhamentos
ProximaSessaoSugeridaEm
Status
CriadoPorUsuarioId
CriadoEm
AtualizadoEm
```

Regras:

- registro de sessao pertence ao prontuario;
- nao deve ser apagado definitivamente de forma simples;
- alteracoes relevantes devem gerar retificacao;
- conteudo clinico deve ser criptografado.

## EvolucoesProntuario

Representa o acompanhamento longitudinal do paciente.

Serve para registrar andamento, mudancas percebidas, objetivos trabalhados, observacoes do psicologo e informacoes que podem fundamentar documentos futuros.

Campos principais:

```txt
Id
ContaPsicologoId
ProntuarioId
PacienteId
ConsultaId
RegistroSessaoId
TipoEvolucao
Titulo
Conteudo
Resumo
DataEvolucao
CriadoPorUsuarioId
CriadoEm
AtualizadoEm
```

Tipos sugeridos:

```txt
NotaClinica
Evolucao
ObjetivoTrabalhado
MudancaPercebida
Encaminhamento
ObservacaoDeAcompanhamento
ResumoParaDocumento
```

Regras:

- `Conteudo` e `Resumo` devem ser criptografados;
- pode ou nao estar vinculada a uma consulta;
- pode ou nao estar vinculada a um registro de sessao;
- pode ser usada como fonte para documentos;
- alteracoes relevantes devem ser auditadas.

## Documentos Psicologicos

O modulo de documentos psicologicos e regra de negocio central.

Nao e um editor de texto generico.

Cada documento deve ter:

- tipo definido por enum;
- modelo/estrutura propria;
- campos obrigatorios;
- campos proibidos;
- validacoes especificas;
- regras de permissao;
- fontes rastreaveis;
- status;
- versao final travada;
- protocolo de entrega;
- auditoria.

## Tipos Obrigatorios

O sistema deve suportar:

```txt
Declaracao
AtestadoPsicologico
RelatorioPsicologico
RelatorioMultiprofissional
LaudoPsicologico
ParecerPsicologico
```

Tipos complementares:

```txt
Encaminhamento
ResumoAcompanhamento
Devolutiva
InformePsicologico
Outro
```

## DocumentosProntuario

Campos principais:

```txt
Id
ContaPsicologoId
ProntuarioId
PacienteId
TipoDocumento
Titulo
Conteudo
FonteDadosJson
Status
GeradoPorUsuarioId
GeradoEm
RevisadoPorUsuarioId
RevisadoEm
AssinadoEm
CriadoEm
AtualizadoEm
```

Regras:

- documento nasce como `Rascunho`;
- psicologo revisa e finaliza;
- documento finalizado gera versao travada;
- retificacao ou correcao gera nova versao;
- entrega gera protocolo;
- conteudo deve ser criptografado;
- fontes usadas devem ser rastreaveis.

## Regras Por Tipo

### Declaracao

Pode informar:

- comparecimento;
- acompanhamento;
- periodo;
- dias e horarios;
- modalidade.

Nao pode conter:

- sintomas;
- diagnostico;
- evolucao clinica;
- hipoteses clinicas;
- observacoes tecnicas;
- relato intimo.

### AtestadoPsicologico

Regras:

- exige finalidade;
- exige fundamentacao tecnica;
- exige fonte no prontuario;
- exige revisao antes de finalizar;
- deve exibir alerta de responsabilidade.

### RelatorioPsicologico

Estrutura sugerida:

```txt
Identificacao
DescricaoDemanda
Procedimentos
Analise
Conclusao
Encaminhamentos
LocalData
Assinatura
```

Regras:

- comunica atuacao profissional;
- pode descrever trabalho desenvolvido ou em desenvolvimento;
- nao deve ser tratado como laudo;
- fontes devem ser rastreaveis.

### RelatorioMultiprofissional

Regras:

- deve limitar informacao psicologica ao necessario;
- deve destacar a parte/responsabilidade do psicologo;
- exige finalidade e destinatario.

### LaudoPsicologico

Regras:

- deve ser separado de relatorio comum;
- exige contexto de avaliacao psicologica;
- exige procedimentos, fontes, analise e conclusao;
- pode exigir referencias;
- nunca deve ser emitido automaticamente.

### ParecerPsicologico

Regras:

- responde questao tecnica especifica;
- exige fundamentacao;
- deve ter conclusao objetiva;
- nasce como rascunho revisavel.

## RegrasDocumentoPsicologico

Representa regras de negocio por tipo de documento.

Campos principais:

```txt
Id
TipoDocumento
Nome
Descricao
CamposObrigatoriosJson
CamposProibidosJson
SecoesObrigatoriasJson
ExigeFinalidade
ExigeDestinatario
ExigeFonteProntuario
ExigeRevisaoAntesFinalizar
ExigeProtocoloEntrega
PermiteConteudoClinico
Ativo
CriadoEm
AtualizadoEm
```

## ModelosDocumentoPsicologico

Representa modelos estruturados.

Regras:

- pode existir modelo padrao do sistema;
- conta pode ter modelo customizado;
- alteracao de modelo nao altera documento ja finalizado;
- template nao e documento final.

## VersoesDocumentoProntuario

Registra versoes de documentos.

Regras:

- conteudo criptografado;
- versao finalizada nao deve ser editada;
- nova correcao gera nova versao.

## ProtocolosEntregaDocumento

Registra entrega de documento.

Campos principais:

```txt
Id
ContaPsicologoId
DocumentoProntuarioId
PacienteId
DestinatarioNome
DestinatarioDocumento
Finalidade
FormaEntrega
EntregueEm
ConfirmadoEm
ConfirmacaoRecebimento
ArquivoEntregueHash
CriadoPorUsuarioId
CriadoEm
```

Regras:

- documento entregue deve ter protocolo;
- protocolo nao deve expor conteudo clinico;
- protocolo vincula a versao entregue.

## IA e Documentos

IA pode apoiar escrita, organizacao e rascunho.

IA nao deve:

- diagnosticar;
- concluir laudo;
- emitir documento final;
- substituir revisao do psicologo.

Todo conteudo gerado deve ser revisado e validado pelo psicologo responsavel.
