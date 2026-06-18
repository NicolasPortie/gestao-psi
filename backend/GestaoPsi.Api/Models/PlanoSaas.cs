using GestaoPsi.Api.Shared.Enums;

namespace GestaoPsi.Api.Models;

public class PlanoSaas
{
    public Guid Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public decimal ValorMensal { get; set; }
    public decimal? ValorAnual { get; set; }
    public int? LimitePacientesAtivos { get; set; }
    public int? LimiteMensagensWhatsAppMes { get; set; }
    public int? LimiteDocumentosMes { get; set; }
    public bool PermiteWhatsApp { get; set; } = true;
    public bool PermiteDocumentosPsicologicos { get; set; } = true;
    public bool PermiteExportacaoDados { get; set; } = true;
    public StatusPlanoSaas Status { get; set; } = StatusPlanoSaas.Ativo;
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AtualizadoEm { get; set; }

    public ICollection<AssinaturaConta> Assinaturas { get; set; } = [];
}
