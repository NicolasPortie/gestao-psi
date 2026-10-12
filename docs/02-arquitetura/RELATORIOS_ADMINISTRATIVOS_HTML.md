# Relatórios administrativos — arquitetura (HTML profissional)

Decisão para a etapa seguinte à implementação de Lembretes e Modelos de mensagem.

## Princípio

Os relatórios administrativos **devem ser gerados como HTML profissional a partir de templates versionados no backend**.

Não criar relatórios somente como cards ou gráficos calculados no frontend.

## Separação de domínios

| Domínio | Finalidade | Acesso |
| --- | --- | --- |
| Relatórios administrativos | Operação do consultório | Psicólogo e recepcionista (conforme escopo) |
| Documentos psicológicos (Fase 2.5) | Produção clínica | Psicólogo; sem exposição indevida à recepção |

Templates de relatório **não** devem ser misturados com modelos de documentos psicológicos.

## Arquitetura proposta

```txt
backend/
  Services/Relatorios/
    IRelatoriosAdministrativosService.cs
    RelatoriosAdministrativosService.cs
    Templates/
      _layout.html
      sessoes-realizadas.html
      consultas-agendadas.html
      cancelamentos.html
      faltas.html
      taxa-comparecimento.html
      pacientes-status.html
      valores-recebidos.html
      pagamentos-pendentes.html
      horarios-ocupados.html
      historico-atendimentos-paciente.html
    Estilos/
      relatorio.css          # tela
      relatorio-print.css    # @media print
  Controllers/RelatoriosController.cs
  DTOs/Relatorios/
```

### Regras

1. **Dados e cálculos** exclusivamente no backend, filtrados por `ContaPsicologoId` do contexto autenticado.
2. **Templates HTML** versionados no repositório, reutilizáveis e sem HTML arbitrário vindo do frontend.
3. **Codificação segura** de todos os valores (escape HTML no motor de template).
4. **CSS próprio** para tela e impressão, com `@media print`, quebras de página e rodapé.
5. **Cabeçalho** com identificação do consultório e do profissional.
6. **Período e filtros aplicados** sempre visíveis no relatório.
7. **Prévia no navegador** (`text/html`) e caminho futuro para PDF a partir do mesmo HTML.
8. **Auditoria** da geração de relatórios sensíveis.
9. **Sem dados clínicos** indevidos (evoluções, hipóteses, prontuário).

## Relatórios iniciais

- Sessões realizadas por período
- Consultas agendadas
- Cancelamentos
- Faltas
- Taxa de comparecimento
- Pacientes ativos e inativos
- Valores recebidos
- Pagamentos pendentes
- Horários mais ocupados
- Histórico administrativo de atendimentos por paciente

## API sugerida

```txt
GET  /api/v1/relatorios/catalogo
POST /api/v1/relatorios/{codigo}/gerar   -> text/html ou envelope com html + metadados
```

O frontend apenas envia filtros e exibe/imprime o HTML retornado; não recalcula indicadores oficiais.

## Status de implementação

Implementado:

- catálogo e geração via API (`/api/v1/relatorios`);
- motor de layout HTML + CSS de tela/impressão;
- 10 relatórios administrativos iniciais;
- tela web com prévia e impressão do HTML oficial (a rota React será portada durante a migração do front-end);
- isolamento por conta e auditoria da geração.

Ainda fora de escopo:

- Exportação PDF (posterior, reutilizando o mesmo HTML)
- WhatsApp Bridge / chatbot / conversas (resto da Fase 3)
- Documentos psicológicos (Fase 2.5; templates separados)
