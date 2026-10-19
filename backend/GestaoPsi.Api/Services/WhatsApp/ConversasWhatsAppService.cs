using System.Text.RegularExpressions;
using GestaoPsi.Api.Data;
using GestaoPsi.Api.DTOs.WhatsApp;
using GestaoPsi.Api.Models;
using GestaoPsi.Api.Services.Seguranca;
using GestaoPsi.Api.Shared.Enums;
using GestaoPsi.Api.Shared.Excecoes;
using GestaoPsi.Api.Shared.Paginacao;
using Microsoft.EntityFrameworkCore;

namespace GestaoPsi.Api.Services.WhatsApp;

public sealed partial class ConversasWhatsAppService(
    AppDbContext dbContext,
    IAutorizacaoContaService autorizacao,
    IAuditoriaService auditoria,
    IProtecaoDadosService protecao) : IConversasWhatsAppService
{
    public async Task<ResultadoPaginado<ConversaWhatsAppListaResponse>> ListarAsync(
        Guid usuarioId,
        Guid contaId,
        FiltroConversaWhatsAppRequest filtro,
        CancellationToken cancellationToken)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, cancellationToken);
        var (pagina, tamanhoPagina) = ParametrosPaginacao.Normalizar(filtro.Pagina, filtro.TamanhoPagina);

        var consulta = dbContext.ConversasWhatsApp.AsNoTracking()
            .Include(item => item.Paciente)
            .Include(item => item.Mensagens)
            .Where(item => item.ContaPsicologoId == contaId);

        if (filtro.Status is not null)
            consulta = consulta.Where(item => item.Status == filtro.Status);
        if (filtro.AtendimentoHumanoNecessario is not null)
            consulta = consulta.Where(item => item.AtendimentoHumanoNecessario == filtro.AtendimentoHumanoNecessario);
        if (filtro.PacienteId is not null)
            consulta = consulta.Where(item => item.PacienteId == filtro.PacienteId);

        var total = await consulta.CountAsync(cancellationToken);

        var itens = await consulta
            .OrderByDescending(item => item.UltimaMensagemEm ?? item.CriadoEm)
            .Skip((pagina - 1) * tamanhoPagina)
            .Take(tamanhoPagina)
            .ToListAsync(cancellationToken);

        return new ResultadoPaginado<ConversaWhatsAppListaResponse>(itens.Select(MapearLista).ToArray(), total, pagina, tamanhoPagina);
    }

    public async Task<ConversaWhatsAppDetalheResponse> ObterAsync(
        Guid usuarioId,
        Guid contaId,
        Guid id,
        CancellationToken cancellationToken)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, cancellationToken);
        var conversa = await CarregarDetalheAsync(contaId, id, cancellationToken);
        return MapearDetalhe(conversa);
    }

    public async Task<ConversaWhatsAppDetalheResponse> VincularPacienteAsync(
        Guid usuarioId,
        Guid contaId,
        Guid id,
        VincularPacienteConversaRequest request,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, cancellationToken);
        var conversa = await dbContext.ConversasWhatsApp
            .Include(item => item.Paciente)
            .SingleOrDefaultAsync(item => item.Id == id && item.ContaPsicologoId == contaId, cancellationToken)
            ?? throw new RegraNegocioException("Conversa não encontrada.", StatusCodes.Status404NotFound);

        var paciente = await dbContext.Pacientes.SingleOrDefaultAsync(
            item => item.Id == request.PacienteId &&
                    item.ContaPsicologoId == contaId &&
                    item.Status == StatusPaciente.Ativo,
            cancellationToken) ?? throw new RegraNegocioException("Paciente ativo não encontrado.", StatusCodes.Status404NotFound);

        conversa.PacienteId = paciente.Id;
        conversa.AtualizadoEm = DateTimeOffset.UtcNow;
        auditoria.Registrar(
            contaId,
            usuarioId,
            "ConversaWhatsAppPacienteVinculado",
            nameof(ConversaWhatsApp),
            conversa.Id,
            "Paciente vinculado à conversa WhatsApp.",
            null,
            new { paciente.Id, paciente.NomeCompleto },
            ip,
            userAgent);
        await dbContext.SaveChangesAsync(cancellationToken);

        conversa.Paciente = paciente;
        var detalhe = await CarregarDetalheAsync(contaId, id, cancellationToken);
        return MapearDetalhe(detalhe);
    }

    public async Task<ConversaWhatsAppDetalheResponse> AssumirAtendimentoHumanoAsync(
        Guid usuarioId,
        Guid contaId,
        Guid id,
        AssumirAtendimentoHumanoRequest request,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, cancellationToken);
        var conversa = await dbContext.ConversasWhatsApp
            .SingleOrDefaultAsync(item => item.Id == id && item.ContaPsicologoId == contaId, cancellationToken)
            ?? throw new RegraNegocioException("Conversa não encontrada.", StatusCodes.Status404NotFound);

        if (conversa.Status is StatusConversaWhatsApp.Finalizada or StatusConversaWhatsApp.Bloqueada)
            throw new RegraNegocioException("Esta conversa já foi encerrada.");

        conversa.Status = StatusConversaWhatsApp.AtendimentoHumano;
        conversa.AtendimentoHumanoNecessario = true;
        conversa.MotivoAtendimentoHumano = string.IsNullOrWhiteSpace(request.Motivo)
            ? "A equipe do consultório assumiu a conversa."
            : request.Motivo.Trim();
        conversa.AtualizadoEm = DateTimeOffset.UtcNow;

        var sessoes = await dbContext.SessoesBot
            .Where(item => item.ContaPsicologoId == contaId &&
                           item.ConversaWhatsAppId == id &&
                           item.Status == StatusSessaoBot.Aberta)
            .ToListAsync(cancellationToken);
        foreach (var sessao in sessoes)
        {
            sessao.Status = StatusSessaoBot.AtendimentoHumano;
            sessao.AtualizadoEm = DateTimeOffset.UtcNow;
        }

        auditoria.Registrar(
            contaId,
            usuarioId,
            "ConversaWhatsAppAtendimentoHumano",
            nameof(ConversaWhatsApp),
            conversa.Id,
            "Conversa assumida pela equipe.",
            null,
            new { conversa.Status, conversa.MotivoAtendimentoHumano },
            ip,
            userAgent);
        await dbContext.SaveChangesAsync(cancellationToken);
        return MapearDetalhe(await CarregarDetalheAsync(contaId, id, cancellationToken));
    }

    /// <summary>Devolve a conversa ao assistente: ele volta a responder as próximas mensagens do paciente.</summary>
    public async Task<ConversaWhatsAppDetalheResponse> DevolverAoAssistenteAsync(
        Guid usuarioId,
        Guid contaId,
        Guid id,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, cancellationToken);
        var conversa = await dbContext.ConversasWhatsApp
            .SingleOrDefaultAsync(item => item.Id == id && item.ContaPsicologoId == contaId, cancellationToken)
            ?? throw new RegraNegocioException("Conversa não encontrada.", StatusCodes.Status404NotFound);

        if (conversa.Status != StatusConversaWhatsApp.AtendimentoHumano)
            throw new RegraNegocioException("Esta conversa não está com a equipe.");

        conversa.Status = StatusConversaWhatsApp.Aberta;
        conversa.AtendimentoHumanoNecessario = false;
        conversa.MotivoAtendimentoHumano = null;
        conversa.AtualizadoEm = DateTimeOffset.UtcNow;

        auditoria.Registrar(
            contaId,
            usuarioId,
            "ConversaWhatsAppDevolvidaAoAssistente",
            nameof(ConversaWhatsApp),
            conversa.Id,
            "Conversa devolvida ao assistente.",
            new { Status = StatusConversaWhatsApp.AtendimentoHumano },
            new { Status = StatusConversaWhatsApp.Aberta },
            ip,
            userAgent);
        await dbContext.SaveChangesAsync(cancellationToken);
        return MapearDetalhe(await CarregarDetalheAsync(contaId, id, cancellationToken));
    }

    public async Task<ConversaWhatsAppDetalheResponse> AlterarStatusAsync(
        Guid usuarioId,
        Guid contaId,
        Guid id,
        StatusConversaWhatsApp status,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, cancellationToken);
        if (status is not (StatusConversaWhatsApp.Finalizada or StatusConversaWhatsApp.Bloqueada or StatusConversaWhatsApp.Aberta))
            throw new RegraNegocioException("Transição de status da conversa inválida.");

        var conversa = await dbContext.ConversasWhatsApp
            .SingleOrDefaultAsync(item => item.Id == id && item.ContaPsicologoId == contaId, cancellationToken)
            ?? throw new RegraNegocioException("Conversa não encontrada.", StatusCodes.Status404NotFound);

        var anterior = conversa.Status;
        conversa.Status = status;
        conversa.AtualizadoEm = DateTimeOffset.UtcNow;
        if (status == StatusConversaWhatsApp.Aberta)
        {
            conversa.AtendimentoHumanoNecessario = false;
            conversa.MotivoAtendimentoHumano = null;
        }
        if (status is StatusConversaWhatsApp.Finalizada or StatusConversaWhatsApp.Bloqueada)
        {
            var sessoes = await dbContext.SessoesBot
                .Where(item => item.ContaPsicologoId == contaId &&
                               item.ConversaWhatsAppId == id &&
                               item.Status == StatusSessaoBot.Aberta)
                .ToListAsync(cancellationToken);
            foreach (var sessao in sessoes)
            {
                sessao.Status = StatusSessaoBot.Finalizada;
                sessao.AtualizadoEm = DateTimeOffset.UtcNow;
            }
        }

        auditoria.Registrar(
            contaId,
            usuarioId,
            "StatusConversaWhatsAppAlterado",
            nameof(ConversaWhatsApp),
            conversa.Id,
            "Situação da conversa alterada.",
            new { Status = anterior },
            new { Status = status },
            ip,
            userAgent);
        await dbContext.SaveChangesAsync(cancellationToken);
        return MapearDetalhe(await CarregarDetalheAsync(contaId, id, cancellationToken));
    }

    public async Task<MensagemWhatsAppResponse> EnviarMensagemAdministrativaAsync(
        Guid usuarioId,
        Guid contaId,
        Guid conversaId,
        EnviarMensagemConversaRequest request,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken)
    {
        await autorizacao.ObterUsuarioAtivoAsync(usuarioId, contaId, cancellationToken);
        var conversa = await dbContext.ConversasWhatsApp
            .Include(item => item.IntegracaoWhatsApp)
            .SingleOrDefaultAsync(item => item.Id == conversaId && item.ContaPsicologoId == contaId, cancellationToken)
            ?? throw new RegraNegocioException("Conversa não encontrada.", StatusCodes.Status404NotFound);

        if (conversa.Status is StatusConversaWhatsApp.Finalizada or StatusConversaWhatsApp.Bloqueada)
            throw new RegraNegocioException("Não é possível enviar mensagem em conversa encerrada.");

        var conteudo = request.Conteudo.Trim();
        if (conteudo.Length == 0)
            throw new RegraNegocioException("Informe o conteúdo da mensagem administrativa.");

        var mensagem = new MensagemWhatsApp
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = contaId,
            ConversaWhatsAppId = conversa.Id,
            Direcao = DirecaoMensagem.Saida,
            TipoMensagem = TipoMensagemWhatsApp.Texto,
            Conteudo = protecao.Proteger(conteudo),
            Status = StatusMensagemWhatsApp.Pendente,
            CriadoEm = DateTimeOffset.UtcNow
        };

        // Sem Bridge ativo/conectado: não finge envio.
        if (conversa.IntegracaoWhatsApp.Status != StatusIntegracao.Ativa || !conversa.IntegracaoWhatsApp.Ativo)
        {
            mensagem.Status = StatusMensagemWhatsApp.Pendente;
            mensagem.ErroEnvio = "Bridge indisponível ou inativo. Mensagem permanece na fila lógica administrativa.";
        }
        else
        {
            // Entrega real depende do Bridge externo. Mantém pendente até confirmação por evento.
            mensagem.Status = StatusMensagemWhatsApp.Pendente;
            mensagem.ErroEnvio = "Aguardando confirmação de entrega pelo Bridge.";
        }

        conversa.UltimaMensagemEm = DateTimeOffset.UtcNow;
        conversa.AtualizadoEm = DateTimeOffset.UtcNow;
        if (conversa.Status == StatusConversaWhatsApp.Aberta)
            conversa.Status = StatusConversaWhatsApp.AtendimentoHumano;

        dbContext.MensagensWhatsApp.Add(mensagem);
        auditoria.Registrar(
            contaId,
            usuarioId,
            "MensagemWhatsAppAdministrativaCriada",
            nameof(MensagemWhatsApp),
            mensagem.Id,
            "Mensagem administrativa registrada para envio via Bridge.",
            null,
            new { conversa.Id, mensagem.Status },
            ip,
            userAgent);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new MensagemWhatsAppResponse(
            mensagem.Id,
            mensagem.Direcao,
            mensagem.TipoMensagem,
            conteudo,
            mensagem.Status,
            mensagem.EnviadaEm,
            mensagem.RecebidaEm,
            mensagem.ErroEnvio,
            mensagem.CriadoEm);
    }

    private async Task<ConversaWhatsApp> CarregarDetalheAsync(Guid contaId, Guid id, CancellationToken cancellationToken)
    {
        return await dbContext.ConversasWhatsApp.AsNoTracking()
                   .Include(item => item.Paciente)
                   .Include(item => item.Mensagens.OrderBy(m => m.CriadoEm))
                   .SingleOrDefaultAsync(item => item.Id == id && item.ContaPsicologoId == contaId, cancellationToken)
               ?? throw new RegraNegocioException("Conversa não encontrada.", StatusCodes.Status404NotFound);
    }

    private ConversaWhatsAppListaResponse MapearLista(ConversaWhatsApp item)
    {
        var ultima = item.Mensagens.OrderByDescending(m => m.CriadoEm).FirstOrDefault();
        string? previa = null;
        if (ultima?.Conteudo is not null)
        {
            try
            {
                var texto = protecao.Desproteger(ultima.Conteudo);
                previa = texto.Length <= 80 ? texto : texto[..80] + "…";
            }
            catch
            {
                previa = "[conteúdo protegido]";
            }
        }

        return new ConversaWhatsAppListaResponse(
            item.Id,
            item.IntegracaoWhatsAppId,
            item.PacienteId,
            item.Paciente?.NomeCompleto,
            MascararTelefone(item.Telefone),
            item.NomeContato,
            item.Status,
            item.UltimaMensagemEm,
            item.AtendimentoHumanoNecessario,
            item.MotivoAtendimentoHumano,
            previa,
            item.CriadoEm);
    }

    private ConversaWhatsAppDetalheResponse MapearDetalhe(ConversaWhatsApp item)
    {
        var mensagens = item.Mensagens
            .OrderBy(m => m.CriadoEm)
            .Select(m =>
            {
                string? conteudo = null;
                if (!string.IsNullOrWhiteSpace(m.Conteudo))
                {
                    try { conteudo = protecao.Desproteger(m.Conteudo); }
                    catch { conteudo = "[conteúdo protegido]"; }
                }

                return new MensagemWhatsAppResponse(
                    m.Id,
                    m.Direcao,
                    m.TipoMensagem,
                    conteudo,
                    m.Status,
                    m.EnviadaEm,
                    m.RecebidaEm,
                    m.ErroEnvio,
                    m.CriadoEm);
            })
            .ToArray();

        return new ConversaWhatsAppDetalheResponse(
            item.Id,
            item.IntegracaoWhatsAppId,
            item.PacienteId,
            item.Paciente?.NomeCompleto,
            MascararTelefone(item.Telefone),
            item.NomeContato,
            item.Status,
            item.UltimaMensagemEm,
            item.AtendimentoHumanoNecessario,
            item.MotivoAtendimentoHumano,
            item.CriadoEm,
            mensagens);
    }

    private static string MascararTelefone(string telefone)
    {
        var digitos = DigitosRegex().Replace(telefone, string.Empty);
        if (digitos.Length <= 4) return "****";
        return new string('*', Math.Max(0, digitos.Length - 4)) + digitos[^4..];
    }

    [GeneratedRegex(@"\D")]
    private static partial Regex DigitosRegex();
}
