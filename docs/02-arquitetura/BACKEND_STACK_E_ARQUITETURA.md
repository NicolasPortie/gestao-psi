# Stack e Arquitetura do Back-end

## Objetivo

Este documento define a stack inicial e a arquitetura do back-end do projeto Vínculo.

O objetivo é criar uma API profissional, organizada e fácil de evoluir, sem usar Clean Architecture neste momento.

A API deve ser pensada para atender não apenas o front-end React, mas também possíveis consumidores futuros, como chatbot, aplicativo mobile, integrações com WhatsApp, sistemas externos ou outros painéis.

As regras de nomenclatura do projeto estão definidas em `CONVENCOES_NOMENCLATURA.md`.

No back-end, nomes relacionados ao domínio do sistema devem ser escritos em português do Brasil. Inglês deve ser usado apenas quando for padrão técnico do ASP.NET Core, C#, EF Core, bibliotecas ou arquivos de configuração.

O Vínculo sera desenvolvido como um produto SaaS multi-conta.

Na pratica:

- o codigo-base do back-end sera unico para todos os clientes;
- cada psicologo tera sua propria `ContaPsicologo`;
- cada conta representa um consultorio individual;
- as entidades principais do dominio devem usar `ContaPsicologoId` quando armazenarem dados da rotina do consultorio;
- dados profissionais do psicologo da conta devem ficar em `DadosProfissionaisPsicologo`;
- a separacao entre clientes deve acontecer por conta e regra de acesso.

Essa decisao permite vender o produto como SaaS sem criar um projeto separado para cada psicologo.

## Camadas do Produto SaaS

O back-end deve diferenciar duas camadas conceituais:

```txt
Camada SaaS
  -> contas
  -> planos
  -> assinaturas
  -> modulos
  -> status comercial

Camada da Conta do Consultorio
  -> pacientes
  -> agenda
  -> consultas
  -> sessoes
  -> pagamentos
  -> WhatsApp
  -> auditoria
```

A primeira implementacao deve focar na Camada da Conta do Consultorio.

A camada SaaS de planos, assinaturas e modulos pode evoluir depois sem misturar dados comerciais com dados clinicos.

## Stack Definida

### Framework

```txt
ASP.NET Core Web API
```

O back-end será desenvolvido como uma Web API usando ASP.NET Core.

### ORM

```txt
Entity Framework Core
```

O EF Core será usado para mapear os Models do sistema para o banco de dados.

### Banco de Dados

```txt
SQL Server
```

O SQL Server será o banco de dados principal do projeto.

### Documentação da API

```txt
Swagger / OpenAPI
```

A API deve expor documentação via Swagger/OpenAPI para facilitar testes, integração com o front-end e consumo por futuros clientes externos.

## Decisao Arquitetural

O projeto não usará Clean Architecture neste momento.

A arquitetura escolhida será uma arquitetura simples, profissional e organizada em camadas internas dentro do próprio projeto da API.

Estrutura principal:

```txt
Controllers
Services
DTOs
Models
Data
Mappings
Validators
Middlewares
Shared
```

Fluxo principal:

```txt
Request DTO
  -> Controller
  -> Service
  -> EF Core / AppDbContext
  -> SQL Server
  -> Response DTO
```

## Por Que Usar Controllers

O projeto usará Controllers do ASP.NET Core.

Controllers são adequados para criar uma API organizada, clara e fácil de consumir por diferentes clientes.

Responsabilidade dos Controllers:

- receber requisições HTTP;
- validar entrada básica quando necessário;
- chamar services;
- retornar respostas HTTP;
- definir rotas da API;
- aplicar autorização quando necessário.

Controllers não devem concentrar regra de negócio pesada nem acesso direto desorganizado ao banco.

## Estrutura Inicial do Projeto

Estrutura sugerida:

```txt
backend/
  GestaoPsi.Api/
    Controllers/
      AutenticacaoController.cs
      PacientesController.cs
      ConsultasController.cs
      SessoesController.cs
      PagamentosController.cs
      AgendaController.cs
      ListaEsperaController.cs
      LembretesController.cs
      IntegracoesWhatsAppController.cs
      RelatoriosController.cs
      ConfiguracoesController.cs

    Services/
      Autenticacao/
        IAutenticacaoService.cs
        AutenticacaoService.cs
      Pacientes/
        IPacientesService.cs
        PacientesService.cs
      Consultas/
        IConsultasService.cs
        ConsultasService.cs
      Sessoes/
        ISessoesService.cs
        SessoesService.cs
      Pagamentos/
        IPagamentosService.cs
        PagamentosService.cs
      Agenda/
        IAgendaService.cs
        AgendaService.cs
      ListaEspera/
        IListaEsperaService.cs
        ListaEsperaService.cs
      Lembretes/
        ILembretesService.cs
        LembretesService.cs
      IntegracoesWhatsApp/
        IIntegracoesWhatsAppService.cs
        IntegracoesWhatsAppService.cs

    Data/
      AppDbContext.cs
      Configuracoes/
      Migrations/

    Models/
      Usuario.cs
      DadosProfissionaisPsicologo.cs
      Paciente.cs
      Consulta.cs
      RegistroSessao.cs
      Pagamento.cs
      ConfiguracaoAtendimento.cs
      TipoAtendimento.cs
      HorarioDisponivel.cs
      BloqueioAgenda.cs
      HistoricoConsulta.cs
      RetificacaoRegistroSessao.cs
      Lembrete.cs
      ModeloMensagem.cs
      ListaEspera.cs
      IntegracaoWhatsApp.cs
      ConversaWhatsApp.cs
      MensagemWhatsApp.cs
      EventoBridgeWhatsApp.cs
      SessaoBot.cs
      IntencaoBot.cs
      LogAuditoria.cs
      Notificacao.cs

    DTOs/
      Autenticacao/
      Pacientes/
      Consultas/
      Sessoes/
      Pagamentos/
      Agenda/
      ListaEspera/
      Lembretes/
      IntegracoesWhatsApp/
      Relatorios/
      Comum/

    Mappings/
      PacienteMappings.cs
      ConsultaMappings.cs
      SessaoMappings.cs

    Validators/
      Pacientes/
      Consultas/
      Sessoes/

    Middlewares/
      ExceptionHandlingMiddleware.cs

    Shared/
      Constantes/
      Enums/
      Excecoes/
      Respostas/

    Program.cs
    appsettings.json
```

## Responsabilidade das Pastas

### Controllers

Contém os endpoints HTTP da API.

Exemplos:

```txt
PacientesController
ConsultasController
SessoesController
AutenticacaoController
```

Os Controllers devem ser objetivos e chamar os Services para executar ações.

### Services

Contém as regras de negócio e orquestra as operações da aplicação.

Exemplos:

- cadastrar paciente;
- buscar agenda;
- criar agendamento;
- cancelar consulta;
- registrar sessão;
- confirmar pagamento.

Os Services podem usar o `AppDbContext` diretamente no início do projeto.

Caso a aplicação cresça e exista necessidade real, podemos avaliar o uso de repositories futuramente.

### Data

Contém a configuração de acesso ao banco.

Arquivos principais:

```txt
AppDbContext.cs
Configuracoes/
Migrations/
```

O `AppDbContext` será responsável pelos `DbSet` do EF Core.

Exemplo:

```csharp
public DbSet<Paciente> Pacientes { get; set; }
public DbSet<Consulta> Consultas { get; set; }
public DbSet<RegistroSessao> RegistrosSessao { get; set; }
public DbSet<Pagamento> Pagamentos { get; set; }
```

### Models

Contém as entidades usadas pelo EF Core.

No projeto, Models representam as estruturas internas persistidas no banco de dados.

Exemplos:

```txt
Paciente
Consulta
RegistroSessao
Pagamento
Usuario
LogAuditoria
```

Models não devem ser expostos diretamente como contrato da API quando houver risco de vazar campos internos, sensíveis ou desnecessários.

### DTOs

Contém os contratos de entrada e saída da API.

DTOs protegem os Models e deixam a API mais estável para diferentes consumidores.

Exemplo:

```txt
CriarPacienteRequest
AtualizarPacienteRequest
PacienteResponse
```

Fluxo esperado:

```txt
Controller recebe Request DTO
Service cria ou atualiza Model
EF Core persiste Model
Service retorna Response DTO
Controller devolve resposta HTTP
```

### Mappings

Contém conversões entre DTOs e Models.

Exemplo:

```txt
CriarPacienteRequest -> Paciente
Paciente -> PacienteResponse
```

No início, os mappings podem ser feitos manualmente.

Bibliotecas como AutoMapper não serão usadas automaticamente. Só devem ser consideradas se a repetição ficar grande o suficiente para justificar.

### Validators

Contém validações de entrada.

Pode ser usado para organizar validações mais complexas fora dos Controllers.

No futuro, podemos avaliar o uso de FluentValidation se fizer sentido.

### Middlewares

Contém middlewares globais da API.

Exemplo:

```txt
ExceptionHandlingMiddleware
```

Esse middleware pode padronizar respostas de erro e evitar tratamento repetido nos Controllers.

### Shared

Contém recursos reutilizáveis.

Exemplos:

- constantes;
- enums;
- exceptions customizadas;
- respostas padronizadas;
- helpers simples.

Evitar colocar regras de negócio importantes em `Shared`.

## API Pensada Para Multiplos Consumidores

A API deve ser criada para ser consumida por diferentes clientes:

- front-end React;
- chatbot administrativo;
- aplicativo mobile futuro;
- integrações com WhatsApp;
- integrações externas;
- painéis administrativos futuros.

Por isso, a API deve ter:

- rotas claras;
- contratos bem definidos;
- DTOs de request e response;
- respostas padronizadas;
- autenticação;
- autorização;
- versionamento;
- documentação Swagger/OpenAPI.

## Isolamento por Conta

Como o produto lida com dados pessoais e dados clinicos sensiveis, o isolamento entre contas deve ser uma decisao de arquitetura desde o inicio.

Direcao inicial recomendada:

```txt
1 psicologo / consultorio
  -> 1 ContaPsicologo
  -> usuarios, configuracoes, pacientes, agenda e registros clinicos escopados pela conta
```

Com isso, o back-end de dominio continua coerente com a regra de uma conta por psicologo autonomo.

Regras:

- resolver a `ContaPsicologo` a partir do usuario autenticado;
- nao aceitar `ContaPsicologoId` livre do front-end como criterio de permissao;
- filtrar dados de dominio por `ContaPsicologoId`;
- validar que entidades relacionadas pertencem a mesma conta;
- manter secrets e tokens de Bridge vinculados a conta;
- registrar auditoria com `ContaPsicologoId`;
- tratar logs comerciais da plataforma separadamente dos registros clinicos.

O objetivo e cada usuario/psicologo ter sua propria conta dentro do SaaS.

## Modulos SaaS e Feature Flags

O produto podera ter planos e modulos ativaveis, mas isso nao deve virar complexidade prematura.

No back-end, a direcao inicial e preparar configuracoes simples para habilitar ou desabilitar recursos por conta.

Modulos candidatos:

- Agenda;
- Pacientes;
- Sessoes;
- Pagamentos;
- Relatorios;
- Lista de espera;
- Lembretes;
- WhatsApp Bridge;
- Chatbot administrativo;
- IA assistiva futura;
- Documentos.

Essas configuracoes devem ser lidas pelos services quando uma funcionalidade depender de plano/modulo.

Evitar regras hardcoded por cliente.

## Versionamento de API

As rotas devem considerar versionamento desde o início.

Formato recomendado:

```txt
/api/v1/pacientes
/api/v1/consultas
/api/v1/sessoes
/api/v1/pagamentos
```

Exemplos:

```txt
GET    /api/v1/pacientes
GET    /api/v1/pacientes/{id}
POST   /api/v1/pacientes
PUT    /api/v1/pacientes/{id}
DELETE /api/v1/pacientes/{id}

GET    /api/v1/consultas
POST   /api/v1/consultas
PATCH  /api/v1/consultas/{id}/cancelar
PATCH  /api/v1/consultas/{id}/confirmar
```

## Respostas Padronizadas

A API deve retornar respostas previsíveis.

Exemplo de resposta de sucesso:

```json
{
  "success": true,
  "data": {},
  "message": "Operacao realizada com sucesso."
}
```

Exemplo de resposta de erro:

```json
{
  "success": false,
  "message": "Dados invalidos.",
  "errors": []
}
```

Essa padronização facilita o consumo pelo React, chatbot e futuras integrações.

## Autenticacao e Autorizacao

O projeto deve considerar autenticação e autorização desde o início, mesmo que a implementação completa venha depois.

Direção inicial:

```txt
JWT
Roles
Policies
```

Perfis previstos:

```txt
Psicologo
Recepcionista
Paciente
Administrador
```

A autorização será importante porque nem todo usuário poderá acessar dados clínicos.

Exemplo:

- recepcionista pode acessar agenda e cadastro administrativo;
- recepcionista não pode acessar registros clínicos;
- psicólogo pode acessar registros clínicos dos seus pacientes;
- paciente não pode acessar anotações internas.

## Separacao Entre Dados Administrativos e Clinicos

Desde o início, o back-end deve respeitar a separação entre dados administrativos e dados clínicos.

Dados administrativos:

- nome do paciente;
- telefone;
- e-mail;
- agenda;
- pagamentos;
- status de consulta.

Dados clínicos:

- registro de sessão;
- evolução;
- observações internas;
- encaminhamentos;
- histórico psicológico.

Essa separação deve influenciar:

- Models;
- DTOs;
- Services;
- permissões;
- endpoints;
- respostas da API.

## Auditoria

O sistema deve ser preparado para auditoria.

Ações importantes devem futuramente gerar logs, como:

- criação de paciente;
- edição de paciente;
- criação de agendamento;
- cancelamento de consulta;
- registro de sessão;
- edição de registro clínico;
- alteração de pagamento;
- login;
- tentativa de acesso negada.

Model previsto:

```txt
LogAuditoria
```

Campos possíveis:

- id;
- usuário responsável;
- data e hora;
- tipo da ação;
- entidade afetada;
- descrição;
- endereço IP.

## Regras Para Dados Clinicos

Registros clínicos devem ser tratados com cuidado.

Diretrizes:

- não expor dados clínicos em endpoints administrativos;
- não permitir exclusão definitiva simples;
- registrar alterações importantes;
- controlar acesso por perfil;
- evitar retorno de informações clínicas para usuários sem permissão.

## Padroes de Codigo

### Controllers

Controllers devem ser finos.

Eles devem:

- receber request;
- chamar service;
- retornar response.

Evitar:

- regra de negócio pesada;
- consultas EF Core complexas diretamente no controller;
- montagem manual repetida de respostas;
- validações longas dentro do controller.

### Services

Services concentram a lógica da aplicação.

Eles devem:

- validar regras de negócio;
- consultar e persistir dados via EF Core;
- transformar Models em DTOs de resposta;
- garantir regras de segurança e consistência.

### Models

Models representam dados internos persistidos pelo EF Core.

Não devem ser usados automaticamente como retorno público da API.

Toda propriedade com texto de pessoa (nome, contato, observação, mensagem) leva `[Cifrado]` e é gravada cifrada pelo
`AppDbContext`. Não dá para filtrar nem ordenar por ela no SQL; ver "Cifra em camadas" em
`docs/03-modelagem/04-seguranca-privacidade.md`.

### DTOs

DTOs representam contratos externos.

Eles devem ser pensados para quem consome a API.

### EF Core

O EF Core será usado de forma direta e controlada.

No início, os Services podem usar o `AppDbContext` diretamente.

Repositories não serão criados automaticamente, para evitar abstração desnecessária.

Se surgirem consultas muito repetidas ou regras de persistência complexas, podemos reavaliar.

## O Que Nao Usar no Inicio

Para manter o projeto organizado sem excesso de arquitetura, não usar no início:

```txt
Clean Architecture
CQRS
MediatR
Repository Pattern obrigatorio
Unit of Work manual
Microservices
Event Sourcing
DDD pesado
```

Esses padrões podem ser úteis em alguns cenários, mas não são necessários para a primeira fase do Vínculo.

## Redis e Estado Temporario Distribuido

O Redis faz parte da stack obrigatoria do back-end.

Usar Redis para:

- tentativas de login e bloqueios temporarios;
- tokens de recuperacao de senha com expiracao e uso unico;
- refresh tokens e revogacao de sessoes;
- chaveiro compartilhado do ASP.NET Core Data Protection;
- cache distribuido quando houver ganho real;
- rate limiting distribuido em fluxos sensiveis.

Nao usar Redis como fonte principal de dados duraveis do consultorio. Contas, usuarios, pacientes, prontuarios, documentos, auditoria e configuracoes permanecem no SQL Server.

Em ambiente `Development`, enquanto o produto ainda esta em construcao local, a API pode usar uma implementacao em memoria para esse estado temporario quando `ConnectionStrings:Redis` nao estiver configurada. Esse fallback existe apenas para ergonomia de desenvolvimento e nao deve ser usado em homologacao ou producao.

Em ambientes fora de `Development`, ausencia de Redis configurado deve impedir a inicializacao da API.

## Regra de Negocio no Back-end

Toda regra de negocio, seguranca, autorizacao e validacao de dominio deve ser executada no back-end.

O front-end pode validar formato e campos obrigatorios para melhorar a experiencia, mas nao pode decidir:

- se uma conta pode ser criada;
- se um CRP ou e-mail esta disponivel;
- qual conta o usuario acessa;
- se o usuario esta bloqueado;
- se uma senha ou token e valido;
- quais permissoes ou modulos estao ativos;
- se uma operacao clinica ou administrativa pode ser concluida.

O front-end nao deve simular sucesso para operacoes que dependem da API.

## Decisao Atual

A stack oficial do back-end do Vínculo será:

```txt
ASP.NET Core Web API + Controllers + EF Core + SQL Server
```

A arquitetura oficial inicial será:

```txt
Controllers -> Services -> EF Core / AppDbContext -> SQL Server
```

Com:

- Models para entidades do EF Core;
- DTOs para contratos da API;
- Services para regras de negócio;
- Controllers para endpoints HTTP;
- Swagger/OpenAPI para documentação;
- versionamento de rotas;
- preparação para autenticação, autorização e auditoria;
- operacao SaaS com isolamento por conta.

Essa abordagem busca equilibrar:

- profissionalismo;
- simplicidade;
- manutenção;
- clareza;
- facilidade de consumo por outros clientes;
- crescimento futuro sem excesso de complexidade inicial;
- capacidade de vender o produto como SaaS multi-conta sem criar um projeto separado por psicologo.
