# Stack e Arquitetura do Front-end

## Decisão

O front-end oficial do GestãoPsi é uma SPA em React, TypeScript e Vite. A aplicação Angular anterior foi descontinuada sem camada de compatibilidade, execução paralela ou adaptadores entre frameworks.

A decisão prioriza domínio da stack pelo mantenedor, simplicidade operacional e uma base moderna para um produto administrativo sensível. O backend e os contratos HTTP permanecem independentes do framework de interface.

A direção visual e o sistema de design estão em [`DESIGN.md`](../../DESIGN.md) (raiz do repositório). A decisão de reestruturação do front-end está registrada em [`docs/adr/0001-reestruturacao-do-frontend.md`](../adr/0001-reestruturacao-do-frontend.md).

## Stack obrigatória

- React 19.2;
- TypeScript em modo estrito;
- Vite 8 para desenvolvimento e build;
- React Router 8 em Data Mode para rotas, loaders e proteção de navegação;
- TanStack Query 5 para estado remoto, cache, invalidação e mutações;
- React Hook Form 7 com Zod 4 para formulários e validação de formato;
- Tailwind CSS 4 para tokens, layout, responsividade e composição visual;
- Lucide React como biblioteca principal de ícones;
- Vitest e Testing Library para testes unitários e de componentes;
- Playwright para fluxos críticos e validação desktop/mobile, com `@axe-core/playwright` para a varredura de acessibilidade (WCAG A e AA) dos dois temas.

### Dependências de interface aprovadas

Não existe biblioteca de componentes visuais pronta (nada de Material, PrimeNG ou similares). O visual é próprio, sobre tokens. Apenas camadas **sem estilo** ou utilitários minúsculos foram aprovados, cada um com um motivo:

| Dependência | Uso | Por quê |
| --- | --- | --- |
| `@base-ui/react` | Dialog, AlertDialog, Menu, Tabs, Tooltip, Combobox | Foco preso, teclado, ARIA e portal corretos sem reimplementar; zero estilo imposto |
| `sonner` | Toasts | Fila, pausa ao passar o mouse e leitor de tela resolvidos; estilizado por tokens |
| `class-variance-authority` + `clsx` | Variantes de botão, marca e etiqueta | Composição de classes tipada, sem CSS-in-JS |
| `@fontsource-variable/hanken-grotesk` | Tipografia | Fonte local, sem requisição a terceiros (privacidade) |

Qualquer outra dependência de interface exige registrar a decisão antes de entrar.

## Fronteiras de responsabilidade

- React compõe a interface e o estado efêmero local.
- React Router controla rotas, layouts e redirecionamentos.
- TanStack Query é a única camada de cache para dados da API.
- React Hook Form controla estado de formulário; Zod valida formato no cliente.
- `core/api` concentra cliente HTTP, envelopes, erros, credenciais e renovação de sessão.
- `features` concentra páginas, componentes, contratos e requisições de cada domínio.
- Regra de negócio, autorização, isolamento por conta e sucesso final de operações pertencem ao backend.

O front-end nunca envia `ContaPsicologoId` como critério de autorização, nunca simula sucesso da API e nunca decide permissões clínicas apenas ocultando elementos.

## Estrutura

```txt
frontend/
  e2e/                         Playwright (desktop e mobile)
  scripts/seed-demo.mjs        conta de demonstração com dados realistas (somente local)
  src/app/
    main.tsx  router.tsx  providers.tsx
    core/
      api/                     cliente HTTP, envelope, paginação
      autenticacao/            sessão em memória e permissões por perfil
      dominio/                 vocabulário de estados (marca + tom + rótulo)
      erros/  formatacao/  hooks/  tema/
    components/
      ui/                      primitivos (botao, campo, tabela, dialogo, menu, abas...)
      feedback/                esqueleto, estados vazio/erro, avisos, toasts
      layout/                  shell, trilho, navegação móvel, página
    features/
      painel/  agenda/  pacientes/  sessoes/  documentos/  pagamentos/
      lista-espera/  lembretes/  notificacoes/  whatsapp/  relatorios/
      configuracoes/  usuarios/  dados-profissionais/  modelos-mensagem/
      auditoria/  autenticacao/
    styles/
      index.css  tokens.css  sobreposicoes.css
    test/
```

Cada feature agrupa suas páginas (`*-page.tsx`), `components/`, a camada HTTP (`*.api.ts`), contratos (`*.types.ts`), validação (`*.schemas.ts`) e **rótulos de domínio** (`*.rotulos.ts`, onde cada enum do backend vira texto de interface e estado visual). Nomes de domínio ficam em português do Brasil e arquivos usam kebab-case.

Regras de organização:

- Uma feature importa de `components/` e `core/`. De outra feature só consome o que ela publica para reuso (`*.api.ts`, `*.keys.ts`, `*.rotulos.ts` e componentes de composição como `SeletorPaciente`), nunca detalhes internos.
- Rótulos e mapeamentos enum → texto ficam em `*.rotulos.ts`, nunca espalhados em JSX.
- Páginas com mais de uma responsabilidade se dividem em `components/` da própria feature.

## Estado e comunicação HTTP

- Dados vindos da API são server state e usam TanStack Query.
- Filtros, página e ordenação de listas vivem na URL (`useParametrosUrl`), para compartilhar e restaurar a visão.
- Estado visual curto usa `useState` no componente mais próximo.
- Context é reservado a dependências transversais estáveis (sessão autenticada, tema, contexto da página).
- Erros de mutação são derivados do estado da própria mutação; não se copia erro para `useState`.
- Não duplicar respostas da API em Context, stores globais ou estado local.
- O cliente HTTP usa `fetch`, `credentials: 'include'`, `AbortSignal` e um erro tipado.
- O access token fica apenas em memória. O refresh token continua em cookie protegido pelo backend.
- Uma única renovação de token pode ocorrer por vez; requisições 401 aguardam a mesma renovação antes de repetir.
- Ao trocar a identidade da sessão, o cache do TanStack Query é limpo, para que nenhum dado de uma conta apareça para outra.

## Rotas

Rotas são carregadas sob demanda por feature. Áreas autenticadas usam um layout protegido comum e restauram a sessão antes de liberar conteúdo. Rotas públicas redirecionam usuários autenticados para `/painel`.

| Área | Rotas |
| --- | --- |
| Rotina | `/painel` (Hoje), `/agenda`, `/consultas/nova`, `/consultas/:id`, `/pagamentos` (Financeiro), `/lista-espera` |
| Pessoas | `/pacientes`, `/pacientes/novo`, `/pacientes/:id`, `/pacientes/:id/editar`, `/pacientes/:id/prontuario` |
| Comunicação | `/conversas`, `/lembretes`, `/notificacoes` |
| Clínico | `/documentos`, `/documentos/:id`, `/relatorios` |
| Configurações | `/configuracoes/{conta,agenda,profissional,equipe,auditoria,mensagens,whatsapp}` |
| Público | `/login`, `/cadastro`, `/recuperar-senha`, `/redefinir-senha`, `/termos`, `/privacidade` |

Endereços anteriores à reorganização continuam funcionando por redirecionamento (`/usuarios`, `/dados-profissionais`, `/modelos-mensagem`, `/auditoria`, `/integracoes/whatsapp`, `/integracoes/whatsapp/conversas`). Rotas inexistentes mostram uma página 404 com caminho de volta. Rotas de gestão (equipe, auditoria, integração) e clínicas (prontuário, documentos) mostram "acesso restrito" para perfis sem permissão, mas **a autorização final é sempre do servidor**.

## Formulários

- Usar React Hook Form para formulários do produto e `useWatch` (não `watch`) para valores derivados.
- Usar schemas Zod apenas para formato e coerência de campos.
- Erros da API prevalecem sobre inferências do cliente.
- Todo campo possui rótulo associado, descrição/erro identificável e foco visível.
- Formulários sensíveis não persistem rascunhos em `localStorage`.
- Criar e editar registros pequenos usa gaveta lateral; formulários longos usam página própria.

## Interface e acessibilidade

- Direção visual: "folha de respostas" (ver `DESIGN.md`): régua, marcas de estado e um acento petróleo.
- Meta WCAG 2.2 AA, navegação por teclado e semântica nativa. Os pares de cor dos tokens são medidos por contraste.
- Componentes interativos têm estados padrão, hover, foco, ativo, desabilitado, carregando e erro.
- Toda lista e tela de dados tem esqueleto de carregamento, estado vazio com próximo passo e estado de erro com nova tentativa.
- `prefers-reduced-motion` desativa movimentos não essenciais; só se anima `transform`, opacidade e `clip-path`.
- Desktop e mobile recebem estruturas adequadas (trilho lateral e barra inferior), sem apenas reduzir tipografia. No celular, nenhuma tela pode forçar rolagem horizontal.
- Tema claro, escuro ou do sistema, aplicado antes da primeira pintura para evitar flash (`public/tema-inicial.js`, externo para que a CSP proíba scripts embutidos).
- Contêineres com rolagem horizontal usam `RegiaoRolavel` (focável e anunciada só quando há rolagem), para que o teclado alcance o que está fora da tela.
- Dados clínicos nunca aparecem em superfícies administrativas por conveniência de layout.

## O que não usar

- Angular, RxJS, PrimeNG, PrimeIcons ou artefatos de compatibilidade Angular;
- Redux, Zustand ou outra store global sem decisão arquitetural posterior;
- CSS-in-JS, Sass ou folhas locais extensas quando Tailwind e tokens resolverem;
- bibliotecas de componentes com visual próprio (Material, Ant, Chakra, shadcn copiado sem adaptação aos tokens);
- SSR, microfrontends, monorepo Nx ou service worker no MVP;
- dados falsos para simular operações dependentes da API;
- `localStorage` para tokens, prontuário ou qualquer dado clínico (apenas a preferência de tema é permitida);
- valores de cor literais em componentes: usar os papéis de `tokens.css`.

## Qualidade obrigatória

- `npm run lint` sem erros nem avisos;
- `npm run typecheck` sem erros;
- `npm test` para testes relacionados;
- `npm run build` concluído;
- `npm run test:e2e` com os fluxos críticos, a varredura de acessibilidade e a ausência de rolagem horizontal em desktop e mobile (exige API em `localhost:5178` e front em `localhost:4200`; o CI sobe a pilha do `docker-compose`);
- console do navegador sem erros;
- `npm run contraste` sem falhas ao alterar `tokens.css`;
- telas conferidas nos temas claro e escuro, em 390 px e em 1440 px.
