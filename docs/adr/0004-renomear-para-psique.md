# 0004. Renomear o produto para Psique

- Estado: aceita
- Data: 22 de outubro de 2026
- Substitui: apenas a decisão de nome da [ADR 0002](0002-identidade-visual.md); cor, símbolo e demais decisões visuais continuam valendo

## Contexto

O nome "Vínculo" foi escolhido pelo conceito de vínculo terapêutico, mas é uma palavra comum demais para um produto de software: difícil de buscar, ambígua (relações trabalhistas, contratos) e sem relação direta com o ofício. O projeto mantinha ainda o nome técnico antigo "GestaoPsi" em pastas, namespaces, banco e cookies, o que deixava duas identidades convivendo.

## Decisão

1. **Nome: Psique.** Palavra de origem grega para mente e alma, objeto de trabalho do psicólogo. É curta, tem grafia clara em português e é fácil de pronunciar e de buscar.
2. **Um nome só.** O nome visível e o nome técnico passam a ser o mesmo: pastas (`backend/Psique.Api`), projetos, namespaces C#, banco (`Psique`), volumes e serviços do Docker, cookies, chaves de armazenamento local e repositório.
3. **Identidade visual preservada.** O símbolo (azulejo com duas metades de semicírculo), a paleta verde-musgo e a tipografia não mudam. Só a palavra ao lado do símbolo e o texto de apoio mudam.

## Consequências

- Os propósitos de cifra (`Psique.Colunas.v1`, `Psique.DadosSensiveis.v1`), o nome da aplicação do Data Protection e o prefixo das chaves no Redis mudaram. **Dados cifrados com o nome antigo não podem ser lidos pelo nome novo.** Como o projeto não foi implantado com dados reais, o banco de desenvolvimento é recriado; uma instalação existente exigiria migrar os dados antes da troca.
- Tokens e sessões emitidos antes da troca deixam de valer (emissor e audiência do JWT mudaram), e as preferências de tema e de menu salvas no navegador voltam ao padrão.
- O texto de apoio da marca mudou de "quem cuida de vínculos" para "quem cuida de pessoas".

## Alternativas consideradas

- **Manter Vínculo:** conceito coerente, mas pouco distintivo e difícil de buscar.
- **Escuta, Acolhe e Sessão:** boas para o tom do produto, mas mais genéricas ou presas a uma só parte da rotina.
