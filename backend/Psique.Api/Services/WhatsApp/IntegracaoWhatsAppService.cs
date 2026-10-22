using System.Net;
using System.Text.RegularExpressions;
using Psique.Api.Data;
using Psique.Api.DTOs.WhatsApp;
using Psique.Api.Models;
using Psique.Api.Services.Seguranca;
using Psique.Api.Shared.Enums;
using Psique.Api.Shared.Excecoes;
using Microsoft.EntityFrameworkCore;

namespace Psique.Api.Services.WhatsApp;

public sealed partial class IntegracaoWhatsAppService(
    AppDbContext dbContext,
    IAutorizacaoContaService autorizacao,
    IAuditoriaService auditoria,
    IProtecaoDadosService protecao,
    IHttpClientFactory httpClientFactory) : IIntegracaoWhatsAppService
{
    public async Task<IntegracaoWhatsAppResponse?> ObterAsync(Guid usuarioId, Guid contaId, CancellationToken cancellationToken)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, cancellationToken);
        var integracao = await ObterIntegracaoAsync(contaId, rastrear: false, cancellationToken);
        return integracao is null ? null : Mapear(integracao);
    }

    public async Task<IntegracaoWhatsAppResponse> SalvarAsync(
        Guid usuarioId,
        Guid contaId,
        SalvarIntegracaoWhatsAppRequest request,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, cancellationToken);
        ValidarUrl(request.UrlBaseBridge);
        var numero = NormalizarTelefone(request.NumeroWhatsApp);
        var nome = request.Nome.Trim();
        var provedor = request.Provedor.Trim();

        var integracao = await ObterIntegracaoAsync(contaId, rastrear: true, cancellationToken);
        var criando = integracao is null;
        if (criando)
        {
            if (string.IsNullOrWhiteSpace(request.Token))
                throw new RegraNegocioException("Informe o token do Bridge na primeira configuração.");

            integracao = new IntegracaoWhatsApp
            {
                Id = Guid.NewGuid(),
                ContaPsicologoId = contaId,
                Status = StatusIntegracao.Pendente
            };
            dbContext.IntegracoesWhatsApp.Add(integracao);
        }

        if (!string.IsNullOrWhiteSpace(request.Token))
        {
            var token = request.Token.Trim();
            if (token.Length < 16)
                throw new RegraNegocioException("O token do Bridge deve ter ao menos 16 caracteres.");

            var hash = protecao.HashToken(token);
            var conflito = await dbContext.IntegracoesWhatsApp.AnyAsync(
                item => item.TokenHash == hash && item.ContaPsicologoId != contaId,
                cancellationToken);
            if (conflito)
                throw new RegraNegocioException("Token de Bridge já utilizado por outra conta.");

            integracao!.TokenCriptografado = protecao.Proteger(token);
            integracao.TokenHash = hash;
        }
        else if (string.IsNullOrWhiteSpace(integracao!.TokenHash))
        {
            throw new RegraNegocioException("Token do Bridge é obrigatório.");
        }

        integracao.Nome = nome;
        integracao.Provedor = provedor;
        integracao.UrlBaseBridge = request.UrlBaseBridge.Trim().TrimEnd('/');
        integracao.NumeroWhatsApp = numero;
        integracao.Ativo = request.Ativo;
        integracao.AtualizadoEm = DateTimeOffset.UtcNow;
        if (!request.Ativo)
            integracao.Status = StatusIntegracao.Inativa;
        else if (integracao.Status == StatusIntegracao.Inativa)
            integracao.Status = StatusIntegracao.Pendente;

        auditoria.Registrar(
            contaId,
            usuarioId,
            criando ? "IntegracaoWhatsAppCriada" : "IntegracaoWhatsAppAtualizada",
            nameof(IntegracaoWhatsApp),
            integracao.Id,
            "Configuração do Bridge WhatsApp salva.",
            null,
            new { integracao.Nome, integracao.Provedor, integracao.NumeroWhatsApp, integracao.Ativo, integracao.Status },
            ip,
            userAgent);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Mapear(integracao);
    }

    public async Task<IntegracaoWhatsAppResponse> AlterarAtivoAsync(
        Guid usuarioId,
        Guid contaId,
        bool ativo,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, cancellationToken);
        var integracao = await ObterIntegracaoAsync(contaId, rastrear: true, cancellationToken)
            ?? throw new RegraNegocioException("Integração WhatsApp não configurada.", StatusCodes.Status404NotFound);

        integracao.Ativo = ativo;
        integracao.Status = ativo ? StatusIntegracao.Pendente : StatusIntegracao.Inativa;
        integracao.AtualizadoEm = DateTimeOffset.UtcNow;
        auditoria.Registrar(
            contaId,
            usuarioId,
            ativo ? "IntegracaoWhatsAppAtivada" : "IntegracaoWhatsAppInativada",
            nameof(IntegracaoWhatsApp),
            integracao.Id,
            ativo ? "Integração WhatsApp ativada." : "Integração WhatsApp inativada.",
            null,
            new { integracao.Ativo, integracao.Status },
            ip,
            userAgent);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Mapear(integracao);
    }

    public async Task<TesteConexaoBridgeResponse> TestarConexaoAsync(
        Guid usuarioId,
        Guid contaId,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, cancellationToken);
        var integracao = await ObterIntegracaoAsync(contaId, rastrear: true, cancellationToken)
            ?? throw new RegraNegocioException("Integração WhatsApp não configurada.", StatusCodes.Status404NotFound);

        if (!integracao.Ativo)
            throw new RegraNegocioException("Ative a integração antes de testar a conexão.");

        var testadoEm = DateTimeOffset.UtcNow;
        integracao.UltimaConexaoTestadaEm = testadoEm;

        try
        {
            using var cliente = httpClientFactory.CreateClient("BridgeWhatsApp");
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(TimeSpan.FromSeconds(8));

            var urlSaude = $"{integracao.UrlBaseBridge.TrimEnd('/')}/health";
            using var resposta = await cliente.GetAsync(urlSaude, cts.Token);
            if (resposta.IsSuccessStatusCode || resposta.StatusCode is HttpStatusCode.NotFound or HttpStatusCode.Unauthorized)
            {
                // 404/401 indicam endpoint alcançável mesmo sem health dedicado.
                integracao.Status = StatusIntegracao.Ativa;
                integracao.UltimoErro = null;
                auditoria.Registrar(contaId, usuarioId, "BridgeWhatsAppTesteOk", nameof(IntegracaoWhatsApp), integracao.Id, "Teste de conexão com Bridge bem-sucedido.", null, new { urlSaude, resposta.StatusCode }, ip, userAgent);
                await dbContext.SaveChangesAsync(cancellationToken);
                return new TesteConexaoBridgeResponse(true, integracao.Status, "Bridge alcançável. Integração marcada como ativa.", testadoEm);
            }

            integracao.Status = StatusIntegracao.Erro;
            integracao.UltimoErro = $"Bridge respondeu HTTP {(int)resposta.StatusCode}.";
            auditoria.Registrar(contaId, usuarioId, "BridgeWhatsAppTesteFalha", nameof(IntegracaoWhatsApp), integracao.Id, "Teste de conexão com Bridge falhou.", null, new { integracao.UltimoErro }, ip, userAgent);
            await dbContext.SaveChangesAsync(cancellationToken);
            return new TesteConexaoBridgeResponse(false, integracao.Status, integracao.UltimoErro, testadoEm);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or UriFormatException)
        {
            integracao.Status = StatusIntegracao.Erro;
            integracao.UltimoErro = "Não foi possível alcançar o Bridge. Verifique a URL e a disponibilidade do serviço.";
            auditoria.Registrar(contaId, usuarioId, "BridgeWhatsAppTesteFalha", nameof(IntegracaoWhatsApp), integracao.Id, "Teste de conexão com Bridge falhou.", null, new { Motivo = ex.GetType().Name }, ip, userAgent);
            await dbContext.SaveChangesAsync(cancellationToken);
            return new TesteConexaoBridgeResponse(false, integracao.Status, integracao.UltimoErro, testadoEm);
        }
    }

    public async Task<IReadOnlyCollection<EventoBridgeResumoResponse>> ListarEventosAsync(
        Guid usuarioId,
        Guid contaId,
        CancellationToken cancellationToken)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, cancellationToken);
        var integracao = await ObterIntegracaoAsync(contaId, rastrear: false, cancellationToken);
        if (integracao is null)
            return [];

        var eventos = await dbContext.EventosBridgeWhatsApp.AsNoTracking()
            .Where(item => item.ContaPsicologoId == contaId && item.IntegracaoWhatsAppId == integracao.Id)
            .OrderByDescending(item => item.CriadoEm)
            .Take(50)
            .ToArrayAsync(cancellationToken);

        return eventos.Select(item => new EventoBridgeResumoResponse(
            item.Id,
            item.TipoEvento,
            item.Processado,
            item.ErroProcessamento,
            item.CriadoEm,
            item.ProcessadoEm)).ToArray();
    }

    private async Task<IntegracaoWhatsApp?> ObterIntegracaoAsync(Guid contaId, bool rastrear, CancellationToken cancellationToken)
    {
        var consulta = rastrear
            ? dbContext.IntegracoesWhatsApp.AsQueryable()
            : dbContext.IntegracoesWhatsApp.AsNoTracking();
        return await consulta
            .OrderByDescending(item => item.CriadoEm)
            .FirstOrDefaultAsync(item => item.ContaPsicologoId == contaId, cancellationToken);
    }

    private static void ValidarUrl(string url)
    {
        if (!Uri.TryCreate(url.Trim(), UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
        {
            throw new RegraNegocioException("Informe uma URL base válida do Bridge (http ou https).");
        }
    }

    private static string NormalizarTelefone(string telefone)
    {
        var digitos = DigitosRegex().Replace(telefone, string.Empty);
        if (digitos.Length < 10 || digitos.Length > 15)
            throw new RegraNegocioException("Informe um número de WhatsApp válido com DDI/DDD.");
        return digitos;
    }

    private static IntegracaoWhatsAppResponse Mapear(IntegracaoWhatsApp item) => new(
        item.Id,
        item.Nome,
        item.Provedor,
        item.UrlBaseBridge,
        MascararToken(),
        item.NumeroWhatsApp,
        item.Status,
        item.Ativo,
        item.UltimoErro,
        item.UltimaConexaoTestadaEm,
        item.CriadoEm,
        item.AtualizadoEm);

    private static string MascararToken() => "••••••••••••••••";

    [GeneratedRegex(@"\D")]
    private static partial Regex DigitosRegex();
}
