---
name: Vínculo
description: Ferramenta de trabalho calma para o psicólogo e a equipe do consultório, em verde-musgo sobre porcelana, com o azulejo como módulo.
colors:
  paper: "#fdfdfb"
  rail: "#f2f6f1"
  field: "#ffffff"
  hover: "#eef2ed"
  selected: "#dbeede"
  line: "#dee3de"
  line-strong: "#7c837a"
  ink: "#1b211c"
  ink-muted: "#515b53"
  ink-faint: "#5d665e"
  accent: "#23593d"
  accent-hover: "#184b31"
  accent-ink: "#164e33"
  accent-wash: "#e5f5e7"
  on-accent: "#f9fdfa"
  focus: "#2b7a52"
  ocre: "#dcaf61"
  danger: "#a83825"
  danger-ink: "#932d1c"
  danger-wash: "#ffeee7"
  warning: "#b97a13"
  warning-ink: "#694414"
  warning-wash: "#fff6d9"
  success: "#006f55"
  success-ink: "#00503c"
  success-wash: "#e4f9f1"
typography:
  title:
    fontFamily: "Jost Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  section:
    fontFamily: "Jost Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "Atkinson Hyperlegible Next Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.57
  label:
    fontFamily: "Atkinson Hyperlegible Next Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.38
rounded:
  sm: "4px"
  md: "6px"
  lg: "10px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.md}"
    height: "36px"
    padding: "0 14px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.on-accent}"
  button-secondary:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "36px"
  input:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "36px"
---

# Design System: Vínculo

## Overview

**Estrela do norte criativa: "o azulejo como módulo"**

Uma ferramenta de trabalho para o psicólogo e para quem trabalha com ele, aberta o dia inteiro. Por isso é calma: fundo de porcelana branca, texto em grafite quente, um único verde-musgo para o que é ação, e nenhuma decoração que dispute atenção com a rotina. A marca tem origem nos painéis de azulejo modulares (Athos Bulcão): um módulo simples, repetido e combinado. Aqui o módulo vive só onde tem função, na marca e nas marcas de estado, em que cada coisa é o mesmo azulejo em um ponto do preenchimento.

O nome, **Vínculo**, é o conceito central da clínica. O símbolo é um azulejo com duas metades de um semicírculo, porcelana e ocre, que se encontram no meio: o vínculo entre duas pessoas.

A interface é plana, tipográfica e moderadamente densa. Listas e tabelas são réguas de linhas finas; não há grade de cartões, métricas gigantes, faixas laterais coloridas, ilustrações nem padrões decorativos. A única imagem é uma fotografia de ambiente de consultório (duas poltronas frente a frente, luz natural) na tela de acesso, sem pessoas e sem texto por cima; ver `docs/04-ux/imagens.md`.

Rejeita: azul saturado e padrões vibrantes (parecem banco ou jogo, não consultório), estética hospitalar, ícones terapêuticos literais (folha, cérebro, psi), template SaaS genérico e qualquer sinal de painel multi-clínica.

**Características-chave:**

- trilho lateral recolhível no desktop e navegação inferior no celular, com a mesma informação em ambos;
- fundo de porcelana branca; no tema escuro, grafite quente com um sopro de verde, sem azul;
- um único acento verde-musgo, mais ambar para atenção, tijolo para erro e pinho para concluído;
- dois tipos: Jost nos títulos e na marca, Atkinson Hyperlegible Next no texto;
- movimento curto (120–300 ms), `ease-out` forte, removível com `prefers-reduced-motion`.

## Colors

Cores em OKLCH, declaradas como papéis semânticos em `frontend/src/app/styles/tokens.css`. Componentes só leem papéis (`bg-paper`, `text-ink`, `border-line`), nunca valores literais. Todos os pares de texto são medidos por `npm run contraste` (AA no mínimo, AAA no texto principal), nos dois temas.

### Primary

- **Verde-musgo** (`accent`): ação primária, seleção atual, foco e o estado "confirmada". O verde é a cor internacional da saúde mental; aqui aparece fechado e sóbrio, nunca em tom de menta ou de "saúde". `accent-ink` para texto e links, `accent-wash` para fundos de seleção suave.

### Semânticas

- **Tijolo** (`danger`): erro, ação destrutiva e atenção alta.
- **Âmbar** (`warning`): pendências que pedem atenção sem urgência.
- **Pinho** (`success`): concluído, mais fundo que o acento para a marca de check se distinguir. Sempre com marca e texto.
- **Ocre** (`ocre`): só na marca, nunca como cor de interface.

### Neutral

- **Porcelana** (`paper`), **trilho** (`rail`), **campo** (`field`): três níveis de superfície com diferença de tom, não de sombra.
- **Grafite** (`ink`, `ink-muted`, `ink-faint`): três níveis de texto, todos acima de 4,5:1.
- **Régua** (`line`, `line-strong`): `line` separa linhas de lista; `line-strong` contorna controles e passa 3:1.

**A regra da voz única.** O acento ocupa no máximo 10% da tela; a raridade comunica prioridade.

## Typography

**Títulos e marca:** Jost Variable, geométrica de herança modernista, par dos módulos do azulejo.
**Texto:** Atkinson Hyperlegible Next Variable, desenhada para a leitura sem esforço, em listas, formulários e navegação. Numerais tabulares (`.num`) onde há valores, horas e datas.

### Escala curta e fixa

- **Título** (Jost 600, 1,5 rem): título da página. Um por tela.
- **Seção** (Jost 600, 1 rem): agrupamentos dentro da página.
- **Corpo** (Atkinson 400, 0,875 rem, entrelinha 1,57): conteúdo e instruções; prosa limitada a 60 caracteres por linha.
- **Rótulo** (Atkinson 500, 0,8125 rem): campos, cabeçalhos de coluna, navegação.

**A regra da hierarquia silenciosa.** Peso e espaço criam estrutura. Nada de rótulos em caixa alta com espaçamento, nem números gigantes decorativos.

## Elevation

Plano por padrão. A separação vem de tom e régua. Sombra só em superfícies que flutuam (menus, diálogos, gavetas, toasts), sempre como anel de 1 px mais sustentação e ambiente.

## Components

Os primitivos vivem em `frontend/src/app/components/ui/` e seguem o vocabulário em português do projeto.

### Botão (`Botao`, `BotaoLink`)

- 36 px de altura (44 px em ponteiro de toque), cantos de 6 px, `scale(0.96)` ao pressionar.
- Cinco variantes: primário, secundário, discreto, perigo e perigo discreto. Uma única primária por visão.
- Carregando: spinner no lugar do conteúdo, largura preservada, `aria-busy`.

### Campo (`Campo`, `Entrada`, `Selecao`, `AreaTexto`)

- Rótulo sempre visível e associado; dica e erro por `aria-describedby`; "opcional" indicado em texto.
- 36 px de altura, borda `line-strong`, foco com anel verde sem deslocar layout.
- Busca de paciente por servidor (`SeletorPaciente`, combobox), sem limite fixo de itens.

### Marca de estado (`MarcaEstado`, `EstadoRotulado`)

Oito formas SVG, todas o mesmo azulejo de 16 px: contorno com arco (agendada), quarto de círculo preenchido (aguardando), cheio (confirmada), cheio com check (realizada), contorno riscado (cancelada), contorno com seta (remarcada), cheio com x (não compareceu) e módulo pequeno (ponto). Cada estado de domínio mapeia forma + tom + rótulo em `*.rotulos.ts` da própria feature. A cor nunca é o único portador de significado.

### Marca (`Marca`, `SimboloMarca`)

Azulejo musgo com semicírculo em duas metades (porcelana e ocre) e a palavra "vínculo" em Jost. As cores vêm dos tokens `--marca-*`, então a marca acompanha o tema. A fonte da verdade do símbolo é `frontend/public/favicon.svg`; os ícones raster saem dele.

### Tabela e lista (`Tabela`, `ListaRegulada`)

- Sem moldura externa, linhas separadas por régua, linha inteira clicável por um único link.
- Colunas secundárias somem por breakpoint (`ocultarAte`); no celular nada força rolagem horizontal (verificado nos testes de ponta a ponta).

### Sobreposições (`Dialogo`, `Gaveta`, `Confirmacao`, `MenuAcoes`, `Dica`)

Base UI como camada sem estilo, com foco preso, `Esc`, retorno de foco e portal. Gaveta lateral para criar e editar; diálogo de confirmação com texto da consequência para ações destrutivas.

### Navegação

Trilho lateral recolhível (desktop, `lg+`) com grupos Rotina, Comunicação, Clínico e Consultório. No celular, barra inferior com quatro destinos mais "Mais". Configurações é um hub com subnavegação lateral (faixa rolável no celular). A marca e o sino de notificações ficam no topo; o tema é escolhido no menu do usuário.

### Feedback

- Toasts (Sonner) para confirmação transitória; avisos em linha para erro que bloqueia.
- Todo carregamento usa esqueleto na forma do conteúdo; todo vazio explica o próximo passo num azulejo ainda por preencher; todo erro oferece "Tentar novamente".

## Do's and Don'ts

### Do:

- **Do** usar padrões familiares, rótulos diretos e os quatro estados: carregando, vazio, erro e sucesso.
- **Do** mostrar o estado como marca + texto.
- **Do** manter dados administrativos e clínicos visualmente separados e nunca expor conteúdo clínico em listas ou painéis.
- **Do** pensar na recepção tanto quanto no psicólogo: a mesma tela é lida por quem agenda e por quem atende.
- **Do** manter alvos de toque de 44 px, foco visível, navegação completa por teclado e `prefers-reduced-motion`.
- **Do** escrever rótulos em português do Brasil com acentuação correta.

### Don't:

- **Don't** usar ilustrações, padrões vibrantes ou azul saturado; a ferramenta é calma. A única imagem é a foto de ambiente do login: sem pessoas, tons neutros e quentes, sem texto sobre ela.
- **Don't** criar aparência de landing page, métricas heroicas ou grade de cartões idênticos.
- **Don't** usar faixas laterais coloridas, texto em gradiente, glassmorphism ou ciano neon.
- **Don't** animar propriedades de layout (largura, altura, margem); use transform, opacidade, `clip-path` ou grid.
- **Don't** usar mais de uma ação primária preenchida na mesma visão.
- **Don't** sugerir multi-clínica, troca de profissional ou painel compartilhado.
- **Don't** simular sucesso no cliente: o resultado de toda operação vem da API.
