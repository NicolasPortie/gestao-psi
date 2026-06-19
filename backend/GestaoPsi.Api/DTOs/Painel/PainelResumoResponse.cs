namespace GestaoPsi.Api.DTOs.Painel;

public sealed record PainelResumoResponse(
    PainelUsuarioResponse Usuario,
    PainelIndicadoresResponse Indicadores,
    IReadOnlyCollection<PainelConsultaHojeResponse> ConsultasHoje,
    IReadOnlyCollection<PainelDiaSemanaResponse> VisaoSemana,
    IReadOnlyCollection<PainelAlertaResponse> Alertas,
    IReadOnlyCollection<PainelPrioridadeResponse> Prioridades,
    IReadOnlyCollection<PainelAcaoRapidaResponse> AcoesRapidas);

public sealed record PainelUsuarioResponse(
    string NomeCompleto,
    string PrimeiroNome,
    string Perfil);

public sealed record PainelIndicadoresResponse(
    int ConsultasHoje,
    int ConsultasRestantesHoje,
    int ConsultasAguardandoConfirmacao,
    int PacientesAtivos,
    decimal PagamentosPendentes,
    int LembretesFalhosHoje,
    int ConversasWhatsappAbertas,
    int ConversasWhatsappAtendimentoHumano,
    int NotificacoesNaoLidas,
    int ProgressoMensalPercentual);

public sealed record PainelConsultaHojeResponse(
    Guid Id,
    string Paciente,
    string HorarioInicio,
    int DuracaoMinutos,
    string TipoAtendimento,
    string Modalidade,
    string Status,
    bool PodeRegistrarSessao);

public sealed record PainelDiaSemanaResponse(
    DateOnly Data,
    string Rotulo,
    int Consultas);

public sealed record PainelAlertaResponse(
    string Tipo,
    string Titulo,
    string Mensagem,
    DateTimeOffset CriadoEm,
    string? Rota);

public sealed record PainelPrioridadeResponse(
    string Titulo,
    string Mensagem,
    string Icone,
    string Tom,
    string Rota,
    string Acao);

public sealed record PainelAcaoRapidaResponse(
    string Titulo,
    string Descricao,
    string Icone,
    string Rota,
    bool Habilitada);
