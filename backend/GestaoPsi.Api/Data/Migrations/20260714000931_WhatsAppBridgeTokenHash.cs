using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestaoPsi.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class WhatsAppBridgeTokenHash : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TokenHash",
                table: "IntegracoesWhatsApp",
                type: "nvarchar(128)",
                maxLength: 128,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "UltimaConexaoTestadaEm",
                table: "IntegracoesWhatsApp",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UltimoErro",
                table: "IntegracoesWhatsApp",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_IntegracoesWhatsApp_TokenHash",
                table: "IntegracoesWhatsApp",
                column: "TokenHash",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_IntegracoesWhatsApp_TokenHash",
                table: "IntegracoesWhatsApp");

            migrationBuilder.DropColumn(
                name: "TokenHash",
                table: "IntegracoesWhatsApp");

            migrationBuilder.DropColumn(
                name: "UltimaConexaoTestadaEm",
                table: "IntegracoesWhatsApp");

            migrationBuilder.DropColumn(
                name: "UltimoErro",
                table: "IntegracoesWhatsApp");
        }
    }
}
