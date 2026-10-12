using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestaoPsi.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarFusoHorarioConta : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FusoHorario",
                table: "ConfiguracoesAtendimento",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FusoHorario",
                table: "ConfiguracoesAtendimento");
        }
    }
}
