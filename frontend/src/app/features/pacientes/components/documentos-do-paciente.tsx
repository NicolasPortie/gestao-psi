import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { FileText } from 'lucide-react';

import { EsqueletoLinhas } from '../../../components/feedback/esqueleto';
import { EstadoErro, EstadoVazio } from '../../../components/feedback/estados';
import { Botao } from '../../../components/ui/botao';
import { EstadoRotulado } from '../../../components/ui/marca-estado';
import { CabecalhoTabela, CelulaTabela, ColunaTabela, LinhaTabela, LinkDaLinha, Tabela } from '../../../components/ui/tabela';
import { descreverEstado, rotuloDe } from '../../../core/dominio/estado';
import { mensagemDeErro } from '../../../core/erros/mensagem-de-erro';
import { formatarData } from '../../../core/formatacao/datas';
import { GavetaDocumento } from '../../documentos/components/gaveta-documento';
import { documentosKeys, listarDocumentos } from '../../documentos/documentos.api';
import { estadosDocumento, rotulosTipoDocumento } from '../../documentos/documentos.rotulos';

/** Documentos psicológicos do paciente. Só o psicólogo chega aqui; o servidor recusa os demais. */
export function DocumentosDoPaciente({ pacienteId }: { pacienteId: string }) {
  const [criando, setCriando] = useState(false);
  const filtro = { pacienteId, pagina: 1, tamanhoPagina: 50 };
  const { data, isPending, error, refetch } = useQuery({
    queryKey: documentosKeys.lista(filtro),
    queryFn: ({ signal }) => listarDocumentos(filtro, { signal }),
  });

  if (isPending) return <EsqueletoLinhas quantidade={3} />;
  if (error || !data) return <EstadoErro mensagem={mensagemDeErro(error, 'Tente novamente em instantes.')} aoTentarNovamente={() => void refetch()} />;
  const gaveta = <GavetaDocumento aberto={criando} aoMudar={setCriando} pacienteInicial={pacienteId} />;
  if (data.itens.length === 0) {
    return (
      <>
        <EstadoVazio
          icone={FileText}
          titulo="Nenhum documento"
          descricao="Declarações, relatórios e atestados emitidos para este paciente aparecem aqui."
          acao={
            <Botao variante="secundario" onClick={() => setCriando(true)}>
              Novo documento
            </Botao>
          }
        />
        {gaveta}
      </>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <Botao variante="secundario" onClick={() => setCriando(true)}>
          Novo documento
        </Botao>
      </div>
      <Tabela rotulo="Documentos do paciente">
        <CabecalhoTabela>
          <tr>
            <ColunaTabela>Documento</ColunaTabela>
            <ColunaTabela ocultarAte="sm">Criado em</ColunaTabela>
            <ColunaTabela>Estado</ColunaTabela>
          </tr>
        </CabecalhoTabela>
        <tbody>
          {data.itens.map((documento) => (
            <LinhaTabela key={documento.id}>
              <CelulaTabela>
                <LinkDaLinha to={`/documentos/${documento.id}`}>{documento.titulo}</LinkDaLinha>
                <span className="block text-sm text-ink-muted">{rotuloDe(rotulosTipoDocumento, documento.tipo)}</span>
              </CelulaTabela>
              <CelulaTabela ocultarAte="sm" className="num text-ink-muted">
                {formatarData(documento.criadoEm)}
              </CelulaTabela>
              <CelulaTabela>
                <EstadoRotulado estado={descreverEstado(estadosDocumento, documento.status)} compacto />
              </CelulaTabela>
            </LinhaTabela>
          ))}
        </tbody>
      </Tabela>
      {gaveta}
    </div>
  );
}
