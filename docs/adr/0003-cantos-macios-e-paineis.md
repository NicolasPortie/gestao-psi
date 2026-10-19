# 0003. Cantos macios, painéis claros e estados em pílula

- Estado: aceita
- Data: 18 de outubro de 2026
- Complementa: [ADR 0002](0002-identidade-visual.md) (nome, paleta e fontes continuam)

## Contexto

Numa revisão do app inteiro, o usuário achou a interface "quadradona". A análise confirmou: cantos de 4 a 6 px em tudo, marcas de estado quadradas em cada linha, telas feitas só de título e réguas, sem nenhum bloco que se destacasse, e corpo de texto em 14 px. O resultado lembrava um sistema administrativo, não uma ferramenta de quem cuida de pessoas.

## Decisão

1. **Cantos macios.** Escala nova: 4 / 6 / 10 / 14 / 20 px (`--radius-xs` a `--radius-xl`). Controles (botão, campo, item de menu) usam 10 px; painéis e listas, 14 px; diálogos e gavetas, 20 px. Filtros, etiquetas e estados são pílulas.
2. **Painéis claros.** O fundo passa a ser linho (`--paper`, branco quente) e os blocos que importam ficam num painel branco (`--surface`) com régua de 1 px, sem sombra. Tabelas e listas são sempre painéis, com cabeçalho em tom de linho. Continua proibida a grade de cartões iguais e as métricas heroicas.
3. **Estados em pílula.** `EstadoRotulado` vira pílula tingida pelo tom (`*-wash` + `*-ink`) com a marca desenhada à esquerda. As marcas passam de azulejo quadrado a círculo, no mesmo vocabulário de preenchimento (vazio, metade, cheio, cheio com check, riscado, seta, x, ponto). O azulejo quadrado fica só na marca do produto.
4. **Texto maior.** Corpo em 15 px (`--text-base`), rótulos em 14 px, legendas em 13 px, título de página em 26 px.
5. **Filtros em trilho.** `GrupoSegmentado` é um trilho em pílula onde a opção marcada sobe como pastilha clara.

## Consequências

- Componentes continuam lendo só papéis; o novo papel `surface` entra em `tokens.css` e no `npm run contraste`, que agora mede também texto sobre painel e marcas sobre as pílulas.
- Telas novas herdam o visual pelos primitivos (`Tabela`, `ListaRegulada`, `Painel`, `Secao painel`, `EstadoRotulado`).
- A regra da voz única (acento em no máximo 10% da tela) e a calma da ADR 0002 permanecem.
