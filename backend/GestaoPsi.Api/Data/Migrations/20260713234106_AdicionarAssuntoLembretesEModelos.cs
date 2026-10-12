using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestaoPsi.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarAssuntoLembretesEModelos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Assunto",
                table: "ModelosMensagem",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Assunto",
                table: "Lembretes",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Assunto",
                table: "ModelosMensagem");

            migrationBuilder.DropColumn(
                name: "Assunto",
                table: "Lembretes");
        }
    }
}
