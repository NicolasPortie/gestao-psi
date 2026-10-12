using GestaoPsi.Api.Services.Comunicacao;
using GestaoPsi.Api.Shared.Excecoes;

namespace GestaoPsi.Api.Tests;

public sealed class ModeloMensagemTemplateServiceTests
{
    private readonly ModeloMensagemTemplateService _service = new();

    [Fact]
    public void Renderizar_DeveSubstituirVariaveisPermitidas()
    {
        var valores = new Dictionary<string, string?>
        {
            [VariaveisModeloMensagem.NomePaciente] = "Ana Silva",
            [VariaveisModeloMensagem.DataConsulta] = "20/07/2026",
            [VariaveisModeloMensagem.HorarioConsulta] = "15:30"
        };

        var resultado = _service.Renderizar(
            "Olá, {{nome_paciente}}. Sua consulta é em {{data_consulta}} às {{horario_consulta}}.",
            valores);

        Assert.Equal("Olá, Ana Silva. Sua consulta é em 20/07/2026 às 15:30.", resultado);
    }

    [Fact]
    public void ValidarConteudo_DeveRejeitarVariaveisDesconhecidas()
    {
        var excecao = Assert.Throws<RegraNegocioException>(() =>
            _service.ValidarConteudo("Diagnóstico: {{diagnostico_clinico}}"));

        Assert.Contains("{{diagnostico_clinico}}", excecao.Message);
    }

    [Fact]
    public void Renderizar_DeveSubstituirVariavelAusentePorVazio()
    {
        var valores = new Dictionary<string, string?>
        {
            [VariaveisModeloMensagem.NomePaciente] = "Ana"
        };

        var resultado = _service.Renderizar(
            "Olá, {{nome_paciente}}. Local: {{endereco}}.",
            valores);

        Assert.Equal("Olá, Ana. Local: .", resultado);
    }

    [Fact]
    public void Renderizar_NaoDeveInterpretarValorComoTemplate()
    {
        var valores = new Dictionary<string, string?>
        {
            [VariaveisModeloMensagem.NomePaciente] = "{{nome_paciente}} injetado"
        };

        var resultado = _service.Renderizar("Paciente: {{nome_paciente}}", valores);
        Assert.Equal("Paciente: {{nome_paciente}} injetado", resultado);
    }

    [Fact]
    public void ValidarConteudo_DeveAceitarAssuntoComVariaveisPermitidas()
    {
        _service.ValidarConteudo(
            "Olá, {{nome_paciente}}",
            "Lembrete {{data_consulta}}");
    }
}
