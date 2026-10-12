using GestaoPsi.Api.Data;
using GestaoPsi.Api.Models;
using GestaoPsi.Api.Shared.Enums;
using GestaoPsi.Api.Configuracoes;
using GestaoPsi.Api.DTOs.Documentos;
using GestaoPsi.Api.DTOs.Sessoes;
using GestaoPsi.Api.DTOs.Pacientes;
using GestaoPsi.Api.Services.Documentos;
using GestaoPsi.Api.Services.Sessoes;
using GestaoPsi.Api.Services.Pacientes;
using GestaoPsi.Api.Services.Seguranca;
using GestaoPsi.Api.Shared.Excecoes;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Options;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace GestaoPsi.Api.Tests;

// Banco exclusivo desta fixture. Nunca usa a connection string da aplicacao.
public sealed class BancoIntegridadeRelacional : IAsyncLifetime
{
    private readonly string nome = $"GestaoPsi_Ticket01_{Guid.NewGuid():N}";
    public static bool InfraestruturaConfigurada => OperatingSystem.IsWindows()
        || !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("GESTAOPSI_TEST_SQLSERVER"));

    private string ConnectionString
    {
        get
        {
            var origem = Environment.GetEnvironmentVariable("GESTAOPSI_TEST_SQLSERVER");
            var builder = new SqlConnectionStringBuilder(string.IsNullOrWhiteSpace(origem)
                ? "Server=(localdb)\\MSSQLLocalDB;Integrated Security=true;TrustServerCertificate=true"
                : origem);
            // Sobrescreve qualquer catalogo recebido; nunca anexa arquivos de usuario.
            builder.InitialCatalog = nome;
            builder.AttachDBFilename = string.Empty;
            return builder.ConnectionString;
        }
    }

    public AppDbContext CriarContexto() => new(new DbContextOptionsBuilder<AppDbContext>()
        .UseSqlServer(ConnectionString)
        .Options);

    public async Task InitializeAsync()
    {
        if (!InfraestruturaConfigurada) return;
        await using var db = CriarContexto();
        await db.Database.MigrateAsync();
    }

    public async Task DisposeAsync()
    {
        if (!InfraestruturaConfigurada) return;
        // A identidade e gerada aqui, sem aceitar nome/connection string externa.
        if (!nome.StartsWith("GestaoPsi_Ticket01_", StringComparison.Ordinal))
            throw new InvalidOperationException("Banco de teste inválido.");
        await using var db = CriarContexto();
        await db.Database.EnsureDeletedAsync();
    }
}

public sealed class SqlServerFactAttribute : FactAttribute
{
    public SqlServerFactAttribute()
    {
        if (!BancoIntegridadeRelacional.InfraestruturaConfigurada)
            Skip = "SQL Server indisponível: configure GESTAOPSI_TEST_SQLSERVER; LocalDB automatico somente no Windows.";
    }
}

public sealed class SqlServerTheoryAttribute : TheoryAttribute
{
    public SqlServerTheoryAttribute()
    {
        if (!BancoIntegridadeRelacional.InfraestruturaConfigurada)
            Skip = "SQL Server indisponível: configure GESTAOPSI_TEST_SQLSERVER; LocalDB automatico somente no Windows.";
    }
}

public sealed class IntegridadeRelacionalTests(BancoIntegridadeRelacional banco)
    : IClassFixture<BancoIntegridadeRelacional>
{
    [SqlServerFact]
    public async Task Pagamento_NaoPodeReferenciarConsultaDeOutroPacienteDaMesmaConta()
    {
        await using var db = banco.CriarContexto();
        await using var transacao = await db.Database.BeginTransactionAsync();
        var c = await CriarCenarioAsync(db);
        db.Pagamentos.Add(new Pagamento
        {
            Id = Guid.NewGuid(), ContaPsicologoId = c.Conta, PacienteId = c.OutroPaciente,
            ConsultaId = c.Consulta, Valor = 100
        });

        var erro = await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
        Assert.Equal(547, Assert.IsType<SqlException>(erro.InnerException).Number);
    }

    [SqlServerTheory]
    [InlineData("DocumentoProntuario")]
    [InlineData("EvolucaoProntuario")]
    [InlineData("Lembrete")]
    [InlineData("RegistroSessaoPaciente")]
    [InlineData("RegistroSessaoTipo")]
    [InlineData("EvolucaoRegistro")]
    public async Task VinculosClinicosEAdministrativos_NaoPodemMisturarPacienteProntuarioOuTipo(string caso)
    {
        await using var db = banco.CriarContexto();
        await using var transacao = await db.Database.BeginTransactionAsync();
        var c = await CriarCenarioAsync(db);
        var id = Guid.NewGuid();
        if (caso == "DocumentoProntuario")
            db.Add(new DocumentoProntuario { Id = id, ContaPsicologoId = c.Conta, PacienteId = c.OutroPaciente, ProntuarioId = c.Prontuario, CriadoPorUsuarioId = c.Usuario, Titulo = "Documento" });
        else if (caso == "EvolucaoProntuario")
            db.Add(new EvolucaoProntuario { Id = id, ContaPsicologoId = c.Conta, PacienteId = c.OutroPaciente, ProntuarioId = c.Prontuario, CriadoPorUsuarioId = c.Usuario, Conteudo = "conteúdo de teste" });
        else if (caso == "Lembrete")
            db.Add(new Lembrete { Id = id, ContaPsicologoId = c.Conta, PacienteId = c.OutroPaciente, ConsultaId = c.Consulta });
        else if (caso.StartsWith("RegistroSessao", StringComparison.Ordinal))
        {
            var consulta = new Consulta { Id = Guid.NewGuid(), ContaPsicologoId = c.Conta, PacienteId = c.Paciente, TipoAtendimentoId = c.Tipo, InicioEm = DateTimeOffset.UtcNow.AddDays(1), FimEm = DateTimeOffset.UtcNow.AddDays(1).AddHours(1) };
            var tipo = new TipoAtendimento { Id = Guid.NewGuid(), ContaPsicologoId = c.Conta, Nome = "Outro tipo" };
            db.AddRange(consulta, tipo);
            await db.SaveChangesAsync();
            db.ChangeTracker.Clear();
            db.Add(new RegistroSessao { Id = id, ContaPsicologoId = c.Conta, PacienteId = caso == "RegistroSessaoPaciente" ? c.OutroPaciente : c.Paciente, ProntuarioId = c.Prontuario, ConsultaId = consulta.Id, TipoAtendimentoId = caso == "RegistroSessaoTipo" ? tipo.Id : c.Tipo, CriadoPorUsuarioId = c.Usuario });
        }
        else
        {
            var outroProntuario = new Prontuario { Id = Guid.NewGuid(), ContaPsicologoId = c.Conta, PacienteId = c.OutroPaciente };
            db.Add(outroProntuario);
            await db.SaveChangesAsync();
            db.ChangeTracker.Clear();
            db.Add(new EvolucaoProntuario { Id = id, ContaPsicologoId = c.Conta, PacienteId = c.OutroPaciente, ProntuarioId = outroProntuario.Id, RegistroSessaoId = c.Registro, CriadoPorUsuarioId = c.Usuario, Conteudo = "conteúdo de teste" });
        }

        var erro = await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
        Assert.Equal(547, Assert.IsType<SqlException>(erro.InnerException).Number);
    }

    [SqlServerFact]
    public async Task Prontuario_ArquivamentoPermiteNovoAtivoSemApagarHistorico()
    {
        await using var db = banco.CriarContexto();
        await using var transacao = await db.Database.BeginTransactionAsync();
        var c = await CriarCenarioAsync(db);
        var anterior = await db.Prontuarios.SingleAsync(x => x.Id == c.Prontuario);
        anterior.Status = StatusProntuario.Arquivado;
        anterior.ArquivadoEm = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();
        db.Prontuarios.Add(new Prontuario { Id = Guid.NewGuid(), ContaPsicologoId = c.Conta, PacienteId = c.Paciente });
        await db.SaveChangesAsync();

        db.ChangeTracker.Clear();
        var paciente = await db.Pacientes.Include(x => x.RegistrosSessao).SingleAsync(x => x.Id == c.Paciente);
        Assert.Single(paciente.RegistrosSessao);
        Assert.Equal(c.Prontuario, paciente.RegistrosSessao.Single().ProntuarioId);
        Assert.Equal(2, await db.Prontuarios.CountAsync(x => x.PacienteId == c.Paciente));
        db.Prontuarios.Add(new Prontuario { Id = Guid.NewGuid(), ContaPsicologoId = c.Conta, PacienteId = c.Paciente });
        var erro = await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
        Assert.Contains(Assert.IsType<SqlException>(erro.InnerException).Number, new[] { 2601, 2627 });
    }

    [SqlServerFact]
    public async Task DadosProfissionais_SomenteUmAtivoPorContaPreservandoInativos()
    {
        await using var db = banco.CriarContexto();
        await using var transacao = await db.Database.BeginTransactionAsync();
        var c = await CriarCenarioAsync(db);
        var outroUsuario = new Usuario { Id = Guid.NewGuid(), ContaPsicologoId = c.Conta, NomeCompleto = "Outro usuário", Email = $"{Guid.NewGuid():N}@teste.local", SenhaHash = "hash" };
        db.Add(outroUsuario);
        var primeiro = new DadosProfissionaisPsicologo { Id = Guid.NewGuid(), ContaPsicologoId = c.Conta, UsuarioId = c.Usuario, Crp = "protegido", CrpHash = "hash1", NomeProfissional = "Responsavel" };
        db.Add(primeiro);
        await db.SaveChangesAsync();
        db.Add(new DadosProfissionaisPsicologo { Id = Guid.NewGuid(), ContaPsicologoId = c.Conta, UsuarioId = outroUsuario.Id, Crp = "protegido", CrpHash = "hash2", NomeProfissional = "Segundo" });
        var erro = await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
        Assert.Contains(Assert.IsType<SqlException>(erro.InnerException).Number, new[] { 2601, 2627 });
        primeiro.Status = StatusUsuario.Inativo;
        await db.SaveChangesAsync();
        Assert.Equal(2, await db.DadosProfissionaisPsicologo.CountAsync(x => x.ContaPsicologoId == c.Conta));
    }

    [SqlServerFact]
    public async Task Entrega_NaoAceitaDocumentoSemVersaoFinalRastreavel()
    {
        await using var db = banco.CriarContexto();
        await using var transacao = await db.Database.BeginTransactionAsync();
        var c = await CriarCenarioAsync(db);
        var documento = new DocumentoProntuario { Id = Guid.NewGuid(), ContaPsicologoId = c.Conta, PacienteId = c.Paciente, ProntuarioId = c.Prontuario, CriadoPorUsuarioId = c.Usuario, Titulo = "Documento legado", Status = StatusDocumentoProntuario.Finalizado };
        db.Add(documento);
        await db.SaveChangesAsync();
        var protecao = CriarProtecao();
        var service = new DocumentosService(db, new AutorizacaoContaService(db), protecao, new AuditoriaService(db, protecao));

        await Assert.ThrowsAsync<RegraNegocioException>(() => service.RegistrarEntregaAsync(c.Usuario, c.Conta, documento.Id, new RegistrarEntregaDocumentoRequest(), null, null, CancellationToken.None));
        Assert.Empty(await db.ProtocolosEntregaDocumento.ToArrayAsync());
    }

    [SqlServerFact]
    public async Task Evolucao_NaoVinculaSessaoDeProntuarioArquivadoAoNovoProntuario()
    {
        await using var db = banco.CriarContexto();
        await using var transacao = await db.Database.BeginTransactionAsync();
        var c = await CriarCenarioAsync(db);
        var antigo = await db.Prontuarios.SingleAsync(x => x.Id == c.Prontuario);
        antigo.Status = StatusProntuario.Arquivado;
        await db.SaveChangesAsync();
        db.Add(new Prontuario { Id = Guid.NewGuid(), ContaPsicologoId = c.Conta, PacienteId = c.Paciente });
        await db.SaveChangesAsync();
        var protecao = CriarProtecao();
        var service = new SessoesService(db, new AutorizacaoContaService(db), protecao, new AuditoriaService(db, protecao));

        await Assert.ThrowsAsync<RegraNegocioException>(() => service.CriarEvolucaoAsync(c.Usuario, c.Conta,
            new CriarEvolucaoProntuarioRequest { PacienteId = c.Paciente, RegistroSessaoId = c.Registro, Conteudo = "Evolucao" }, null, null, CancellationToken.None));
    }

    [SqlServerFact]
    public async Task Assinatura_SomenteUmaAtivaPorContaPreservandoCanceladas()
    {
        await using var db = banco.CriarContexto();
        await using var transacao = await db.Database.BeginTransactionAsync();
        var c = await CriarCenarioAsync(db);
        var plano = new PlanoSaas { Id = Guid.NewGuid(), Codigo = $"teste-{Guid.NewGuid():N}", Nome = "Plano" };
        var anterior = new AssinaturaConta { Id = Guid.NewGuid(), ContaPsicologoId = c.Conta, PlanoSaasId = plano.Id, Status = StatusAssinaturaConta.Ativa };
        db.AddRange(plano, anterior);
        await db.SaveChangesAsync();
        db.Add(new AssinaturaConta { Id = Guid.NewGuid(), ContaPsicologoId = c.Conta, PlanoSaasId = plano.Id, Status = StatusAssinaturaConta.Ativa });
        var erro = await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
        Assert.Contains(Assert.IsType<SqlException>(erro.InnerException).Number, new[] { 2601, 2627 });
        anterior.Status = StatusAssinaturaConta.Cancelada;
        await db.SaveChangesAsync();
        Assert.Equal(2, await db.AssinaturasConta.CountAsync(x => x.ContaPsicologoId == c.Conta));
    }

    [SqlServerTheory]
    [InlineData("Rastreavel")]
    [InlineData("SemVersao")]
    [InlineData("Ambigua")]
    [InlineData("PacienteIncoerente")]
    public async Task Migration_AtualizaLegadoSomenteComVersaoDeEntregaComprovavel(string caso)
    {
        var isolado = new BancoIntegridadeRelacional();
        try
        {
            await using var db = isolado.CriarContexto();
            var migrator = db.GetService<IMigrator>();
            await migrator.MigrateAsync("20261004124651_VersionarAutenticacaoUsuario");
            var c = await CriarCenarioAsync(db);
            var documento = new DocumentoProntuario { Id = Guid.NewGuid(), ContaPsicologoId = c.Conta, PacienteId = c.Paciente, ProntuarioId = c.Prontuario, CriadoPorUsuarioId = c.Usuario, Titulo = "Documento legado", Status = StatusDocumentoProntuario.Entregue, HashConteudoFinal = "hash-legado" };
            db.Add(documento);
            var versao = new VersaoDocumentoProntuario { Id = Guid.NewGuid(), ContaPsicologoId = c.Conta, DocumentoProntuarioId = documento.Id, CriadoPorUsuarioId = c.Usuario, NumeroVersao = 1, ConteudoJson = "conteudo-legado-protegido", HashConteudo = "hash-legado", CriadoEm = DateTimeOffset.UtcNow.AddDays(-1) };
            if (caso != "SemVersao") db.Add(versao);
            if (caso == "Ambigua") db.Add(new VersaoDocumentoProntuario { Id = Guid.NewGuid(), ContaPsicologoId = c.Conta, DocumentoProntuarioId = documento.Id, CriadoPorUsuarioId = c.Usuario, NumeroVersao = 2, ConteudoJson = "conteudo-legado-protegido", HashConteudo = "hash-legado", CriadoEm = DateTimeOffset.UtcNow.AddHours(-1) });
            if (caso == "PacienteIncoerente") db.Add(new Pagamento { Id = Guid.NewGuid(), ContaPsicologoId = c.Conta, PacienteId = c.OutroPaciente, ConsultaId = c.Consulta, Valor = 100 });
            await db.SaveChangesAsync();
            var protocoloId = Guid.NewGuid();
            var agora = DateTimeOffset.UtcNow;
            await db.Database.ExecuteSqlInterpolatedAsync($"""
                INSERT INTO [ProtocolosEntregaDocumento]
                ([Id], [ContaPsicologoId], [DocumentoProntuarioId], [RegistradoPorUsuarioId], [TipoEntrega], [Status], [EntregueEm], [CriadoEm])
                VALUES ({protocoloId}, {c.Conta}, {documento.Id}, {c.Usuario}, N'Presencial', N'Registrada', {agora}, {agora})
                """);
            db.ChangeTracker.Clear();

            if (caso == "Rastreavel")
            {
                await migrator.MigrateAsync();
                var protocolo = await db.ProtocolosEntregaDocumento.Include(x => x.VersaoDocumentoProntuario).SingleAsync(x => x.Id == protocoloId);
                Assert.Equal(versao.Id, protocolo.VersaoDocumentoProntuarioId);
                Assert.Equal("conteudo-legado-protegido", protocolo.VersaoDocumentoProntuario.ConteudoJson);
                Assert.Equal(13, (await db.Database.GetAppliedMigrationsAsync()).Count());
                Assert.Equal(77, await db.Database.SqlQueryRaw<int>("SELECT COUNT(*) AS [Value] FROM sys.foreign_keys").SingleAsync());
                Assert.Equal(0, await db.Database.SqlQueryRaw<int>("SELECT COUNT(*) AS [Value] FROM sys.foreign_keys WHERE is_disabled = 1 OR is_not_trusted = 1").SingleAsync());
            }
            else
            {
                var erro = await Assert.ThrowsAsync<SqlException>(() => migrator.MigrateAsync());
                Assert.Equal(caso == "PacienteIncoerente" ? 547 : 51001, erro.Number);
                Assert.Equal(11, (await db.Database.GetAppliedMigrationsAsync()).Count());
                Assert.Equal(1, await db.Database.SqlQueryRaw<int>("SELECT COUNT(*) AS [Value] FROM [ProtocolosEntregaDocumento]").SingleAsync());
                Assert.Equal(0, await db.Database.SqlQueryRaw<int>("SELECT COUNT(*) AS [Value] FROM sys.columns WHERE object_id = OBJECT_ID('ProtocolosEntregaDocumento') AND name = 'VersaoDocumentoProntuarioId'").SingleAsync());
                Assert.Equal(caso == "SemVersao" ? 0 : caso == "Ambigua" ? 2 : 1, await db.VersoesDocumentoProntuario.CountAsync());
                if (caso == "PacienteIncoerente") Assert.Equal(c.OutroPaciente, (await db.Pagamentos.SingleAsync()).PacienteId);
            }
        }
        finally
        {
            await isolado.DisposeAsync();
        }
    }

    [SqlServerTheory]
    [InlineData("Evolucao", 8000)]
    [InlineData("Sessao", 8000)]
    [InlineData("Documento", 10000)]
    [InlineData("Paciente", 2000)]
    [InlineData("Contato", 500)]
    public async Task TextoCriptografado_PreservaUnicodeNoLimiteDoContrato(string caso, int limite)
    {
        await using var db = banco.CriarContexto();
        await using var transacao = await db.Database.BeginTransactionAsync();
        var c = await CriarCenarioAsync(db);
        var texto = string.Concat(Enumerable.Repeat("á🧠", limite / 3)) + new string('á', limite % 3);
        var protecao = CriarProtecao();
        var autorizacao = new AutorizacaoContaService(db);
        var auditoria = new AuditoriaService(db, protecao);
        if (caso == "Evolucao")
        {
            var service = new SessoesService(db, autorizacao, protecao, auditoria);
            await service.CriarEvolucaoAsync(c.Usuario, c.Conta, new CriarEvolucaoProntuarioRequest { PacienteId = c.Paciente, Conteudo = texto }, null, null, CancellationToken.None);
            db.ChangeTracker.Clear();
            Assert.Equal(texto, (await service.ListarEvolucoesAsync(c.Usuario, c.Conta, c.Paciente, 1, 20, CancellationToken.None)).Itens.Single().Conteudo);
        }
        else if (caso == "Sessao")
        {
            var consulta = new Consulta { Id = Guid.NewGuid(), ContaPsicologoId = c.Conta, PacienteId = c.Paciente, TipoAtendimentoId = c.Tipo, InicioEm = DateTimeOffset.UtcNow.AddDays(1), FimEm = DateTimeOffset.UtcNow.AddDays(1).AddHours(1) };
            db.Add(consulta);
            await db.SaveChangesAsync();
            var service = new SessoesService(db, autorizacao, protecao, auditoria);
            var encaminhamentos = string.Concat(Enumerable.Repeat("á🧠", 1333)) + "á";
            var resposta = await service.CriarAsync(c.Usuario, c.Conta, new CriarRegistroSessaoRequest { ConsultaId = consulta.Id, ObservacoesClinicas = texto, Evolucao = texto, Encaminhamentos = encaminhamentos }, null, null, CancellationToken.None);
            db.ChangeTracker.Clear();
            var salvo = await db.RegistrosSessao.SingleAsync(x => x.Id == resposta.Id);
            Assert.Equal(texto, protecao.Desproteger(salvo.ObservacoesClinicas!));
            Assert.Equal(texto, protecao.Desproteger(salvo.Evolucao!));
            Assert.Equal(encaminhamentos, protecao.Desproteger(salvo.Encaminhamentos!));
        }
        else if (caso == "Documento")
        {
            var service = new DocumentosService(db, autorizacao, protecao, auditoria);
            var criado = await service.CriarAsync(c.Usuario, c.Conta, new CriarDocumentoRequest { PacienteId = c.Paciente, Tipo = TipoDocumentoPsicologico.RelatorioPsicologico, Titulo = "Relatorio", Conteudo = texto }, null, null, CancellationToken.None);
            await service.FinalizarAsync(c.Usuario, c.Conta, criado.Id, null, null, CancellationToken.None);
            db.ChangeTracker.Clear();
            Assert.Equal(texto, (await service.ObterAsync(c.Usuario, c.Conta, criado.Id, CancellationToken.None)).Conteudo);
            Assert.Equal(texto, protecao.Desproteger((await db.VersoesDocumentoProntuario.SingleAsync()).ConteudoJson));
        }
        else
        {
            var service = new PacientesService(db, protecao, auditoria);
            var criado = await service.CriarAsync(c.Usuario, c.Conta,
                new CriarPacienteRequest("Paciente Unicode", null, null, null, null, null,
                    caso == "Paciente" ? texto : null,
                    caso == "Contato" ? [new ContatoPacienteRequest(TipoContato.Responsavel, texto, false)] : null), null, null, CancellationToken.None);
            db.ChangeTracker.Clear();
            var resposta = await service.ObterPorIdAsync(c.Conta, criado.Id, CancellationToken.None);
            Assert.Equal(texto, caso == "Paciente" ? resposta.ObservacaoAdministrativa : resposta.ContatosAdicionais.Single().Valor);
        }
    }

    [SqlServerTheory]
    [InlineData("Contato")]
    [InlineData("PacienteUsuario")]
    [InlineData("Auditoria")]
    public async Task ReferenciasEntreContas_SaoRejeitadasPeloSqlServer(string caso)
    {
        await using var db = banco.CriarContexto();
        await using var transacao = await db.Database.BeginTransactionAsync();
        var c = await CriarCenarioAsync(db);
        if (caso == "Contato") db.Add(new ContatoPaciente { Id = Guid.NewGuid(), ContaPsicologoId = c.OutraConta, PacienteId = c.Paciente, Valor = "protegido", ValorHash = "hash" });
        else if (caso == "PacienteUsuario") db.Add(new Paciente { Id = Guid.NewGuid(), ContaPsicologoId = c.OutraConta, UsuarioId = c.Usuario, NomeCompleto = "Paciente externo" });
        else db.Add(new LogAuditoria { Id = Guid.NewGuid(), ContaPsicologoId = c.OutraConta, UsuarioId = c.Usuario, TipoAcao = "Teste", Entidade = "Paciente" });
        var erro = await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
        Assert.Equal(547, Assert.IsType<SqlException>(erro.InnerException).Number);
    }

    [SqlServerFact]
    public async Task Sessao_SomenteUmaPorConsultaMesmoQuandoArquivada()
    {
        await using var db = banco.CriarContexto();
        await using var transacao = await db.Database.BeginTransactionAsync();
        var c = await CriarCenarioAsync(db);
        var registro = await db.RegistrosSessao.SingleAsync(x => x.Id == c.Registro);
        registro.Status = StatusRegistroSessao.Arquivado;
        await db.SaveChangesAsync();
        db.ChangeTracker.Clear();
        db.Add(new RegistroSessao { Id = Guid.NewGuid(), ContaPsicologoId = c.Conta, PacienteId = c.Paciente, ProntuarioId = c.Prontuario, ConsultaId = c.Consulta, TipoAtendimentoId = c.Tipo, CriadoPorUsuarioId = c.Usuario });
        var erro = await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
        Assert.Contains(Assert.IsType<SqlException>(erro.InnerException).Number, new[] { 2601, 2627 });
    }

    [SqlServerFact]
    public async Task GrafoValido_PreservaOpcionaisEntregaRastreavelEHistoricoClinico()
    {
        await using var db = banco.CriarContexto();
        await using var transacao = await db.Database.BeginTransactionAsync();
        var c = await CriarCenarioAsync(db);
        var protecao = CriarProtecao();
        var autorizacao = new AutorizacaoContaService(db);
        var auditoria = new AuditoriaService(db, protecao);
        var documentos = new DocumentosService(db, autorizacao, protecao, auditoria);
        var sessoes = new SessoesService(db, autorizacao, protecao, auditoria);
        await sessoes.CriarEvolucaoAsync(c.Usuario, c.Conta, new CriarEvolucaoProntuarioRequest { PacienteId = c.Paciente, RegistroSessaoId = c.Registro, Conteudo = "Evolução vinculada" }, null, null, CancellationToken.None);
        await sessoes.CriarEvolucaoAsync(c.Usuario, c.Conta, new CriarEvolucaoProntuarioRequest { PacienteId = c.Paciente, Conteudo = "Evolução avulsa" }, null, null, CancellationToken.None);
        db.Add(new Pagamento { Id = Guid.NewGuid(), ContaPsicologoId = c.Conta, PacienteId = c.Paciente, ConsultaId = null, Valor = 100 });
        db.Add(new Lembrete { Id = Guid.NewGuid(), ContaPsicologoId = c.Conta, PacienteId = c.Paciente, ConsultaId = c.Consulta, ModeloMensagemId = null });
        await db.SaveChangesAsync();
        var criado = await documentos.CriarAsync(c.Usuario, c.Conta, new CriarDocumentoRequest { PacienteId = c.Paciente, Tipo = TipoDocumentoPsicologico.Declaracao, Titulo = "Declaracao", Conteudo = "Comparecimento em consulta." }, null, null, CancellationToken.None);
        var finalizado = await documentos.FinalizarAsync(c.Usuario, c.Conta, criado.Id, null, null, CancellationToken.None);
        var entrega = await documentos.RegistrarEntregaAsync(c.Usuario, c.Conta, criado.Id, new RegistrarEntregaDocumentoRequest(), null, null, CancellationToken.None);
        db.ChangeTracker.Clear();
        var protocolo = await db.ProtocolosEntregaDocumento.Include(x => x.VersaoDocumentoProntuario).SingleAsync(x => x.Id == entrega.Id);
        Assert.Equal(finalizado.Versoes.Single().Id, protocolo.VersaoDocumentoProntuarioId);
        Assert.Equal(criado.Id, protocolo.VersaoDocumentoProntuario.DocumentoProntuarioId);
        Assert.Equal(2, (await sessoes.ListarEvolucoesAsync(c.Usuario, c.Conta, c.Paciente, 1, 20, CancellationToken.None)).Total);
        Assert.Equal(StatusDocumentoProntuario.Entregue, (await documentos.ObterAsync(c.Usuario, c.Conta, criado.Id, CancellationToken.None)).Status);

        var erro = await Assert.ThrowsAsync<SqlException>(() => db.Database.ExecuteSqlInterpolatedAsync($"DELETE FROM [Prontuarios] WHERE [Id] = {c.Prontuario}"));
        Assert.Equal(547, erro.Number);
        Assert.True(await db.RegistrosSessao.AnyAsync(x => x.Id == c.Registro));
        Assert.True(await db.DocumentosProntuario.AnyAsync(x => x.Id == criado.Id));

        var outroDocumento = await documentos.CriarAsync(c.Usuario, c.Conta, new CriarDocumentoRequest { PacienteId = c.Paciente, Tipo = TipoDocumentoPsicologico.Declaracao, Titulo = "Outra declaração", Conteudo = "Outro comparecimento." }, null, null, CancellationToken.None);
        var versaoErrada = await Assert.ThrowsAsync<SqlException>(() => db.Database.ExecuteSqlInterpolatedAsync($"UPDATE [ProtocolosEntregaDocumento] SET [DocumentoProntuarioId] = {outroDocumento.Id} WHERE [Id] = {entrega.Id}"));
        Assert.Equal(547, versaoErrada.Number);
    }

    private static ProtecaoDadosService CriarProtecao() => new(new EphemeralDataProtectionProvider(),
        Options.Create(new SegurancaConfiguracao { ChaveHashDados = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32)) }));

    private static async Task<Cenario> CriarCenarioAsync(AppDbContext db)
    {
        var c = new Cenario(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(),
            Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid());
        db.AddRange(
            new ContaPsicologo { Id = c.Conta, NomeConta = "Conta de teste" },
            new ContaPsicologo { Id = c.OutraConta, NomeConta = "Outra conta de teste" },
            new Usuario { Id = c.Usuario, ContaPsicologoId = c.Conta, NomeCompleto = "Psicologo", Email = $"{c.Usuario:N}@teste.local", SenhaHash = "hash", Perfil = PerfilUsuario.Psicologo },
            new Paciente { Id = c.Paciente, ContaPsicologoId = c.Conta, NomeCompleto = "Paciente" },
            new Paciente { Id = c.OutroPaciente, ContaPsicologoId = c.Conta, NomeCompleto = "Outro paciente" },
            new TipoAtendimento { Id = c.Tipo, ContaPsicologoId = c.Conta, Nome = "Individual" },
            new Consulta { Id = c.Consulta, ContaPsicologoId = c.Conta, PacienteId = c.Paciente, TipoAtendimentoId = c.Tipo, InicioEm = DateTimeOffset.UtcNow, FimEm = DateTimeOffset.UtcNow.AddHours(1) },
            new Prontuario { Id = c.Prontuario, ContaPsicologoId = c.Conta, PacienteId = c.Paciente },
            new RegistroSessao { Id = c.Registro, ContaPsicologoId = c.Conta, ProntuarioId = c.Prontuario, PacienteId = c.Paciente, ConsultaId = c.Consulta, TipoAtendimentoId = c.Tipo, CriadoPorUsuarioId = c.Usuario, DataSessao = DateTimeOffset.UtcNow });
        await db.SaveChangesAsync();
        db.ChangeTracker.Clear();
        return c;
    }

    private sealed record Cenario(Guid Conta, Guid OutraConta, Guid Usuario, Guid Paciente,
        Guid OutroPaciente, Guid Tipo, Guid Consulta, Guid Prontuario, Guid Registro);
}
