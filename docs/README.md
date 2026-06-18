# Documentacao do GestaoPsi

Esta pasta organiza a documentacao do projeto por responsabilidade.

## Estrutura

```txt
docs/
  01-produto/
    PLANEJAMENTO.md
    CONVENCOES_NOMENCLATURA.md

  02-arquitetura/
    BACKEND_STACK_E_ARQUITETURA.md
    FRONTEND_STACK_E_ARQUITETURA.md

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

  05-operacao/
```

## Fonte de Verdade

- Produto e escopo: `01-produto/PLANEJAMENTO.md`
- Arquitetura tecnica: `02-arquitetura/`
- Modelagem e regras de dominio: `03-modelagem/`
- Telas: `04-ux/`

## Decisao Atual do Produto

O GestaoPsi e um SaaS multi-conta para psicologos autonomos.

Cada psicologo possui uma `ContaPsicologo`. Todos os dados do consultorio, como pacientes, agenda, prontuario, documentos, pagamentos e WhatsApp, devem ser escopados por `ContaPsicologoId`.

Usar sempre a nomenclatura de conta no dominio do produto.
