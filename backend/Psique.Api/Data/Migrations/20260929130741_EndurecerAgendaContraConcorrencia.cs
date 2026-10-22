using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Psique.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class EndurecerAgendaContraConcorrencia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Consultas_ContaPsicologoId_Status_InicioEm_FimEm",
                table: "Consultas",
                columns: new[] { "ContaPsicologoId", "Status", "InicioEm", "FimEm" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Consultas_ContaPsicologoId_Status_InicioEm_FimEm",
                table: "Consultas");
        }
    }
}
