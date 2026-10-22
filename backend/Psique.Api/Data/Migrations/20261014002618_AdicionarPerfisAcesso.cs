using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Psique.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarPerfisAcesso : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PerfilAcessoId",
                table: "Usuarios",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PerfisAcesso",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    Permissoes = table.Column<string>(type: "nvarchar(400)", maxLength: 400, nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ContaPsicologoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PerfisAcesso", x => x.Id);
                    table.UniqueConstraint("AK_PerfisAcesso_ContaPsicologoId_Id", x => new { x.ContaPsicologoId, x.Id });
                    table.ForeignKey(
                        name: "FK_PerfisAcesso_ContasPsicologo_ContaPsicologoId",
                        column: x => x.ContaPsicologoId,
                        principalTable: "ContasPsicologo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_ContaPsicologoId_PerfilAcessoId",
                table: "Usuarios",
                columns: new[] { "ContaPsicologoId", "PerfilAcessoId" });

            migrationBuilder.CreateIndex(
                name: "IX_PerfisAcesso_ContaPsicologoId",
                table: "PerfisAcesso",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_PerfisAcesso_ContaPsicologoId_Nome",
                table: "PerfisAcesso",
                columns: new[] { "ContaPsicologoId", "Nome" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Usuarios_PerfisAcesso_ContaPsicologoId_PerfilAcessoId",
                table: "Usuarios",
                columns: new[] { "ContaPsicologoId", "PerfilAcessoId" },
                principalTable: "PerfisAcesso",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Usuarios_PerfisAcesso_ContaPsicologoId_PerfilAcessoId",
                table: "Usuarios");

            migrationBuilder.DropTable(
                name: "PerfisAcesso");

            migrationBuilder.DropIndex(
                name: "IX_Usuarios_ContaPsicologoId_PerfilAcessoId",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "PerfilAcessoId",
                table: "Usuarios");
        }
    }
}
