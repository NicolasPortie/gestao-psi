# Documentação do Vínculo

Esta pasta organiza a documentação do projeto por responsabilidade.

## Estrutura

```txt
docs/
  01-produto/
    PLANEJAMENTO.md
    CONVENCOES_NOMENCLATURA.md

  02-arquitetura/
    BACKEND_STACK_E_ARQUITETURA.md
    FRONTEND_STACK_E_ARQUITETURA.md
    RELATORIOS_ADMINISTRATIVOS_HTML.md

  03-modelagem/
    README.md
    01-modelagem-banco-dados.md
    02-saas-contas-planos.md
    03-prontuario-e-documentos.md
    04-seguranca-privacidade.md
    05-whatsapp-chatbot.md
    06-fluxos-regras-negocio.md
    07-mvp-e-fases.md

  04-ux/
    README.md
    imagens.md

  05-operacao/
    IMPLANTACAO.md

  adr/
    0001-reestruturacao-do-frontend.md
    0002-identidade-visual.md
    0003-cantos-macios-e-paineis.md

  screenshots/
```

## Fonte de verdade

- Produto e escopo: `01-produto/PLANEJAMENTO.md`
- Arquitetura técnica: `02-arquitetura/`
- Modelagem e regras de domínio: `03-modelagem/`
- Design e telas: `../DESIGN.md` e `04-ux/`
- Implantação e backups: `05-operacao/`
- Decisões arquiteturais: `adr/`

## Decisão atual do produto

O Vínculo é um SaaS multi-conta para psicólogos autônomos.

Cada psicólogo possui uma `ContaPsicologo`. Todos os dados do consultório, como pacientes, agenda, prontuário, documentos, pagamentos e WhatsApp, devem ser escopados por `ContaPsicologoId`.

Usar sempre a nomenclatura de conta no domínio do produto.
