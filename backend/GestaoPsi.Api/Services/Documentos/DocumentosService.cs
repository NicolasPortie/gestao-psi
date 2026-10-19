using GestaoPsi.Api.Shared.Texto;
using GestaoPsi.Api.Data;
using GestaoPsi.Api.DTOs.Documentos;
using GestaoPsi.Api.Models;
using GestaoPsi.Api.Services.Seguranca;
using GestaoPsi.Api.Shared.Enums;
using GestaoPsi.Api.Shared.Excecoes;
using GestaoPsi.Api.Shared.Paginacao;
using Microsoft.EntityFrameworkCore;

namespace GestaoPsi.Api.Services.Documentos;

public sealed class DocumentosService(AppDbContext db, IAutorizacaoContaService autorizacao, IProtecaoDadosService protecao, IAuditoriaService auditoria) : IDocumentosService
{
    public async Task<ResultadoPaginado<DocumentoListaResponse>> ListarAsync(Guid usuarioId, Guid contaId, Guid? pacienteId, int pagina, int tamanhoPagina, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var (paginaAtual, tamanhoAtual) = ParametrosPaginacao.Normalizar(pagina, tamanhoPagina);
        var consulta = db.DocumentosProntuario.AsNoTracking().Include(x => x.Paciente)
            .Where(x => x.ContaPsicologoId == contaId && (pacienteId == null || x.PacienteId == pacienteId));
        var total = await consulta.CountAsync(ct);
        var itens = await consulta
            .OrderByDescending(x => x.CriadoEm).Skip((paginaAtual - 1) * tamanhoAtual).Take(tamanhoAtual).Select(x => new DocumentoListaResponse(x.Id, x.PacienteId, x.Paciente.NomeCompleto, x.Tipo, x.Status, x.Titulo, x.Finalidade, x.CriadoEm, x.FinalizadoEm)).ToArrayAsync(ct);
        return new ResultadoPaginado<DocumentoListaResponse>(itens, total, paginaAtual, tamanhoAtual);
    }

    public async Task<DocumentoDetalheResponse> ObterAsync(Guid usuarioId, Guid contaId, Guid id, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        return Mapear(await ObterDocumentoAsync(contaId, id, ct));
    }

    public async Task<DocumentoDetalheResponse> CriarAsync(Guid usuarioId, Guid contaId, CriarDocumentoRequest request, string? ip, string? userAgent, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        ValidarConteudo(request.Tipo, request.Finalidade, request.Conteudo);
        var prontuario = await db.Prontuarios.SingleOrDefaultAsync(x => x.ContaPsicologoId == contaId && x.PacienteId == request.PacienteId && x.Status == StatusProntuario.Ativo, ct)
            ?? throw new RegraNegocioException("Prontuário clínico ativo não encontrado para este paciente.", StatusCodes.Status404NotFound);
        var documento = new DocumentoProntuario { Id = Guid.NewGuid(), ContaPsicologoId = contaId, ProntuarioId = prontuario.Id, PacienteId = request.PacienteId, CriadoPorUsuarioId = usuarioId, Tipo = request.Tipo, Titulo = request.Titulo.Trim(), Finalidade = Limpar(request.Finalidade), Solicitante = Limpar(request.Solicitante), ConteudoAtualJson = protecao.Proteger(request.Conteudo.Trim()) };
        db.DocumentosProntuario.Add(documento);
        auditoria.Registrar(contaId, usuarioId, "DocumentoPsicologicoCriado", nameof(DocumentoProntuario), documento.Id, "Documento psicológico criado como rascunho.", null, new { documento.PacienteId, documento.Tipo, documento.Status }, ip, userAgent);
        await db.SaveChangesAsync(ct);
        documento.Paciente = await db.Pacientes.SingleAsync(x => x.Id == documento.PacienteId && x.ContaPsicologoId == contaId, ct);
        return Mapear(documento);
    }

    public async Task<DocumentoDetalheResponse> AtualizarAsync(Guid usuarioId, Guid contaId, Guid id, AtualizarDocumentoRequest request, string? ip, string? userAgent, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var documento = await ObterDocumentoAsync(contaId, id, ct);
        if (documento.Status is StatusDocumentoProntuario.Finalizado or StatusDocumentoProntuario.Entregue or StatusDocumentoProntuario.Arquivado) throw new RegraNegocioException("Documento finalizado ou entregue não pode ser alterado.");
        ValidarConteudo(documento.Tipo, request.Finalidade, request.Conteudo);
        documento.Titulo = request.Titulo.Trim(); documento.Finalidade = Limpar(request.Finalidade); documento.Solicitante = Limpar(request.Solicitante); documento.ConteudoAtualJson = protecao.Proteger(request.Conteudo.Trim()); documento.AtualizadoEm = DateTimeOffset.UtcNow;
        auditoria.Registrar(contaId, usuarioId, "DocumentoPsicologicoAtualizado", nameof(DocumentoProntuario), documento.Id, "Rascunho de documento psicológico atualizado.", null, new { documento.Status }, ip, userAgent);
        await db.SaveChangesAsync(ct); return Mapear(documento);
    }

    public async Task<DocumentoDetalheResponse> FinalizarAsync(Guid usuarioId, Guid contaId, Guid id, string? ip, string? userAgent, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        if (!await db.DadosProfissionaisPsicologo.AnyAsync(x => x.ContaPsicologoId == contaId && x.UsuarioId == usuarioId && x.Status == StatusUsuario.Ativo && x.NomeProfissional != "" && x.CrpHash != "", ct))
            throw new RegraNegocioException("Complete seu nome e CRP em Dados profissionais antes de finalizar um documento.", StatusCodes.Status409Conflict);
        var documento = await ObterDocumentoAsync(contaId, id, ct);
        if (documento.Status is not (StatusDocumentoProntuario.Rascunho or StatusDocumentoProntuario.EmRevisao or StatusDocumentoProntuario.Retificado)) throw new RegraNegocioException("Somente rascunhos em revisao podem ser finalizados.");
        var conteudo = protecao.Desproteger(documento.ConteudoAtualJson ?? throw new RegraNegocioException("Conteúdo do documento não informado."));
        ValidarConteudo(documento.Tipo, documento.Finalidade, conteudo);
        var numero = await db.VersoesDocumentoProntuario.Where(x => x.ContaPsicologoId == contaId && x.DocumentoProntuarioId == id).CountAsync(ct) + 1;
        var hash = protecao.HashDeterministico(conteudo);
        db.VersoesDocumentoProntuario.Add(new() { Id = Guid.NewGuid(), ContaPsicologoId = contaId, DocumentoProntuarioId = id, CriadoPorUsuarioId = usuarioId, NumeroVersao = numero, ConteudoJson = protecao.Proteger(conteudo), HashConteudo = hash, MotivoAlteracao = "Finalização revisada pelo psicólogo." });
        documento.Status = StatusDocumentoProntuario.Finalizado; documento.FinalizadoPorUsuarioId = usuarioId; documento.FinalizadoEm = DateTimeOffset.UtcNow; documento.HashConteudoFinal = hash;
        auditoria.Registrar(contaId, usuarioId, "DocumentoPsicologicoFinalizado", nameof(DocumentoProntuario), id, "Documento psicológico finalizado e versão travada criada.", null, new { documento.Tipo, NumeroVersao = numero }, ip, userAgent);
        await db.SaveChangesAsync(ct); return Mapear(documento);
    }

    public async Task<ProtocoloEntregaResponse> RegistrarEntregaAsync(Guid usuarioId, Guid contaId, Guid id, RegistrarEntregaDocumentoRequest request, string? ip, string? userAgent, CancellationToken ct)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, ct);
        var documento = await ObterDocumentoAsync(contaId, id, ct);
        if (documento.Status != StatusDocumentoProntuario.Finalizado) throw new RegraNegocioException("Finalize o documento antes de registrar a entrega.");
        var versao = documento.Versoes.OrderByDescending(x => x.NumeroVersao).FirstOrDefault();
        if (versao is null || documento.HashConteudoFinal is null || versao.HashConteudo != documento.HashConteudoFinal)
            throw new RegraNegocioException("Documento sem versão final rastreável para entrega.");
        var protocolo = new ProtocoloEntregaDocumento { Id = Guid.NewGuid(), ContaPsicologoId = contaId, DocumentoProntuarioId = id, VersaoDocumentoProntuarioId = versao.Id, RegistradoPorUsuarioId = usuarioId, TipoEntrega = request.TipoEntrega, Destinatario = Limpar(request.Destinatario), Observacao = Limpar(request.Observacao), EntregueEm = request.EntregueEm ?? DateTimeOffset.UtcNow };
        db.ProtocolosEntregaDocumento.Add(protocolo); documento.Status = StatusDocumentoProntuario.Entregue;
        auditoria.Registrar(contaId, usuarioId, "EntregaDocumentoPsicologicoRegistrada", nameof(DocumentoProntuario), id, "Protocolo de entrega de documento registrado.", null, new { protocolo.TipoEntrega, protocolo.EntregueEm }, ip, userAgent);
        await db.SaveChangesAsync(ct); return new(protocolo.Id, protocolo.TipoEntrega, protocolo.Status, protocolo.Destinatario, protocolo.EntregueEm);
    }

    private async Task<DocumentoProntuario> ObterDocumentoAsync(Guid contaId, Guid id, CancellationToken ct) => await db.DocumentosProntuario.Include(x => x.Paciente).Include(x => x.Versoes).Include(x => x.ProtocolosEntrega).SingleOrDefaultAsync(x => x.Id == id && x.ContaPsicologoId == contaId, ct) ?? throw new RegraNegocioException("Documento psicológico não encontrado.", StatusCodes.Status404NotFound);
    private DocumentoDetalheResponse Mapear(DocumentoProntuario x) => new(x.Id, x.PacienteId, x.Paciente.NomeCompleto, x.Tipo, x.Status, x.Titulo, x.Finalidade, x.Solicitante, string.IsNullOrWhiteSpace(x.ConteudoAtualJson) ? string.Empty : protecao.Desproteger(x.ConteudoAtualJson), x.CriadoEm, x.FinalizadoEm, x.Versoes.OrderByDescending(v => v.NumeroVersao).Select(v => new VersaoDocumentoResponse(v.Id, v.NumeroVersao, v.MotivoAlteracao, v.CriadoEm)).ToArray(), x.ProtocolosEntrega.OrderByDescending(p => p.EntregueEm).Select(p => new ProtocoloEntregaResponse(p.Id, p.TipoEntrega, p.Status, p.Destinatario, p.EntregueEm)).ToArray());
    /// <summary>Termos já normalizados (sem acento): a comparação ignora caixa e acentuação.</summary>
    private static readonly string[] TermosClinicosProibidosEmDeclaracao = ["diagnostico", "sintoma", "hipotese", "evolucao clinica"];

    private static void ValidarConteudo(TipoDocumentoPsicologico tipo, string? finalidade, string conteudo)
    {
        if (string.IsNullOrWhiteSpace(conteudo)) throw new RegraNegocioException("Informe o conteúdo do documento.");
        if (tipo is TipoDocumentoPsicologico.AtestadoPsicologico or TipoDocumentoPsicologico.RelatorioMultiprofissional or TipoDocumentoPsicologico.LaudoPsicologico or TipoDocumentoPsicologico.ParecerPsicologico && string.IsNullOrWhiteSpace(finalidade)) throw new RegraNegocioException("Este tipo de documento exige finalidade.");
        if (tipo == TipoDocumentoPsicologico.Declaracao && TextoNormalizado.ContemAlgum(conteudo, TermosClinicosProibidosEmDeclaracao)) throw new RegraNegocioException("Declarações não podem conter dados clínicos, diagnóstico ou hipóteses.");
    }
    private static string? Limpar(string? valor) => string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();
}
