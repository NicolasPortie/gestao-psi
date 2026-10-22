using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Psique.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class VersionarAutenticacaoUsuario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "VersaoAutenticacao",
                table: "Usuarios",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "VersaoAutenticacao",
                table: "Usuarios");
        }
    }
}
