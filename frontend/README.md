# Frontend Vínculo

SPA em React, TypeScript e Vite.

## Requisitos

- Node.js 22.12 ou superior;
- npm 11;
- API Vínculo disponível em `http://127.0.0.1:5178` durante o desenvolvimento.

## Comandos

```bash
npm install
npm run dev            # Vite em http://localhost:4200, com /api encaminhado para a API local
npm run typecheck
npm run lint
npm test               # Vitest + Testing Library
npm run build
npm run contraste      # mede o contraste WCAG dos pares de cor de tokens.css (claro e escuro)
npm run seed:demo      # conta fictícia com dados realistas (somente API local)
npm run test:e2e       # Playwright, desktop e mobile; exige API e front rodando
```

O servidor Vite usa a porta `4200`. Para outro endereço de API, defina `VITE_API_URL` sem barra final.

Os testes de ponta a ponta criam dados fictícios em contas de teste próprias (`qa.consultorio@…`, `e2e.rotas@…`). Não os execute contra um banco com dados reais de atendimento.

## Arquitetura

- `src/app`: providers e rotas;
- `src/app/core`: API, autenticação, vocabulário de estados, formatação, hooks e tema;
- `src/app/components/ui`: primitivos do sistema de design (botão, campo, tabela, diálogo, menu, abas…);
- `src/app/components/feedback`: esqueleto, estados vazio e erro, avisos e toasts;
- `src/app/components/layout`: shell, trilho lateral, navegação móvel e cabeçalho de página;
- `src/app/features`: fatias de domínio, cada uma com páginas, `components/`, `*.api.ts`, `*.types.ts`, `*.schemas.ts` e `*.rotulos.ts`;
- `src/app/styles`: `tokens.css` (papéis semânticos claro/escuro), `index.css` e `sobreposicoes.css`;
- `e2e`: fluxos críticos em Playwright (`apoio.ts` reúne os auxiliares compartilhados).

Antes de implementar novas telas, leia:

- [`docs/02-arquitetura/FRONTEND_STACK_E_ARQUITETURA.md`](../docs/02-arquitetura/FRONTEND_STACK_E_ARQUITETURA.md): stack, fronteiras e regras;
- [`DESIGN.md`](../DESIGN.md): sistema de design e o que não fazer;
- [`docs/04-ux/README.md`](../docs/04-ux/README.md): mapa de telas, padrões e verificação visual;
- [`docs/adr/0001-reestruturacao-do-frontend.md`](../docs/adr/0001-reestruturacao-do-frontend.md): por que o front-end é assim.
