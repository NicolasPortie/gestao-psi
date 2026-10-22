# Convencoes de Nomenclatura

## Objetivo

Este documento define o padrão de nomenclatura do projeto Psique.

A regra principal é: nomes do domínio do sistema devem ser escritos em português do Brasil.

Essa decisão se aplica ao back-end, front-end, banco de dados, arquivos, pastas, classes, funções, métodos, variáveis, tabelas, colunas, rotas e componentes.

## Regra Principal

Usar português do Brasil para tudo que representar regra, conceito ou entidade do negócio.

Exemplos:

```txt
Paciente
Consulta
Agendamento
Sessao
Pagamento
Psicologo
Recepcionista
RegistroClinico
HistoricoPaciente
ListaEspera
```

Evitar nomes em inglês para conceitos do sistema:

```txt
Patient
Appointment
Session
Payment
User
ClinicalRecord
```

## Regra Para o Modelo SaaS

A Psique será operada como SaaS multi-conta.

O dominio principal do consultorio continua sendo escrito em portugues e pensado para uma conta de psicologo autonomo.

Quando surgirem recursos da plataforma SaaS, separar claramente os nomes da camada comercial dos nomes do dominio clinico/administrativo.

Exemplos da camada SaaS/conta:

```txt
ContaPsicologo
Plano
Assinatura
ModuloContratado
StatusContaPsicologo
```

Exemplos do dominio da conta:

```txt
Paciente
Consulta
Sessao
Pagamento
RegistroSessao
ConfiguracaoAtendimento
IntegracaoWhatsApp
```

Regras:

- usar `ContaPsicologoId` nas tabelas de dominio que guardam dados da conta;
- nao usar `PsicologoId` como separador principal de dados;
- dados comerciais da assinatura devem ficar fora das tabelas clinicas;
- nomes da plataforma SaaS devem deixar claro que pertencem a operacao do produto, nao ao prontuario ou rotina clinica.

## Onde Usar Portugues

### Back-end

Usar português em:

- nomes de arquivos;
- nomes de pastas de domínio;
- classes;
- métodos;
- propriedades;
- DTOs;
- Models;
- Services;
- Controllers quando representarem recursos do sistema;
- enums;
- constantes;
- mensagens internas do domínio.

Exemplos:

```txt
PacientesController.cs
ConsultasController.cs
SessoesController.cs
PagamentosController.cs
ConfiguracoesController.cs
```

```txt
Paciente.cs
Consulta.cs
RegistroSessao.cs
Pagamento.cs
Usuario.cs
LogAuditoria.cs
```

```txt
CriarPacienteRequest.cs
AtualizarPacienteRequest.cs
PacienteResponse.cs
```

```csharp
public Task<PacienteResponse> CriarPacienteAsync(CriarPacienteRequest request)
public Task CancelarConsultaAsync(Guid consultaId)
public Task ConfirmarPagamentoAsync(Guid pagamentoId)
```

### Front-end

Usar português em:

- nomes de features;
- componentes de domínio;
- services;
- models;
- rotas internas do produto;
- nomes de arquivos relacionados ao domínio;
- métodos;
- variáveis;
- tipos e interfaces do domínio.

Exemplos:

```txt
features/
  pacientes/
  consultas/
  sessoes/
  pagamentos/
  configuracoes/
```

```txt
pacientes.service.ts
consulta.model.ts
formulario-paciente.component.ts
lista-pacientes.component.ts
```

```ts
listarPacientes()
criarPaciente()
cancelarConsulta()
confirmarPagamento()
```

### Banco de Dados

Usar português em:

- nomes de tabelas;
- nomes de colunas;
- nomes de constraints quando forem definidas manualmente;
- nomes de índices quando forem definidos manualmente.

Exemplos:

```txt
Pacientes
Consultas
Sessoes
Pagamentos
Usuarios
LogsAuditoria
```

```txt
Id
NomeCompleto
Telefone
Email
DataNascimento
StatusConsulta
DataCriacao
DataAtualizacao
```

## Onde Ingles Pode Ser Usado

Inglês pode ser usado quando for padrão técnico da linguagem, framework, biblioteca ou protocolo.

Exemplos:

```txt
Program.cs
appsettings.json
launchSettings.json
package.json
tsconfig.json
vite.config.ts
Dockerfile
README.md
```

Também é aceitável manter nomes técnicos padronizados em inglês quando fazem parte do ecossistema:

```txt
Controller
Service
Request
Response
Middleware
Migration
DbContext
fetch
Interceptor
Guard
Component
Routes
Module
DTO
API
JWT
Swagger
OpenAPI
```

Exemplos aceitáveis:

```txt
PacientesController.cs
PacientesService.cs
CriarPacienteRequest.cs
PacienteResponse.cs
AppDbContext.cs
ExceptionHandlingMiddleware.cs
```

O conceito do domínio fica em português, mas o sufixo técnico pode permanecer em inglês quando isso deixar o código mais natural dentro do framework.

## Rotas da API

As rotas da API devem usar português quando representarem recursos do domínio.

Exemplos:

```txt
/api/v1/pacientes
/api/v1/consultas
/api/v1/sessoes
/api/v1/pagamentos
/api/v1/configuracoes
```

Ações também devem ser em português:

```txt
PATCH /api/v1/consultas/{id}/cancelar
PATCH /api/v1/consultas/{id}/confirmar
PATCH /api/v1/consultas/{id}/remarcar
```

## Rotas do Front-end

As rotas do front-end devem seguir português:

```txt
/login
/painel
/pacientes
/agenda
/consultas
/sessoes
/pagamentos
/configuracoes
```

## Padrao de Escrita

### C# / Back-end

Usar PascalCase para:

- classes;
- records;
- enums;
- propriedades;
- métodos públicos.

Exemplos:

```csharp
public class Paciente
public class Consulta
public enum StatusConsulta
public string NomeCompleto { get; set; }
public Task CriarPacienteAsync()
```

Usar camelCase para:

- variáveis locais;
- parâmetros;
- campos privados quando aplicável.

Exemplos:

```csharp
var pacienteEncontrado = await ...
Guid consultaId
string nomeCompleto
```

### TypeScript / React

Usar PascalCase para:

- classes;
- interfaces;
- types;
- enums.

Exemplos:

```ts
export interface Paciente
export interface Consulta
export class PacientesService
```

Usar camelCase para:

- funções;
- métodos;
- variáveis;
- propriedades.

Exemplos:

```ts
listarPacientes()
criarConsulta()
pacienteSelecionado
consultaAtual
```

Nomes de arquivos de dominio no React devem usar kebab-case. Pontos de entrada convencionais, como `App.tsx`, podem manter PascalCase.

Exemplos:

```txt
lista-pacientes.component.ts
formulario-paciente.component.ts
pacientes.service.ts
consulta.model.ts
```

## Acentos

Não usar acentos em nomes de arquivos, pastas, classes, métodos, variáveis, tabelas ou colunas.

Usar:

```txt
Sessoes
Configuracoes
Historico
Psicologo
Recepcao
```

Evitar:

```txt
Sessões
Configurações
Histórico
Psicólogo
Recepção
```

Acentos podem ser usados normalmente em textos exibidos para o usuário, mensagens, labels e documentação.

## Exemplos de Conversao

| Ingles | Portugues recomendado |
| --- | --- |
| Patient | Paciente |
| Appointment | Consulta ou Agendamento |
| Session | Sessao |
| SessionRecord | RegistroSessao |
| Payment | Pagamento |
| User | Usuario |
| Role | Perfil |
| Permission | Permissao |
| AuditLog | LogAuditoria |
| WaitingList | ListaEspera |
| Schedule | Agenda |
| Settings | Configuracoes |
| Reminder | Lembrete |

## Observacao Sobre Termos Ambiguos

Alguns termos precisam ser definidos com cuidado.

Por exemplo:

```txt
Consulta
Agendamento
Sessao
```

Sugestão inicial:

- `Agendamento`: ato de marcar um horário.
- `Consulta`: horário marcado entre paciente e psicólogo.
- `Sessao`: atendimento realizado e registrado clinicamente.

Essa distinção poderá ser refinada na modelagem do banco de dados.

## Decisao Atual

A Psique usará português do Brasil para nomes ligados ao domínio do sistema.

Inglês será mantido apenas quando for padrão técnico natural do framework, linguagem, biblioteca ou arquivo de configuração.

Essa regra se aplica ao front-end, back-end, banco de dados e documentação técnica.
