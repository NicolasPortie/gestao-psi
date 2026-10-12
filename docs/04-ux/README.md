# UX do GestãoPsi

A referência visual é o código e o [`DESIGN.md`](../../DESIGN.md). Não há mais mockups externos como fonte de verdade. A decisão está em [`docs/adr/0001-reestruturacao-do-frontend.md`](../adr/0001-reestruturacao-do-frontend.md).

## Mapa de telas

| Grupo no menu | Tela | Rota | Perfis |
| --- | --- | --- | --- |
| Rotina | Hoje (painel) | `/painel` | todos |
| Rotina | Agenda (semana, dia no celular) | `/agenda` | todos |
| Rotina | Nova consulta | `/consultas/nova` | todos |
| Rotina | Detalhe da consulta | `/consultas/:id` | todos |
| Rotina | Pacientes, ficha, cadastro | `/pacientes`, `/pacientes/:id`, `/pacientes/novo`, `/pacientes/:id/editar` | todos |
| Rotina | Financeiro | `/pagamentos` | todos |
| Rotina | Lista de espera | `/lista-espera` | todos |
| Comunicação | Conversas do WhatsApp | `/conversas` | todos |
| Comunicação | Lembretes | `/lembretes` | todos |
| Clínico | Prontuário e sessões | `/pacientes/:id/prontuario` | Psicólogo |
| Clínico | Documentos e detalhe | `/documentos`, `/documentos/:id` | Psicólogo |
| Consultório | Relatórios administrativos | `/relatorios` | todos |
| Consultório | Notificações | `/notificacoes` | todos |
| Consultório | Configurações (hub) | `/configuracoes/{conta,agenda,profissional,equipe,auditoria,mensagens,whatsapp}` | gestão (Psicólogo e Administrador); conta, agenda e mensagens para todos |
| Público | Termos de uso e política de privacidade | `/termos`, `/privacidade` | sem login |

A recepção nunca vê conteúdo clínico: prontuário e documentos mostram "acesso restrito", e o servidor recusa a requisição.

## Padrões de tela

- **Cabeçalho**: título único, descrição curta e, no máximo, uma ação primária preenchida.
- **Lista**: filtros na URL, tabela em régua no desktop e linhas empilhadas no celular, paginação só quando há mais de uma página.
- **Criar/editar registro pequeno**: gaveta lateral. Formulário longo: página própria com seções.
- **Ação destrutiva**: diálogo de confirmação que descreve a consequência.
- **Estados**: toda tela de dados define carregamento (esqueleto), vazio (próximo passo), erro (nova tentativa) e sucesso (toast).
- **Estado de entidade**: marca desenhada + texto, vindos de `*.rotulos.ts`.

## Verificação visual

Para qualquer mudança de interface:

1. `npm run contraste` sem falhas se `tokens.css` mudou.
2. Conferir a tela em 390 px e 1440 px, nos temas claro e escuro.
3. Abrir gavetas, diálogos e menus da tela alterada.
4. Console do navegador sem erros.
5. `npm run test:e2e` com a API e o front rodando. A suíte inclui a ausência de rolagem horizontal em 390 px e 320 px e a varredura de acessibilidade (axe, WCAG A e AA) nos temas claro e escuro, com gavetas abertas.

Dados de demonstração para conferir telas: `npm run seed:demo` (somente com API local).
