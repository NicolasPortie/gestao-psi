using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Psique.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AlinharModeloContaPsicologoSaas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TiposAtendimento_Nome",
                table: "TiposAtendimento");

            migrationBuilder.DropIndex(
                name: "IX_SessoesBot_ConversaWhatsAppId",
                table: "SessoesBot");

            migrationBuilder.DropIndex(
                name: "IX_SessoesBot_ConversaWhatsAppId_Status",
                table: "SessoesBot");

            migrationBuilder.DropIndex(
                name: "IX_RegistrosSessao_PacienteId_DataSessao",
                table: "RegistrosSessao");

            migrationBuilder.DropIndex(
                name: "IX_Pagamentos_PacienteId_Status",
                table: "Pagamentos");

            migrationBuilder.DropIndex(
                name: "IX_Pacientes_Cpf",
                table: "Pacientes");

            migrationBuilder.DropIndex(
                name: "IX_Notificacoes_UsuarioId_Lida_CriadoEm",
                table: "Notificacoes");

            migrationBuilder.DropIndex(
                name: "IX_ModelosMensagem_Tipo_Canal_Ativo",
                table: "ModelosMensagem");

            migrationBuilder.DropIndex(
                name: "IX_MensagensWhatsApp_ConversaWhatsAppId_MensagemExternaId",
                table: "MensagensWhatsApp");

            migrationBuilder.DropIndex(
                name: "IX_LogsAuditoria_CriadoEm",
                table: "LogsAuditoria");

            migrationBuilder.DropIndex(
                name: "IX_LogsAuditoria_Entidade_EntidadeId",
                table: "LogsAuditoria");

            migrationBuilder.DropIndex(
                name: "IX_ListaEspera_Status_CriadoEm",
                table: "ListaEspera");

            migrationBuilder.DropIndex(
                name: "IX_Lembretes_AgendadoPara_Status",
                table: "Lembretes");

            migrationBuilder.DropIndex(
                name: "IX_HorariosDisponiveis_DiaSemana_HoraInicio_HoraFim",
                table: "HorariosDisponiveis");

            migrationBuilder.DropIndex(
                name: "IX_EventosBridgeWhatsApp_IntegracaoWhatsAppId_EventoExternoId",
                table: "EventosBridgeWhatsApp");

            migrationBuilder.DropIndex(
                name: "IX_EventosBridgeWhatsApp_IntegracaoWhatsAppId_PayloadHash",
                table: "EventosBridgeWhatsApp");

            migrationBuilder.DropIndex(
                name: "IX_DadosProfissionaisPsicologo_Crp",
                table: "DadosProfissionaisPsicologo");

            migrationBuilder.DropIndex(
                name: "IX_DadosProfissionaisPsicologo_Status",
                table: "DadosProfissionaisPsicologo");

            migrationBuilder.DropIndex(
                name: "IX_ConversasWhatsApp_IntegracaoWhatsAppId_Telefone",
                table: "ConversasWhatsApp");

            migrationBuilder.DropIndex(
                name: "IX_ConversasWhatsApp_Status_UltimaMensagemEm",
                table: "ConversasWhatsApp");

            migrationBuilder.DropIndex(
                name: "IX_ContatosPaciente_PacienteId_TipoContato_Valor",
                table: "ContatosPaciente");

            migrationBuilder.DropIndex(
                name: "IX_Consultas_InicioEm",
                table: "Consultas");

            migrationBuilder.DropIndex(
                name: "IX_Consultas_InicioEm_FimEm",
                table: "Consultas");

            migrationBuilder.DropIndex(
                name: "IX_Consultas_PacienteId_InicioEm",
                table: "Consultas");

            migrationBuilder.DropIndex(
                name: "IX_ConfiguracoesAtendimento_Ativo",
                table: "ConfiguracoesAtendimento");

            migrationBuilder.DropIndex(
                name: "IX_BloqueiosAgenda_InicioEm_FimEm",
                table: "BloqueiosAgenda");

            migrationBuilder.AddColumn<Guid>(
                name: "ContaPsicologoId",
                table: "Usuarios",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ContaPsicologoId",
                table: "TiposAtendimento",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ContaPsicologoId",
                table: "SessoesBot",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ContaPsicologoId",
                table: "RetificacoesRegistroSessao",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ContaPsicologoId",
                table: "RegistrosSessao",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ProntuarioId",
                table: "RegistrosSessao",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ContaPsicologoId",
                table: "Pagamentos",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<string>(
                name: "Telefone",
                table: "Pacientes",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(30)",
                oldMaxLength: 30,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Pacientes",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(180)",
                oldMaxLength: 180,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Cpf",
                table: "Pacientes",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(14)",
                oldMaxLength: 14,
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ContaPsicologoId",
                table: "Pacientes",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "CpfHash",
                table: "Pacientes",
                type: "nvarchar(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ContaPsicologoId",
                table: "Notificacoes",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ContaPsicologoId",
                table: "ModelosMensagem",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ContaPsicologoId",
                table: "MensagensWhatsApp",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ContaPsicologoId",
                table: "LogsAuditoria",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ContaPsicologoId",
                table: "ListaEspera",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ContaPsicologoId",
                table: "Lembretes",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ContaPsicologoId",
                table: "IntegracoesWhatsApp",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ContaPsicologoId",
                table: "HorariosDisponiveis",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ContaPsicologoId",
                table: "HistoricosConsulta",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ContaPsicologoId",
                table: "EventosBridgeWhatsApp",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ContaPsicologoId",
                table: "DadosProfissionaisPsicologo",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "CrpHash",
                table: "DadosProfissionaisPsicologo",
                type: "nvarchar(128)",
                maxLength: 128,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Telefone",
                table: "ConversasWhatsApp",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(30)",
                oldMaxLength: 30);

            migrationBuilder.AddColumn<Guid>(
                name: "ContaPsicologoId",
                table: "ConversasWhatsApp",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<string>(
                name: "Valor",
                table: "ContatosPaciente",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(180)",
                oldMaxLength: 180);

            migrationBuilder.AddColumn<Guid>(
                name: "ContaPsicologoId",
                table: "ContatosPaciente",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "ValorHash",
                table: "ContatosPaciente",
                type: "nvarchar(128)",
                maxLength: 128,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "ContaPsicologoId",
                table: "Consultas",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ContaPsicologoId",
                table: "ConfiguracoesAtendimento",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ContaPsicologoId",
                table: "BloqueiosAgenda",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "ContasPsicologo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NomeConta = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContasPsicologo", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Prontuarios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ArquivadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ContaPsicologoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Prontuarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Prontuarios_ContasPsicologo_ContaPsicologoId",
                        column: x => x.ContaPsicologoId,
                        principalTable: "ContasPsicologo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Prontuarios_Pacientes_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "Pacientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EvolucoesProntuario",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProntuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RegistroSessaoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CriadoPorUsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Conteudo = table.Column<string>(type: "nvarchar(max)", maxLength: 8000, nullable: false),
                    DataEvolucao = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    ContaPsicologoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EvolucoesProntuario", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EvolucoesProntuario_ContasPsicologo_ContaPsicologoId",
                        column: x => x.ContaPsicologoId,
                        principalTable: "ContasPsicologo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EvolucoesProntuario_Pacientes_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "Pacientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EvolucoesProntuario_Prontuarios_ProntuarioId",
                        column: x => x.ProntuarioId,
                        principalTable: "Prontuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EvolucoesProntuario_RegistrosSessao_RegistroSessaoId",
                        column: x => x.RegistroSessaoId,
                        principalTable: "RegistrosSessao",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_EvolucoesProntuario_Usuarios_CriadoPorUsuarioId",
                        column: x => x.CriadoPorUsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_ContaPsicologoId",
                table: "Usuarios",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_ContaPsicologoId_Perfil_Status",
                table: "Usuarios",
                columns: new[] { "ContaPsicologoId", "Perfil", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_TiposAtendimento_ContaPsicologoId",
                table: "TiposAtendimento",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_TiposAtendimento_ContaPsicologoId_Nome",
                table: "TiposAtendimento",
                columns: new[] { "ContaPsicologoId", "Nome" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SessoesBot_ContaPsicologoId",
                table: "SessoesBot",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_SessoesBot_ContaPsicologoId_ConversaWhatsAppId",
                table: "SessoesBot",
                columns: new[] { "ContaPsicologoId", "ConversaWhatsAppId" },
                unique: true,
                filter: "[Status] = 'Aberta'");

            migrationBuilder.CreateIndex(
                name: "IX_SessoesBot_ContaPsicologoId_ConversaWhatsAppId_Status",
                table: "SessoesBot",
                columns: new[] { "ContaPsicologoId", "ConversaWhatsAppId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_SessoesBot_ConversaWhatsAppId",
                table: "SessoesBot",
                column: "ConversaWhatsAppId");

            migrationBuilder.CreateIndex(
                name: "IX_RetificacoesRegistroSessao_ContaPsicologoId",
                table: "RetificacoesRegistroSessao",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosSessao_ContaPsicologoId",
                table: "RegistrosSessao",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosSessao_ContaPsicologoId_ConsultaId",
                table: "RegistrosSessao",
                columns: new[] { "ContaPsicologoId", "ConsultaId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosSessao_ContaPsicologoId_PacienteId_DataSessao",
                table: "RegistrosSessao",
                columns: new[] { "ContaPsicologoId", "PacienteId", "DataSessao" });

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosSessao_ContaPsicologoId_ProntuarioId_DataSessao",
                table: "RegistrosSessao",
                columns: new[] { "ContaPsicologoId", "ProntuarioId", "DataSessao" });

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosSessao_PacienteId",
                table: "RegistrosSessao",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosSessao_ProntuarioId",
                table: "RegistrosSessao",
                column: "ProntuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Pagamentos_ContaPsicologoId",
                table: "Pagamentos",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_Pagamentos_ContaPsicologoId_ConsultaId",
                table: "Pagamentos",
                columns: new[] { "ContaPsicologoId", "ConsultaId" });

            migrationBuilder.CreateIndex(
                name: "IX_Pagamentos_ContaPsicologoId_PacienteId_Status",
                table: "Pagamentos",
                columns: new[] { "ContaPsicologoId", "PacienteId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Pagamentos_PacienteId",
                table: "Pagamentos",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_Pacientes_ContaPsicologoId",
                table: "Pacientes",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_Pacientes_ContaPsicologoId_CpfHash",
                table: "Pacientes",
                columns: new[] { "ContaPsicologoId", "CpfHash" },
                unique: true,
                filter: "[CpfHash] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Pacientes_ContaPsicologoId_Status_NomeCompleto",
                table: "Pacientes",
                columns: new[] { "ContaPsicologoId", "Status", "NomeCompleto" });

            migrationBuilder.CreateIndex(
                name: "IX_Pacientes_ContaPsicologoId_UsuarioId",
                table: "Pacientes",
                columns: new[] { "ContaPsicologoId", "UsuarioId" },
                unique: true,
                filter: "[UsuarioId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Notificacoes_ContaPsicologoId",
                table: "Notificacoes",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_Notificacoes_ContaPsicologoId_UsuarioId_Lida_CriadoEm",
                table: "Notificacoes",
                columns: new[] { "ContaPsicologoId", "UsuarioId", "Lida", "CriadoEm" });

            migrationBuilder.CreateIndex(
                name: "IX_Notificacoes_UsuarioId",
                table: "Notificacoes",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelosMensagem_ContaPsicologoId",
                table: "ModelosMensagem",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelosMensagem_ContaPsicologoId_Tipo_Canal_Ativo",
                table: "ModelosMensagem",
                columns: new[] { "ContaPsicologoId", "Tipo", "Canal", "Ativo" });

            migrationBuilder.CreateIndex(
                name: "IX_MensagensWhatsApp_ContaPsicologoId",
                table: "MensagensWhatsApp",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_MensagensWhatsApp_ContaPsicologoId_ConversaWhatsAppId_MensagemExternaId",
                table: "MensagensWhatsApp",
                columns: new[] { "ContaPsicologoId", "ConversaWhatsAppId", "MensagemExternaId" },
                unique: true,
                filter: "[MensagemExternaId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_MensagensWhatsApp_ConversaWhatsAppId",
                table: "MensagensWhatsApp",
                column: "ConversaWhatsAppId");

            migrationBuilder.CreateIndex(
                name: "IX_LogsAuditoria_ContaPsicologoId",
                table: "LogsAuditoria",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_LogsAuditoria_ContaPsicologoId_CriadoEm",
                table: "LogsAuditoria",
                columns: new[] { "ContaPsicologoId", "CriadoEm" });

            migrationBuilder.CreateIndex(
                name: "IX_LogsAuditoria_ContaPsicologoId_Entidade_EntidadeId",
                table: "LogsAuditoria",
                columns: new[] { "ContaPsicologoId", "Entidade", "EntidadeId" });

            migrationBuilder.CreateIndex(
                name: "IX_ListaEspera_ContaPsicologoId",
                table: "ListaEspera",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_ListaEspera_ContaPsicologoId_Status_CriadoEm",
                table: "ListaEspera",
                columns: new[] { "ContaPsicologoId", "Status", "CriadoEm" });

            migrationBuilder.CreateIndex(
                name: "IX_Lembretes_ContaPsicologoId",
                table: "Lembretes",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_Lembretes_ContaPsicologoId_AgendadoPara_Status",
                table: "Lembretes",
                columns: new[] { "ContaPsicologoId", "AgendadoPara", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_IntegracoesWhatsApp_ContaPsicologoId",
                table: "IntegracoesWhatsApp",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_IntegracoesWhatsApp_ContaPsicologoId_Ativo",
                table: "IntegracoesWhatsApp",
                columns: new[] { "ContaPsicologoId", "Ativo" });

            migrationBuilder.CreateIndex(
                name: "IX_HorariosDisponiveis_ContaPsicologoId",
                table: "HorariosDisponiveis",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_HorariosDisponiveis_ContaPsicologoId_DiaSemana_HoraInicio_HoraFim",
                table: "HorariosDisponiveis",
                columns: new[] { "ContaPsicologoId", "DiaSemana", "HoraInicio", "HoraFim" });

            migrationBuilder.CreateIndex(
                name: "IX_HistoricosConsulta_ContaPsicologoId",
                table: "HistoricosConsulta",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_EventosBridgeWhatsApp_ContaPsicologoId",
                table: "EventosBridgeWhatsApp",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_EventosBridgeWhatsApp_ContaPsicologoId_IntegracaoWhatsAppId_EventoExternoId",
                table: "EventosBridgeWhatsApp",
                columns: new[] { "ContaPsicologoId", "IntegracaoWhatsAppId", "EventoExternoId" },
                unique: true,
                filter: "[EventoExternoId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_EventosBridgeWhatsApp_ContaPsicologoId_IntegracaoWhatsAppId_PayloadHash",
                table: "EventosBridgeWhatsApp",
                columns: new[] { "ContaPsicologoId", "IntegracaoWhatsAppId", "PayloadHash" },
                unique: true,
                filter: "[PayloadHash] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_EventosBridgeWhatsApp_IntegracaoWhatsAppId",
                table: "EventosBridgeWhatsApp",
                column: "IntegracaoWhatsAppId");

            migrationBuilder.CreateIndex(
                name: "IX_DadosProfissionaisPsicologo_ContaPsicologoId",
                table: "DadosProfissionaisPsicologo",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_DadosProfissionaisPsicologo_ContaPsicologoId_CrpHash",
                table: "DadosProfissionaisPsicologo",
                columns: new[] { "ContaPsicologoId", "CrpHash" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DadosProfissionaisPsicologo_ContaPsicologoId_Status",
                table: "DadosProfissionaisPsicologo",
                columns: new[] { "ContaPsicologoId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_DadosProfissionaisPsicologo_ContaPsicologoId_UsuarioId",
                table: "DadosProfissionaisPsicologo",
                columns: new[] { "ContaPsicologoId", "UsuarioId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ConversasWhatsApp_ContaPsicologoId",
                table: "ConversasWhatsApp",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_ConversasWhatsApp_ContaPsicologoId_IntegracaoWhatsAppId_Telefone",
                table: "ConversasWhatsApp",
                columns: new[] { "ContaPsicologoId", "IntegracaoWhatsAppId", "Telefone" });

            migrationBuilder.CreateIndex(
                name: "IX_ConversasWhatsApp_ContaPsicologoId_Status_UltimaMensagemEm",
                table: "ConversasWhatsApp",
                columns: new[] { "ContaPsicologoId", "Status", "UltimaMensagemEm" });

            migrationBuilder.CreateIndex(
                name: "IX_ConversasWhatsApp_IntegracaoWhatsAppId",
                table: "ConversasWhatsApp",
                column: "IntegracaoWhatsAppId");

            migrationBuilder.CreateIndex(
                name: "IX_ContatosPaciente_ContaPsicologoId",
                table: "ContatosPaciente",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_ContatosPaciente_ContaPsicologoId_PacienteId_TipoContato_ValorHash",
                table: "ContatosPaciente",
                columns: new[] { "ContaPsicologoId", "PacienteId", "TipoContato", "ValorHash" });

            migrationBuilder.CreateIndex(
                name: "IX_ContatosPaciente_PacienteId",
                table: "ContatosPaciente",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_Consultas_ContaPsicologoId",
                table: "Consultas",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_Consultas_ContaPsicologoId_InicioEm",
                table: "Consultas",
                columns: new[] { "ContaPsicologoId", "InicioEm" },
                unique: true,
                filter: "[Status] IN ('AguardandoConfirmacao', 'Agendada', 'Confirmada', 'Realizada', 'NaoCompareceu')");

            migrationBuilder.CreateIndex(
                name: "IX_Consultas_ContaPsicologoId_InicioEm_FimEm",
                table: "Consultas",
                columns: new[] { "ContaPsicologoId", "InicioEm", "FimEm" });

            migrationBuilder.CreateIndex(
                name: "IX_Consultas_ContaPsicologoId_PacienteId_InicioEm",
                table: "Consultas",
                columns: new[] { "ContaPsicologoId", "PacienteId", "InicioEm" });

            migrationBuilder.CreateIndex(
                name: "IX_Consultas_PacienteId",
                table: "Consultas",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_ConfiguracoesAtendimento_ContaPsicologoId",
                table: "ConfiguracoesAtendimento",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_ConfiguracoesAtendimento_ContaPsicologoId_Ativo",
                table: "ConfiguracoesAtendimento",
                columns: new[] { "ContaPsicologoId", "Ativo" },
                unique: true,
                filter: "[Ativo] = 1");

            migrationBuilder.CreateIndex(
                name: "IX_BloqueiosAgenda_ContaPsicologoId",
                table: "BloqueiosAgenda",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_BloqueiosAgenda_ContaPsicologoId_InicioEm_FimEm",
                table: "BloqueiosAgenda",
                columns: new[] { "ContaPsicologoId", "InicioEm", "FimEm" });

            migrationBuilder.CreateIndex(
                name: "IX_ContasPsicologo_Status",
                table: "ContasPsicologo",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_EvolucoesProntuario_ContaPsicologoId",
                table: "EvolucoesProntuario",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_EvolucoesProntuario_ContaPsicologoId_PacienteId_DataEvolucao",
                table: "EvolucoesProntuario",
                columns: new[] { "ContaPsicologoId", "PacienteId", "DataEvolucao" });

            migrationBuilder.CreateIndex(
                name: "IX_EvolucoesProntuario_ContaPsicologoId_ProntuarioId_DataEvolucao",
                table: "EvolucoesProntuario",
                columns: new[] { "ContaPsicologoId", "ProntuarioId", "DataEvolucao" });

            migrationBuilder.CreateIndex(
                name: "IX_EvolucoesProntuario_CriadoPorUsuarioId",
                table: "EvolucoesProntuario",
                column: "CriadoPorUsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_EvolucoesProntuario_PacienteId",
                table: "EvolucoesProntuario",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_EvolucoesProntuario_ProntuarioId",
                table: "EvolucoesProntuario",
                column: "ProntuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_EvolucoesProntuario_RegistroSessaoId",
                table: "EvolucoesProntuario",
                column: "RegistroSessaoId");

            migrationBuilder.CreateIndex(
                name: "IX_Prontuarios_ContaPsicologoId",
                table: "Prontuarios",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_Prontuarios_ContaPsicologoId_PacienteId",
                table: "Prontuarios",
                columns: new[] { "ContaPsicologoId", "PacienteId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Prontuarios_ContaPsicologoId_Status",
                table: "Prontuarios",
                columns: new[] { "ContaPsicologoId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Prontuarios_PacienteId",
                table: "Prontuarios",
                column: "PacienteId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_BloqueiosAgenda_ContasPsicologo_ContaPsicologoId",
                table: "BloqueiosAgenda",
                column: "ContaPsicologoId",
                principalTable: "ContasPsicologo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ConfiguracoesAtendimento_ContasPsicologo_ContaPsicologoId",
                table: "ConfiguracoesAtendimento",
                column: "ContaPsicologoId",
                principalTable: "ContasPsicologo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Consultas_ContasPsicologo_ContaPsicologoId",
                table: "Consultas",
                column: "ContaPsicologoId",
                principalTable: "ContasPsicologo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ContatosPaciente_ContasPsicologo_ContaPsicologoId",
                table: "ContatosPaciente",
                column: "ContaPsicologoId",
                principalTable: "ContasPsicologo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ConversasWhatsApp_ContasPsicologo_ContaPsicologoId",
                table: "ConversasWhatsApp",
                column: "ContaPsicologoId",
                principalTable: "ContasPsicologo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DadosProfissionaisPsicologo_ContasPsicologo_ContaPsicologoId",
                table: "DadosProfissionaisPsicologo",
                column: "ContaPsicologoId",
                principalTable: "ContasPsicologo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EventosBridgeWhatsApp_ContasPsicologo_ContaPsicologoId",
                table: "EventosBridgeWhatsApp",
                column: "ContaPsicologoId",
                principalTable: "ContasPsicologo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_HistoricosConsulta_ContasPsicologo_ContaPsicologoId",
                table: "HistoricosConsulta",
                column: "ContaPsicologoId",
                principalTable: "ContasPsicologo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_HorariosDisponiveis_ContasPsicologo_ContaPsicologoId",
                table: "HorariosDisponiveis",
                column: "ContaPsicologoId",
                principalTable: "ContasPsicologo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_IntegracoesWhatsApp_ContasPsicologo_ContaPsicologoId",
                table: "IntegracoesWhatsApp",
                column: "ContaPsicologoId",
                principalTable: "ContasPsicologo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Lembretes_ContasPsicologo_ContaPsicologoId",
                table: "Lembretes",
                column: "ContaPsicologoId",
                principalTable: "ContasPsicologo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ListaEspera_ContasPsicologo_ContaPsicologoId",
                table: "ListaEspera",
                column: "ContaPsicologoId",
                principalTable: "ContasPsicologo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LogsAuditoria_ContasPsicologo_ContaPsicologoId",
                table: "LogsAuditoria",
                column: "ContaPsicologoId",
                principalTable: "ContasPsicologo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MensagensWhatsApp_ContasPsicologo_ContaPsicologoId",
                table: "MensagensWhatsApp",
                column: "ContaPsicologoId",
                principalTable: "ContasPsicologo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ModelosMensagem_ContasPsicologo_ContaPsicologoId",
                table: "ModelosMensagem",
                column: "ContaPsicologoId",
                principalTable: "ContasPsicologo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notificacoes_ContasPsicologo_ContaPsicologoId",
                table: "Notificacoes",
                column: "ContaPsicologoId",
                principalTable: "ContasPsicologo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Pacientes_ContasPsicologo_ContaPsicologoId",
                table: "Pacientes",
                column: "ContaPsicologoId",
                principalTable: "ContasPsicologo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Pagamentos_ContasPsicologo_ContaPsicologoId",
                table: "Pagamentos",
                column: "ContaPsicologoId",
                principalTable: "ContasPsicologo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RegistrosSessao_ContasPsicologo_ContaPsicologoId",
                table: "RegistrosSessao",
                column: "ContaPsicologoId",
                principalTable: "ContasPsicologo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RegistrosSessao_Prontuarios_ProntuarioId",
                table: "RegistrosSessao",
                column: "ProntuarioId",
                principalTable: "Prontuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RetificacoesRegistroSessao_ContasPsicologo_ContaPsicologoId",
                table: "RetificacoesRegistroSessao",
                column: "ContaPsicologoId",
                principalTable: "ContasPsicologo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SessoesBot_ContasPsicologo_ContaPsicologoId",
                table: "SessoesBot",
                column: "ContaPsicologoId",
                principalTable: "ContasPsicologo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TiposAtendimento_ContasPsicologo_ContaPsicologoId",
                table: "TiposAtendimento",
                column: "ContaPsicologoId",
                principalTable: "ContasPsicologo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Usuarios_ContasPsicologo_ContaPsicologoId",
                table: "Usuarios",
                column: "ContaPsicologoId",
                principalTable: "ContasPsicologo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BloqueiosAgenda_ContasPsicologo_ContaPsicologoId",
                table: "BloqueiosAgenda");

            migrationBuilder.DropForeignKey(
                name: "FK_ConfiguracoesAtendimento_ContasPsicologo_ContaPsicologoId",
                table: "ConfiguracoesAtendimento");

            migrationBuilder.DropForeignKey(
                name: "FK_Consultas_ContasPsicologo_ContaPsicologoId",
                table: "Consultas");

            migrationBuilder.DropForeignKey(
                name: "FK_ContatosPaciente_ContasPsicologo_ContaPsicologoId",
                table: "ContatosPaciente");

            migrationBuilder.DropForeignKey(
                name: "FK_ConversasWhatsApp_ContasPsicologo_ContaPsicologoId",
                table: "ConversasWhatsApp");

            migrationBuilder.DropForeignKey(
                name: "FK_DadosProfissionaisPsicologo_ContasPsicologo_ContaPsicologoId",
                table: "DadosProfissionaisPsicologo");

            migrationBuilder.DropForeignKey(
                name: "FK_EventosBridgeWhatsApp_ContasPsicologo_ContaPsicologoId",
                table: "EventosBridgeWhatsApp");

            migrationBuilder.DropForeignKey(
                name: "FK_HistoricosConsulta_ContasPsicologo_ContaPsicologoId",
                table: "HistoricosConsulta");

            migrationBuilder.DropForeignKey(
                name: "FK_HorariosDisponiveis_ContasPsicologo_ContaPsicologoId",
                table: "HorariosDisponiveis");

            migrationBuilder.DropForeignKey(
                name: "FK_IntegracoesWhatsApp_ContasPsicologo_ContaPsicologoId",
                table: "IntegracoesWhatsApp");

            migrationBuilder.DropForeignKey(
                name: "FK_Lembretes_ContasPsicologo_ContaPsicologoId",
                table: "Lembretes");

            migrationBuilder.DropForeignKey(
                name: "FK_ListaEspera_ContasPsicologo_ContaPsicologoId",
                table: "ListaEspera");

            migrationBuilder.DropForeignKey(
                name: "FK_LogsAuditoria_ContasPsicologo_ContaPsicologoId",
                table: "LogsAuditoria");

            migrationBuilder.DropForeignKey(
                name: "FK_MensagensWhatsApp_ContasPsicologo_ContaPsicologoId",
                table: "MensagensWhatsApp");

            migrationBuilder.DropForeignKey(
                name: "FK_ModelosMensagem_ContasPsicologo_ContaPsicologoId",
                table: "ModelosMensagem");

            migrationBuilder.DropForeignKey(
                name: "FK_Notificacoes_ContasPsicologo_ContaPsicologoId",
                table: "Notificacoes");

            migrationBuilder.DropForeignKey(
                name: "FK_Pacientes_ContasPsicologo_ContaPsicologoId",
                table: "Pacientes");

            migrationBuilder.DropForeignKey(
                name: "FK_Pagamentos_ContasPsicologo_ContaPsicologoId",
                table: "Pagamentos");

            migrationBuilder.DropForeignKey(
                name: "FK_RegistrosSessao_ContasPsicologo_ContaPsicologoId",
                table: "RegistrosSessao");

            migrationBuilder.DropForeignKey(
                name: "FK_RegistrosSessao_Prontuarios_ProntuarioId",
                table: "RegistrosSessao");

            migrationBuilder.DropForeignKey(
                name: "FK_RetificacoesRegistroSessao_ContasPsicologo_ContaPsicologoId",
                table: "RetificacoesRegistroSessao");

            migrationBuilder.DropForeignKey(
                name: "FK_SessoesBot_ContasPsicologo_ContaPsicologoId",
                table: "SessoesBot");

            migrationBuilder.DropForeignKey(
                name: "FK_TiposAtendimento_ContasPsicologo_ContaPsicologoId",
                table: "TiposAtendimento");

            migrationBuilder.DropForeignKey(
                name: "FK_Usuarios_ContasPsicologo_ContaPsicologoId",
                table: "Usuarios");

            migrationBuilder.DropTable(
                name: "EvolucoesProntuario");

            migrationBuilder.DropTable(
                name: "Prontuarios");

            migrationBuilder.DropTable(
                name: "ContasPsicologo");

            migrationBuilder.DropIndex(
                name: "IX_Usuarios_ContaPsicologoId",
                table: "Usuarios");

            migrationBuilder.DropIndex(
                name: "IX_Usuarios_ContaPsicologoId_Perfil_Status",
                table: "Usuarios");

            migrationBuilder.DropIndex(
                name: "IX_TiposAtendimento_ContaPsicologoId",
                table: "TiposAtendimento");

            migrationBuilder.DropIndex(
                name: "IX_TiposAtendimento_ContaPsicologoId_Nome",
                table: "TiposAtendimento");

            migrationBuilder.DropIndex(
                name: "IX_SessoesBot_ContaPsicologoId",
                table: "SessoesBot");

            migrationBuilder.DropIndex(
                name: "IX_SessoesBot_ContaPsicologoId_ConversaWhatsAppId",
                table: "SessoesBot");

            migrationBuilder.DropIndex(
                name: "IX_SessoesBot_ContaPsicologoId_ConversaWhatsAppId_Status",
                table: "SessoesBot");

            migrationBuilder.DropIndex(
                name: "IX_SessoesBot_ConversaWhatsAppId",
                table: "SessoesBot");

            migrationBuilder.DropIndex(
                name: "IX_RetificacoesRegistroSessao_ContaPsicologoId",
                table: "RetificacoesRegistroSessao");

            migrationBuilder.DropIndex(
                name: "IX_RegistrosSessao_ContaPsicologoId",
                table: "RegistrosSessao");

            migrationBuilder.DropIndex(
                name: "IX_RegistrosSessao_ContaPsicologoId_ConsultaId",
                table: "RegistrosSessao");

            migrationBuilder.DropIndex(
                name: "IX_RegistrosSessao_ContaPsicologoId_PacienteId_DataSessao",
                table: "RegistrosSessao");

            migrationBuilder.DropIndex(
                name: "IX_RegistrosSessao_ContaPsicologoId_ProntuarioId_DataSessao",
                table: "RegistrosSessao");

            migrationBuilder.DropIndex(
                name: "IX_RegistrosSessao_PacienteId",
                table: "RegistrosSessao");

            migrationBuilder.DropIndex(
                name: "IX_RegistrosSessao_ProntuarioId",
                table: "RegistrosSessao");

            migrationBuilder.DropIndex(
                name: "IX_Pagamentos_ContaPsicologoId",
                table: "Pagamentos");

            migrationBuilder.DropIndex(
                name: "IX_Pagamentos_ContaPsicologoId_ConsultaId",
                table: "Pagamentos");

            migrationBuilder.DropIndex(
                name: "IX_Pagamentos_ContaPsicologoId_PacienteId_Status",
                table: "Pagamentos");

            migrationBuilder.DropIndex(
                name: "IX_Pagamentos_PacienteId",
                table: "Pagamentos");

            migrationBuilder.DropIndex(
                name: "IX_Pacientes_ContaPsicologoId",
                table: "Pacientes");

            migrationBuilder.DropIndex(
                name: "IX_Pacientes_ContaPsicologoId_CpfHash",
                table: "Pacientes");

            migrationBuilder.DropIndex(
                name: "IX_Pacientes_ContaPsicologoId_Status_NomeCompleto",
                table: "Pacientes");

            migrationBuilder.DropIndex(
                name: "IX_Pacientes_ContaPsicologoId_UsuarioId",
                table: "Pacientes");

            migrationBuilder.DropIndex(
                name: "IX_Notificacoes_ContaPsicologoId",
                table: "Notificacoes");

            migrationBuilder.DropIndex(
                name: "IX_Notificacoes_ContaPsicologoId_UsuarioId_Lida_CriadoEm",
                table: "Notificacoes");

            migrationBuilder.DropIndex(
                name: "IX_Notificacoes_UsuarioId",
                table: "Notificacoes");

            migrationBuilder.DropIndex(
                name: "IX_ModelosMensagem_ContaPsicologoId",
                table: "ModelosMensagem");

            migrationBuilder.DropIndex(
                name: "IX_ModelosMensagem_ContaPsicologoId_Tipo_Canal_Ativo",
                table: "ModelosMensagem");

            migrationBuilder.DropIndex(
                name: "IX_MensagensWhatsApp_ContaPsicologoId",
                table: "MensagensWhatsApp");

            migrationBuilder.DropIndex(
                name: "IX_MensagensWhatsApp_ContaPsicologoId_ConversaWhatsAppId_MensagemExternaId",
                table: "MensagensWhatsApp");

            migrationBuilder.DropIndex(
                name: "IX_MensagensWhatsApp_ConversaWhatsAppId",
                table: "MensagensWhatsApp");

            migrationBuilder.DropIndex(
                name: "IX_LogsAuditoria_ContaPsicologoId",
                table: "LogsAuditoria");

            migrationBuilder.DropIndex(
                name: "IX_LogsAuditoria_ContaPsicologoId_CriadoEm",
                table: "LogsAuditoria");

            migrationBuilder.DropIndex(
                name: "IX_LogsAuditoria_ContaPsicologoId_Entidade_EntidadeId",
                table: "LogsAuditoria");

            migrationBuilder.DropIndex(
                name: "IX_ListaEspera_ContaPsicologoId",
                table: "ListaEspera");

            migrationBuilder.DropIndex(
                name: "IX_ListaEspera_ContaPsicologoId_Status_CriadoEm",
                table: "ListaEspera");

            migrationBuilder.DropIndex(
                name: "IX_Lembretes_ContaPsicologoId",
                table: "Lembretes");

            migrationBuilder.DropIndex(
                name: "IX_Lembretes_ContaPsicologoId_AgendadoPara_Status",
                table: "Lembretes");

            migrationBuilder.DropIndex(
                name: "IX_IntegracoesWhatsApp_ContaPsicologoId",
                table: "IntegracoesWhatsApp");

            migrationBuilder.DropIndex(
                name: "IX_IntegracoesWhatsApp_ContaPsicologoId_Ativo",
                table: "IntegracoesWhatsApp");

            migrationBuilder.DropIndex(
                name: "IX_HorariosDisponiveis_ContaPsicologoId",
                table: "HorariosDisponiveis");

            migrationBuilder.DropIndex(
                name: "IX_HorariosDisponiveis_ContaPsicologoId_DiaSemana_HoraInicio_HoraFim",
                table: "HorariosDisponiveis");

            migrationBuilder.DropIndex(
                name: "IX_HistoricosConsulta_ContaPsicologoId",
                table: "HistoricosConsulta");

            migrationBuilder.DropIndex(
                name: "IX_EventosBridgeWhatsApp_ContaPsicologoId",
                table: "EventosBridgeWhatsApp");

            migrationBuilder.DropIndex(
                name: "IX_EventosBridgeWhatsApp_ContaPsicologoId_IntegracaoWhatsAppId_EventoExternoId",
                table: "EventosBridgeWhatsApp");

            migrationBuilder.DropIndex(
                name: "IX_EventosBridgeWhatsApp_ContaPsicologoId_IntegracaoWhatsAppId_PayloadHash",
                table: "EventosBridgeWhatsApp");

            migrationBuilder.DropIndex(
                name: "IX_EventosBridgeWhatsApp_IntegracaoWhatsAppId",
                table: "EventosBridgeWhatsApp");

            migrationBuilder.DropIndex(
                name: "IX_DadosProfissionaisPsicologo_ContaPsicologoId",
                table: "DadosProfissionaisPsicologo");

            migrationBuilder.DropIndex(
                name: "IX_DadosProfissionaisPsicologo_ContaPsicologoId_CrpHash",
                table: "DadosProfissionaisPsicologo");

            migrationBuilder.DropIndex(
                name: "IX_DadosProfissionaisPsicologo_ContaPsicologoId_Status",
                table: "DadosProfissionaisPsicologo");

            migrationBuilder.DropIndex(
                name: "IX_DadosProfissionaisPsicologo_ContaPsicologoId_UsuarioId",
                table: "DadosProfissionaisPsicologo");

            migrationBuilder.DropIndex(
                name: "IX_ConversasWhatsApp_ContaPsicologoId",
                table: "ConversasWhatsApp");

            migrationBuilder.DropIndex(
                name: "IX_ConversasWhatsApp_ContaPsicologoId_IntegracaoWhatsAppId_Telefone",
                table: "ConversasWhatsApp");

            migrationBuilder.DropIndex(
                name: "IX_ConversasWhatsApp_ContaPsicologoId_Status_UltimaMensagemEm",
                table: "ConversasWhatsApp");

            migrationBuilder.DropIndex(
                name: "IX_ConversasWhatsApp_IntegracaoWhatsAppId",
                table: "ConversasWhatsApp");

            migrationBuilder.DropIndex(
                name: "IX_ContatosPaciente_ContaPsicologoId",
                table: "ContatosPaciente");

            migrationBuilder.DropIndex(
                name: "IX_ContatosPaciente_ContaPsicologoId_PacienteId_TipoContato_ValorHash",
                table: "ContatosPaciente");

            migrationBuilder.DropIndex(
                name: "IX_ContatosPaciente_PacienteId",
                table: "ContatosPaciente");

            migrationBuilder.DropIndex(
                name: "IX_Consultas_ContaPsicologoId",
                table: "Consultas");

            migrationBuilder.DropIndex(
                name: "IX_Consultas_ContaPsicologoId_InicioEm",
                table: "Consultas");

            migrationBuilder.DropIndex(
                name: "IX_Consultas_ContaPsicologoId_InicioEm_FimEm",
                table: "Consultas");

            migrationBuilder.DropIndex(
                name: "IX_Consultas_ContaPsicologoId_PacienteId_InicioEm",
                table: "Consultas");

            migrationBuilder.DropIndex(
                name: "IX_Consultas_PacienteId",
                table: "Consultas");

            migrationBuilder.DropIndex(
                name: "IX_ConfiguracoesAtendimento_ContaPsicologoId",
                table: "ConfiguracoesAtendimento");

            migrationBuilder.DropIndex(
                name: "IX_ConfiguracoesAtendimento_ContaPsicologoId_Ativo",
                table: "ConfiguracoesAtendimento");

            migrationBuilder.DropIndex(
                name: "IX_BloqueiosAgenda_ContaPsicologoId",
                table: "BloqueiosAgenda");

            migrationBuilder.DropIndex(
                name: "IX_BloqueiosAgenda_ContaPsicologoId_InicioEm_FimEm",
                table: "BloqueiosAgenda");

            migrationBuilder.DropColumn(
                name: "ContaPsicologoId",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "ContaPsicologoId",
                table: "TiposAtendimento");

            migrationBuilder.DropColumn(
                name: "ContaPsicologoId",
                table: "SessoesBot");

            migrationBuilder.DropColumn(
                name: "ContaPsicologoId",
                table: "RetificacoesRegistroSessao");

            migrationBuilder.DropColumn(
                name: "ContaPsicologoId",
                table: "RegistrosSessao");

            migrationBuilder.DropColumn(
                name: "ProntuarioId",
                table: "RegistrosSessao");

            migrationBuilder.DropColumn(
                name: "ContaPsicologoId",
                table: "Pagamentos");

            migrationBuilder.DropColumn(
                name: "ContaPsicologoId",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "CpfHash",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "ContaPsicologoId",
                table: "Notificacoes");

            migrationBuilder.DropColumn(
                name: "ContaPsicologoId",
                table: "ModelosMensagem");

            migrationBuilder.DropColumn(
                name: "ContaPsicologoId",
                table: "MensagensWhatsApp");

            migrationBuilder.DropColumn(
                name: "ContaPsicologoId",
                table: "LogsAuditoria");

            migrationBuilder.DropColumn(
                name: "ContaPsicologoId",
                table: "ListaEspera");

            migrationBuilder.DropColumn(
                name: "ContaPsicologoId",
                table: "Lembretes");

            migrationBuilder.DropColumn(
                name: "ContaPsicologoId",
                table: "IntegracoesWhatsApp");

            migrationBuilder.DropColumn(
                name: "ContaPsicologoId",
                table: "HorariosDisponiveis");

            migrationBuilder.DropColumn(
                name: "ContaPsicologoId",
                table: "HistoricosConsulta");

            migrationBuilder.DropColumn(
                name: "ContaPsicologoId",
                table: "EventosBridgeWhatsApp");

            migrationBuilder.DropColumn(
                name: "ContaPsicologoId",
                table: "DadosProfissionaisPsicologo");

            migrationBuilder.DropColumn(
                name: "CrpHash",
                table: "DadosProfissionaisPsicologo");

            migrationBuilder.DropColumn(
                name: "ContaPsicologoId",
                table: "ConversasWhatsApp");

            migrationBuilder.DropColumn(
                name: "ContaPsicologoId",
                table: "ContatosPaciente");

            migrationBuilder.DropColumn(
                name: "ValorHash",
                table: "ContatosPaciente");

            migrationBuilder.DropColumn(
                name: "ContaPsicologoId",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "ContaPsicologoId",
                table: "ConfiguracoesAtendimento");

            migrationBuilder.DropColumn(
                name: "ContaPsicologoId",
                table: "BloqueiosAgenda");

            migrationBuilder.AlterColumn<string>(
                name: "Telefone",
                table: "Pacientes",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Pacientes",
                type: "nvarchar(180)",
                maxLength: 180,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Cpf",
                table: "Pacientes",
                type: "nvarchar(14)",
                maxLength: 14,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Telefone",
                table: "ConversasWhatsApp",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "Valor",
                table: "ContatosPaciente",
                type: "nvarchar(180)",
                maxLength: 180,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.CreateIndex(
                name: "IX_TiposAtendimento_Nome",
                table: "TiposAtendimento",
                column: "Nome",
                unique: true);

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
                name: "IX_RegistrosSessao_PacienteId_DataSessao",
                table: "RegistrosSessao",
                columns: new[] { "PacienteId", "DataSessao" });

            migrationBuilder.CreateIndex(
                name: "IX_Pagamentos_PacienteId_Status",
                table: "Pagamentos",
                columns: new[] { "PacienteId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Pacientes_Cpf",
                table: "Pacientes",
                column: "Cpf",
                unique: true,
                filter: "[Cpf] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Notificacoes_UsuarioId_Lida_CriadoEm",
                table: "Notificacoes",
                columns: new[] { "UsuarioId", "Lida", "CriadoEm" });

            migrationBuilder.CreateIndex(
                name: "IX_ModelosMensagem_Tipo_Canal_Ativo",
                table: "ModelosMensagem",
                columns: new[] { "Tipo", "Canal", "Ativo" });

            migrationBuilder.CreateIndex(
                name: "IX_MensagensWhatsApp_ConversaWhatsAppId_MensagemExternaId",
                table: "MensagensWhatsApp",
                columns: new[] { "ConversaWhatsAppId", "MensagemExternaId" },
                unique: true,
                filter: "[MensagemExternaId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_LogsAuditoria_CriadoEm",
                table: "LogsAuditoria",
                column: "CriadoEm");

            migrationBuilder.CreateIndex(
                name: "IX_LogsAuditoria_Entidade_EntidadeId",
                table: "LogsAuditoria",
                columns: new[] { "Entidade", "EntidadeId" });

            migrationBuilder.CreateIndex(
                name: "IX_ListaEspera_Status_CriadoEm",
                table: "ListaEspera",
                columns: new[] { "Status", "CriadoEm" });

            migrationBuilder.CreateIndex(
                name: "IX_Lembretes_AgendadoPara_Status",
                table: "Lembretes",
                columns: new[] { "AgendadoPara", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_HorariosDisponiveis_DiaSemana_HoraInicio_HoraFim",
                table: "HorariosDisponiveis",
                columns: new[] { "DiaSemana", "HoraInicio", "HoraFim" });

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
                name: "IX_ConversasWhatsApp_IntegracaoWhatsAppId_Telefone",
                table: "ConversasWhatsApp",
                columns: new[] { "IntegracaoWhatsAppId", "Telefone" });

            migrationBuilder.CreateIndex(
                name: "IX_ConversasWhatsApp_Status_UltimaMensagemEm",
                table: "ConversasWhatsApp",
                columns: new[] { "Status", "UltimaMensagemEm" });

            migrationBuilder.CreateIndex(
                name: "IX_ContatosPaciente_PacienteId_TipoContato_Valor",
                table: "ContatosPaciente",
                columns: new[] { "PacienteId", "TipoContato", "Valor" });

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
                name: "IX_ConfiguracoesAtendimento_Ativo",
                table: "ConfiguracoesAtendimento",
                column: "Ativo",
                unique: true,
                filter: "[Ativo] = 1");

            migrationBuilder.CreateIndex(
                name: "IX_BloqueiosAgenda_InicioEm_FimEm",
                table: "BloqueiosAgenda",
                columns: new[] { "InicioEm", "FimEm" });
        }
    }
}
