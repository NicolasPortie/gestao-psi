using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Psique.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class ReforcarCoerenciaClinicaEHistorico : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DocumentosProntuario_Prontuarios_ContaPsicologoId_ProntuarioId",
                table: "DocumentosProntuario");

            migrationBuilder.DropForeignKey(
                name: "FK_EvolucoesProntuario_Prontuarios_ContaPsicologoId_ProntuarioId",
                table: "EvolucoesProntuario");

            migrationBuilder.DropForeignKey(
                name: "FK_EvolucoesProntuario_RegistrosSessao_ContaPsicologoId_RegistroSessaoId",
                table: "EvolucoesProntuario");

            migrationBuilder.DropForeignKey(
                name: "FK_Lembretes_Consultas_ContaPsicologoId_ConsultaId",
                table: "Lembretes");

            migrationBuilder.DropForeignKey(
                name: "FK_Pagamentos_Consultas_ContaPsicologoId_ConsultaId",
                table: "Pagamentos");

            migrationBuilder.DropForeignKey(
                name: "FK_RegistrosSessao_Consultas_ContaPsicologoId_ConsultaId",
                table: "RegistrosSessao");

            migrationBuilder.DropForeignKey(
                name: "FK_RegistrosSessao_Prontuarios_ContaPsicologoId_ProntuarioId",
                table: "RegistrosSessao");

            migrationBuilder.DropIndex(
                name: "IX_Prontuarios_ContaPsicologoId_PacienteId",
                table: "Prontuarios");

            migrationBuilder.DropIndex(
                name: "IX_Lembretes_ContaPsicologoId_ConsultaId",
                table: "Lembretes");

            migrationBuilder.DropIndex(
                name: "IX_Lembretes_ContaPsicologoId_PacienteId",
                table: "Lembretes");

            migrationBuilder.DropIndex(
                name: "IX_EvolucoesProntuario_ContaPsicologoId_RegistroSessaoId",
                table: "EvolucoesProntuario");

            migrationBuilder.DropIndex(
                name: "IX_DadosProfissionaisPsicologo_ContaPsicologoId",
                table: "DadosProfissionaisPsicologo");

            migrationBuilder.DropIndex(
                name: "IX_AssinaturasConta_ContaPsicologoId",
                table: "AssinaturasConta");

            migrationBuilder.AddColumn<Guid>(
                name: "VersaoDocumentoProntuarioId",
                table: "ProtocolosEntregaDocumento",
                type: "uniqueidentifier",
                nullable: true);

            // Nao inventar a versao de uma entrega historica. Somente associar quando
            // ha exatamente uma versao com o hash final que ja existia na entrega.
            migrationBuilder.Sql("""
                IF EXISTS (
                    SELECT 1 FROM [ProtocolosEntregaDocumento] p
                    WHERE (SELECT COUNT(*) FROM [VersoesDocumentoProntuario] v
                        INNER JOIN [DocumentosProntuario] d
                            ON d.[ContaPsicologoId] = v.[ContaPsicologoId]
                            AND d.[Id] = v.[DocumentoProntuarioId]
                        WHERE v.[ContaPsicologoId] = p.[ContaPsicologoId]
                            AND v.[DocumentoProntuarioId] = p.[DocumentoProntuarioId]
                            AND v.[HashConteudo] = d.[HashConteudoFinal]
                            AND v.[CriadoEm] <= p.[EntregueEm]) <> 1)
                    THROW 51001, 'Entrega historica sem versao inequivoca. Revise os protocolos antes de aplicar a migration.', 1;

                UPDATE p SET [VersaoDocumentoProntuarioId] = (
                    SELECT v.[Id] FROM [VersoesDocumentoProntuario] v
                    INNER JOIN [DocumentosProntuario] d
                        ON d.[ContaPsicologoId] = v.[ContaPsicologoId]
                        AND d.[Id] = v.[DocumentoProntuarioId]
                    WHERE v.[ContaPsicologoId] = p.[ContaPsicologoId]
                        AND v.[DocumentoProntuarioId] = p.[DocumentoProntuarioId]
                        AND v.[HashConteudo] = d.[HashConteudoFinal]
                        AND v.[CriadoEm] <= p.[EntregueEm])
                FROM [ProtocolosEntregaDocumento] p;
                """);

            migrationBuilder.AlterColumn<Guid>(
                name: "VersaoDocumentoProntuarioId",
                table: "ProtocolosEntregaDocumento",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AddUniqueConstraint(
                name: "AK_VersoesDocumentoProntuario_ContaPsicologoId_DocumentoProntuarioId_Id",
                table: "VersoesDocumentoProntuario",
                columns: new[] { "ContaPsicologoId", "DocumentoProntuarioId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_RegistrosSessao_ContaPsicologoId_PacienteId_ProntuarioId_Id",
                table: "RegistrosSessao",
                columns: new[] { "ContaPsicologoId", "PacienteId", "ProntuarioId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Prontuarios_ContaPsicologoId_PacienteId_Id",
                table: "Prontuarios",
                columns: new[] { "ContaPsicologoId", "PacienteId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Consultas_ContaPsicologoId_PacienteId_Id",
                table: "Consultas",
                columns: new[] { "ContaPsicologoId", "PacienteId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Consultas_ContaPsicologoId_PacienteId_TipoAtendimentoId_Id",
                table: "Consultas",
                columns: new[] { "ContaPsicologoId", "PacienteId", "TipoAtendimentoId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosSessao_ContaPsicologoId_PacienteId_TipoAtendimentoId_ConsultaId",
                table: "RegistrosSessao",
                columns: new[] { "ContaPsicologoId", "PacienteId", "TipoAtendimentoId", "ConsultaId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProtocolosEntregaDocumento_ContaPsicologoId_DocumentoProntuarioId_VersaoDocumentoProntuarioId",
                table: "ProtocolosEntregaDocumento",
                columns: new[] { "ContaPsicologoId", "DocumentoProntuarioId", "VersaoDocumentoProntuarioId" });

            migrationBuilder.CreateIndex(
                name: "IX_Prontuarios_ContaPsicologoId_PacienteId",
                table: "Prontuarios",
                columns: new[] { "ContaPsicologoId", "PacienteId" },
                unique: true,
                filter: "[Status] = 'Ativo'");

            migrationBuilder.CreateIndex(
                name: "IX_Pagamentos_ContaPsicologoId_PacienteId_ConsultaId",
                table: "Pagamentos",
                columns: new[] { "ContaPsicologoId", "PacienteId", "ConsultaId" });

            migrationBuilder.CreateIndex(
                name: "IX_Lembretes_ContaPsicologoId_PacienteId_ConsultaId",
                table: "Lembretes",
                columns: new[] { "ContaPsicologoId", "PacienteId", "ConsultaId" });

            migrationBuilder.CreateIndex(
                name: "IX_EvolucoesProntuario_ContaPsicologoId_PacienteId_ProntuarioId_RegistroSessaoId",
                table: "EvolucoesProntuario",
                columns: new[] { "ContaPsicologoId", "PacienteId", "ProntuarioId", "RegistroSessaoId" });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentosProntuario_ContaPsicologoId_PacienteId_ProntuarioId",
                table: "DocumentosProntuario",
                columns: new[] { "ContaPsicologoId", "PacienteId", "ProntuarioId" });

            migrationBuilder.CreateIndex(
                name: "IX_DadosProfissionaisPsicologo_ContaPsicologoId",
                table: "DadosProfissionaisPsicologo",
                column: "ContaPsicologoId",
                unique: true,
                filter: "[Status] = 'Ativo'");

            migrationBuilder.CreateIndex(
                name: "IX_AssinaturasConta_ContaPsicologoId",
                table: "AssinaturasConta",
                column: "ContaPsicologoId",
                unique: true,
                filter: "[Status] = 'Ativa'");

            migrationBuilder.AddForeignKey(
                name: "FK_DocumentosProntuario_Prontuarios_ContaPsicologoId_PacienteId_ProntuarioId",
                table: "DocumentosProntuario",
                columns: new[] { "ContaPsicologoId", "PacienteId", "ProntuarioId" },
                principalTable: "Prontuarios",
                principalColumns: new[] { "ContaPsicologoId", "PacienteId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EvolucoesProntuario_Prontuarios_ContaPsicologoId_PacienteId_ProntuarioId",
                table: "EvolucoesProntuario",
                columns: new[] { "ContaPsicologoId", "PacienteId", "ProntuarioId" },
                principalTable: "Prontuarios",
                principalColumns: new[] { "ContaPsicologoId", "PacienteId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EvolucoesProntuario_RegistrosSessao_ContaPsicologoId_PacienteId_ProntuarioId_RegistroSessaoId",
                table: "EvolucoesProntuario",
                columns: new[] { "ContaPsicologoId", "PacienteId", "ProntuarioId", "RegistroSessaoId" },
                principalTable: "RegistrosSessao",
                principalColumns: new[] { "ContaPsicologoId", "PacienteId", "ProntuarioId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Lembretes_Consultas_ContaPsicologoId_PacienteId_ConsultaId",
                table: "Lembretes",
                columns: new[] { "ContaPsicologoId", "PacienteId", "ConsultaId" },
                principalTable: "Consultas",
                principalColumns: new[] { "ContaPsicologoId", "PacienteId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Pagamentos_Consultas_ContaPsicologoId_PacienteId_ConsultaId",
                table: "Pagamentos",
                columns: new[] { "ContaPsicologoId", "PacienteId", "ConsultaId" },
                principalTable: "Consultas",
                principalColumns: new[] { "ContaPsicologoId", "PacienteId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProtocolosEntregaDocumento_VersoesDocumentoProntuario_ContaPsicologoId_DocumentoProntuarioId_VersaoDocumentoProntuarioId",
                table: "ProtocolosEntregaDocumento",
                columns: new[] { "ContaPsicologoId", "DocumentoProntuarioId", "VersaoDocumentoProntuarioId" },
                principalTable: "VersoesDocumentoProntuario",
                principalColumns: new[] { "ContaPsicologoId", "DocumentoProntuarioId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RegistrosSessao_Consultas_ContaPsicologoId_PacienteId_TipoAtendimentoId_ConsultaId",
                table: "RegistrosSessao",
                columns: new[] { "ContaPsicologoId", "PacienteId", "TipoAtendimentoId", "ConsultaId" },
                principalTable: "Consultas",
                principalColumns: new[] { "ContaPsicologoId", "PacienteId", "TipoAtendimentoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RegistrosSessao_Prontuarios_ContaPsicologoId_PacienteId_ProntuarioId",
                table: "RegistrosSessao",
                columns: new[] { "ContaPsicologoId", "PacienteId", "ProntuarioId" },
                principalTable: "Prontuarios",
                principalColumns: new[] { "ContaPsicologoId", "PacienteId", "Id" },
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DocumentosProntuario_Prontuarios_ContaPsicologoId_PacienteId_ProntuarioId",
                table: "DocumentosProntuario");

            migrationBuilder.DropForeignKey(
                name: "FK_EvolucoesProntuario_Prontuarios_ContaPsicologoId_PacienteId_ProntuarioId",
                table: "EvolucoesProntuario");

            migrationBuilder.DropForeignKey(
                name: "FK_EvolucoesProntuario_RegistrosSessao_ContaPsicologoId_PacienteId_ProntuarioId_RegistroSessaoId",
                table: "EvolucoesProntuario");

            migrationBuilder.DropForeignKey(
                name: "FK_Lembretes_Consultas_ContaPsicologoId_PacienteId_ConsultaId",
                table: "Lembretes");

            migrationBuilder.DropForeignKey(
                name: "FK_Pagamentos_Consultas_ContaPsicologoId_PacienteId_ConsultaId",
                table: "Pagamentos");

            migrationBuilder.DropForeignKey(
                name: "FK_ProtocolosEntregaDocumento_VersoesDocumentoProntuario_ContaPsicologoId_DocumentoProntuarioId_VersaoDocumentoProntuarioId",
                table: "ProtocolosEntregaDocumento");

            migrationBuilder.DropForeignKey(
                name: "FK_RegistrosSessao_Consultas_ContaPsicologoId_PacienteId_TipoAtendimentoId_ConsultaId",
                table: "RegistrosSessao");

            migrationBuilder.DropForeignKey(
                name: "FK_RegistrosSessao_Prontuarios_ContaPsicologoId_PacienteId_ProntuarioId",
                table: "RegistrosSessao");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_VersoesDocumentoProntuario_ContaPsicologoId_DocumentoProntuarioId_Id",
                table: "VersoesDocumentoProntuario");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_RegistrosSessao_ContaPsicologoId_PacienteId_ProntuarioId_Id",
                table: "RegistrosSessao");

            migrationBuilder.DropIndex(
                name: "IX_RegistrosSessao_ContaPsicologoId_PacienteId_TipoAtendimentoId_ConsultaId",
                table: "RegistrosSessao");

            migrationBuilder.DropIndex(
                name: "IX_ProtocolosEntregaDocumento_ContaPsicologoId_DocumentoProntuarioId_VersaoDocumentoProntuarioId",
                table: "ProtocolosEntregaDocumento");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Prontuarios_ContaPsicologoId_PacienteId_Id",
                table: "Prontuarios");

            migrationBuilder.DropIndex(
                name: "IX_Prontuarios_ContaPsicologoId_PacienteId",
                table: "Prontuarios");

            migrationBuilder.DropIndex(
                name: "IX_Pagamentos_ContaPsicologoId_PacienteId_ConsultaId",
                table: "Pagamentos");

            migrationBuilder.DropIndex(
                name: "IX_Lembretes_ContaPsicologoId_PacienteId_ConsultaId",
                table: "Lembretes");

            migrationBuilder.DropIndex(
                name: "IX_EvolucoesProntuario_ContaPsicologoId_PacienteId_ProntuarioId_RegistroSessaoId",
                table: "EvolucoesProntuario");

            migrationBuilder.DropIndex(
                name: "IX_DocumentosProntuario_ContaPsicologoId_PacienteId_ProntuarioId",
                table: "DocumentosProntuario");

            migrationBuilder.DropIndex(
                name: "IX_DadosProfissionaisPsicologo_ContaPsicologoId",
                table: "DadosProfissionaisPsicologo");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Consultas_ContaPsicologoId_PacienteId_Id",
                table: "Consultas");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Consultas_ContaPsicologoId_PacienteId_TipoAtendimentoId_Id",
                table: "Consultas");

            migrationBuilder.DropIndex(
                name: "IX_AssinaturasConta_ContaPsicologoId",
                table: "AssinaturasConta");

            migrationBuilder.DropColumn(
                name: "VersaoDocumentoProntuarioId",
                table: "ProtocolosEntregaDocumento");

            migrationBuilder.CreateIndex(
                name: "IX_Prontuarios_ContaPsicologoId_PacienteId",
                table: "Prontuarios",
                columns: new[] { "ContaPsicologoId", "PacienteId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Lembretes_ContaPsicologoId_ConsultaId",
                table: "Lembretes",
                columns: new[] { "ContaPsicologoId", "ConsultaId" });

            migrationBuilder.CreateIndex(
                name: "IX_Lembretes_ContaPsicologoId_PacienteId",
                table: "Lembretes",
                columns: new[] { "ContaPsicologoId", "PacienteId" });

            migrationBuilder.CreateIndex(
                name: "IX_EvolucoesProntuario_ContaPsicologoId_RegistroSessaoId",
                table: "EvolucoesProntuario",
                columns: new[] { "ContaPsicologoId", "RegistroSessaoId" });

            migrationBuilder.CreateIndex(
                name: "IX_DadosProfissionaisPsicologo_ContaPsicologoId",
                table: "DadosProfissionaisPsicologo",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_AssinaturasConta_ContaPsicologoId",
                table: "AssinaturasConta",
                column: "ContaPsicologoId");

            migrationBuilder.AddForeignKey(
                name: "FK_DocumentosProntuario_Prontuarios_ContaPsicologoId_ProntuarioId",
                table: "DocumentosProntuario",
                columns: new[] { "ContaPsicologoId", "ProntuarioId" },
                principalTable: "Prontuarios",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EvolucoesProntuario_Prontuarios_ContaPsicologoId_ProntuarioId",
                table: "EvolucoesProntuario",
                columns: new[] { "ContaPsicologoId", "ProntuarioId" },
                principalTable: "Prontuarios",
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
                name: "FK_Lembretes_Consultas_ContaPsicologoId_ConsultaId",
                table: "Lembretes",
                columns: new[] { "ContaPsicologoId", "ConsultaId" },
                principalTable: "Consultas",
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
                name: "FK_RegistrosSessao_Consultas_ContaPsicologoId_ConsultaId",
                table: "RegistrosSessao",
                columns: new[] { "ContaPsicologoId", "ConsultaId" },
                principalTable: "Consultas",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RegistrosSessao_Prontuarios_ContaPsicologoId_ProntuarioId",
                table: "RegistrosSessao",
                columns: new[] { "ContaPsicologoId", "ProntuarioId" },
                principalTable: "Prontuarios",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);
        }
    }
}
