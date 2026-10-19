using GestaoPsi.Api.Models;
using GestaoPsi.Api.Shared.Enums;
using Microsoft.EntityFrameworkCore;

namespace GestaoPsi.Api.Services.WhatsApp;

/// <summary>
/// Passagem da conversa do assistente para uma pessoa da equipe. Acontece quando o paciente pede,
/// quando a mensagem pode ser sensível e quando o assistente não consegue ajudar.
/// Depois disso o assistente fica em silêncio até a equipe devolver a conversa.
/// </summary>
public sealed partial class BridgeWhatsAppService
{
    private const string IntencaoFalarComHumano = "falar_com_humano";
    private const string MotivoPedidoDoPaciente = "O paciente pediu para falar com uma pessoa.";
    private const string MotivoNaoEntendeu = "O assistente não entendeu o pedido.";

    private const string RespostaPedidoHumano =
        "Certo, vou avisar a equipe do consultório. Alguém responde você por aqui assim que possível.";

    private const string RespostaNaoEntendeu =
        "Não consegui entender o que você precisa, então vou passar a conversa para a equipe do consultório. Alguém responde você por aqui.";

    private const string RespostaPacienteNaoIdentificado =
        "Não encontrei seu cadastro pelo número desta conversa. Vou passar a conversa para a equipe, que localiza seu cadastro e responde você por aqui.";

    private const string RespostaAgendaNaoConfigurada =
        "Ainda não consigo cuidar de agendamentos por aqui. Vou passar a conversa para a equipe, que responde você.";

    private const string RespostaConteudoSensivel =
        "Recebi sua mensagem e já avisei a equipe do consultório, que vai falar com você por aqui. " +
        "Se você estiver em perigo agora, ligue 188 (CVV, 24 horas) ou 192 (SAMU).";

    /// <summary>Sem acento: comparados com <see cref="Shared.Texto.TextoNormalizado"/>.</summary>
    private static readonly string[] TermosFalarComHumano =
    [
        "atendente", "atendimento humano", "humano",
        "falar com uma pessoa", "falar com alguem", "falar com a equipe", "pessoa de verdade",
        "recepcao", "secretaria",
        "falar com o psicologo", "falar com a psicologa", "falar com o terapeuta", "falar com a terapeuta"
    ];

    private static bool EhIntencaoDesconhecida(string? intencao) =>
        intencao is "administrativa_geral" or "desconhecida";

    private async Task EncaminharParaHumanoAsync(
        Guid contaId,
        ConversaWhatsApp conversa,
        string motivo,
        string resposta,
        CancellationToken ct)
    {
        conversa.Status = StatusConversaWhatsApp.AtendimentoHumano;
        conversa.AtendimentoHumanoNecessario = true;
        conversa.MotivoAtendimentoHumano = motivo;
        conversa.AtualizadoEm = DateTimeOffset.UtcNow;

        var sessoes = await dbContext.SessoesBot
            .Where(item => item.ContaPsicologoId == contaId &&
                           item.ConversaWhatsAppId == conversa.Id &&
                           item.Status == StatusSessaoBot.Aberta)
            .ToListAsync(ct);
        foreach (var sessao in sessoes)
        {
            sessao.Status = StatusSessaoBot.AtendimentoHumano;
            sessao.AtualizadoEm = DateTimeOffset.UtcNow;
        }

        RegistrarRespostaBot(contaId, conversa, resposta);
        RegistrarEncaminhamentoHumano(contaId, conversa, motivo);

        var contato = string.IsNullOrWhiteSpace(conversa.NomeContato) ? "Um contato" : conversa.NomeContato;
        await NotificarEquipeAsync(
            contaId,
            "Uma pessoa precisa responder no WhatsApp",
            $"{contato}: {motivo} Abra a conversa para responder.",
            ct);
    }

    private void RegistrarEncaminhamentoHumano(Guid contaId, ConversaWhatsApp conversa, string motivo)
    {
        conversa.Status = StatusConversaWhatsApp.AtendimentoHumano;
        conversa.AtendimentoHumanoNecessario = true;
        conversa.MotivoAtendimentoHumano = motivo;
        auditoria.Registrar(
            contaId,
            null,
            "ConversaWhatsAppAtendimentoHumano",
            nameof(ConversaWhatsApp),
            conversa.Id,
            "Conversa passada para a equipe pelo assistente do WhatsApp.",
            null,
            new { Status = StatusConversaWhatsApp.AtendimentoHumano, Motivo = motivo },
            null,
            null);
    }
}
