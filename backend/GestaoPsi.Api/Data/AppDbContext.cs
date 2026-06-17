using GestaoPsi.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GestaoPsi.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<DadosProfissionaisPsicologo> DadosProfissionaisPsicologo => Set<DadosProfissionaisPsicologo>();
    public DbSet<Paciente> Pacientes => Set<Paciente>();
    public DbSet<ContatoPaciente> ContatosPaciente => Set<ContatoPaciente>();
    public DbSet<ConfiguracaoAtendimento> ConfiguracoesAtendimento => Set<ConfiguracaoAtendimento>();
    public DbSet<TipoAtendimento> TiposAtendimento => Set<TipoAtendimento>();
    public DbSet<HorarioDisponivel> HorariosDisponiveis => Set<HorarioDisponivel>();
    public DbSet<BloqueioAgenda> BloqueiosAgenda => Set<BloqueioAgenda>();
    public DbSet<Consulta> Consultas => Set<Consulta>();
    public DbSet<HistoricoConsulta> HistoricosConsulta => Set<HistoricoConsulta>();
    public DbSet<RegistroSessao> RegistrosSessao => Set<RegistroSessao>();
    public DbSet<RetificacaoRegistroSessao> RetificacoesRegistroSessao => Set<RetificacaoRegistroSessao>();
    public DbSet<Pagamento> Pagamentos => Set<Pagamento>();
    public DbSet<Lembrete> Lembretes => Set<Lembrete>();
    public DbSet<ModeloMensagem> ModelosMensagem => Set<ModeloMensagem>();
    public DbSet<ListaEspera> ListaEspera => Set<ListaEspera>();
    public DbSet<IntegracaoWhatsApp> IntegracoesWhatsApp => Set<IntegracaoWhatsApp>();
    public DbSet<ConversaWhatsApp> ConversasWhatsApp => Set<ConversaWhatsApp>();
    public DbSet<MensagemWhatsApp> MensagensWhatsApp => Set<MensagemWhatsApp>();
    public DbSet<EventoBridgeWhatsApp> EventosBridgeWhatsApp => Set<EventoBridgeWhatsApp>();
    public DbSet<SessaoBot> SessoesBot => Set<SessaoBot>();
    public DbSet<IntencaoBot> IntencoesBot => Set<IntencaoBot>();
    public DbSet<LogAuditoria> LogsAuditoria => Set<LogAuditoria>();
    public DbSet<Notificacao> Notificacoes => Set<Notificacao>();

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        configurationBuilder.Properties<Enum>().HaveConversion<string>().HaveMaxLength(80);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigurarUsuarios(modelBuilder);
        ConfigurarPacientes(modelBuilder);
        ConfigurarAgenda(modelBuilder);
        ConfigurarConsultas(modelBuilder);
        ConfigurarSessoes(modelBuilder);
        ConfigurarPagamentos(modelBuilder);
        ConfigurarLembretes(modelBuilder);
        ConfigurarWhatsApp(modelBuilder);
        ConfigurarBot(modelBuilder);
        ConfigurarAuditoria(modelBuilder);
    }

    private static void ConfigurarUsuarios(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.ToTable("Usuarios");
            entity.HasKey(usuario => usuario.Id);

            entity.Property(usuario => usuario.NomeCompleto).HasMaxLength(180).IsRequired();
            entity.Property(usuario => usuario.Email).HasMaxLength(180).IsRequired();
            entity.Property(usuario => usuario.SenhaHash).HasMaxLength(500).IsRequired();
            entity.Property(usuario => usuario.Telefone).HasMaxLength(30);

            entity.HasIndex(usuario => usuario.Email).IsUnique();
        });

        modelBuilder.Entity<DadosProfissionaisPsicologo>(entity =>
        {
            entity.ToTable("DadosProfissionaisPsicologo");
            entity.HasKey(dados => dados.Id);

            entity.Property(dados => dados.Crp).HasMaxLength(30).IsRequired();
            entity.Property(dados => dados.NomeProfissional).HasMaxLength(180).IsRequired();
            entity.Property(dados => dados.Bio).HasMaxLength(2000);
            entity.Property(dados => dados.EmailProfissional).HasMaxLength(180);
            entity.Property(dados => dados.TelefoneProfissional).HasMaxLength(30);

            entity.HasIndex(dados => dados.UsuarioId).IsUnique();
            entity.HasIndex(dados => dados.Crp).IsUnique();
            entity.HasIndex(dados => dados.Status)
                .IsUnique()
                .HasFilter("[Status] = 'Ativo'");

            entity.HasOne(dados => dados.Usuario)
                .WithOne(usuario => usuario.DadosProfissionaisPsicologo)
                .HasForeignKey<DadosProfissionaisPsicologo>(dados => dados.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }

    private static void ConfigurarPacientes(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Paciente>(entity =>
        {
            entity.ToTable("Pacientes");
            entity.HasKey(paciente => paciente.Id);

            entity.Property(paciente => paciente.NomeCompleto).HasMaxLength(180).IsRequired();
            entity.Property(paciente => paciente.Cpf).HasMaxLength(14);
            entity.Property(paciente => paciente.Telefone).HasMaxLength(30);
            entity.Property(paciente => paciente.Email).HasMaxLength(180);
            entity.Property(paciente => paciente.ObservacaoAdministrativa).HasMaxLength(2000);

            entity.HasIndex(paciente => paciente.Cpf)
                .IsUnique()
                .HasFilter("[Cpf] IS NOT NULL");

            entity.HasIndex(paciente => paciente.UsuarioId)
                .IsUnique()
                .HasFilter("[UsuarioId] IS NOT NULL");

            entity.HasOne(paciente => paciente.Usuario)
                .WithOne(usuario => usuario.Paciente)
                .HasForeignKey<Paciente>(paciente => paciente.UsuarioId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<ContatoPaciente>(entity =>
        {
            entity.ToTable("ContatosPaciente");
            entity.HasKey(contato => contato.Id);

            entity.Property(contato => contato.Valor).HasMaxLength(180).IsRequired();

            entity.HasIndex(contato => new { contato.PacienteId, contato.TipoContato, contato.Valor });

            entity.HasOne(contato => contato.Paciente)
                .WithMany(paciente => paciente.Contatos)
                .HasForeignKey(contato => contato.PacienteId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }

    private static void ConfigurarAgenda(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ConfiguracaoAtendimento>(entity =>
        {
            entity.ToTable("ConfiguracoesAtendimento", table =>
            {
                table.HasCheckConstraint(
                    "CK_ConfiguracoesAtendimento_DuracaoPadraoMinutos",
                    "[DuracaoPadraoMinutos] > 0");
            });

            entity.HasKey(configuracao => configuracao.Id);
            entity.HasIndex(configuracao => configuracao.Ativo)
                .IsUnique()
                .HasFilter("[Ativo] = 1");
        });

        modelBuilder.Entity<TipoAtendimento>(entity =>
        {
            entity.ToTable("TiposAtendimento", table =>
            {
                table.HasCheckConstraint("CK_TiposAtendimento_DuracaoMinutos", "[DuracaoMinutos] > 0");
                table.HasCheckConstraint("CK_TiposAtendimento_ValorPadrao", "[ValorPadrao] IS NULL OR [ValorPadrao] >= 0");
            });

            entity.HasKey(tipo => tipo.Id);

            entity.Property(tipo => tipo.Nome).HasMaxLength(120).IsRequired();
            entity.Property(tipo => tipo.Descricao).HasMaxLength(1000);
            entity.Property(tipo => tipo.ValorPadrao).HasPrecision(12, 2);

            entity.HasIndex(tipo => tipo.Nome).IsUnique();
        });

        modelBuilder.Entity<HorarioDisponivel>(entity =>
        {
            entity.ToTable("HorariosDisponiveis", table =>
            {
                table.HasCheckConstraint("CK_HorariosDisponiveis_Periodo", "[HoraFim] > [HoraInicio]");
            });

            entity.HasKey(horario => horario.Id);
            entity.HasIndex(horario => new { horario.DiaSemana, horario.HoraInicio, horario.HoraFim });
        });

        modelBuilder.Entity<BloqueioAgenda>(entity =>
        {
            entity.ToTable("BloqueiosAgenda", table =>
            {
                table.HasCheckConstraint("CK_BloqueiosAgenda_Periodo", "[FimEm] > [InicioEm]");
            });

            entity.HasKey(bloqueio => bloqueio.Id);

            entity.Property(bloqueio => bloqueio.Titulo).HasMaxLength(160).IsRequired();
            entity.Property(bloqueio => bloqueio.Descricao).HasMaxLength(1000);

            entity.HasIndex(bloqueio => new { bloqueio.InicioEm, bloqueio.FimEm });
        });
    }

    private static void ConfigurarConsultas(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Consulta>(entity =>
        {
            entity.ToTable("Consultas", table =>
            {
                table.HasCheckConstraint("CK_Consultas_Periodo", "[FimEm] > [InicioEm]");
            });

            entity.HasKey(consulta => consulta.Id);

            entity.Property(consulta => consulta.LinkOnline).HasMaxLength(500);
            entity.Property(consulta => consulta.EnderecoAtendimento).HasMaxLength(500);
            entity.Property(consulta => consulta.ObservacaoAdministrativa).HasMaxLength(2000);
            entity.Property(consulta => consulta.JustificativaCancelamento).HasMaxLength(1000);

            entity.HasIndex(consulta => new { consulta.InicioEm, consulta.FimEm });
            entity.HasIndex(consulta => consulta.InicioEm)
                .IsUnique()
                .HasFilter("[Status] IN ('AguardandoConfirmacao', 'Agendada', 'Confirmada', 'Realizada', 'NaoCompareceu')");

            entity.HasIndex(consulta => new { consulta.PacienteId, consulta.InicioEm });

            entity.HasOne(consulta => consulta.Paciente)
                .WithMany(paciente => paciente.Consultas)
                .HasForeignKey(consulta => consulta.PacienteId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(consulta => consulta.TipoAtendimento)
                .WithMany(tipo => tipo.Consultas)
                .HasForeignKey(consulta => consulta.TipoAtendimentoId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<HistoricoConsulta>(entity =>
        {
            entity.ToTable("HistoricosConsulta");
            entity.HasKey(historico => historico.Id);

            entity.Property(historico => historico.Descricao).HasMaxLength(1000);

            entity.HasOne(historico => historico.Consulta)
                .WithMany(consulta => consulta.Historicos)
                .HasForeignKey(historico => historico.ConsultaId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(historico => historico.Usuario)
                .WithMany(usuario => usuario.HistoricosConsulta)
                .HasForeignKey(historico => historico.UsuarioId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }

    private static void ConfigurarSessoes(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<RegistroSessao>(entity =>
        {
            entity.ToTable("RegistrosSessao");
            entity.HasKey(registro => registro.Id);

            entity.Property(registro => registro.ObservacoesClinicas).HasMaxLength(8000);
            entity.Property(registro => registro.Evolucao).HasMaxLength(8000);
            entity.Property(registro => registro.Encaminhamentos).HasMaxLength(4000);

            entity.HasIndex(registro => registro.ConsultaId).IsUnique();
            entity.HasIndex(registro => new { registro.PacienteId, registro.DataSessao });

            entity.HasOne(registro => registro.Paciente)
                .WithMany(paciente => paciente.RegistrosSessao)
                .HasForeignKey(registro => registro.PacienteId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(registro => registro.Consulta)
                .WithOne(consulta => consulta.RegistroSessao)
                .HasForeignKey<RegistroSessao>(registro => registro.ConsultaId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(registro => registro.TipoAtendimento)
                .WithMany(tipo => tipo.RegistrosSessao)
                .HasForeignKey(registro => registro.TipoAtendimentoId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(registro => registro.CriadoPorUsuario)
                .WithMany(usuario => usuario.RegistrosSessaoCriados)
                .HasForeignKey(registro => registro.CriadoPorUsuarioId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<RetificacaoRegistroSessao>(entity =>
        {
            entity.ToTable("RetificacoesRegistroSessao");
            entity.HasKey(retificacao => retificacao.Id);

            entity.Property(retificacao => retificacao.CampoAlterado).HasMaxLength(120).IsRequired();
            entity.Property(retificacao => retificacao.ValorAnterior).HasMaxLength(8000);
            entity.Property(retificacao => retificacao.ValorNovo).HasMaxLength(8000);
            entity.Property(retificacao => retificacao.Motivo).HasMaxLength(1000);

            entity.HasOne(retificacao => retificacao.RegistroSessao)
                .WithMany(registro => registro.Retificacoes)
                .HasForeignKey(retificacao => retificacao.RegistroSessaoId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(retificacao => retificacao.Usuario)
                .WithMany(usuario => usuario.RetificacoesRegistroSessao)
                .HasForeignKey(retificacao => retificacao.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }

    private static void ConfigurarPagamentos(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Pagamento>(entity =>
        {
            entity.ToTable("Pagamentos", table =>
            {
                table.HasCheckConstraint("CK_Pagamentos_Valor", "[Valor] >= 0");
            });

            entity.HasKey(pagamento => pagamento.Id);

            entity.Property(pagamento => pagamento.Valor).HasPrecision(12, 2);
            entity.Property(pagamento => pagamento.Observacao).HasMaxLength(1000);

            entity.HasIndex(pagamento => new { pagamento.PacienteId, pagamento.Status });
            entity.HasIndex(pagamento => pagamento.ConsultaId);

            entity.HasOne(pagamento => pagamento.Paciente)
                .WithMany(paciente => paciente.Pagamentos)
                .HasForeignKey(pagamento => pagamento.PacienteId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(pagamento => pagamento.Consulta)
                .WithMany(consulta => consulta.Pagamentos)
                .HasForeignKey(pagamento => pagamento.ConsultaId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }

    private static void ConfigurarLembretes(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Lembrete>(entity =>
        {
            entity.ToTable("Lembretes");
            entity.HasKey(lembrete => lembrete.Id);

            entity.Property(lembrete => lembrete.Mensagem).HasMaxLength(2000);
            entity.Property(lembrete => lembrete.ErroEnvio).HasMaxLength(2000);

            entity.HasIndex(lembrete => new { lembrete.AgendadoPara, lembrete.Status });

            entity.HasOne(lembrete => lembrete.Consulta)
                .WithMany(consulta => consulta.Lembretes)
                .HasForeignKey(lembrete => lembrete.ConsultaId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(lembrete => lembrete.Paciente)
                .WithMany()
                .HasForeignKey(lembrete => lembrete.PacienteId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(lembrete => lembrete.ModeloMensagem)
                .WithMany(modelo => modelo.Lembretes)
                .HasForeignKey(lembrete => lembrete.ModeloMensagemId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<ModeloMensagem>(entity =>
        {
            entity.ToTable("ModelosMensagem");
            entity.HasKey(modelo => modelo.Id);

            entity.Property(modelo => modelo.Nome).HasMaxLength(120).IsRequired();
            entity.Property(modelo => modelo.Conteudo).HasMaxLength(4000).IsRequired();

            entity.HasIndex(modelo => new { modelo.Tipo, modelo.Canal, modelo.Ativo });
        });

        modelBuilder.Entity<ListaEspera>(entity =>
        {
            entity.ToTable("ListaEspera", table =>
            {
                table.HasCheckConstraint(
                    "CK_ListaEspera_PreferenciaHorario",
                    "[PreferenciaHorarioInicio] IS NULL OR [PreferenciaHorarioFim] IS NULL OR [PreferenciaHorarioFim] > [PreferenciaHorarioInicio]");
            });

            entity.HasKey(item => item.Id);

            entity.Property(item => item.ObservacaoAdministrativa).HasMaxLength(1000);

            entity.HasIndex(item => new { item.Status, item.CriadoEm });

            entity.HasOne(item => item.Paciente)
                .WithMany(paciente => paciente.ListaEspera)
                .HasForeignKey(item => item.PacienteId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(item => item.TipoAtendimento)
                .WithMany(tipo => tipo.ListaEspera)
                .HasForeignKey(item => item.TipoAtendimentoId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }

    private static void ConfigurarWhatsApp(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<IntegracaoWhatsApp>(entity =>
        {
            entity.ToTable("IntegracoesWhatsApp");
            entity.HasKey(integracao => integracao.Id);

            entity.Property(integracao => integracao.Nome).HasMaxLength(120).IsRequired();
            entity.Property(integracao => integracao.Provedor).HasMaxLength(120).IsRequired();
            entity.Property(integracao => integracao.UrlBaseBridge).HasMaxLength(500).IsRequired();
            entity.Property(integracao => integracao.TokenCriptografado).HasMaxLength(1000).IsRequired();
            entity.Property(integracao => integracao.NumeroWhatsApp).HasMaxLength(30).IsRequired();
        });

        modelBuilder.Entity<ConversaWhatsApp>(entity =>
        {
            entity.ToTable("ConversasWhatsApp");
            entity.HasKey(conversa => conversa.Id);

            entity.Property(conversa => conversa.Telefone).HasMaxLength(30).IsRequired();
            entity.Property(conversa => conversa.NomeContato).HasMaxLength(180);
            entity.Property(conversa => conversa.MotivoAtendimentoHumano).HasMaxLength(1000);

            entity.HasIndex(conversa => new { conversa.IntegracaoWhatsAppId, conversa.Telefone });
            entity.HasIndex(conversa => new { conversa.Status, conversa.UltimaMensagemEm });

            entity.HasOne(conversa => conversa.IntegracaoWhatsApp)
                .WithMany(integracao => integracao.Conversas)
                .HasForeignKey(conversa => conversa.IntegracaoWhatsAppId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(conversa => conversa.Paciente)
                .WithMany(paciente => paciente.ConversasWhatsApp)
                .HasForeignKey(conversa => conversa.PacienteId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<MensagemWhatsApp>(entity =>
        {
            entity.ToTable("MensagensWhatsApp");
            entity.HasKey(mensagem => mensagem.Id);

            entity.Property(mensagem => mensagem.MensagemExternaId).HasMaxLength(180);
            entity.Property(mensagem => mensagem.Conteudo).HasMaxLength(8000);
            entity.Property(mensagem => mensagem.ErroEnvio).HasMaxLength(2000);

            entity.HasIndex(mensagem => new { mensagem.ConversaWhatsAppId, mensagem.MensagemExternaId })
                .IsUnique()
                .HasFilter("[MensagemExternaId] IS NOT NULL");

            entity.HasOne(mensagem => mensagem.ConversaWhatsApp)
                .WithMany(conversa => conversa.Mensagens)
                .HasForeignKey(mensagem => mensagem.ConversaWhatsAppId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<EventoBridgeWhatsApp>(entity =>
        {
            entity.ToTable("EventosBridgeWhatsApp");
            entity.HasKey(evento => evento.Id);

            entity.Property(evento => evento.EventoExternoId).HasMaxLength(180);
            entity.Property(evento => evento.TipoEvento).HasMaxLength(120).IsRequired();
            entity.Property(evento => evento.PayloadHash).HasMaxLength(128);
            entity.Property(evento => evento.PayloadJson).IsRequired();
            entity.Property(evento => evento.ErroProcessamento).HasMaxLength(2000);

            entity.HasIndex(evento => new { evento.IntegracaoWhatsAppId, evento.EventoExternoId })
                .IsUnique()
                .HasFilter("[EventoExternoId] IS NOT NULL");

            entity.HasIndex(evento => new { evento.IntegracaoWhatsAppId, evento.PayloadHash })
                .IsUnique()
                .HasFilter("[PayloadHash] IS NOT NULL");

            entity.HasOne(evento => evento.IntegracaoWhatsApp)
                .WithMany(integracao => integracao.Eventos)
                .HasForeignKey(evento => evento.IntegracaoWhatsAppId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }

    private static void ConfigurarBot(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SessaoBot>(entity =>
        {
            entity.ToTable("SessoesBot");
            entity.HasKey(sessao => sessao.Id);

            entity.Property(sessao => sessao.IntencaoAtual).HasMaxLength(120).IsRequired();
            entity.Property(sessao => sessao.EtapaAtual).HasMaxLength(120);
            entity.Property(sessao => sessao.DadosTemporariosJson).HasMaxLength(4000);

            entity.HasIndex(sessao => new { sessao.ConversaWhatsAppId, sessao.Status });
            entity.HasIndex(sessao => sessao.ConversaWhatsAppId)
                .IsUnique()
                .HasFilter("[Status] = 'Aberta'");

            entity.HasOne(sessao => sessao.ConversaWhatsApp)
                .WithMany(conversa => conversa.SessoesBot)
                .HasForeignKey(sessao => sessao.ConversaWhatsAppId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(sessao => sessao.Paciente)
                .WithMany(paciente => paciente.SessoesBot)
                .HasForeignKey(sessao => sessao.PacienteId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<IntencaoBot>(entity =>
        {
            entity.ToTable("IntencoesBot");
            entity.HasKey(intencao => intencao.Id);

            entity.Property(intencao => intencao.Nome).HasMaxLength(120).IsRequired();
            entity.Property(intencao => intencao.Descricao).HasMaxLength(1000);
            entity.HasIndex(intencao => intencao.Nome).IsUnique();
        });
    }

    private static void ConfigurarAuditoria(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<LogAuditoria>(entity =>
        {
            entity.ToTable("LogsAuditoria");
            entity.HasKey(log => log.Id);

            entity.Property(log => log.TipoAcao).HasMaxLength(120).IsRequired();
            entity.Property(log => log.Entidade).HasMaxLength(120).IsRequired();
            entity.Property(log => log.Descricao).HasMaxLength(2000);
            entity.Property(log => log.Ip).HasMaxLength(80);
            entity.Property(log => log.UserAgent).HasMaxLength(500);
            entity.Property(log => log.DadosAntesJson).HasMaxLength(8000);
            entity.Property(log => log.DadosDepoisJson).HasMaxLength(8000);

            entity.HasIndex(log => new { log.Entidade, log.EntidadeId });
            entity.HasIndex(log => log.CriadoEm);

            entity.HasOne(log => log.Usuario)
                .WithMany(usuario => usuario.LogsAuditoria)
                .HasForeignKey(log => log.UsuarioId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Notificacao>(entity =>
        {
            entity.ToTable("Notificacoes");
            entity.HasKey(notificacao => notificacao.Id);

            entity.Property(notificacao => notificacao.Titulo).HasMaxLength(160).IsRequired();
            entity.Property(notificacao => notificacao.Mensagem).HasMaxLength(2000).IsRequired();
            entity.Property(notificacao => notificacao.Tipo).HasMaxLength(120).IsRequired();

            entity.HasIndex(notificacao => new { notificacao.UsuarioId, notificacao.Lida, notificacao.CriadoEm });

            entity.HasOne(notificacao => notificacao.Usuario)
                .WithMany(usuario => usuario.Notificacoes)
                .HasForeignKey(notificacao => notificacao.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
