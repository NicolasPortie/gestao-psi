using GestaoPsi.Api.Services.WhatsApp;

namespace GestaoPsi.Api.Tests;

public sealed class DetectorConteudoSensiveisTests
{
    private readonly DetectorConteudoSensiveisService _detector = new();

    [Theory]
    [InlineData("Estou em crise de pânico e preciso de ajuda")]
    [InlineData("ESTOU EM CRISE DE PANICO")]
    [InlineData("pensando em suicídio")]
    [InlineData("PENSANDO EM SUICIDIO")]
    [InlineData("quero um diagnóstico")]
    [InlineData("sofrendo violência doméstica")]
    [InlineData("não quero viver assim")]
    [InlineData("ideação suicida")]
    public void ConteudoSensivel_DeveExigirHumano(string conteudo)
    {
        Assert.True(_detector.RequerAtendimentoHumano(conteudo, out var motivo));
        Assert.False(string.IsNullOrWhiteSpace(motivo));
    }

    [Theory]
    [InlineData("ola, quais horários disponíveis?")]
    [InlineData("quero agendar 12/08 14:00")]
    [InlineData("obrigado, até mais")]
    [InlineData("")]
    public void ConteudoAdministrativo_NaoDeveExigirHumano(string conteudo)
    {
        Assert.False(_detector.RequerAtendimentoHumano(conteudo, out _));
    }
}
