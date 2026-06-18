# Stack e Arquitetura do Front-end

## Objetivo

Este documento define a stack inicial e a arquitetura do front-end do projeto GestãoPsi.

O objetivo é criar uma base profissional, moderna e organizada, usando Angular como framework principal e mantendo uma estrutura simples o suficiente para o início do projeto, mas preparada para crescer.

As regras de nomenclatura do projeto estão definidas em `CONVENCOES_NOMENCLATURA.md`.

No front-end, nomes relacionados ao domínio do sistema devem ser escritos em português do Brasil. Inglês deve ser usado apenas quando for padrão técnico do Angular, TypeScript, bibliotecas ou arquivos de configuração.

O GestaoPsi sera desenvolvido como um produto SaaS multi-conta.

Na experiencia do front-end, cada psicologo acessa sua propria conta, como se fosse o sistema individual do seu consultorio.

Portanto:

- o front-end deve operar sempre dentro da conta autenticada;
- nao deve existir selecao de profissional ou contexto multi-clinica no MVP;
- configuracoes do psicologo sao configuracoes da conta atual;
- modulos podem aparecer ou ficar ocultos conforme plano/configuracao da conta;
- textos e fluxos devem reforcar a sensacao de consultorio proprio, nao de painel compartilhado com outros profissionais.

O produto sera comercializado como SaaS, mas a interface de dominio deve continuar focada na conta do psicologo autenticado.

## Stack Definida

### Framework

```txt
Angular
```

O Angular será usado como framework principal do front-end.

Ele foi escolhido por ser uma solução completa, opinativa e adequada para sistemas administrativos, com suporte nativo a rotas, formulários, serviços, injeção de dependência, interceptors, guards e organização modular.

### Linguagem

```txt
TypeScript
```

O TypeScript será usado em todo o front-end, seguindo o padrão do Angular.

### Componentes

```txt
Standalone Components
```

O projeto deve usar componentes standalone, que são o padrão moderno do Angular para aplicações novas.

Não devemos estruturar o projeto em torno de `NgModule`, exceto se alguma biblioteca ou necessidade específica exigir.

### Roteamento

```txt
Angular Router
```

O roteamento será feito com o roteador oficial do Angular.

Rotas esperadas no futuro:

```txt
/login
/painel
/pacientes
/agenda
/consultas
/sessoes
/pagamentos
/lista-espera
/relatorios
/integracoes/whatsapp
/configuracoes
```

### Formulários

```txt
Reactive Forms
```

Os formulários devem ser criados com Reactive Forms.

Essa escolha é importante porque o sistema terá formulários com validações, regras e estados mais complexos, como cadastro de pacientes, agendamentos, login, registro de sessão e configurações da agenda.

### Comunicação com API

```txt
HttpClient
```

O Angular HttpClient será usado para comunicação com o back-end ASP.NET.

As chamadas HTTP devem ficar centralizadas em services por domínio.

Exemplos:

```txt
pacientes.service.ts
consultas.service.ts
autenticacao.service.ts
sessoes.service.ts
pagamentos.service.ts
agenda.service.ts
lista-espera.service.ts
integracoes-whatsapp.service.ts
```

### Estado da Aplicação

```txt
Signals + Services
```

O estado inicial do front-end deve ser controlado com Angular Signals e services.

Essa abordagem será usada para:

- usuário autenticado;
- estado de carregamento;
- filtros;
- dados de tela;
- seleção atual;
- estados simples compartilhados.

Não será usado NgRx no início.

NgRx ou NgRx SignalStore poderá ser avaliado futuramente caso o estado global fique realmente complexo.

### Biblioteca de UI

```txt
PrimeNG
```

O PrimeNG será usado como biblioteca principal de componentes visuais.

Ele foi escolhido por ser forte para sistemas administrativos e oferecer componentes úteis para o GestãoPsi, como:

- tabelas;
- formulários;
- calendário;
- datepicker;
- dialogs;
- dropdowns;
- menus;
- sidebar;
- toast;
- confirmação;
- tabs;
- inputs avançados.

### Ícones

```txt
PrimeIcons
```

Os ícones principais do sistema devem vir do PrimeIcons, mantendo consistência com o PrimeNG.

### Estilização

```txt
Tailwind CSS
SCSS
```

O projeto usará Tailwind CSS para layout, espaçamento, responsividade e acabamento visual.

O SCSS será usado de forma controlada para estilos globais, configurações base, pequenos overrides e casos onde utility classes não forem ideais.

### Integração entre PrimeNG e Tailwind

```txt
tailwindcss-primeui
```

O projeto deve usar a integração oficial entre PrimeNG e Tailwind por meio do `tailwindcss-primeui`.

Essa integração permite usar tokens visuais do PrimeNG em classes Tailwind, ajudando a manter consistência entre os componentes do PrimeNG e os layouts customizados.

## Responsabilidade de Cada Ferramenta

### PrimeNG

Usar PrimeNG para componentes complexos e interativos:

- tabelas;
- calendário;
- datepicker;
- dialog;
- dropdown;
- toast;
- confirmação;
- menu;
- sidebar;
- inputs avançados;
- tabs;
- componentes administrativos.

### Tailwind CSS

Usar Tailwind para:

- layout das telas;
- espaçamento;
- grids;
- flexbox;
- responsividade;
- alinhamento;
- composição visual;
- ajustes rápidos de interface;
- criação de componentes próprios simples.

### SCSS

Usar SCSS para:

- estilos globais;
- tema base;
- ajustes que se repetem em várias telas;
- overrides específicos do PrimeNG quando necessário;
- regras que ficariam ruins ou confusas como classes utilitárias.

Evitar criar muitos arquivos SCSS pequenos com estilos locais que poderiam ser resolvidos com Tailwind.

## Stack Final do Front-end

```txt
Angular
TypeScript
Standalone Components
Angular Router
Reactive Forms
HttpClient
PrimeNG
PrimeIcons
Tailwind CSS
tailwindcss-primeui
SCSS
Signals + Services
```

## O Que Nao Usar no Inicio

Para manter o projeto profissional sem adicionar complexidade antes da hora, não usar no início:

```txt
NgRx Store
Nx
SSR
Microfrontends
Angular Material
PrimeFlex
CSS solto sem padrão
```

Essas tecnologias podem ser avaliadas no futuro se houver necessidade real.

## Arquitetura do Front-end

A arquitetura será organizada por features, com separação clara entre core, shared, layout e módulos de negócio.

Estrutura sugerida:

```txt
frontend/
  src/
    app/
      core/
        api/
        autenticacao/
        guards/
        interceptors/
        services/
      shared/
        components/
        directives/
        pipes/
        models/
      layout/
        shell/
        sidebar/
        topbar/
    features/
      painel/
      pacientes/
      consultas/
      sessoes/
      pagamentos/
      agenda/
      lista-espera/
      lembretes/
      integracoes/
        whatsapp/
      relatorios/
      notificacoes/
      configuracoes/
      app.config.ts
      app.routes.ts
    styles/
      _tokens.scss
      _primeng-overrides.scss
      _base.scss
    styles.scss
```

## Responsabilidade das Pastas

### core

Contém recursos globais e estruturais da aplicação.

Exemplos:

- autenticação;
- guards de rota;
- interceptors HTTP;
- services globais;
- configuração de API;
- gerenciamento de sessão;
- tratamento global de erros.

Nada dentro de `core` deve depender de uma feature específica.

### shared

Contém recursos reutilizáveis e genéricos.

Exemplos:

- componentes compartilhados;
- pipes;
- directives;
- models comuns;
- helpers simples.

Itens em `shared` devem ser reaproveitáveis por várias features.

### layout

Contém a estrutura visual principal da aplicação autenticada.

Exemplos:

- shell principal;
- menu lateral;
- barra superior;
- estrutura de navegação;
- área principal de conteúdo.

### features

Contém as áreas de negócio do sistema.

Cada feature deve agrupar suas próprias páginas, componentes, models e services específicos.

Exemplo:

```txt
features/
  pacientes/
    pages/
      lista-pacientes/
      formulario-paciente/
      detalhes-paciente/
    components/
    services/
      pacientes.service.ts
    models/
      paciente.model.ts
    pacientes.routes.ts
```

## Features Iniciais Previstas

## Modulos e Planos no Front-end

Como o GestaoPsi sera vendido como SaaS, o front-end deve estar preparado para esconder, exibir ou limitar funcionalidades conforme os modulos ativos da conta.

No MVP, isso pode ser feito de forma simples, por configuracoes retornadas pela API.

Exemplos de modulos:

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

Regras para o front-end:

- nao hardcodar funcionalidades por cliente;
- menus devem considerar permissoes do usuario e modulos ativos;
- rotas de modulos inativos devem bloquear acesso de forma clara;
- telas devem diferenciar falta de permissao de modulo nao contratado/habilitado;
- recursos clinicos continuam protegidos por perfil, mesmo que o modulo esteja ativo;
- informacoes comerciais de plano nao devem se misturar com dados clinicos.

Essa preparacao permite evoluir para planos SaaS sem transformar o MVP em um painel multi-clinica.

### autenticacao

Responsável por login, logout, sessão e fluxo de autenticação.

### painel

Tela inicial do psicólogo após login.

Pode futuramente exibir resumo da agenda, próximos atendimentos, pendências e indicadores administrativos.

### pacientes

Cadastro e gerenciamento de pacientes.

### consultas

Agenda, horários, agendamentos, cancelamentos e remarcações.

### sessoes

Registro das sessões e histórico clínico.

Essa área deve receber atenção especial por lidar com dados sensíveis.

### pagamentos

Controle de pagamentos, status financeiro e histórico.

### agenda

Visualizacao e configuracao da agenda, horarios disponiveis e bloqueios.

### lista-espera

Controle dos pacientes aguardando horario disponivel.

### lembretes

Configuracao e acompanhamento de lembretes enviados aos pacientes.

### integracoes

Configuracoes e acompanhamento de integracoes externas, principalmente WhatsApp via Bridge.

### relatorios

Relatorios administrativos sobre consultas, pagamentos, pacientes, comparecimento e agenda.

### notificacoes

Notificacoes internas do painel, como falhas de lembrete, novos agendamentos e solicitacoes vindas do WhatsApp.

### configuracoes

Configurações do psicólogo, agenda, regras de atendimento, cancelamento, remarcação e lembretes.

## Padroes de Codigo

### Componentes

Componentes devem ser pequenos, focados e reutilizáveis quando fizer sentido.

Evitar componentes grandes demais concentrando regra, layout e integração com API ao mesmo tempo.

### Services

Services devem centralizar comunicação com API e regras simples relacionadas a dados de tela.

Controllers HTTP não existem no front-end, então os services funcionam como camada de comunicação entre componentes e back-end.

### Models

Models e interfaces devem representar os contratos usados pelo front-end.

Exemplo:

```ts
export interface Paciente {
  id: string;
  nomeCompleto: string;
  telefone?: string;
  email?: string;
  status: 'ativo' | 'inativo';
}
```

### Rotas

As rotas devem ser separadas por feature quando a área crescer.

Exemplo:

```txt
pacientes.routes.ts
consultas.routes.ts
sessoes.routes.ts
```

### Estado

Usar Signals para estado local e services para estado compartilhado simples.

Evitar criar gerenciamento global complexo antes de existir necessidade.

## Diretriz Visual

O sistema deve ter aparência profissional, moderna e adequada a um produto administrativo de saúde.

Direção visual:

- interface limpa;
- boa legibilidade;
- navegação clara;
- densidade moderada;
- cores sóbrias;
- estados visuais claros;
- componentes consistentes;
- foco em produtividade;
- evitar aparência de landing page ou site promocional.

O sistema deve parecer uma ferramenta de trabalho confiável, não uma página de marketing.

## Decisao Atual

A stack oficial do front-end do GestãoPsi será:

```txt
Angular + PrimeNG + Tailwind CSS + Reactive Forms + Signals
```

Essa escolha busca equilibrar:

- profissionalismo;
- produtividade;
- visual moderno;
- consistência;
- boa arquitetura;
- facilidade de manutenção;
- crescimento futuro do projeto;
- operacao SaaS com experiencia de consultorio individual por conta.
