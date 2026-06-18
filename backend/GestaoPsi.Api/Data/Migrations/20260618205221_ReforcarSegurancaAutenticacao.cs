using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestaoPsi.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class ReforcarSegurancaAutenticacao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ConversasWhatsApp_Pacientes_ContaPsicologoId_PacienteId",
                table: "ConversasWhatsApp");

            migrationBuilder.DropForeignKey(
                name: "FK_EvolucoesProntuario_RegistrosSessao_ContaPsicologoId_RegistroSessaoId",
                table: "EvolucoesProntuario");

            migrationBuilder.DropForeignKey(
                name: "FK_HistoricosConsulta_Usuarios_ContaPsicologoId_UsuarioId",
                table: "HistoricosConsulta");

            migrationBuilder.DropForeignKey(
                name: "FK_Lembretes_ModelosMensagem_ContaPsicologoId_ModeloMensagemId",
                table: "Lembretes");

            migrationBuilder.DropForeignKey(
                name: "FK_ListaEspera_TiposAtendimento_ContaPsicologoId_TipoAtendimentoId",
                table: "ListaEspera");

            migrationBuilder.DropForeignKey(
                name: "FK_LogsAuditoria_Usuarios_ContaPsicologoId_UsuarioId",
                table: "LogsAuditoria");

            migrationBuilder.DropForeignKey(
                name: "FK_Pacientes_Usuarios_ContaPsicologoId_UsuarioId",
                table: "Pacientes");

            migrationBuilder.DropForeignKey(
                name: "FK_Pagamentos_Consultas_ContaPsicologoId_ConsultaId",
                table: "Pagamentos");

            migrationBuilder.DropForeignKey(
                name: "FK_SessoesBot_Pacientes_ContaPsicologoId_PacienteId",
                table: "SessoesBot");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "TermosAceitosEm",
                table: "Usuarios",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VersaoTermosAceitos",
                table: "Usuarios",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Crp",
                table: "DadosProfissionaisPsicologo",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(30)",
                oldMaxLength: 30);

            migrationBuilder.AddForeignKey(
                name: "FK_ConversasWhatsApp_Pacientes_ContaPsicologoId_PacienteId",
                table: "ConversasWhatsApp",
                columns: new[] { "ContaPsicologoId", "PacienteId" },
                principalTable: "Pacientes",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EvolucoesProntuario_RegistrosSessao_ContaPsicologoId_RegistroSessaoId",
                table: "EvolucoesProntuario",
                columns: new[] { "ContaPsicologoId", "RegistroSessaoId" },
                principalTable: "RegistrosSessao",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_HistoricosConsulta_Usuarios_ContaPsicologoId_UsuarioId",
                table: "HistoricosConsulta",
                columns: new[] { "ContaPsicologoId", "UsuarioId" },
                principalTable: "Usuarios",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Lembretes_ModelosMensagem_ContaPsicologoId_ModeloMensagemId",
                table: "Lembretes",
                columns: new[] { "ContaPsicologoId", "ModeloMensagemId" },
                principalTable: "ModelosMensagem",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ListaEspera_TiposAtendimento_ContaPsicologoId_TipoAtendimentoId",
                table: "ListaEspera",
                columns: new[] { "ContaPsicologoId", "TipoAtendimentoId" },
                principalTable: "TiposAtendimento",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LogsAuditoria_Usuarios_ContaPsicologoId_UsuarioId",
                table: "LogsAuditoria",
                columns: new[] { "ContaPsicologoId", "UsuarioId" },
                principalTable: "Usuarios",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Pacientes_Usuarios_ContaPsicologoId_UsuarioId",
                table: "Pacientes",
                columns: new[] { "ContaPsicologoId", "UsuarioId" },
                principalTable: "Usuarios",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Pagamentos_Consultas_ContaPsicologoId_ConsultaId",
                table: "Pagamentos",
                columns: new[] { "ContaPsicologoId", "ConsultaId" },
                principalTable: "Consultas",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SessoesBot_Pacientes_ContaPsicologoId_PacienteId",
                table: "SessoesBot",
                columns: new[] { "ContaPsicologoId", "PacienteId" },
                principalTable: "Pacientes",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ConversasWhatsApp_Pacientes_ContaPsicologoId_PacienteId",
                table: "ConversasWhatsApp");

            migrationBuilder.DropForeignKey(
                name: "FK_EvolucoesProntuario_RegistrosSessao_ContaPsicologoId_RegistroSessaoId",
                table: "EvolucoesProntuario");

            migrationBuilder.DropForeignKey(
                name: "FK_HistoricosConsulta_Usuarios_ContaPsicologoId_UsuarioId",
                table: "HistoricosConsulta");

            migrationBuilder.DropForeignKey(
                name: "FK_Lembretes_ModelosMensagem_ContaPsicologoId_ModeloMensagemId",
                table: "Lembretes");

            migrationBuilder.DropForeignKey(
                name: "FK_ListaEspera_TiposAtendimento_ContaPsicologoId_TipoAtendimentoId",
                table: "ListaEspera");

            migrationBuilder.DropForeignKey(
                name: "FK_LogsAuditoria_Usuarios_ContaPsicologoId_UsuarioId",
                table: "LogsAuditoria");

            migrationBuilder.DropForeignKey(
                name: "FK_Pacientes_Usuarios_ContaPsicologoId_UsuarioId",
                table: "Pacientes");

            migrationBuilder.DropForeignKey(
                name: "FK_Pagamentos_Consultas_ContaPsicologoId_ConsultaId",
                table: "Pagamentos");

            migrationBuilder.DropForeignKey(
                name: "FK_SessoesBot_Pacientes_ContaPsicologoId_PacienteId",
                table: "SessoesBot");

            migrationBuilder.DropColumn(
                name: "TermosAceitosEm",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "VersaoTermosAceitos",
                table: "Usuarios");

            migrationBuilder.AlterColumn<string>(
                name: "Crp",
                table: "DadosProfissionaisPsicologo",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AddForeignKey(
                name: "FK_ConversasWhatsApp_Pacientes_ContaPsicologoId_PacienteId",
                table: "ConversasWhatsApp",
                columns: new[] { "ContaPsicologoId", "PacienteId" },
                principalTable: "Pacientes",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_EvolucoesProntuario_RegistrosSessao_ContaPsicologoId_RegistroSessaoId",
                table: "EvolucoesProntuario",
                columns: new[] { "ContaPsicologoId", "RegistroSessaoId" },
                principalTable: "RegistrosSessao",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_HistoricosConsulta_Usuarios_ContaPsicologoId_UsuarioId",
                table: "HistoricosConsulta",
                columns: new[] { "ContaPsicologoId", "UsuarioId" },
                principalTable: "Usuarios",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Lembretes_ModelosMensagem_ContaPsicologoId_ModeloMensagemId",
                table: "Lembretes",
                columns: new[] { "ContaPsicologoId", "ModeloMensagemId" },
                principalTable: "ModelosMensagem",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_ListaEspera_TiposAtendimento_ContaPsicologoId_TipoAtendimentoId",
                table: "ListaEspera",
                columns: new[] { "ContaPsicologoId", "TipoAtendimentoId" },
                principalTable: "TiposAtendimento",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_LogsAuditoria_Usuarios_ContaPsicologoId_UsuarioId",
                table: "LogsAuditoria",
                columns: new[] { "ContaPsicologoId", "UsuarioId" },
                principalTable: "Usuarios",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Pacientes_Usuarios_ContaPsicologoId_UsuarioId",
                table: "Pacientes",
                columns: new[] { "ContaPsicologoId", "UsuarioId" },
                principalTable: "Usuarios",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Pagamentos_Consultas_ContaPsicologoId_ConsultaId",
                table: "Pagamentos",
                columns: new[] { "ContaPsicologoId", "ConsultaId" },
                principalTable: "Consultas",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_SessoesBot_Pacientes_ContaPsicologoId_PacienteId",
                table: "SessoesBot",
                columns: new[] { "ContaPsicologoId", "PacienteId" },
                principalTable: "Pacientes",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.SetNull);
        }
    }
}
