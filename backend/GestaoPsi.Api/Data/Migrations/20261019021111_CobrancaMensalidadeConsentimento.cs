using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestaoPsi.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class CobrancaMensalidadeConsentimento : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "Competencia",
                table: "Pagamentos",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ConsentimentoRegistradoEm",
                table: "Pacientes",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModoCobranca",
                table: "Pacientes",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: false,
                defaultValue: "PorSessao");

            migrationBuilder.AddColumn<bool>(
                name: "CobrarAoRealizar",
                table: "ConfiguracoesAtendimento",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "CobrarFalta",
                table: "ConfiguracoesAtendimento",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Pagamentos_ContaPsicologoId_PacienteId_Competencia",
                table: "Pagamentos",
                columns: new[] { "ContaPsicologoId", "PacienteId", "Competencia" },
                filter: "[Competencia] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Pagamentos_ContaPsicologoId_PacienteId_Competencia",
                table: "Pagamentos");

            migrationBuilder.DropColumn(
                name: "Competencia",
                table: "Pagamentos");

            migrationBuilder.DropColumn(
                name: "ConsentimentoRegistradoEm",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "ModoCobranca",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "CobrarAoRealizar",
                table: "ConfiguracoesAtendimento");

            migrationBuilder.DropColumn(
                name: "CobrarFalta",
                table: "ConfiguracoesAtendimento");
        }
    }
}
