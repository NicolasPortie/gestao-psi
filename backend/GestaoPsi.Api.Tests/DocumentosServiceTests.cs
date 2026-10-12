using GestaoPsi.Api.Data;
using GestaoPsi.Api.DTOs.Documentos;
using GestaoPsi.Api.Models;
using GestaoPsi.Api.Services.Documentos;
using GestaoPsi.Api.Services.Seguranca;
using GestaoPsi.Api.Shared.Enums;
using GestaoPsi.Api.Shared.Excecoes;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace GestaoPsi.Api.Tests;

public sealed class DocumentosServiceTests
{
    [Fact]
    public async Task CriarAsync_DeveProtegerConteudoERegistrarAuditoria()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var auditoria = new AuditoriaCaptura();
        var service = CriarService(contexto, auditoria);

        var resposta = await service.CriarAsync(
            cenario.UsuarioId,
            cenario.ContaId,
            new CriarDocumentoRequest
            {
                PacienteId = cenario.PacienteId,
                Tipo = TipoDocumentoPsicologico.Declaracao,
                Titulo = "Declaração de acompanhamento",
                Conteudo = "Declaramos que a pessoa encontra-se em acompanhamento psicológico."
            },
            "127.0.0.1",
            "teste",
            CancellationToken.None);

        var persistido = await contexto.DocumentosProntuario.SingleAsync();
        Assert.StartsWith("protegido:", persistido.ConteudoAtualJson);
        Assert.Equal("Declaramos que a pessoa encontra-se em acompanhamento psicológico.", resposta.Conteudo);
        Assert.Contains("DocumentoPsicologicoCriado", auditoria.Acoes);
    }

    [Fact]
    public async Task CriarAsync_NaoDeveAceitarPacienteDeOutraConta()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var outraContaId = Guid.NewGuid();
        var outroPacienteId = Guid.NewGuid();
        contexto.AddRange(
            new ContaPsicologo
            {
                Id = outraContaId,
                NomeConta = "Outra conta",
                Status = StatusContaPsicologo.Ativa
            },
            new Paciente
            {
                Id = outroPacienteId,
                ContaPsicologoId = outraContaId,
                NomeCompleto = "Paciente externo",
                Status = StatusPaciente.Ativo
            },
            new Prontuario
            {
                Id = Guid.NewGuid(),
                ContaPsicologoId = outraContaId,
                PacienteId = outroPacienteId,
                Status = StatusProntuario.Ativo
            });
        await contexto.SaveChangesAsync();

        var service = CriarService(contexto, new AuditoriaCaptura());
        var excecao = await Assert.ThrowsAsync<RegraNegocioException>(() => service.CriarAsync(
            cenario.UsuarioId,
            cenario.ContaId,
            new CriarDocumentoRequest
            {
                PacienteId = outroPacienteId,
                Tipo = TipoDocumentoPsicologico.Declaracao,
                Titulo = "Documento indevido",
                Conteudo = "Conteúdo administrativo."
            },
            null,
            null,
            CancellationToken.None));

        Assert.Equal(StatusCodes.Status404NotFound, excecao.StatusCode);
        Assert.Empty(contexto.DocumentosProntuario);
    }

    [Theory]
    [InlineData("A pessoa apresenta diagnóstico em avaliação.")]
    [InlineData("A pessoa apresenta DIAGNOSTICO em avaliação.")]
    [InlineData("Foi levantada uma hipótese inicial.")]
    [InlineData("Sem sintomas relevantes.")]
    public async Task CriarAsync_DeclaracaoNaoDevePermitirTermosClinicosComOuSemAcento(string conteudo)
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var service = CriarService(contexto, new AuditoriaCaptura());

        var excecao = await Assert.ThrowsAsync<RegraNegocioException>(() => service.CriarAsync(
            cenario.UsuarioId,
            cenario.ContaId,
            new CriarDocumentoRequest
            {
                PacienteId = cenario.PacienteId,
                Tipo = TipoDocumentoPsicologico.Declaracao,
                Titulo = "Declaração com conteúdo clínico",
                Conteudo = conteudo
            },
            null,
            null,
            CancellationToken.None));

        Assert.Equal(StatusCodes.Status400BadRequest, excecao.StatusCode);
        Assert.Empty(contexto.DocumentosProntuario);
    }

    [Fact]
    public async Task FinalizarAsync_DeveCriarVersaoImutavelComHash()
    {
        await using var contexto = CriarContexto();
        var cenario = await CriarCenarioAsync(contexto);
        var auditoria = new AuditoriaCaptura();
        var service = CriarService(contexto, auditoria);
        var criado = await service.CriarAsync(
            cenario.UsuarioId,
            cenario.ContaId,
            new CriarDocumentoRequest
            {
                PacienteId = cenario.PacienteId,
                Tipo = TipoDocumentoPsicologico.RelatorioPsicologico,
                Titulo = "Relatório psicológico",
                Finalidade = "Encaminhamento solicitado pela pessoa atendida.",
                Conteudo = "Conteúdo revisado do relatório."
            },
            null,
            null,
            CancellationToken.None);

        var resposta = await service.FinalizarAsync(
            cenario.UsuarioId,
            cenario.ContaId,
            criado.Id,
            null,
            null,
            CancellationToken.None);

        var documento = await contexto.DocumentosProntuario.SingleAsync();
        var versao = await contexto.VersoesDocumentoProntuario.SingleAsync();
        Assert.Equal(StatusDocumentoProntuario.Finalizado, resposta.Status);
        Assert.Equal("hash:Conteúdo revisado do relatório.", documento.HashConteudoFinal);
        Assert.StartsWith("protegido:", versao.ConteudoJson);
        Assert.Equal(1, versao.NumeroVersao);
        Assert.Contains("DocumentoPsicologicoFinalizado", auditoria.Acoes);
    }

    private static DocumentosService CriarService(AppDbContext contexto, IAuditoriaService auditoria) =>
        new(contexto, new AutorizacaoContaService(contexto), new ProtecaoFake(), auditoria);

    private static async Task<Cenario> CriarCenarioAsync(AppDbContext contexto)
    {
        var contaId = Guid.NewGuid();
        var usuarioId = Guid.NewGuid();
        var pacienteId = Guid.NewGuid();
        contexto.AddRange(
            new ContaPsicologo
            {
                Id = contaId,
                NomeConta = "Consultorio",
                Status = StatusContaPsicologo.Ativa
            },
            new Usuario
            {
                Id = usuarioId,
                ContaPsicologoId = contaId,
                NomeCompleto = "Psicologa",
                Email = $"{usuarioId:N}@teste.local",
                SenhaHash = "hash",
                Perfil = PerfilUsuario.Psicologo,
                Status = StatusUsuario.Ativo
            },
            new Paciente
            {
                Id = pacienteId,
                ContaPsicologoId = contaId,
                NomeCompleto = "Paciente da conta",
                Status = StatusPaciente.Ativo
            },
            new Prontuario
            {
                Id = Guid.NewGuid(),
                ContaPsicologoId = contaId,
                PacienteId = pacienteId,
                Status = StatusProntuario.Ativo
            });
        await contexto.SaveChangesAsync();
        return new Cenario(contaId, usuarioId, pacienteId);
    }

    private static AppDbContext CriarContexto() => new(
        new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

    private sealed record Cenario(Guid ContaId, Guid UsuarioId, Guid PacienteId);

    private sealed class ProtecaoFake : IProtecaoDadosService
    {
        public string Proteger(string valor) => $"protegido:{valor}";
        public string Desproteger(string valorProtegido) =>
            valorProtegido.StartsWith("protegido:", StringComparison.Ordinal)
                ? valorProtegido["protegido:".Length..]
                : valorProtegido;
        public string HashDeterministico(string valor) => $"hash:{valor}";
        public string HashToken(string token) => $"tokenhash:{token}";
        public string GerarTokenSeguro() => "token";
    }

    private sealed class AuditoriaCaptura : IAuditoriaService
    {
        public List<string> Acoes { get; } = [];

        public void Registrar(
            Guid contaPsicologoId,
            Guid? usuarioId,
            string tipoAcao,
            string entidade,
            Guid? entidadeId,
            string descricao,
            object? dadosAntes = null,
            object? dadosDepois = null,
            string? ip = null,
            string? userAgent = null) => Acoes.Add(tipoAcao);
    }
}
