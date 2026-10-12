---
name: GestãoPsi
description: Folha de respostas psicométrica, ferramenta de trabalho precisa para a rotina de consultórios de psicologia.
colors:
  paper: "#f9fcfc"
  rail: "#eef3f5"
  field: "#fdffff"
  hover: "#eaf1f2"
  selected: "#daf2f7"
  line: "#dde4e6"
  line-strong: "#7d888b"
  ink: "#121d27"
  ink-muted: "#4b575f"
  ink-faint: "#59656c"
  accent: "#0c606d"
  accent-hover: "#00525f"
  accent-ink: "#005261"
  accent-wash: "#e0f4f9"
  on-accent: "#f9fcfd"
  focus: "#008093"
  danger: "#be2323"
  danger-ink: "#a21a1b"
  danger-wash: "#ffeeea"
  warning: "#bb7400"
  warning-ink: "#6f4606"
  warning-wash: "#fff4d7"
  success: "#187c49"
  success-ink: "#035a31"
  success-wash: "#e5faeb"
typography:
  title:
    fontFamily: "Hanken Grotesk Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  section:
    fontFamily: "Hanken Grotesk Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "Hanken Grotesk Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.57
  label:
    fontFamily: "Hanken Grotesk Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.38
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
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

# Design System: GestãoPsi

## Overview

**Estrela do norte criativa: "a folha de respostas"**

Uma ferramenta de trabalho para quem passa o dia organizando pessoas, horários e registros. A referência visual é a folha de leitura óptica dos testes psicométricos: papel frio quase sem croma, tinta azul-grafite, linhas de régua em petróleo claro e **marcas desenhadas** (anel, meio, cheio, check, riscado, seta) no lugar de selos coloridos. O estado de uma consulta, de um pagamento ou de um lembrete é sempre uma marca com texto, nunca só uma cor.

A interface é plana, tipográfica e moderadamente densa. Listas e tabelas são réguas de linhas finas; não há grade de cartões, métricas gigantes nem faixas laterais coloridas. Cada tela tem, no máximo, uma ação primária preenchida.

Rejeita: template SaaS genérico, estética hospitalar literal, decoração terapêutica, qualquer sinal de painel multi-clínica.

**Características-chave:**

- trilho lateral recolhível no desktop e navegação inferior no celular, com a mesma informação em ambos;
- superfícies em papel frio tingido, nunca branco nem preto puros;
- um único acento petróleo, mais uma "tinta de correção" vermelha reservada a atenção e erro;
- uma só família tipográfica (Hanken Grotesk), hierarquia por peso e espaço;
- movimento curto (120–300 ms), `ease-out` forte, removível com `prefers-reduced-motion`;
- tema claro e escuro com os mesmos papéis semânticos.

## Colors

Cores em OKLCH, declaradas como papéis semânticos em `frontend/src/app/styles/tokens.css`. Componentes só leem papéis (`bg-paper`, `text-ink`, `border-line`), nunca valores literais. Todos os pares de texto foram medidos com contraste WCAG (AA no mínimo, AAA no texto principal).

### Primary

- **Petróleo** (`accent`): ação primária, seleção atual, foco e confirmações. `accent-ink` para texto e links, `accent-wash` para fundos de seleção suave.

### Semânticas

- **Tinta de correção** (`danger`): erro, ação destrutiva e atenção alta.
- **Âmbar** (`warning`): pendências que pedem atenção sem urgência.
- **Verde** (`success`): conclusão e confirmação positiva. Sempre acompanhado de marca e texto.

### Neutral

- **Papel** (`paper`), **trilho** (`rail`), **campo** (`field`): três níveis de superfície com diferença de tom, não de sombra.
- **Tinta** (`ink`, `ink-muted`, `ink-faint`): três níveis de texto, todos acima de 4,5:1.
- **Régua** (`line`, `line-strong`): `line` separa linhas de lista; `line-strong` contorna controles e passa 3:1.

**A regra da voz única.** O acento ocupa no máximo 10% da tela; a raridade comunica prioridade. No tema escuro, o acento é um azul-petróleo suavizado (não ciano saturado).

## Typography

**Família única:** Hanken Grotesk Variable, com Segoe UI e system-ui de reserva.

**Caráter:** sans humanista e neutra, legível em dados, formulários e navegação, com numerais tabulares (`.num`) onde há valores, horas e datas.

### Escala curta e fixa

- **Título** (600, 1,5 rem): título da página. Um por tela.
- **Seção** (600, 1 rem): agrupamentos dentro da página.
- **Corpo** (400, 0,875 rem, entrelinha 1,57): conteúdo e instruções; prosa limitada a 60 caracteres por linha.
- **Rótulo** (500, 0,8125 rem): campos, cabeçalhos de coluna, navegação.

**A regra da hierarquia silenciosa.** Peso e espaço criam estrutura. Nada de rótulos em caixa alta com espaçamento, nem números gigantes decorativos.

## Elevation

Plano por padrão. A separação vem de tom e régua. Sombra só em superfícies que flutuam (menus, diálogos, gavetas, toasts), sempre como anel de 1 px mais sustentação e ambiente.

## Components

Os primitivos vivem em `frontend/src/app/components/ui/` e seguem o vocabulário em português do projeto.

### Botão (`Botao`, `BotaoLink`)

- 36 px de altura (44 px em ponteiro de toque), raio de 8 px, `scale(0.96)` ao pressionar.
- Cinco variantes: primário, secundário, discreto, perigo e perigo discreto. Uma única primária por visão.
- Carregando: spinner no lugar do conteúdo, largura preservada, `aria-busy`.

### Campo (`Campo`, `Entrada`, `Selecao`, `AreaTexto`)

- Rótulo sempre visível e associado; dica e erro por `aria-describedby`; "opcional" indicado em texto.
- 36 px de altura, borda `line-strong`, foco com anel petróleo sem deslocar layout.
- Busca de paciente por servidor (`SeletorPaciente`, combobox), sem limite fixo de itens.

### Marca de estado (`MarcaEstado`, `EstadoRotulado`)

Oito formas SVG: anel, meio, cheio, check, riscado, seta, x e ponto. Cada estado de domínio mapeia forma + tom + rótulo em `*.rotulos.ts` da própria feature. A cor nunca é o único portador de significado.

### Tabela e lista (`Tabela`, `ListaRegulada`)

- Sem moldura externa, linhas separadas por régua, linha inteira clicável por um único link.
- Colunas secundárias somem por breakpoint (`ocultarAte`); no celular nada força rolagem horizontal (verificado nos testes de ponta a ponta).

### Sobreposições (`Dialogo`, `Gaveta`, `Confirmacao`, `MenuAcoes`, `Dica`)

Base UI como camada sem estilo, com foco preso, `Esc`, retorno de foco e portal. Gaveta lateral para criar e editar; diálogo de confirmação com texto da consequência para ações destrutivas.

### Navegação

Trilho lateral recolhível (desktop, `lg+`) com grupos Rotina, Comunicação, Clínico e Consultório. No celular, barra inferior com quatro destinos mais "Mais". Configurações é um hub com subnavegação lateral (faixa rolável no celular). A marca e o sino de notificações ficam no topo; o tema é escolhido no menu do usuário.

### Feedback

- Toasts (Sonner) para confirmação transitória; avisos em linha para erro que bloqueia.
- Todo carregamento usa esqueleto na forma do conteúdo; todo vazio explica o próximo passo; todo erro oferece "Tentar novamente".

## Do's and Don'ts

### Do:

- **Do** usar padrões familiares, rótulos diretos e os quatro estados: carregando, vazio, erro e sucesso.
- **Do** mostrar o estado como marca + texto.
- **Do** manter dados administrativos e clínicos visualmente separados e nunca expor conteúdo clínico em listas ou painéis.
- **Do** manter alvos de toque de 44 px, foco visível, navegação completa por teclado e `prefers-reduced-motion`.
- **Do** escrever rótulos em português do Brasil com acentuação correta.

### Don't:

- **Don't** criar aparência de landing page, métricas heroicas ou grade de cartões idênticos.
- **Don't** usar faixas laterais coloridas, texto em gradiente, glassmorphism ou ciano neon.
- **Don't** animar propriedades de layout (largura, altura, margem); use transform, opacidade, `clip-path` ou grid.
- **Don't** usar mais de uma ação primária preenchida na mesma visão.
- **Don't** sugerir multi-clínica, troca de profissional ou painel compartilhado.
- **Don't** simular sucesso no cliente: o resultado de toda operação vem da API.
