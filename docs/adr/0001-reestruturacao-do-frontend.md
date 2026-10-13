# 0001. Reestruturação do front-end: sistema de design próprio sobre primitivos sem estilo

- Estado: aceita
- Data: 11 de outubro de 2026

## Contexto

A migração de Angular para React deixou o front-end funcional, mas com problemas que não se resolvem com ajustes pontuais:

- a interface tinha aparência de template (grades de cartões, métricas em destaque, selos coloridos), sem identidade;
- cada tela resolvia do seu jeito tabela, formulário, vazio, erro e carregamento;
- a navegação horizontal escondia módulos atrás de um menu "Áreas" e dobrava para o celular sem equivalência real;
- configurações estavam espalhadas em vários itens de menu de nível superior (equipe, dados profissionais, modelos, auditoria, integração);
- telas de lista cortavam dados (seleção de paciente limitada a 100 itens, consulta do prontuário por identificador digitado);
- textos de interface e mensagens do backend estavam sem acentuação;
- não havia tema escuro, estados de carregamento e erro consistentes, nem verificação de contraste.

## Decisão

1. **Sistema de design próprio**, documentado em `DESIGN.md` e implementado em `frontend/src/app/styles/tokens.css` e `components/ui/`. Direção inicial: régua e marcas de estado desenhadas; a identidade final foi fixada na [ADR 0002](0002-identidade-visual.md). Tema claro e escuro por papéis semânticos em OKLCH.
2. **Primitivos sem estilo para o que é difícil de acertar à mão**: `@base-ui/react` (diálogo, gaveta, menu, abas, dica, combobox) e `sonner` (toasts). `class-variance-authority` e `clsx` compõem variantes. As fontes são servidas localmente.
3. **Navegação reorganizada**: trilho lateral recolhível no desktop e barra inferior no celular. Configurações viram um hub com subnavegação (`/configuracoes/*`); endereços antigos redirecionam. Existe página 404.
4. **Estado de domínio como marca + texto** (`core/dominio/estado.ts` e `*.rotulos.ts` por feature), nunca só cor.
5. **Listas e filtros dirigidos pela URL**, busca de paciente por servidor e seleção de consulta no prontuário por lista.
6. **Texto em português correto** na interface e nas mensagens do backend, com comparação de palavras sensíveis normalizada em um único ponto (`TextoNormalizado`), de modo que listas de termos continuem sem acento.
7. **Pendências de banco aplicadas por migração**: as migrações de coerência clínica e de armazenamento de campos criptografados já estavam no repositório e passam a ser parte do fluxo de setup local (`dotnet ef database update`).

## Alternativas consideradas

- **Biblioteca de componentes completa (Material, Ant, Chakra, PrimeReact).** Resolveria acessibilidade rápido, mas imporia identidade visual alheia ao produto, tornaria o tema escuro e as marcas de estado mais difíceis e aumentaria o custo de manter a aparência consistente.
- **shadcn/ui copiado.** Mesma base (Radix/Base UI), porém traria o visual padrão e muito código a adaptar. Usar Base UI direto, com nossos tokens, dá o mesmo comportamento com menos superfície.
- **Tudo à mão, sem headless.** Foco preso, retorno de foco, `aria-*` de combobox e posicionamento de menu são fonte comum de falhas de acessibilidade; o custo de manter é maior que o de uma dependência sem estilo.
- **Manter a navegação horizontal.** Não escalava para mais de dez destinos e escondia módulos; o trilho mostra tudo com agrupamento e se recolhe.
- **Estado só por cor.** Falha em daltonismo e em impressão; as marcas desenhadas acompanham o texto e custam pouco.

## Consequências

- Novas telas devem usar os primitivos de `components/ui/` e os papéis de `tokens.css`; valores de cor literais são proibidos em componentes.
- Quatro dependências de interface entram na stack aprovada (ver `FRONTEND_STACK_E_ARQUITETURA.md`). Trocá-las exige novo registro.
- Os mockups antigos deixam de ser fonte de referência visual; a referência passa a ser `DESIGN.md` e o código.
- Rotas de configuração mudaram de lugar; links externos antigos continuam funcionando por redirecionamento, que pode ser removido quando não houver mais referências.
- Termos de comparação em `DetectorConteudoSensiveisService` e na validação de declarações precisam permanecer **sem acento**, porque a entrada é normalizada antes de comparar.
- O fluxo de verificação passa a incluir `npm run contraste`, teste de ausência de rolagem horizontal no celular e captura nos dois temas.
