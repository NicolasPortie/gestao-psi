using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Psique.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class CriarModelagemInicial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BloqueiosAgenda",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Titulo = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    InicioEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    FimEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    DiaInteiro = table.Column<bool>(type: "bit", nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BloqueiosAgenda", x => x.Id);
                    table.CheckConstraint("CK_BloqueiosAgenda_Periodo", "[FimEm] > [InicioEm]");
                });

            migrationBuilder.CreateTable(
                name: "ConfiguracoesAtendimento",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DuracaoPadraoMinutos = table.Column<int>(type: "int", nullable: false),
                    ConfirmacaoAutomaticaConsulta = table.Column<bool>(type: "bit", nullable: false),
                    PermiteListaEspera = table.Column<bool>(type: "bit", nullable: false),
                    PermiteAgendamentoWhatsApp = table.Column<bool>(type: "bit", nullable: false),
                    AntecedenciaMinimaAgendamentoHoras = table.Column<int>(type: "int", nullable: true),
                    AntecedenciaCancelamentoHoras = table.Column<int>(type: "int", nullable: true),
                    AntecedenciaRemarcacaoHoras = table.Column<int>(type: "int", nullable: true),
                    ExigeJustificativaCancelamento = table.Column<bool>(type: "bit", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConfiguracoesAtendimento", x => x.Id);
                    table.CheckConstraint("CK_ConfiguracoesAtendimento_DuracaoPadraoMinutos", "[DuracaoPadraoMinutos] > 0");
                });

            migrationBuilder.CreateTable(
                name: "HorariosDisponiveis",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DiaSemana = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    HoraInicio = table.Column<TimeOnly>(type: "time", nullable: false),
                    HoraFim = table.Column<TimeOnly>(type: "time", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HorariosDisponiveis", x => x.Id);
                    table.CheckConstraint("CK_HorariosDisponiveis_Periodo", "[HoraFim] > [HoraInicio]");
                });

            migrationBuilder.CreateTable(
                name: "IntegracoesWhatsApp",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Provedor = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    UrlBaseBridge = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    TokenCriptografado = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    NumeroWhatsApp = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IntegracoesWhatsApp", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "IntencoesBot",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Ativa = table.Column<bool>(type: "bit", nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IntencoesBot", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ModelosMensagem",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Canal = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Conteudo = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModelosMensagem", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TiposAtendimento",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    DuracaoMinutos = table.Column<int>(type: "int", nullable: false),
                    ValorPadrao = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: true),
                    ModalidadePadrao = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposAtendimento", x => x.Id);
                    table.CheckConstraint("CK_TiposAtendimento_DuracaoMinutos", "[DuracaoMinutos] > 0");
                    table.CheckConstraint("CK_TiposAtendimento_ValorPadrao", "[ValorPadrao] IS NULL OR [ValorPadrao] >= 0");
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NomeCompleto = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: false),
                    SenhaHash = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Telefone = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    Perfil = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    UltimoAcessoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EventosBridgeWhatsApp",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IntegracaoWhatsAppId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventoExternoId = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: true),
                    TipoEvento = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    PayloadHash = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    PayloadJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Processado = table.Column<bool>(type: "bit", nullable: false),
                    ProcessadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ErroProcessamento = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventosBridgeWhatsApp", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EventosBridgeWhatsApp_IntegracoesWhatsApp_IntegracaoWhatsAppId",
                        column: x => x.IntegracaoWhatsAppId,
                        principalTable: "IntegracoesWhatsApp",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DadosProfissionaisPsicologo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Crp = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    NomeProfissional = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: false),
                    Bio = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    EmailProfissional = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: true),
                    TelefoneProfissional = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DadosProfissionaisPsicologo", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DadosProfissionaisPsicologo_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LogsAuditoria",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TipoAcao = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Entidade = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    EntidadeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Descricao = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Ip = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DadosAntesJson = table.Column<string>(type: "nvarchar(max)", maxLength: 8000, nullable: true),
                    DadosDepoisJson = table.Column<string>(type: "nvarchar(max)", maxLength: 8000, nullable: true),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LogsAuditoria", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LogsAuditoria_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Notificacoes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Titulo = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Mensagem = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Lida = table.Column<bool>(type: "bit", nullable: false),
                    LidaEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notificacoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notificacoes_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Pacientes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    NomeCompleto = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: false),
                    DataNascimento = table.Column<DateOnly>(type: "date", nullable: true),
                    Cpf = table.Column<string>(type: "nvarchar(14)", maxLength: 14, nullable: true),
                    Telefone = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    ObservacaoAdministrativa = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pacientes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Pacientes_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Consultas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TipoAtendimentoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InicioEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    FimEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Modalidade = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Origem = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    LinkOnline = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    EnderecoAtendimento = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ObservacaoAdministrativa = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    JustificativaCancelamento = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Consultas", x => x.Id);
                    table.CheckConstraint("CK_Consultas_Periodo", "[FimEm] > [InicioEm]");
                    table.ForeignKey(
                        name: "FK_Consultas_Pacientes_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "Pacientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Consultas_TiposAtendimento_TipoAtendimentoId",
                        column: x => x.TipoAtendimentoId,
                        principalTable: "TiposAtendimento",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ContatosPaciente",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TipoContato = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Valor = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: false),
                    Principal = table.Column<bool>(type: "bit", nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContatosPaciente", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContatosPaciente_Pacientes_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "Pacientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ConversasWhatsApp",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IntegracaoWhatsAppId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Telefone = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    NomeContato = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    UltimaMensagemEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    AtendimentoHumanoNecessario = table.Column<bool>(type: "bit", nullable: false),
                    MotivoAtendimentoHumano = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConversasWhatsApp", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ConversasWhatsApp_IntegracoesWhatsApp_IntegracaoWhatsAppId",
                        column: x => x.IntegracaoWhatsAppId,
                        principalTable: "IntegracoesWhatsApp",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ConversasWhatsApp_Pacientes_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "Pacientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ListaEspera",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TipoAtendimentoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PreferenciaDiaSemana = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    PreferenciaHorarioInicio = table.Column<TimeOnly>(type: "time", nullable: true),
                    PreferenciaHorarioFim = table.Column<TimeOnly>(type: "time", nullable: true),
                    Prioridade = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Origem = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    ObservacaoAdministrativa = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListaEspera", x => x.Id);
                    table.CheckConstraint("CK_ListaEspera_PreferenciaHorario", "[PreferenciaHorarioInicio] IS NULL OR [PreferenciaHorarioFim] IS NULL OR [PreferenciaHorarioFim] > [PreferenciaHorarioInicio]");
                    table.ForeignKey(
                        name: "FK_ListaEspera_Pacientes_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "Pacientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ListaEspera_TiposAtendimento_TipoAtendimentoId",
                        column: x => x.TipoAtendimentoId,
                        principalTable: "TiposAtendimento",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "HistoricosConsulta",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConsultaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    StatusAnterior = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    StatusNovo = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoricosConsulta", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HistoricosConsulta_Consultas_ConsultaId",
                        column: x => x.ConsultaId,
                        principalTable: "Consultas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HistoricosConsulta_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Lembretes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConsultaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ModeloMensagemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Canal = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    AgendadoPara = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    EnviadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    Mensagem = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ErroEnvio = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Lembretes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Lembretes_Consultas_ConsultaId",
                        column: x => x.ConsultaId,
                        principalTable: "Consultas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Lembretes_ModelosMensagem_ModeloMensagemId",
                        column: x => x.ModeloMensagemId,
                        principalTable: "ModelosMensagem",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Lembretes_Pacientes_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "Pacientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Pagamentos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConsultaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Valor = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    FormaPagamento = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    PagoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    VencimentoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    Observacao = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pagamentos", x => x.Id);
                    table.CheckConstraint("CK_Pagamentos_Valor", "[Valor] >= 0");
                    table.ForeignKey(
                        name: "FK_Pagamentos_Consultas_ConsultaId",
                        column: x => x.ConsultaId,
                        principalTable: "Consultas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Pagamentos_Pacientes_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "Pacientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RegistrosSessao",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConsultaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TipoAtendimentoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CriadoPorUsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DataSessao = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    ObservacoesClinicas = table.Column<string>(type: "nvarchar(max)", maxLength: 8000, nullable: true),
                    Evolucao = table.Column<string>(type: "nvarchar(max)", maxLength: 8000, nullable: true),
                    Encaminhamentos = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    ProximaSessaoSugeridaEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RegistrosSessao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RegistrosSessao_Consultas_ConsultaId",
                        column: x => x.ConsultaId,
                        principalTable: "Consultas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RegistrosSessao_Pacientes_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "Pacientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RegistrosSessao_TiposAtendimento_TipoAtendimentoId",
                        column: x => x.TipoAtendimentoId,
                        principalTable: "TiposAtendimento",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RegistrosSessao_Usuarios_CriadoPorUsuarioId",
                        column: x => x.CriadoPorUsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MensagensWhatsApp",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConversaWhatsAppId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MensagemExternaId = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: true),
                    Direcao = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    TipoMensagem = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Conteudo = table.Column<string>(type: "nvarchar(max)", maxLength: 8000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    EnviadaEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    RecebidaEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LidaEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ErroEnvio = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MensagensWhatsApp", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MensagensWhatsApp_ConversasWhatsApp_ConversaWhatsAppId",
                        column: x => x.ConversaWhatsAppId,
                        principalTable: "ConversasWhatsApp",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SessoesBot",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConversaWhatsAppId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IntencaoAtual = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    EtapaAtual = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    DadosTemporariosJson = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    ExpiraEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessoesBot", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SessoesBot_ConversasWhatsApp_ConversaWhatsAppId",
                        column: x => x.ConversaWhatsAppId,
                        principalTable: "ConversasWhatsApp",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SessoesBot_Pacientes_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "Pacientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "RetificacoesRegistroSessao",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RegistroSessaoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CampoAlterado = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    ValorAnterior = table.Column<string>(type: "nvarchar(max)", maxLength: 8000, nullable: true),
                    ValorNovo = table.Column<string>(type: "nvarchar(max)", maxLength: 8000, nullable: true),
                    Motivo = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RetificacoesRegistroSessao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RetificacoesRegistroSessao_RegistrosSessao_RegistroSessaoId",
                        column: x => x.RegistroSessaoId,
                        principalTable: "RegistrosSessao",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RetificacoesRegistroSessao_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BloqueiosAgenda_InicioEm_FimEm",
                table: "BloqueiosAgenda",
                columns: new[] { "InicioEm", "FimEm" });

            migrationBuilder.CreateIndex(
                name: "IX_ConfiguracoesAtendimento_Ativo",
                table: "ConfiguracoesAtendimento",
                column: "Ativo",
                unique: true,
                filter: "[Ativo] = 1");

            migrationBuilder.CreateIndex(
                name: "IX_Consultas_InicioEm",
                table: "Consultas",
                column: "InicioEm",
                unique: true,
                filter: "[Status] IN ('AguardandoConfirmacao', 'Agendada', 'Confirmada', 'Realizada', 'NaoCompareceu')");

            migrationBuilder.CreateIndex(
                name: "IX_Consultas_InicioEm_FimEm",
                table: "Consultas",
                columns: new[] { "InicioEm", "FimEm" });

            migrationBuilder.CreateIndex(
                name: "IX_Consultas_PacienteId_InicioEm",
                table: "Consultas",
                columns: new[] { "PacienteId", "InicioEm" });

            migrationBuilder.CreateIndex(
                name: "IX_Consultas_TipoAtendimentoId",
                table: "Consultas",
                column: "TipoAtendimentoId");

            migrationBuilder.CreateIndex(
                name: "IX_ContatosPaciente_PacienteId_TipoContato_Valor",
                table: "ContatosPaciente",
                columns: new[] { "PacienteId", "TipoContato", "Valor" });

            migrationBuilder.CreateIndex(
                name: "IX_ConversasWhatsApp_IntegracaoWhatsAppId_Telefone",
                table: "ConversasWhatsApp",
                columns: new[] { "IntegracaoWhatsAppId", "Telefone" });

            migrationBuilder.CreateIndex(
                name: "IX_ConversasWhatsApp_PacienteId",
                table: "ConversasWhatsApp",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_ConversasWhatsApp_Status_UltimaMensagemEm",
                table: "ConversasWhatsApp",
                columns: new[] { "Status", "UltimaMensagemEm" });

            migrationBuilder.CreateIndex(
                name: "IX_DadosProfissionaisPsicologo_Crp",
                table: "DadosProfissionaisPsicologo",
                column: "Crp",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DadosProfissionaisPsicologo_Status",
                table: "DadosProfissionaisPsicologo",
                column: "Status",
                unique: true,
                filter: "[Status] = 'Ativo'");

            migrationBuilder.CreateIndex(
                name: "IX_DadosProfissionaisPsicologo_UsuarioId",
                table: "DadosProfissionaisPsicologo",
                column: "UsuarioId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EventosBridgeWhatsApp_IntegracaoWhatsAppId_EventoExternoId",
                table: "EventosBridgeWhatsApp",
                columns: new[] { "IntegracaoWhatsAppId", "EventoExternoId" },
                unique: true,
                filter: "[EventoExternoId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_EventosBridgeWhatsApp_IntegracaoWhatsAppId_PayloadHash",
                table: "EventosBridgeWhatsApp",
                columns: new[] { "IntegracaoWhatsAppId", "PayloadHash" },
                unique: true,
                filter: "[PayloadHash] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_HistoricosConsulta_ConsultaId",
                table: "HistoricosConsulta",
                column: "ConsultaId");

            migrationBuilder.CreateIndex(
                name: "IX_HistoricosConsulta_UsuarioId",
                table: "HistoricosConsulta",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_HorariosDisponiveis_DiaSemana_HoraInicio_HoraFim",
                table: "HorariosDisponiveis",
                columns: new[] { "DiaSemana", "HoraInicio", "HoraFim" });

            migrationBuilder.CreateIndex(
                name: "IX_IntencoesBot_Nome",
                table: "IntencoesBot",
                column: "Nome",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Lembretes_AgendadoPara_Status",
                table: "Lembretes",
                columns: new[] { "AgendadoPara", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Lembretes_ConsultaId",
                table: "Lembretes",
                column: "ConsultaId");

            migrationBuilder.CreateIndex(
                name: "IX_Lembretes_ModeloMensagemId",
                table: "Lembretes",
                column: "ModeloMensagemId");

            migrationBuilder.CreateIndex(
                name: "IX_Lembretes_PacienteId",
                table: "Lembretes",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_ListaEspera_PacienteId",
                table: "ListaEspera",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_ListaEspera_Status_CriadoEm",
                table: "ListaEspera",
                columns: new[] { "Status", "CriadoEm" });

            migrationBuilder.CreateIndex(
                name: "IX_ListaEspera_TipoAtendimentoId",
                table: "ListaEspera",
                column: "TipoAtendimentoId");

            migrationBuilder.CreateIndex(
                name: "IX_LogsAuditoria_CriadoEm",
                table: "LogsAuditoria",
                column: "CriadoEm");

            migrationBuilder.CreateIndex(
                name: "IX_LogsAuditoria_Entidade_EntidadeId",
                table: "LogsAuditoria",
                columns: new[] { "Entidade", "EntidadeId" });

            migrationBuilder.CreateIndex(
                name: "IX_LogsAuditoria_UsuarioId",
                table: "LogsAuditoria",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_MensagensWhatsApp_ConversaWhatsAppId_MensagemExternaId",
                table: "MensagensWhatsApp",
                columns: new[] { "ConversaWhatsAppId", "MensagemExternaId" },
                unique: true,
                filter: "[MensagemExternaId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ModelosMensagem_Tipo_Canal_Ativo",
                table: "ModelosMensagem",
                columns: new[] { "Tipo", "Canal", "Ativo" });

            migrationBuilder.CreateIndex(
                name: "IX_Notificacoes_UsuarioId_Lida_CriadoEm",
                table: "Notificacoes",
                columns: new[] { "UsuarioId", "Lida", "CriadoEm" });

            migrationBuilder.CreateIndex(
                name: "IX_Pacientes_Cpf",
                table: "Pacientes",
                column: "Cpf",
                unique: true,
                filter: "[Cpf] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Pacientes_UsuarioId",
                table: "Pacientes",
                column: "UsuarioId",
                unique: true,
                filter: "[UsuarioId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Pagamentos_ConsultaId",
                table: "Pagamentos",
                column: "ConsultaId");

            migrationBuilder.CreateIndex(
                name: "IX_Pagamentos_PacienteId_Status",
                table: "Pagamentos",
                columns: new[] { "PacienteId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosSessao_ConsultaId",
                table: "RegistrosSessao",
                column: "ConsultaId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosSessao_CriadoPorUsuarioId",
                table: "RegistrosSessao",
                column: "CriadoPorUsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosSessao_PacienteId_DataSessao",
                table: "RegistrosSessao",
                columns: new[] { "PacienteId", "DataSessao" });

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosSessao_TipoAtendimentoId",
                table: "RegistrosSessao",
                column: "TipoAtendimentoId");

            migrationBuilder.CreateIndex(
                name: "IX_RetificacoesRegistroSessao_RegistroSessaoId",
                table: "RetificacoesRegistroSessao",
                column: "RegistroSessaoId");

            migrationBuilder.CreateIndex(
                name: "IX_RetificacoesRegistroSessao_UsuarioId",
                table: "RetificacoesRegistroSessao",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_SessoesBot_ConversaWhatsAppId",
                table: "SessoesBot",
                column: "ConversaWhatsAppId",
                unique: true,
                filter: "[Status] = 'Aberta'");

            migrationBuilder.CreateIndex(
                name: "IX_SessoesBot_ConversaWhatsAppId_Status",
                table: "SessoesBot",
                columns: new[] { "ConversaWhatsAppId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_SessoesBot_PacienteId",
                table: "SessoesBot",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_TiposAtendimento_Nome",
                table: "TiposAtendimento",
                column: "Nome",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Email",
                table: "Usuarios",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BloqueiosAgenda");

            migrationBuilder.DropTable(
                name: "ConfiguracoesAtendimento");

            migrationBuilder.DropTable(
                name: "ContatosPaciente");

            migrationBuilder.DropTable(
                name: "DadosProfissionaisPsicologo");

            migrationBuilder.DropTable(
                name: "EventosBridgeWhatsApp");

            migrationBuilder.DropTable(
                name: "HistoricosConsulta");

            migrationBuilder.DropTable(
                name: "HorariosDisponiveis");

            migrationBuilder.DropTable(
                name: "IntencoesBot");

            migrationBuilder.DropTable(
                name: "Lembretes");

            migrationBuilder.DropTable(
                name: "ListaEspera");

            migrationBuilder.DropTable(
                name: "LogsAuditoria");

            migrationBuilder.DropTable(
                name: "MensagensWhatsApp");

            migrationBuilder.DropTable(
                name: "Notificacoes");

            migrationBuilder.DropTable(
                name: "Pagamentos");

            migrationBuilder.DropTable(
                name: "RetificacoesRegistroSessao");

            migrationBuilder.DropTable(
                name: "SessoesBot");

            migrationBuilder.DropTable(
                name: "ModelosMensagem");

            migrationBuilder.DropTable(
                name: "RegistrosSessao");

            migrationBuilder.DropTable(
                name: "ConversasWhatsApp");

            migrationBuilder.DropTable(
                name: "Consultas");

            migrationBuilder.DropTable(
                name: "IntegracoesWhatsApp");

            migrationBuilder.DropTable(
                name: "Pacientes");

            migrationBuilder.DropTable(
                name: "TiposAtendimento");

            migrationBuilder.DropTable(
                name: "Usuarios");
        }
    }
}
