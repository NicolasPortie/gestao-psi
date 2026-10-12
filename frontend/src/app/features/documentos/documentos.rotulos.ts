import type { DescricaoEstado } from '../../core/dominio/estado';
import type { StatusDocumentoProntuario, TipoDocumentoPsicologico } from './documentos.api';

export const estadosDocumento: Record<StatusDocumentoProntuario, DescricaoEstado> = {
  Rascunho: { rotulo: 'Rascunho', tom: 'neutro', marca: 'anel' },
  EmRevisao: { rotulo: 'Em revisão', tom: 'aviso', marca: 'meio' },
  Finalizado: { rotulo: 'Finalizado', tom: 'acento', marca: 'cheio' },
  Entregue: { rotulo: 'Entregue', tom: 'sucesso', marca: 'check' },
  Retificado: { rotulo: 'Retificado', tom: 'neutro', marca: 'seta' },
  Arquivado: { rotulo: 'Arquivado', tom: 'neutro', marca: 'riscado' },
  Cancelado: { rotulo: 'Cancelado', tom: 'neutro', marca: 'riscado' },
};

export const rotulosTipoDocumento: Record<TipoDocumentoPsicologico, string> = {
  Declaracao: 'Declaração',
  AtestadoPsicologico: 'Atestado psicológico',
  RelatorioPsicologico: 'Relatório psicológico',
  RelatorioMultiprofissional: 'Relatório multiprofissional',
  LaudoPsicologico: 'Laudo psicológico',
  ParecerPsicologico: 'Parecer psicológico',
  Encaminhamento: 'Encaminhamento',
  ResumoAcompanhamento: 'Resumo de acompanhamento',
  Devolutiva: 'Devolutiva',
  InformePsicologico: 'Informe psicológico',
  Outro: 'Outro',
};
