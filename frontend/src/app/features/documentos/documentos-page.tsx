import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { FilePlus2, FileText } from 'lucide-react';
import { useState } from 'react';

import { AcessoRestrito } from '../../components/feedback/acesso-restrito';
import { EsqueletoLinhas } from '../../components/feedback/esqueleto';
import { EstadoErro, EstadoVazio } from '../../components/feedback/estados';
import { CabecalhoPagina, Pagina } from '../../components/layout/pagina';
import { Botao, BotaoLink } from '../../components/ui/botao';
import { EstadoRotulado } from '../../components/ui/marca-estado';
import { Paginacao } from '../../components/ui/paginacao';
import { CabecalhoTabela, CelulaTabela, ColunaTabela, LinhaTabela, LinkDaLinha, Tabela } from '../../components/ui/tabela';
import { usePermissoes } from '../../core/autenticacao/permissoes';
import { descreverEstado, rotuloDe } from '../../core/dominio/estado';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import { formatarData } from '../../core/formatacao/datas';
import { GavetaDocumento } from './components/gaveta-documento';
import { documentosKeys, listarDocumentos } from './documentos.api';
import { estadosDocumento, rotulosTipoDocumento } from './documentos.rotulos';

const TAMANHO_PAGINA = 20;

export default function DocumentosPage() {
  const { acessoClinico } = usePermissoes();
  const [pagina, setPagina] = useState(1);
  const [criando, setCriando] = useState(false);
  const filtro = { pagina, tamanhoPagina: TAMANHO_PAGINA };

  const listaQuery = useQuery({
    queryKey: documentosKeys.lista(filtro),
    queryFn: ({ signal }) => listarDocumentos(filtro, { signal }),
    enabled: acessoClinico,
    placeholderData: keepPreviousData,
  });

  if (!acessoClinico) {
    return (
      <AcessoRestrito
        mensagem="Documentos psicológicos são abertos só pelo psicólogo responsável."
        acao={
          <BotaoLink to="/painel" variante="secundario">
            Voltar para Hoje
          </BotaoLink>
        }
      />
    );
  }

  const { data, isPending, error, isFetching, isPlaceholderData, refetch } = listaQuery;

  return (
    <Pagina largura="ampla" className="gap-6">
      <CabecalhoPagina
        titulo="Documentos"
        descricao="Declarações, relatórios e demais documentos psicológicos, com versões e protocolo de entrega."
        acoes={
          <Botao variante="primario" onClick={() => setCriando(true)}>
            <FilePlus2 size={16} aria-hidden="true" />
            Novo documento
          </Botao>
        }
      />

      {isPending ? (
        <EsqueletoLinhas quantidade={6} />
      ) : error && !data ? (
        <EstadoErro titulo="Documentos indisponíveis" mensagem={mensagemDeErro(error, 'Tente novamente em instantes.')} aoTentarNovamente={() => void refetch()} recarregando={isFetching} />
      ) : data && data.itens.length === 0 ? (
        <EstadoVazio
          icone={FileText}
          titulo="Nenhum documento ainda"
          descricao="Crie um rascunho, revise o texto e finalize quando estiver pronto para entregar ao paciente ou ao solicitante."
          acao={
            <Botao variante="secundario" onClick={() => setCriando(true)}>
              Novo documento
            </Botao>
          }
        />
      ) : data ? (
        <div aria-busy={isFetching} className={isPlaceholderData ? 'opacity-60 transition-opacity duration-150' : 'transition-opacity duration-150'}>
          <Tabela rotulo="Documentos">
            <CabecalhoTabela>
              <tr>
                <ColunaTabela>Documento</ColunaTabela>
                <ColunaTabela ocultarAte="md">Paciente</ColunaTabela>
                <ColunaTabela ocultarAte="lg">Criado em</ColunaTabela>
                <ColunaTabela>Estado</ColunaTabela>
              </tr>
            </CabecalhoTabela>
            <tbody>
              {data.itens.map((documento) => (
                <LinhaTabela key={documento.id}>
                  <CelulaTabela>
                    <LinkDaLinha to={`/documentos/${documento.id}`}>{documento.titulo}</LinkDaLinha>
                    <span className="block text-sm text-ink-muted">
                      {rotuloDe(rotulosTipoDocumento, documento.tipo)}
                      <span className="md:hidden"> · {documento.paciente}</span>
                    </span>
                  </CelulaTabela>
                  <CelulaTabela ocultarAte="md" className="text-ink-muted">
                    {documento.paciente}
                  </CelulaTabela>
                  <CelulaTabela ocultarAte="lg" className="num text-ink-muted">
                    {formatarData(documento.criadoEm)}
                  </CelulaTabela>
                  <CelulaTabela>
                    <EstadoRotulado estado={descreverEstado(estadosDocumento, documento.status)} compacto />
                  </CelulaTabela>
                </LinhaTabela>
              ))}
            </tbody>
          </Tabela>
          <Paginacao className="mt-2" pagina={data.pagina} total={data.total} tamanhoPagina={data.tamanhoPagina} aoMudarPagina={setPagina} desabilitado={isFetching} />
        </div>
      ) : null}

      <GavetaDocumento aberto={criando} aoMudar={setCriando} />
    </Pagina>
  );
}
