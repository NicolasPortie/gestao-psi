# Modelagem do Vínculo

Esta pasta separa a modelagem do Vínculo em documentos menores.

## Ordem Recomendada de Leitura

1. `01-modelagem-banco-dados.md`
2. `02-saas-contas-planos.md`
3. `03-prontuario-e-documentos.md`
4. `04-seguranca-privacidade.md`
5. `05-whatsapp-chatbot.md`
6. `06-fluxos-regras-negocio.md`
7. `07-mvp-e-fases.md`

## Decisao de Modelagem

O sistema sera SaaS multi-conta.

`ContaPsicologo` e a raiz de isolamento dos dados. Entidades de dominio que pertencem ao consultorio devem possuir `ContaPsicologoId`.

Exemplos:

- `Usuarios`
- `Pacientes`
- `Consultas`
- `Prontuarios`
- `RegistrosSessao`
- `EvolucoesProntuario`
- `DocumentosProntuario`
- `Pagamentos`
- `IntegracoesWhatsApp`
- `LogsAuditoria`

## Principio Central

O Vínculo nao deve ser apenas uma agenda com anotacoes. Ele deve ser um sistema profissional de gestao para psicologos, com prontuario, evolucao do atendimento, documentos psicologicos, seguranca, auditoria e automacao administrativa por WhatsApp/chatbot.
