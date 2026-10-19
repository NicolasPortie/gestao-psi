using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestaoPsi.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class SerieConsultasValorSessaoContatos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "ValorSessao",
                table: "Pacientes",
                type: "decimal(12,2)",
                precision: 12,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Nome",
                table: "ContatosPaciente",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SerieId",
                table: "Consultas",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Consultas_ContaPsicologoId_SerieId",
                table: "Consultas",
                columns: new[] { "ContaPsicologoId", "SerieId" },
                filter: "[SerieId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Consultas_ContaPsicologoId_SerieId",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "ValorSessao",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "Nome",
                table: "ContatosPaciente");

            migrationBuilder.DropColumn(
                name: "SerieId",
                table: "Consultas");
        }
    }
}
