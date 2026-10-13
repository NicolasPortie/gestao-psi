# 0002. Identidade visual: nome Vínculo, verde-musgo sobre porcelana e o azulejo como módulo

- Estado: aceita
- Data: 12 de outubro de 2026
- Substitui: a direção visual inicial da [ADR 0001](0001-reestruturacao-do-frontend.md)

## Contexto

A primeira reestruturação entregou um sistema de design consistente, mas a identidade não servia ao produto:

- o nome "GestãoPsi" descrevia a categoria (gestão + psicologia) sem dizer nada do ofício;
- o símbolo (a letra psi com uma bolha) e as imagens da tela de acesso eram abstratos e sem relação com o consultório;
- a paleta petróleo, e depois uma segunda tentativa em cobalto saturado com tema escuro azul-marinho e uma parede de azulejos colorida no login, pareceram frias, vibrantes e de banco, não de uma ferramenta que o psicólogo e a equipe abrem o dia inteiro.

O feedback do usuário fixou os critérios: fundo branco, tema escuro opcional, uma cor que represente o sistema, nada genérico, nome com sentido para psicólogos, e **nada de decoração na tela de acesso**.

## Decisão

1. **Nome: Vínculo.** É o conceito central da clínica (vínculo terapêutico) e descreve o que o produto cuida: a relação contínua entre psicólogo e paciente, e entre o consultório e sua equipe. O nome fica em `frontend/src/app/core/marca.ts`; trocar ali troca a interface inteira. Nomes técnicos internos (`GestaoPsi` em pastas, namespaces, banco, cookies e chaves) permanecem para não quebrar migrações, dados e integrações.
2. **Cor: verde-musgo sobre porcelana branca.** O verde é a cor internacional da conscientização em saúde mental; em tom fechado e sóbrio, não em menta. Ambar para atenção, tijolo para erro e pinho para concluído. Tema escuro em grafite quente com um sopro de verde, sem azul. Tudo em papéis semânticos OKLCH, com contraste medido nos dois temas.
3. **Tipografia: Jost nos títulos e na marca, Atkinson Hyperlegible Next no texto.** A primeira é geométrica de herança modernista; a segunda foi desenhada para a leitura sem esforço, o que serve a uma equipe que lê o dia inteiro e ao critério de acessibilidade do produto.
4. **Marca: o azulejo como módulo.** Referência aos painéis modulares de Athos Bulcão. O símbolo é um azulejo musgo com duas metades de um semicírculo (porcelana e ocre) que se encontram: o vínculo entre duas pessoas. As marcas de estado são o mesmo azulejo em um ponto do preenchimento (contorno, quarto de círculo, cheio, cheio com check). O módulo aparece só onde tem função.
5. **Tela de acesso sem imagem.** Formulário, marca e promessa em texto, mais a sequência de estados de uma consulta. A arte do produto é a marca.

## Alternativas consideradas

- **Presença** como nome: recusado pelo usuário por não ter sentido para um sistema de psicólogos.
- **Manter GestãoPsi**: nome descritivo, sem identidade.
- **Cobalto e parede de azulejos coloridos**: coerente como conceito, mas vibrante demais para uma ferramenta de uso diário e associada a banco; foi construído, avaliado e descartado.
- **A hora de cinquenta minutos** (mostrador de relógio, preto, branco e vermelho): austero e suíço demais para um consultório.
- **Padrão da categoria** (verde-água, cartões arredondados, métricas): é o genérico que o usuário quer evitar.

## Consequências

- Qualquer nova tela herda a calma: sem imagens decorativas, sem cores saturadas, no máximo uma ação primária.
- O acento verde não deve ser usado para estados de "concluído": para isso existe o pinho, com marca de check.
- O ocre vive só na marca; não é cor de interface.
- Se o nome mudar de novo, os pontos de troca são `core/marca.ts`, `index.html`, `public/favicon.svg` (e os ícones derivados), `appsettings.json` (nome do remetente de e-mail) e os documentos.
- Dependência trocada: sai `@fontsource-variable/hanken-grotesk`, entram `@fontsource-variable/jost` e `@fontsource-variable/atkinson-hyperlegible-next`.
- Antes de operar comercialmente, o nome precisa de busca de anterioridade no INPI e de verificação de domínio; este registro não faz essa checagem.
