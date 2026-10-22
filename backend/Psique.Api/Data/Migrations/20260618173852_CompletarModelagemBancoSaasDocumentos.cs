using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Psique.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class CompletarModelagemBancoSaasDocumentos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ConfiguracoesSegurancaConta",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CriptografiaAplicacaoAtiva = table.Column<bool>(type: "bit", nullable: false),
                    ExigeMfaUsuariosAdministrativos = table.Column<bool>(type: "bit", nullable: false),
                    BloqueiaAcessoAposTentativasInvalidas = table.Column<bool>(type: "bit", nullable: false),
                    MaximoTentativasInvalidas = table.Column<int>(type: "int", nullable: false),
                    RetencaoLogsAuditoriaDias = table.Column<int>(type: "int", nullable: false),
                    RetencaoProntuarioAnos = table.Column<int>(type: "int", nullable: false),
                    PermiteExportacaoCompletaDados = table.Column<bool>(type: "bit", nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ContaPsicologoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConfiguracoesSegurancaConta", x => x.Id);
                    table.CheckConstraint("CK_ConfiguracoesSegurancaConta_MaximoTentativasInvalidas", "[MaximoTentativasInvalidas] > 0");
                    table.CheckConstraint("CK_ConfiguracoesSegurancaConta_RetencaoLogsAuditoriaDias", "[RetencaoLogsAuditoriaDias] >= 365");
                    table.CheckConstraint("CK_ConfiguracoesSegurancaConta_RetencaoProntuarioAnos", "[RetencaoProntuarioAnos] >= 5");
                    table.ForeignKey(
                        name: "FK_ConfiguracoesSegurancaConta_ContasPsicologo_ContaPsicologoId",
                        column: x => x.ContaPsicologoId,
                        principalTable: "ContasPsicologo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DocumentosProntuario",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProntuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CriadoPorUsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FinalizadoPorUsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Tipo = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Titulo = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: false),
                    Finalidade = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Solicitante = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: true),
                    ConteudoAtualJson = table.Column<string>(type: "nvarchar(max)", maxLength: 12000, nullable: true),
                    HashConteudoFinal = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    FinalizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ArquivadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ContaPsicologoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentosProntuario", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentosProntuario_ContasPsicologo_ContaPsicologoId",
                        column: x => x.ContaPsicologoId,
                        principalTable: "ContasPsicologo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DocumentosProntuario_Pacientes_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "Pacientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DocumentosProntuario_Prontuarios_ProntuarioId",
                        column: x => x.ProntuarioId,
                        principalTable: "Prontuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DocumentosProntuario_Usuarios_CriadoPorUsuarioId",
                        column: x => x.CriadoPorUsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DocumentosProntuario_Usuarios_FinalizadoPorUsuarioId",
                        column: x => x.FinalizadoPorUsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ModelosDocumentoPsicologico",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    EstruturaJson = table.Column<string>(type: "nvarchar(max)", maxLength: 12000, nullable: false),
                    PadraoSistema = table.Column<bool>(type: "bit", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ContaPsicologoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModelosDocumentoPsicologico", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModelosDocumentoPsicologico_ContasPsicologo_ContaPsicologoId",
                        column: x => x.ContaPsicologoId,
                        principalTable: "ContasPsicologo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PlanosSaas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ValorMensal = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    ValorAnual = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: true),
                    LimitePacientesAtivos = table.Column<int>(type: "int", nullable: true),
                    LimiteMensagensWhatsAppMes = table.Column<int>(type: "int", nullable: true),
                    LimiteDocumentosMes = table.Column<int>(type: "int", nullable: true),
                    PermiteWhatsApp = table.Column<bool>(type: "bit", nullable: false),
                    PermiteDocumentosPsicologicos = table.Column<bool>(type: "bit", nullable: false),
                    PermiteExportacaoDados = table.Column<bool>(type: "bit", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanosSaas", x => x.Id);
                    table.CheckConstraint("CK_PlanosSaas_LimiteDocumentosMes", "[LimiteDocumentosMes] IS NULL OR [LimiteDocumentosMes] > 0");
                    table.CheckConstraint("CK_PlanosSaas_LimiteMensagensWhatsAppMes", "[LimiteMensagensWhatsAppMes] IS NULL OR [LimiteMensagensWhatsAppMes] > 0");
                    table.CheckConstraint("CK_PlanosSaas_LimitePacientesAtivos", "[LimitePacientesAtivos] IS NULL OR [LimitePacientesAtivos] > 0");
                    table.CheckConstraint("CK_PlanosSaas_ValorAnual", "[ValorAnual] IS NULL OR [ValorAnual] >= 0");
                    table.CheckConstraint("CK_PlanosSaas_ValorMensal", "[ValorMensal] >= 0");
                });

            migrationBuilder.CreateTable(
                name: "RegrasDocumentoPsicologico",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    RegraJson = table.Column<string>(type: "nvarchar(max)", maxLength: 12000, nullable: false),
                    Obrigatoria = table.Column<bool>(type: "bit", nullable: false),
                    Ativa = table.Column<bool>(type: "bit", nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RegrasDocumentoPsicologico", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProtocolosEntregaDocumento",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DocumentoProntuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RegistradoPorUsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TipoEntrega = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Destinatario = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: true),
                    Observacao = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    EntregueEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    ContaPsicologoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProtocolosEntregaDocumento", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProtocolosEntregaDocumento_ContasPsicologo_ContaPsicologoId",
                        column: x => x.ContaPsicologoId,
                        principalTable: "ContasPsicologo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProtocolosEntregaDocumento_DocumentosProntuario_DocumentoProntuarioId",
                        column: x => x.DocumentoProntuarioId,
                        principalTable: "DocumentosProntuario",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProtocolosEntregaDocumento_Usuarios_RegistradoPorUsuarioId",
                        column: x => x.RegistradoPorUsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VersoesDocumentoProntuario",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DocumentoProntuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CriadoPorUsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NumeroVersao = table.Column<int>(type: "int", nullable: false),
                    ConteudoJson = table.Column<string>(type: "nvarchar(max)", maxLength: 12000, nullable: false),
                    MotivoAlteracao = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    HashConteudo = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    ContaPsicologoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VersoesDocumentoProntuario", x => x.Id);
                    table.CheckConstraint("CK_VersoesDocumentoProntuario_NumeroVersao", "[NumeroVersao] > 0");
                    table.ForeignKey(
                        name: "FK_VersoesDocumentoProntuario_ContasPsicologo_ContaPsicologoId",
                        column: x => x.ContaPsicologoId,
                        principalTable: "ContasPsicologo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VersoesDocumentoProntuario_DocumentosProntuario_DocumentoProntuarioId",
                        column: x => x.DocumentoProntuarioId,
                        principalTable: "DocumentosProntuario",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VersoesDocumentoProntuario_Usuarios_CriadoPorUsuarioId",
                        column: x => x.CriadoPorUsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AssinaturasConta",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlanoSaasId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Ciclo = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    InicioEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    TesteAte = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    RenovacaoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    CanceladaEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    MotivoCancelamento = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ProvedorPagamento = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    AssinaturaExternaId = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: true),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ContaPsicologoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssinaturasConta", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssinaturasConta_ContasPsicologo_ContaPsicologoId",
                        column: x => x.ContaPsicologoId,
                        principalTable: "ContasPsicologo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AssinaturasConta_PlanosSaas_PlanoSaasId",
                        column: x => x.PlanoSaasId,
                        principalTable: "PlanosSaas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FaturasAssinatura",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AssinaturaContaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Valor = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    VencimentoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    PagoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ProvedorPagamento = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    FaturaExternaId = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: true),
                    UrlPagamento = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CriadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ContaPsicologoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FaturasAssinatura", x => x.Id);
                    table.CheckConstraint("CK_FaturasAssinatura_Valor", "[Valor] >= 0");
                    table.ForeignKey(
                        name: "FK_FaturasAssinatura_AssinaturasConta_AssinaturaContaId",
                        column: x => x.AssinaturaContaId,
                        principalTable: "AssinaturasConta",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FaturasAssinatura_ContasPsicologo_ContaPsicologoId",
                        column: x => x.ContaPsicologoId,
                        principalTable: "ContasPsicologo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AssinaturasConta_ContaPsicologoId",
                table: "AssinaturasConta",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_AssinaturasConta_ContaPsicologoId_PlanoSaasId",
                table: "AssinaturasConta",
                columns: new[] { "ContaPsicologoId", "PlanoSaasId" });

            migrationBuilder.CreateIndex(
                name: "IX_AssinaturasConta_ContaPsicologoId_Status",
                table: "AssinaturasConta",
                columns: new[] { "ContaPsicologoId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_AssinaturasConta_PlanoSaasId",
                table: "AssinaturasConta",
                column: "PlanoSaasId");

            migrationBuilder.CreateIndex(
                name: "IX_AssinaturasConta_ProvedorPagamento_AssinaturaExternaId",
                table: "AssinaturasConta",
                columns: new[] { "ProvedorPagamento", "AssinaturaExternaId" },
                unique: true,
                filter: "[ProvedorPagamento] IS NOT NULL AND [AssinaturaExternaId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ConfiguracoesSegurancaConta_ContaPsicologoId",
                table: "ConfiguracoesSegurancaConta",
                column: "ContaPsicologoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DocumentosProntuario_ContaPsicologoId",
                table: "DocumentosProntuario",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentosProntuario_ContaPsicologoId_PacienteId_CriadoEm",
                table: "DocumentosProntuario",
                columns: new[] { "ContaPsicologoId", "PacienteId", "CriadoEm" });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentosProntuario_ContaPsicologoId_ProntuarioId_Tipo_Status",
                table: "DocumentosProntuario",
                columns: new[] { "ContaPsicologoId", "ProntuarioId", "Tipo", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentosProntuario_ContaPsicologoId_Status_FinalizadoEm",
                table: "DocumentosProntuario",
                columns: new[] { "ContaPsicologoId", "Status", "FinalizadoEm" });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentosProntuario_CriadoPorUsuarioId",
                table: "DocumentosProntuario",
                column: "CriadoPorUsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentosProntuario_FinalizadoPorUsuarioId",
                table: "DocumentosProntuario",
                column: "FinalizadoPorUsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentosProntuario_PacienteId",
                table: "DocumentosProntuario",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentosProntuario_ProntuarioId",
                table: "DocumentosProntuario",
                column: "ProntuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_FaturasAssinatura_AssinaturaContaId",
                table: "FaturasAssinatura",
                column: "AssinaturaContaId");

            migrationBuilder.CreateIndex(
                name: "IX_FaturasAssinatura_ContaPsicologoId",
                table: "FaturasAssinatura",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_FaturasAssinatura_ContaPsicologoId_AssinaturaContaId_VencimentoEm",
                table: "FaturasAssinatura",
                columns: new[] { "ContaPsicologoId", "AssinaturaContaId", "VencimentoEm" });

            migrationBuilder.CreateIndex(
                name: "IX_FaturasAssinatura_ContaPsicologoId_Status_VencimentoEm",
                table: "FaturasAssinatura",
                columns: new[] { "ContaPsicologoId", "Status", "VencimentoEm" });

            migrationBuilder.CreateIndex(
                name: "IX_FaturasAssinatura_ProvedorPagamento_FaturaExternaId",
                table: "FaturasAssinatura",
                columns: new[] { "ProvedorPagamento", "FaturaExternaId" },
                unique: true,
                filter: "[ProvedorPagamento] IS NOT NULL AND [FaturaExternaId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ModelosDocumentoPsicologico_ContaPsicologoId",
                table: "ModelosDocumentoPsicologico",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelosDocumentoPsicologico_ContaPsicologoId_Tipo_Ativo",
                table: "ModelosDocumentoPsicologico",
                columns: new[] { "ContaPsicologoId", "Tipo", "Ativo" });

            migrationBuilder.CreateIndex(
                name: "IX_ModelosDocumentoPsicologico_ContaPsicologoId_Tipo_Nome",
                table: "ModelosDocumentoPsicologico",
                columns: new[] { "ContaPsicologoId", "Tipo", "Nome" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PlanosSaas_Codigo",
                table: "PlanosSaas",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PlanosSaas_Status",
                table: "PlanosSaas",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ProtocolosEntregaDocumento_ContaPsicologoId",
                table: "ProtocolosEntregaDocumento",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_ProtocolosEntregaDocumento_ContaPsicologoId_DocumentoProntuarioId_EntregueEm",
                table: "ProtocolosEntregaDocumento",
                columns: new[] { "ContaPsicologoId", "DocumentoProntuarioId", "EntregueEm" });

            migrationBuilder.CreateIndex(
                name: "IX_ProtocolosEntregaDocumento_ContaPsicologoId_Status_EntregueEm",
                table: "ProtocolosEntregaDocumento",
                columns: new[] { "ContaPsicologoId", "Status", "EntregueEm" });

            migrationBuilder.CreateIndex(
                name: "IX_ProtocolosEntregaDocumento_DocumentoProntuarioId",
                table: "ProtocolosEntregaDocumento",
                column: "DocumentoProntuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_ProtocolosEntregaDocumento_RegistradoPorUsuarioId",
                table: "ProtocolosEntregaDocumento",
                column: "RegistradoPorUsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_RegrasDocumentoPsicologico_Tipo_Ativa",
                table: "RegrasDocumentoPsicologico",
                columns: new[] { "Tipo", "Ativa" });

            migrationBuilder.CreateIndex(
                name: "IX_RegrasDocumentoPsicologico_Tipo_Nome",
                table: "RegrasDocumentoPsicologico",
                columns: new[] { "Tipo", "Nome" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VersoesDocumentoProntuario_ContaPsicologoId",
                table: "VersoesDocumentoProntuario",
                column: "ContaPsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_VersoesDocumentoProntuario_ContaPsicologoId_CriadoEm",
                table: "VersoesDocumentoProntuario",
                columns: new[] { "ContaPsicologoId", "CriadoEm" });

            migrationBuilder.CreateIndex(
                name: "IX_VersoesDocumentoProntuario_ContaPsicologoId_DocumentoProntuarioId_NumeroVersao",
                table: "VersoesDocumentoProntuario",
                columns: new[] { "ContaPsicologoId", "DocumentoProntuarioId", "NumeroVersao" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VersoesDocumentoProntuario_CriadoPorUsuarioId",
                table: "VersoesDocumentoProntuario",
                column: "CriadoPorUsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_VersoesDocumentoProntuario_DocumentoProntuarioId",
                table: "VersoesDocumentoProntuario",
                column: "DocumentoProntuarioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ConfiguracoesSegurancaConta");

            migrationBuilder.DropTable(
                name: "FaturasAssinatura");

            migrationBuilder.DropTable(
                name: "ModelosDocumentoPsicologico");

            migrationBuilder.DropTable(
                name: "ProtocolosEntregaDocumento");

            migrationBuilder.DropTable(
                name: "RegrasDocumentoPsicologico");

            migrationBuilder.DropTable(
                name: "VersoesDocumentoProntuario");

            migrationBuilder.DropTable(
                name: "AssinaturasConta");

            migrationBuilder.DropTable(
                name: "DocumentosProntuario");

            migrationBuilder.DropTable(
                name: "PlanosSaas");
        }
    }
}
