using GestaoPsi.Api.Data;
using GestaoPsi.Api.DTOs.WhatsApp;
using GestaoPsi.Api.Models;
using GestaoPsi.Api.Services.Notificacoes;
using GestaoPsi.Api.Services.Seguranca;
using GestaoPsi.Api.Services.WhatsApp;
using GestaoPsi.Api.Shared.Enums;
using GestaoPsi.Api.Shared.Excecoes;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace GestaoPsi.Api.Tests;

public sealed class WhatsAppBridgeServiceTests
{
    [Fact]
    public async Task ReceberEvento_SemToken_DeveNegar()
    {
        await using var contexto = CriarContexto();
        var service = CriarBridge(contexto);

        var excecao = await Assert.ThrowsAsync<RegraNegocioException>(() =>
            service.ReceberEventoAsync(
                "",
                new ReceberEventoBridgeRequest
                {
                    TipoEvento = "mensagem.recebida",
                    Telefone = "5511999999999",
                    Conteudo = "Quero agendar"
                },
                null,
                null,
                CancellationToken.None));

        Assert.Equal(StatusCodes.Status401Unauthorized, excecao.StatusCode);
    }

    [Fact]
    public async Task ReceberMensagem_DeveCriarConversaEMensagemProtegida()
    {
        await using var contexto = CriarContexto();
        var protecao = new ProtecaoFake();
        var token = "token-bridge-super-seguro";
        var contaId = Guid.NewGuid();
        contexto.AddRange(
            new ContaPsicologo { Id = contaId, NomeConta = "Conta WA", Status = StatusContaPsicologo.Ativa },
            new IntegracaoWhatsApp
            {
                Id = Guid.NewGuid(),
                ContaPsicologoId = contaId,
                Nome = "Bridge",
                Provedor = "Bridge",
                UrlBaseBridge = "https://bridge.local",
                TokenCriptografado = protecao.Proteger(token),
                TokenHash = protecao.HashToken(token),
                NumeroWhatsApp = "5511888888888",
                Status = StatusIntegracao.Ativa,
                Ativo = true
            },
            new Usuario
            {
                Id = Guid.NewGuid(),
                ContaPsicologoId = contaId,
                NomeCompleto = "Psi",
                Email = "psi@teste.local",
                SenhaHash = "x",
                Perfil = PerfilUsuario.Psicologo,
                Status = StatusUsuario.Ativo
            });
        await contexto.SaveChangesAsync();

        var service = CriarBridge(contexto, protecao);
        var resultado = await service.ReceberEventoAsync(
            token,
            new ReceberEventoBridgeRequest
            {
                EventoExternoId = "evt-1",
                TipoEvento = "mensagem.recebida",
                Telefone = "5511999999999",
                NomeContato = "Maria",
                Conteudo = "Quero remarcar minha consulta",
                MensagemExternaId = "msg-1"
            },
            null,
            null,
            CancellationToken.None);

        Assert.True(resultado.Processado);
        Assert.False(resultado.Duplicado);
        Assert.NotNull(resultado.ConversaId);
        Assert.Single(contexto.ConversasWhatsApp);
        Assert.Equal(2, contexto.MensagensWhatsApp.Count());
        Assert.Contains(contexto.MensagensWhatsApp, m => m.Direcao == DirecaoMensagem.Entrada && m.Conteudo!.StartsWith("protegido:"));
        Assert.Contains(contexto.MensagensWhatsApp, m => m.Direcao == DirecaoMensagem.Saida);
        Assert.Contains(contexto.SessoesBot, s => s.IntencaoAtual == "remarcar_consulta");
    }

    [Fact]
    public async Task ReceberMensagem_DeveVincularPacientePeloHashDoContato()
    {
        await using var contexto = CriarContexto();
        var protecao = new ProtecaoFake();
        var token = "token-bridge-vinculo-01";
        var contaId = Guid.NewGuid();
        var pacienteId = Guid.NewGuid();
        const string telefone = "5511999999999";
        contexto.AddRange(
            new ContaPsicologo { Id = contaId, NomeConta = "Conta WA", Status = StatusContaPsicologo.Ativa },
            new IntegracaoWhatsApp
            {
                Id = Guid.NewGuid(),
                ContaPsicologoId = contaId,
                Nome = "Bridge",
                Provedor = "Bridge",
                UrlBaseBridge = "https://bridge.local",
                TokenCriptografado = protecao.Proteger(token),
                TokenHash = protecao.HashToken(token),
                NumeroWhatsApp = "5511888888888",
                Status = StatusIntegracao.Ativa,
                Ativo = true
            },
            new Paciente
            {
                Id = pacienteId,
                ContaPsicologoId = contaId,
                NomeCompleto = "Paciente Vínculo",
                Telefone = protecao.Proteger(telefone),
                Status = StatusPaciente.Ativo
            },
            new ContatoPaciente
            {
                Id = Guid.NewGuid(),
                ContaPsicologoId = contaId,
                PacienteId = pacienteId,
                TipoContato = TipoContato.WhatsApp,
                Valor = protecao.Proteger(telefone),
                ValorHash = protecao.HashDeterministico(telefone),
                Principal = true
            });
        await contexto.SaveChangesAsync();

        var service = CriarBridge(contexto, protecao);
        var resultado = await service.ReceberEventoAsync(
            token,
            new ReceberEventoBridgeRequest
            {
                EventoExternoId = "evt-vinc",
                TipoEvento = "mensagem.recebida",
                Telefone = telefone,
                Conteudo = "ola, quais horários?",
                MensagemExternaId = "msg-vinc"
            },
            null,
            null,
            CancellationToken.None);

        Assert.True(resultado.Processado);
        var conversa = Assert.Single(contexto.ConversasWhatsApp);
        Assert.Equal(pacienteId, conversa.PacienteId);
    }

    [Fact]
    public async Task ConteudoSensivel_DeveExigirHumanoENotificar()
    {
        await using var contexto = CriarContexto();
        var protecao = new ProtecaoFake();
        var token = "token-bridge-sensivel-01";
        var contaId = Guid.NewGuid();
        var usuarioId = Guid.NewGuid();
        contexto.AddRange(
            new ContaPsicologo { Id = contaId, NomeConta = "Conta WA", Status = StatusContaPsicologo.Ativa },
            new IntegracaoWhatsApp
            {
                Id = Guid.NewGuid(),
                ContaPsicologoId = contaId,
                Nome = "Bridge",
                Provedor = "Bridge",
                UrlBaseBridge = "https://bridge.local",
                TokenCriptografado = protecao.Proteger(token),
                TokenHash = protecao.HashToken(token),
                NumeroWhatsApp = "5511888888888",
                Status = StatusIntegracao.Ativa,
                Ativo = true
            },
            new Usuario
            {
                Id = usuarioId,
                ContaPsicologoId = contaId,
                NomeCompleto = "Psi",
                Email = "psi@teste.local",
                SenhaHash = "x",
                Perfil = PerfilUsuario.Psicologo,
                Status = StatusUsuario.Ativo
            });
        await contexto.SaveChangesAsync();

        var service = CriarBridge(contexto, protecao);
        await service.ReceberEventoAsync(
            token,
            new ReceberEventoBridgeRequest
            {
                EventoExternoId = "evt-sensivel",
                TipoEvento = "mensagem.recebida",
                Telefone = "5511999991111",
                Conteudo = "Estou em crise de panico e quero morrer"
            },
            null,
            null,
            CancellationToken.None);

        var conversa = Assert.Single(contexto.ConversasWhatsApp);
        Assert.True(conversa.AtendimentoHumanoNecessario);
        Assert.Equal(StatusConversaWhatsApp.AtendimentoHumano, conversa.Status);
        Assert.Contains(contexto.Notificacoes, n => n.Tipo == "whatsapp" && n.UsuarioId == usuarioId);
    }

    [Fact]
    public async Task EventoDuplicado_DeveSerIdempotente()
    {
        await using var contexto = CriarContexto();
        var protecao = new ProtecaoFake();
        var token = "token-bridge-idempotente";
        var contaId = Guid.NewGuid();
        contexto.AddRange(
            new ContaPsicologo { Id = contaId, NomeConta = "Conta WA", Status = StatusContaPsicologo.Ativa },
            new IntegracaoWhatsApp
            {
                Id = Guid.NewGuid(),
                ContaPsicologoId = contaId,
                Nome = "Bridge",
                Provedor = "Bridge",
                UrlBaseBridge = "https://bridge.local",
                TokenCriptografado = protecao.Proteger(token),
                TokenHash = protecao.HashToken(token),
                NumeroWhatsApp = "5511888888888",
                Status = StatusIntegracao.Ativa,
                Ativo = true
            });
        await contexto.SaveChangesAsync();

        var service = CriarBridge(contexto, protecao);
        var request = new ReceberEventoBridgeRequest
        {
            EventoExternoId = "evt-dup",
            TipoEvento = "mensagem.recebida",
            Telefone = "5511999992222",
            Conteudo = "Olá",
            MensagemExternaId = "msg-dup"
        };

        await service.ReceberEventoAsync(token, request, null, null, CancellationToken.None);
        var segundo = await service.ReceberEventoAsync(token, request, null, null, CancellationToken.None);

        Assert.True(segundo.Duplicado);
        Assert.Single(contexto.ConversasWhatsApp);
        Assert.Equal(2, contexto.MensagensWhatsApp.Count());
    }

    private static BridgeWhatsAppService CriarBridge(AppDbContext contexto, ProtecaoFake? protecao = null)
    {
        protecao ??= new ProtecaoFake();
        return new BridgeWhatsAppService(
            contexto,
            protecao,
            new AuditoriaCaptura(),
            new NotificacoesService(contexto, new AutorizacaoContaService(contexto)),
            new DetectorConteudoSensiveisService());
    }

    private static AppDbContext CriarContexto() => new(
        new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

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
            string? userAgent = null)
        {
        }
    }
}
