using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Psique.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class ConfigurarLembretesAutomaticos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AntecedenciaLembreteHoras",
                table: "ConfiguracoesAtendimento",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "CanalLembretePadrao",
                table: "ConfiguracoesAtendimento",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "LembretesAutomaticosAtivos",
                table: "ConfiguracoesAtendimento",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ProgramarLembreteAoConfirmar",
                table: "ConfiguracoesAtendimento",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ProgramarLembreteAoCriarConsulta",
                table: "ConfiguracoesAtendimento",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AntecedenciaLembreteHoras",
                table: "ConfiguracoesAtendimento");

            migrationBuilder.DropColumn(
                name: "CanalLembretePadrao",
                table: "ConfiguracoesAtendimento");

            migrationBuilder.DropColumn(
                name: "LembretesAutomaticosAtivos",
                table: "ConfiguracoesAtendimento");

            migrationBuilder.DropColumn(
                name: "ProgramarLembreteAoConfirmar",
                table: "ConfiguracoesAtendimento");

            migrationBuilder.DropColumn(
                name: "ProgramarLembreteAoCriarConsulta",
                table: "ConfiguracoesAtendimento");
        }
    }
}
