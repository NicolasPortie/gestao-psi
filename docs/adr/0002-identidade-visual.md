# 0002. Identidade visual: nome Vínculo, verde-musgo sobre porcelana e o azulejo como módulo

- Estado: aceita (a decisão de nome foi substituída pela [ADR 0004](0004-renomear-para-psique.md))
- Data: 12 de outubro de 2026
- Substitui: a direção visual inicial da [ADR 0001](0001-reestruturacao-do-frontend.md)

## Contexto

A primeira reestruturação entregou um sistema de design consistente, mas a identidade não servia ao produto:

- o nome "GestãoPsi" descrevia a categoria (gestão + psicologia) sem dizer nada do ofício;
- o símbolo (a letra psi com uma bolha) e as imagens da tela de acesso eram abstratos e sem relação com o consultório;
- a paleta petróleo, e depois uma segunda tentativa em cobalto saturado com tema escuro azul-marinho e uma parede de azulejos colorida no login, pareceram frias, vibrantes e de banco, não de uma ferramenta que o psicólogo e a equipe abrem o dia inteiro.

O feedback do usuário fixou os critérios: fundo branco, tema escuro opcional, uma cor que represente o sistema, nada genérico, nome com sentido para psicólogos, e **nada de arte abstrata na tela de acesso**. Numa rodada seguinte ele pediu, no lugar, **fotos que remetam ao psicólogo e ao ambiente**.

## Decisão

1. **Nome: Vínculo.** É o conceito central da clínica (vínculo terapêutico) e descreve o que o produto cuida: a relação contínua entre psicólogo e paciente, e entre o consultório e sua equipe. O nome fica em `frontend/src/app/core/marca.ts`; trocar ali troca a interface inteira. Nomes técnicos internos (`GestaoPsi` em pastas, namespaces, banco, cookies e chaves) permanecem para não quebrar migrações, dados e integrações.
2. **Cor: verde-musgo sobre porcelana branca.** O verde é a cor internacional da conscientização em saúde mental; em tom fechado e sóbrio, não em menta. Ambar para atenção, tijolo para erro e pinho para concluído. Tema escuro em grafite quente com um sopro de verde, sem azul. Tudo em papéis semânticos OKLCH, com contraste medido nos dois temas.
3. **Tipografia: Jost nos títulos e na marca, Atkinson Hyperlegible Next no texto.** A primeira é geométrica de herança modernista; a segunda foi desenhada para a leitura sem esforço, o que serve a uma equipe que lê o dia inteiro e ao critério de acessibilidade do produto.
4. **Marca: o azulejo como módulo.** Referência aos painéis modulares de Athos Bulcão. O símbolo é um azulejo musgo com duas metades de um semicírculo (porcelana e ocre) que se encontram: o vínculo entre duas pessoas. As marcas de estado são o mesmo azulejo em um ponto do preenchimento (contorno, quarto de círculo, cheio, cheio com check). O módulo aparece só onde tem função.
5. **Tela de acesso com foto de ambiente.** Formulário à esquerda e, no desktop, uma fotografia real de consultório (duas poltronas frente a frente, relógio, luz natural), sem pessoas, com a promessa do produto e a sequência de estados abaixo dela, nunca sobre ela. No celular, uma faixa da mesma foto. Origem, licença e como trocar estão em `docs/04-ux/imagens.md`. Ilustração, padrão e arte abstrata continuam fora.

## Alternativas consideradas

- **Presença** como nome: recusado pelo usuário por não ter sentido para um sistema de psicólogos.
- **Manter GestãoPsi**: nome descritivo, sem identidade.
- **Cobalto e parede de azulejos coloridos**: coerente como conceito, mas vibrante demais para uma ferramenta de uso diário e associada a banco; foi construído, avaliado e descartado.
- **A hora de cinquenta minutos** (mostrador de relógio, preto, branco e vermelho): austero e suíço demais para um consultório.
- **Padrão da categoria** (verde-água, cartões arredondados, métricas): é o genérico que o usuário quer evitar.

## Consequências

- Qualquer nova tela herda a calma: sem ilustrações nem padrões, sem cores saturadas, no máximo uma ação primária. Fotografia só de ambiente, sem pessoas, e só no acesso.
- O acento verde não deve ser usado para estados de "concluído": para isso existe o pinho, com marca de check.
- O ocre vive só na marca; não é cor de interface.
- Se o nome mudar de novo, os pontos de troca são `core/marca.ts`, `index.html`, `public/favicon.svg` (e os ícones derivados), `appsettings.json` (nome do remetente de e-mail) e os documentos.
- Dependência trocada: sai `@fontsource-variable/hanken-grotesk`, entram `@fontsource-variable/jost` e `@fontsource-variable/atkinson-hyperlegible-next`.
- Antes de operar comercialmente, o nome precisa de busca de anterioridade no INPI e de verificação de domínio; este registro não faz essa checagem.

## Adendo — 14 de outubro de 2026

A composição de acesso do item 5 foi revisada após avaliação do usuário: a imagem anterior não remetia ao consultório esperado; a promessa do produto e a sequência decorativa de estados também foram rejeitadas. O histórico acima registra a decisão original; este adendo descreve o acesso atual.

- A imagem é agora uma foto de ambiente de consultório criada para o Vínculo, sem pessoas. Origem e termos de uso estão em [`docs/04-ux/imagens.md`](../04-ux/imagens.md); não representa um consultório real.
- Um cabeçalho comum reúne a marca e o menu de aparência. No desktop, a foto fica à esquerda e o formulário à direita, em proporção 7:5; no celular, a sequência é marca, faixa de foto e formulário. Não há promessa promocional, estados decorativos ou texto sobre a imagem.
- O formulário usa o título "Acessar meu consultório", controles de 48 px e links com alvos de pelo menos 44 px. Links legais ficam no rodapé.
- Movimento curto apresenta o encontro das metades da marca, o recorte da foto e os grupos do formulário, uma única vez e sem impedir o uso. A preferência por movimento reduzido remove essas animações.

Permanecem nome, símbolo, paleta, fontes, tokens e stack existentes. O escopo desta etapa é o login como referência antes de avaliar as telas internas; não é uma substituição da identidade visual.
