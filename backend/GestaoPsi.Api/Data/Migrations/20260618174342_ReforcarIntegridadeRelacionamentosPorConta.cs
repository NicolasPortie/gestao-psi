using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestaoPsi.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class ReforcarIntegridadeRelacionamentosPorConta : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Consultas_Pacientes_PacienteId",
                table: "Consultas");

            migrationBuilder.DropForeignKey(
                name: "FK_Consultas_TiposAtendimento_TipoAtendimentoId",
                table: "Consultas");

            migrationBuilder.DropForeignKey(
                name: "FK_ContatosPaciente_Pacientes_PacienteId",
                table: "ContatosPaciente");

            migrationBuilder.DropForeignKey(
                name: "FK_ConversasWhatsApp_IntegracoesWhatsApp_IntegracaoWhatsAppId",
                table: "ConversasWhatsApp");

            migrationBuilder.DropForeignKey(
                name: "FK_ConversasWhatsApp_Pacientes_PacienteId",
                table: "ConversasWhatsApp");

            migrationBuilder.DropForeignKey(
                name: "FK_DadosProfissionaisPsicologo_Usuarios_UsuarioId",
                table: "DadosProfissionaisPsicologo");

            migrationBuilder.DropForeignKey(
                name: "FK_DocumentosProntuario_Pacientes_PacienteId",
                table: "DocumentosProntuario");

            migrationBuilder.DropForeignKey(
                name: "FK_DocumentosProntuario_Prontuarios_ProntuarioId",
                table: "DocumentosProntuario");

            migrationBuilder.DropForeignKey(
                name: "FK_DocumentosProntuario_Usuarios_CriadoPorUsuarioId",
                table: "DocumentosProntuario");

            migrationBuilder.DropForeignKey(
                name: "FK_DocumentosProntuario_Usuarios_FinalizadoPorUsuarioId",
                table: "DocumentosProntuario");

            migrationBuilder.DropForeignKey(
                name: "FK_EventosBridgeWhatsApp_IntegracoesWhatsApp_IntegracaoWhatsAppId",
                table: "EventosBridgeWhatsApp");

            migrationBuilder.DropForeignKey(
                name: "FK_EvolucoesProntuario_Pacientes_PacienteId",
                table: "EvolucoesProntuario");

            migrationBuilder.DropForeignKey(
                name: "FK_EvolucoesProntuario_Prontuarios_ProntuarioId",
                table: "EvolucoesProntuario");

            migrationBuilder.DropForeignKey(
                name: "FK_EvolucoesProntuario_RegistrosSessao_RegistroSessaoId",
                table: "EvolucoesProntuario");

            migrationBuilder.DropForeignKey(
                name: "FK_EvolucoesProntuario_Usuarios_CriadoPorUsuarioId",
                table: "EvolucoesProntuario");

            migrationBuilder.DropForeignKey(
                name: "FK_FaturasAssinatura_AssinaturasConta_AssinaturaContaId",
                table: "FaturasAssinatura");

            migrationBuilder.DropForeignKey(
                name: "FK_HistoricosConsulta_Consultas_ConsultaId",
                table: "HistoricosConsulta");

            migrationBuilder.DropForeignKey(
                name: "FK_HistoricosConsulta_Usuarios_UsuarioId",
                table: "HistoricosConsulta");

            migrationBuilder.DropForeignKey(
                name: "FK_Lembretes_Consultas_ConsultaId",
                table: "Lembretes");

            migrationBuilder.DropForeignKey(
                name: "FK_Lembretes_ModelosMensagem_ModeloMensagemId",
                table: "Lembretes");

            migrationBuilder.DropForeignKey(
                name: "FK_Lembretes_Pacientes_PacienteId",
                table: "Lembretes");

            migrationBuilder.DropForeignKey(
                name: "FK_ListaEspera_Pacientes_PacienteId",
                table: "ListaEspera");

            migrationBuilder.DropForeignKey(
                name: "FK_ListaEspera_TiposAtendimento_TipoAtendimentoId",
                table: "ListaEspera");

            migrationBuilder.DropForeignKey(
                name: "FK_LogsAuditoria_Usuarios_UsuarioId",
                table: "LogsAuditoria");

            migrationBuilder.DropForeignKey(
                name: "FK_MensagensWhatsApp_ConversasWhatsApp_ConversaWhatsAppId",
                table: "MensagensWhatsApp");

            migrationBuilder.DropForeignKey(
                name: "FK_Notificacoes_Usuarios_UsuarioId",
                table: "Notificacoes");

            migrationBuilder.DropForeignKey(
                name: "FK_Pacientes_Usuarios_UsuarioId",
                table: "Pacientes");

            migrationBuilder.DropForeignKey(
                name: "FK_Pagamentos_Consultas_ConsultaId",
                table: "Pagamentos");

            migrationBuilder.DropForeignKey(
                name: "FK_Pagamentos_Pacientes_PacienteId",
                table: "Pagamentos");

            migrationBuilder.DropForeignKey(
                name: "FK_Prontuarios_Pacientes_PacienteId",
                table: "Prontuarios");

            migrationBuilder.DropForeignKey(
                name: "FK_ProtocolosEntregaDocumento_DocumentosProntuario_DocumentoProntuarioId",
                table: "ProtocolosEntregaDocumento");

            migrationBuilder.DropForeignKey(
                name: "FK_ProtocolosEntregaDocumento_Usuarios_RegistradoPorUsuarioId",
                table: "ProtocolosEntregaDocumento");

            migrationBuilder.DropForeignKey(
                name: "FK_RegistrosSessao_Consultas_ConsultaId",
                table: "RegistrosSessao");

            migrationBuilder.DropForeignKey(
                name: "FK_RegistrosSessao_Pacientes_PacienteId",
                table: "RegistrosSessao");

            migrationBuilder.DropForeignKey(
                name: "FK_RegistrosSessao_Prontuarios_ProntuarioId",
                table: "RegistrosSessao");

            migrationBuilder.DropForeignKey(
                name: "FK_RegistrosSessao_TiposAtendimento_TipoAtendimentoId",
                table: "RegistrosSessao");

            migrationBuilder.DropForeignKey(
                name: "FK_RegistrosSessao_Usuarios_CriadoPorUsuarioId",
                table: "RegistrosSessao");

            migrationBuilder.DropForeignKey(
                name: "FK_RetificacoesRegistroSessao_RegistrosSessao_RegistroSessaoId",
                table: "RetificacoesRegistroSessao");

            migrationBuilder.DropForeignKey(
                name: "FK_RetificacoesRegistroSessao_Usuarios_UsuarioId",
                table: "RetificacoesRegistroSessao");

            migrationBuilder.DropForeignKey(
                name: "FK_SessoesBot_ConversasWhatsApp_ConversaWhatsAppId",
                table: "SessoesBot");

            migrationBuilder.DropForeignKey(
                name: "FK_SessoesBot_Pacientes_PacienteId",
                table: "SessoesBot");

            migrationBuilder.DropForeignKey(
                name: "FK_VersoesDocumentoProntuario_DocumentosProntuario_DocumentoProntuarioId",
                table: "VersoesDocumentoProntuario");

            migrationBuilder.DropForeignKey(
                name: "FK_VersoesDocumentoProntuario_Usuarios_CriadoPorUsuarioId",
                table: "VersoesDocumentoProntuario");

            migrationBuilder.DropIndex(
                name: "IX_VersoesDocumentoProntuario_CriadoPorUsuarioId",
                table: "VersoesDocumentoProntuario");

            migrationBuilder.DropIndex(
                name: "IX_VersoesDocumentoProntuario_DocumentoProntuarioId",
                table: "VersoesDocumentoProntuario");

            migrationBuilder.DropIndex(
                name: "IX_SessoesBot_ConversaWhatsAppId",
                table: "SessoesBot");

            migrationBuilder.DropIndex(
                name: "IX_SessoesBot_PacienteId",
                table: "SessoesBot");

            migrationBuilder.DropIndex(
                name: "IX_RetificacoesRegistroSessao_RegistroSessaoId",
                table: "RetificacoesRegistroSessao");

            migrationBuilder.DropIndex(
                name: "IX_RetificacoesRegistroSessao_UsuarioId",
                table: "RetificacoesRegistroSessao");

            migrationBuilder.DropIndex(
                name: "IX_RegistrosSessao_ConsultaId",
                table: "RegistrosSessao");

            migrationBuilder.DropIndex(
                name: "IX_RegistrosSessao_CriadoPorUsuarioId",
                table: "RegistrosSessao");

            migrationBuilder.DropIndex(
                name: "IX_RegistrosSessao_PacienteId",
                table: "RegistrosSessao");

            migrationBuilder.DropIndex(
                name: "IX_RegistrosSessao_ProntuarioId",
                table: "RegistrosSessao");

            migrationBuilder.DropIndex(
                name: "IX_RegistrosSessao_TipoAtendimentoId",
                table: "RegistrosSessao");

            migrationBuilder.DropIndex(
                name: "IX_ProtocolosEntregaDocumento_DocumentoProntuarioId",
                table: "ProtocolosEntregaDocumento");

            migrationBuilder.DropIndex(
                name: "IX_ProtocolosEntregaDocumento_RegistradoPorUsuarioId",
                table: "ProtocolosEntregaDocumento");

            migrationBuilder.DropIndex(
                name: "IX_Prontuarios_PacienteId",
                table: "Prontuarios");

            migrationBuilder.DropIndex(
                name: "IX_Pagamentos_ConsultaId",
                table: "Pagamentos");

            migrationBuilder.DropIndex(
                name: "IX_Pagamentos_PacienteId",
                table: "Pagamentos");

            migrationBuilder.DropIndex(
                name: "IX_Pacientes_UsuarioId",
                table: "Pacientes");

            migrationBuilder.DropIndex(
                name: "IX_Notificacoes_UsuarioId",
                table: "Notificacoes");

            migrationBuilder.DropIndex(
                name: "IX_MensagensWhatsApp_ConversaWhatsAppId",
                table: "MensagensWhatsApp");

            migrationBuilder.DropIndex(
                name: "IX_LogsAuditoria_UsuarioId",
                table: "LogsAuditoria");

            migrationBuilder.DropIndex(
                name: "IX_ListaEspera_PacienteId",
                table: "ListaEspera");

            migrationBuilder.DropIndex(
                name: "IX_ListaEspera_TipoAtendimentoId",
                table: "ListaEspera");

            migrationBuilder.DropIndex(
                name: "IX_Lembretes_ConsultaId",
                table: "Lembretes");

            migrationBuilder.DropIndex(
                name: "IX_Lembretes_ModeloMensagemId",
                table: "Lembretes");

            migrationBuilder.DropIndex(
                name: "IX_Lembretes_PacienteId",
                table: "Lembretes");

            migrationBuilder.DropIndex(
                name: "IX_HistoricosConsulta_ConsultaId",
                table: "HistoricosConsulta");

            migrationBuilder.DropIndex(
                name: "IX_HistoricosConsulta_UsuarioId",
                table: "HistoricosConsulta");

            migrationBuilder.DropIndex(
                name: "IX_FaturasAssinatura_AssinaturaContaId",
                table: "FaturasAssinatura");

            migrationBuilder.DropIndex(
                name: "IX_EvolucoesProntuario_CriadoPorUsuarioId",
                table: "EvolucoesProntuario");

            migrationBuilder.DropIndex(
                name: "IX_EvolucoesProntuario_PacienteId",
                table: "EvolucoesProntuario");

            migrationBuilder.DropIndex(
                name: "IX_EvolucoesProntuario_ProntuarioId",
                table: "EvolucoesProntuario");

            migrationBuilder.DropIndex(
                name: "IX_EvolucoesProntuario_RegistroSessaoId",
                table: "EvolucoesProntuario");

            migrationBuilder.DropIndex(
                name: "IX_EventosBridgeWhatsApp_IntegracaoWhatsAppId",
                table: "EventosBridgeWhatsApp");

            migrationBuilder.DropIndex(
                name: "IX_DocumentosProntuario_CriadoPorUsuarioId",
                table: "DocumentosProntuario");

            migrationBuilder.DropIndex(
                name: "IX_DocumentosProntuario_FinalizadoPorUsuarioId",
                table: "DocumentosProntuario");

            migrationBuilder.DropIndex(
                name: "IX_DocumentosProntuario_PacienteId",
                table: "DocumentosProntuario");

            migrationBuilder.DropIndex(
                name: "IX_DocumentosProntuario_ProntuarioId",
                table: "DocumentosProntuario");

            migrationBuilder.DropIndex(
                name: "IX_DadosProfissionaisPsicologo_UsuarioId",
                table: "DadosProfissionaisPsicologo");

            migrationBuilder.DropIndex(
                name: "IX_ConversasWhatsApp_IntegracaoWhatsAppId",
                table: "ConversasWhatsApp");

            migrationBuilder.DropIndex(
                name: "IX_ConversasWhatsApp_PacienteId",
                table: "ConversasWhatsApp");

            migrationBuilder.DropIndex(
                name: "IX_ContatosPaciente_PacienteId",
                table: "ContatosPaciente");

            migrationBuilder.DropIndex(
                name: "IX_Consultas_PacienteId",
                table: "Consultas");

            migrationBuilder.DropIndex(
                name: "IX_Consultas_TipoAtendimentoId",
                table: "Consultas");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_VersoesDocumentoProntuario_ContaPsicologoId_Id",
                table: "VersoesDocumentoProntuario",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Usuarios_ContaPsicologoId_Id",
                table: "Usuarios",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_TiposAtendimento_ContaPsicologoId_Id",
                table: "TiposAtendimento",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_SessoesBot_ContaPsicologoId_Id",
                table: "SessoesBot",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_RetificacoesRegistroSessao_ContaPsicologoId_Id",
                table: "RetificacoesRegistroSessao",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_RegistrosSessao_ContaPsicologoId_Id",
                table: "RegistrosSessao",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_ProtocolosEntregaDocumento_ContaPsicologoId_Id",
                table: "ProtocolosEntregaDocumento",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Prontuarios_ContaPsicologoId_Id",
                table: "Prontuarios",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Pagamentos_ContaPsicologoId_Id",
                table: "Pagamentos",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Pacientes_ContaPsicologoId_Id",
                table: "Pacientes",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Notificacoes_ContaPsicologoId_Id",
                table: "Notificacoes",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_ModelosMensagem_ContaPsicologoId_Id",
                table: "ModelosMensagem",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_ModelosDocumentoPsicologico_ContaPsicologoId_Id",
                table: "ModelosDocumentoPsicologico",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_MensagensWhatsApp_ContaPsicologoId_Id",
                table: "MensagensWhatsApp",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_LogsAuditoria_ContaPsicologoId_Id",
                table: "LogsAuditoria",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_ListaEspera_ContaPsicologoId_Id",
                table: "ListaEspera",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Lembretes_ContaPsicologoId_Id",
                table: "Lembretes",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_IntegracoesWhatsApp_ContaPsicologoId_Id",
                table: "IntegracoesWhatsApp",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_HorariosDisponiveis_ContaPsicologoId_Id",
                table: "HorariosDisponiveis",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_HistoricosConsulta_ContaPsicologoId_Id",
                table: "HistoricosConsulta",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_FaturasAssinatura_ContaPsicologoId_Id",
                table: "FaturasAssinatura",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_EvolucoesProntuario_ContaPsicologoId_Id",
                table: "EvolucoesProntuario",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_EventosBridgeWhatsApp_ContaPsicologoId_Id",
                table: "EventosBridgeWhatsApp",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_DocumentosProntuario_ContaPsicologoId_Id",
                table: "DocumentosProntuario",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_DadosProfissionaisPsicologo_ContaPsicologoId_Id",
                table: "DadosProfissionaisPsicologo",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_ConversasWhatsApp_ContaPsicologoId_Id",
                table: "ConversasWhatsApp",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_ContatosPaciente_ContaPsicologoId_Id",
                table: "ContatosPaciente",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Consultas_ContaPsicologoId_Id",
                table: "Consultas",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_ConfiguracoesSegurancaConta_ContaPsicologoId_Id",
                table: "ConfiguracoesSegurancaConta",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_ConfiguracoesAtendimento_ContaPsicologoId_Id",
                table: "ConfiguracoesAtendimento",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_BloqueiosAgenda_ContaPsicologoId_Id",
                table: "BloqueiosAgenda",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_AssinaturasConta_ContaPsicologoId_Id",
                table: "AssinaturasConta",
                columns: new[] { "ContaPsicologoId", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_VersoesDocumentoProntuario_ContaPsicologoId_CriadoPorUsuarioId",
                table: "VersoesDocumentoProntuario",
                columns: new[] { "ContaPsicologoId", "CriadoPorUsuarioId" });

            migrationBuilder.CreateIndex(
                name: "IX_SessoesBot_ContaPsicologoId_PacienteId",
                table: "SessoesBot",
                columns: new[] { "ContaPsicologoId", "PacienteId" });

            migrationBuilder.CreateIndex(
                name: "IX_RetificacoesRegistroSessao_ContaPsicologoId_RegistroSessaoId",
                table: "RetificacoesRegistroSessao",
                columns: new[] { "ContaPsicologoId", "RegistroSessaoId" });

            migrationBuilder.CreateIndex(
                name: "IX_RetificacoesRegistroSessao_ContaPsicologoId_UsuarioId",
                table: "RetificacoesRegistroSessao",
                columns: new[] { "ContaPsicologoId", "UsuarioId" });

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosSessao_ContaPsicologoId_CriadoPorUsuarioId",
                table: "RegistrosSessao",
                columns: new[] { "ContaPsicologoId", "CriadoPorUsuarioId" });

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosSessao_ContaPsicologoId_TipoAtendimentoId",
                table: "RegistrosSessao",
                columns: new[] { "ContaPsicologoId", "TipoAtendimentoId" });

            migrationBuilder.CreateIndex(
                name: "IX_ProtocolosEntregaDocumento_ContaPsicologoId_RegistradoPorUsuarioId",
                table: "ProtocolosEntregaDocumento",
                columns: new[] { "ContaPsicologoId", "RegistradoPorUsuarioId" });

            migrationBuilder.CreateIndex(
                name: "IX_LogsAuditoria_ContaPsicologoId_UsuarioId",
                table: "LogsAuditoria",
                columns: new[] { "ContaPsicologoId", "UsuarioId" });

            migrationBuilder.CreateIndex(
                name: "IX_ListaEspera_ContaPsicologoId_PacienteId",
                table: "ListaEspera",
                columns: new[] { "ContaPsicologoId", "PacienteId" });

            migrationBuilder.CreateIndex(
                name: "IX_ListaEspera_ContaPsicologoId_TipoAtendimentoId",
                table: "ListaEspera",
                columns: new[] { "ContaPsicologoId", "TipoAtendimentoId" });

            migrationBuilder.CreateIndex(
                name: "IX_Lembretes_ContaPsicologoId_ConsultaId",
                table: "Lembretes",
                columns: new[] { "ContaPsicologoId", "ConsultaId" });

            migrationBuilder.CreateIndex(
                name: "IX_Lembretes_ContaPsicologoId_ModeloMensagemId",
                table: "Lembretes",
                columns: new[] { "ContaPsicologoId", "ModeloMensagemId" });

            migrationBuilder.CreateIndex(
                name: "IX_Lembretes_ContaPsicologoId_PacienteId",
                table: "Lembretes",
                columns: new[] { "ContaPsicologoId", "PacienteId" });

            migrationBuilder.CreateIndex(
                name: "IX_HistoricosConsulta_ContaPsicologoId_ConsultaId",
                table: "HistoricosConsulta",
                columns: new[] { "ContaPsicologoId", "ConsultaId" });

            migrationBuilder.CreateIndex(
                name: "IX_HistoricosConsulta_ContaPsicologoId_UsuarioId",
                table: "HistoricosConsulta",
                columns: new[] { "ContaPsicologoId", "UsuarioId" });

            migrationBuilder.CreateIndex(
                name: "IX_EvolucoesProntuario_ContaPsicologoId_CriadoPorUsuarioId",
                table: "EvolucoesProntuario",
                columns: new[] { "ContaPsicologoId", "CriadoPorUsuarioId" });

            migrationBuilder.CreateIndex(
                name: "IX_EvolucoesProntuario_ContaPsicologoId_RegistroSessaoId",
                table: "EvolucoesProntuario",
                columns: new[] { "ContaPsicologoId", "RegistroSessaoId" });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentosProntuario_ContaPsicologoId_CriadoPorUsuarioId",
                table: "DocumentosProntuario",
                columns: new[] { "ContaPsicologoId", "CriadoPorUsuarioId" });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentosProntuario_ContaPsicologoId_FinalizadoPorUsuarioId",
                table: "DocumentosProntuario",
                columns: new[] { "ContaPsicologoId", "FinalizadoPorUsuarioId" });

            migrationBuilder.CreateIndex(
                name: "IX_ConversasWhatsApp_ContaPsicologoId_PacienteId",
                table: "ConversasWhatsApp",
                columns: new[] { "ContaPsicologoId", "PacienteId" });

            migrationBuilder.CreateIndex(
                name: "IX_Consultas_ContaPsicologoId_TipoAtendimentoId",
                table: "Consultas",
                columns: new[] { "ContaPsicologoId", "TipoAtendimentoId" });

            migrationBuilder.AddForeignKey(
                name: "FK_Consultas_Pacientes_ContaPsicologoId_PacienteId",
                table: "Consultas",
                columns: new[] { "ContaPsicologoId", "PacienteId" },
                principalTable: "Pacientes",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Consultas_TiposAtendimento_ContaPsicologoId_TipoAtendimentoId",
                table: "Consultas",
                columns: new[] { "ContaPsicologoId", "TipoAtendimentoId" },
                principalTable: "TiposAtendimento",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ContatosPaciente_Pacientes_ContaPsicologoId_PacienteId",
                table: "ContatosPaciente",
                columns: new[] { "ContaPsicologoId", "PacienteId" },
                principalTable: "Pacientes",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ConversasWhatsApp_IntegracoesWhatsApp_ContaPsicologoId_IntegracaoWhatsAppId",
                table: "ConversasWhatsApp",
                columns: new[] { "ContaPsicologoId", "IntegracaoWhatsAppId" },
                principalTable: "IntegracoesWhatsApp",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ConversasWhatsApp_Pacientes_ContaPsicologoId_PacienteId",
                table: "ConversasWhatsApp",
                columns: new[] { "ContaPsicologoId", "PacienteId" },
                principalTable: "Pacientes",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_DadosProfissionaisPsicologo_Usuarios_ContaPsicologoId_UsuarioId",
                table: "DadosProfissionaisPsicologo",
                columns: new[] { "ContaPsicologoId", "UsuarioId" },
                principalTable: "Usuarios",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DocumentosProntuario_Pacientes_ContaPsicologoId_PacienteId",
                table: "DocumentosProntuario",
                columns: new[] { "ContaPsicologoId", "PacienteId" },
                principalTable: "Pacientes",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DocumentosProntuario_Prontuarios_ContaPsicologoId_ProntuarioId",
                table: "DocumentosProntuario",
                columns: new[] { "ContaPsicologoId", "ProntuarioId" },
                principalTable: "Prontuarios",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DocumentosProntuario_Usuarios_ContaPsicologoId_CriadoPorUsuarioId",
                table: "DocumentosProntuario",
                columns: new[] { "ContaPsicologoId", "CriadoPorUsuarioId" },
                principalTable: "Usuarios",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DocumentosProntuario_Usuarios_ContaPsicologoId_FinalizadoPorUsuarioId",
                table: "DocumentosProntuario",
                columns: new[] { "ContaPsicologoId", "FinalizadoPorUsuarioId" },
                principalTable: "Usuarios",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EventosBridgeWhatsApp_IntegracoesWhatsApp_ContaPsicologoId_IntegracaoWhatsAppId",
                table: "EventosBridgeWhatsApp",
                columns: new[] { "ContaPsicologoId", "IntegracaoWhatsAppId" },
                principalTable: "IntegracoesWhatsApp",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EvolucoesProntuario_Pacientes_ContaPsicologoId_PacienteId",
                table: "EvolucoesProntuario",
                columns: new[] { "ContaPsicologoId", "PacienteId" },
                principalTable: "Pacientes",
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
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_EvolucoesProntuario_Usuarios_ContaPsicologoId_CriadoPorUsuarioId",
                table: "EvolucoesProntuario",
                columns: new[] { "ContaPsicologoId", "CriadoPorUsuarioId" },
                principalTable: "Usuarios",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_FaturasAssinatura_AssinaturasConta_ContaPsicologoId_AssinaturaContaId",
                table: "FaturasAssinatura",
                columns: new[] { "ContaPsicologoId", "AssinaturaContaId" },
                principalTable: "AssinaturasConta",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_HistoricosConsulta_Consultas_ContaPsicologoId_ConsultaId",
                table: "HistoricosConsulta",
                columns: new[] { "ContaPsicologoId", "ConsultaId" },
                principalTable: "Consultas",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_HistoricosConsulta_Usuarios_ContaPsicologoId_UsuarioId",
                table: "HistoricosConsulta",
                columns: new[] { "ContaPsicologoId", "UsuarioId" },
                principalTable: "Usuarios",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Lembretes_Consultas_ContaPsicologoId_ConsultaId",
                table: "Lembretes",
                columns: new[] { "ContaPsicologoId", "ConsultaId" },
                principalTable: "Consultas",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Lembretes_ModelosMensagem_ContaPsicologoId_ModeloMensagemId",
                table: "Lembretes",
                columns: new[] { "ContaPsicologoId", "ModeloMensagemId" },
                principalTable: "ModelosMensagem",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Lembretes_Pacientes_ContaPsicologoId_PacienteId",
                table: "Lembretes",
                columns: new[] { "ContaPsicologoId", "PacienteId" },
                principalTable: "Pacientes",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ListaEspera_Pacientes_ContaPsicologoId_PacienteId",
                table: "ListaEspera",
                columns: new[] { "ContaPsicologoId", "PacienteId" },
                principalTable: "Pacientes",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ListaEspera_TiposAtendimento_ContaPsicologoId_TipoAtendimentoId",
                table: "ListaEspera",
                columns: new[] { "ContaPsicologoId", "TipoAtendimentoId" },
                principalTable: "TiposAtendimento",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_LogsAuditoria_Usuarios_ContaPsicologoId_UsuarioId",
                table: "LogsAuditoria",
                columns: new[] { "ContaPsicologoId", "UsuarioId" },
                principalTable: "Usuarios",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_MensagensWhatsApp_ConversasWhatsApp_ContaPsicologoId_ConversaWhatsAppId",
                table: "MensagensWhatsApp",
                columns: new[] { "ContaPsicologoId", "ConversaWhatsAppId" },
                principalTable: "ConversasWhatsApp",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notificacoes_Usuarios_ContaPsicologoId_UsuarioId",
                table: "Notificacoes",
                columns: new[] { "ContaPsicologoId", "UsuarioId" },
                principalTable: "Usuarios",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Pacientes_Usuarios_ContaPsicologoId_UsuarioId",
                table: "Pacientes",
                columns: new[] { "ContaPsicologoId", "UsuarioId" },
                principalTable: "Usuarios",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Pagamentos_Consultas_ContaPsicologoId_ConsultaId",
                table: "Pagamentos",
                columns: new[] { "ContaPsicologoId", "ConsultaId" },
                principalTable: "Consultas",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Pagamentos_Pacientes_ContaPsicologoId_PacienteId",
                table: "Pagamentos",
                columns: new[] { "ContaPsicologoId", "PacienteId" },
                principalTable: "Pacientes",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Prontuarios_Pacientes_ContaPsicologoId_PacienteId",
                table: "Prontuarios",
                columns: new[] { "ContaPsicologoId", "PacienteId" },
                principalTable: "Pacientes",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProtocolosEntregaDocumento_DocumentosProntuario_ContaPsicologoId_DocumentoProntuarioId",
                table: "ProtocolosEntregaDocumento",
                columns: new[] { "ContaPsicologoId", "DocumentoProntuarioId" },
                principalTable: "DocumentosProntuario",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProtocolosEntregaDocumento_Usuarios_ContaPsicologoId_RegistradoPorUsuarioId",
                table: "ProtocolosEntregaDocumento",
                columns: new[] { "ContaPsicologoId", "RegistradoPorUsuarioId" },
                principalTable: "Usuarios",
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
                name: "FK_RegistrosSessao_Pacientes_ContaPsicologoId_PacienteId",
                table: "RegistrosSessao",
                columns: new[] { "ContaPsicologoId", "PacienteId" },
                principalTable: "Pacientes",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RegistrosSessao_Prontuarios_ContaPsicologoId_ProntuarioId",
                table: "RegistrosSessao",
                columns: new[] { "ContaPsicologoId", "ProntuarioId" },
                principalTable: "Prontuarios",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RegistrosSessao_TiposAtendimento_ContaPsicologoId_TipoAtendimentoId",
                table: "RegistrosSessao",
                columns: new[] { "ContaPsicologoId", "TipoAtendimentoId" },
                principalTable: "TiposAtendimento",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RegistrosSessao_Usuarios_ContaPsicologoId_CriadoPorUsuarioId",
                table: "RegistrosSessao",
                columns: new[] { "ContaPsicologoId", "CriadoPorUsuarioId" },
                principalTable: "Usuarios",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RetificacoesRegistroSessao_RegistrosSessao_ContaPsicologoId_RegistroSessaoId",
                table: "RetificacoesRegistroSessao",
                columns: new[] { "ContaPsicologoId", "RegistroSessaoId" },
                principalTable: "RegistrosSessao",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RetificacoesRegistroSessao_Usuarios_ContaPsicologoId_UsuarioId",
                table: "RetificacoesRegistroSessao",
                columns: new[] { "ContaPsicologoId", "UsuarioId" },
                principalTable: "Usuarios",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SessoesBot_ConversasWhatsApp_ContaPsicologoId_ConversaWhatsAppId",
                table: "SessoesBot",
                columns: new[] { "ContaPsicologoId", "ConversaWhatsAppId" },
                principalTable: "ConversasWhatsApp",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SessoesBot_Pacientes_ContaPsicologoId_PacienteId",
                table: "SessoesBot",
                columns: new[] { "ContaPsicologoId", "PacienteId" },
                principalTable: "Pacientes",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_VersoesDocumentoProntuario_DocumentosProntuario_ContaPsicologoId_DocumentoProntuarioId",
                table: "VersoesDocumentoProntuario",
                columns: new[] { "ContaPsicologoId", "DocumentoProntuarioId" },
                principalTable: "DocumentosProntuario",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_VersoesDocumentoProntuario_Usuarios_ContaPsicologoId_CriadoPorUsuarioId",
                table: "VersoesDocumentoProntuario",
                columns: new[] { "ContaPsicologoId", "CriadoPorUsuarioId" },
                principalTable: "Usuarios",
                principalColumns: new[] { "ContaPsicologoId", "Id" },
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Consultas_Pacientes_ContaPsicologoId_PacienteId",
                table: "Consultas");

            migrationBuilder.DropForeignKey(
                name: "FK_Consultas_TiposAtendimento_ContaPsicologoId_TipoAtendimentoId",
                table: "Consultas");

            migrationBuilder.DropForeignKey(
                name: "FK_ContatosPaciente_Pacientes_ContaPsicologoId_PacienteId",
                table: "ContatosPaciente");

            migrationBuilder.DropForeignKey(
                name: "FK_ConversasWhatsApp_IntegracoesWhatsApp_ContaPsicologoId_IntegracaoWhatsAppId",
                table: "ConversasWhatsApp");

            migrationBuilder.DropForeignKey(
                name: "FK_ConversasWhatsApp_Pacientes_ContaPsicologoId_PacienteId",
                table: "ConversasWhatsApp");

            migrationBuilder.DropForeignKey(
                name: "FK_DadosProfissionaisPsicologo_Usuarios_ContaPsicologoId_UsuarioId",
                table: "DadosProfissionaisPsicologo");

            migrationBuilder.DropForeignKey(
                name: "FK_DocumentosProntuario_Pacientes_ContaPsicologoId_PacienteId",
                table: "DocumentosProntuario");

            migrationBuilder.DropForeignKey(
                name: "FK_DocumentosProntuario_Prontuarios_ContaPsicologoId_ProntuarioId",
                table: "DocumentosProntuario");

            migrationBuilder.DropForeignKey(
                name: "FK_DocumentosProntuario_Usuarios_ContaPsicologoId_CriadoPorUsuarioId",
                table: "DocumentosProntuario");

            migrationBuilder.DropForeignKey(
                name: "FK_DocumentosProntuario_Usuarios_ContaPsicologoId_FinalizadoPorUsuarioId",
                table: "DocumentosProntuario");

            migrationBuilder.DropForeignKey(
                name: "FK_EventosBridgeWhatsApp_IntegracoesWhatsApp_ContaPsicologoId_IntegracaoWhatsAppId",
                table: "EventosBridgeWhatsApp");

            migrationBuilder.DropForeignKey(
                name: "FK_EvolucoesProntuario_Pacientes_ContaPsicologoId_PacienteId",
                table: "EvolucoesProntuario");

            migrationBuilder.DropForeignKey(
                name: "FK_EvolucoesProntuario_Prontuarios_ContaPsicologoId_ProntuarioId",
                table: "EvolucoesProntuario");

            migrationBuilder.DropForeignKey(
                name: "FK_EvolucoesProntuario_RegistrosSessao_ContaPsicologoId_RegistroSessaoId",
                table: "EvolucoesProntuario");

            migrationBuilder.DropForeignKey(
                name: "FK_EvolucoesProntuario_Usuarios_ContaPsicologoId_CriadoPorUsuarioId",
                table: "EvolucoesProntuario");

            migrationBuilder.DropForeignKey(
                name: "FK_FaturasAssinatura_AssinaturasConta_ContaPsicologoId_AssinaturaContaId",
                table: "FaturasAssinatura");

            migrationBuilder.DropForeignKey(
                name: "FK_HistoricosConsulta_Consultas_ContaPsicologoId_ConsultaId",
                table: "HistoricosConsulta");

            migrationBuilder.DropForeignKey(
                name: "FK_HistoricosConsulta_Usuarios_ContaPsicologoId_UsuarioId",
                table: "HistoricosConsulta");

            migrationBuilder.DropForeignKey(
                name: "FK_Lembretes_Consultas_ContaPsicologoId_ConsultaId",
                table: "Lembretes");

            migrationBuilder.DropForeignKey(
                name: "FK_Lembretes_ModelosMensagem_ContaPsicologoId_ModeloMensagemId",
                table: "Lembretes");

            migrationBuilder.DropForeignKey(
                name: "FK_Lembretes_Pacientes_ContaPsicologoId_PacienteId",
                table: "Lembretes");

            migrationBuilder.DropForeignKey(
                name: "FK_ListaEspera_Pacientes_ContaPsicologoId_PacienteId",
                table: "ListaEspera");

            migrationBuilder.DropForeignKey(
                name: "FK_ListaEspera_TiposAtendimento_ContaPsicologoId_TipoAtendimentoId",
                table: "ListaEspera");

            migrationBuilder.DropForeignKey(
                name: "FK_LogsAuditoria_Usuarios_ContaPsicologoId_UsuarioId",
                table: "LogsAuditoria");

            migrationBuilder.DropForeignKey(
                name: "FK_MensagensWhatsApp_ConversasWhatsApp_ContaPsicologoId_ConversaWhatsAppId",
                table: "MensagensWhatsApp");

            migrationBuilder.DropForeignKey(
                name: "FK_Notificacoes_Usuarios_ContaPsicologoId_UsuarioId",
                table: "Notificacoes");

            migrationBuilder.DropForeignKey(
                name: "FK_Pacientes_Usuarios_ContaPsicologoId_UsuarioId",
                table: "Pacientes");

            migrationBuilder.DropForeignKey(
                name: "FK_Pagamentos_Consultas_ContaPsicologoId_ConsultaId",
                table: "Pagamentos");

            migrationBuilder.DropForeignKey(
                name: "FK_Pagamentos_Pacientes_ContaPsicologoId_PacienteId",
                table: "Pagamentos");

            migrationBuilder.DropForeignKey(
                name: "FK_Prontuarios_Pacientes_ContaPsicologoId_PacienteId",
                table: "Prontuarios");

            migrationBuilder.DropForeignKey(
                name: "FK_ProtocolosEntregaDocumento_DocumentosProntuario_ContaPsicologoId_DocumentoProntuarioId",
                table: "ProtocolosEntregaDocumento");

            migrationBuilder.DropForeignKey(
                name: "FK_ProtocolosEntregaDocumento_Usuarios_ContaPsicologoId_RegistradoPorUsuarioId",
                table: "ProtocolosEntregaDocumento");

            migrationBuilder.DropForeignKey(
                name: "FK_RegistrosSessao_Consultas_ContaPsicologoId_ConsultaId",
                table: "RegistrosSessao");

            migrationBuilder.DropForeignKey(
                name: "FK_RegistrosSessao_Pacientes_ContaPsicologoId_PacienteId",
                table: "RegistrosSessao");

            migrationBuilder.DropForeignKey(
                name: "FK_RegistrosSessao_Prontuarios_ContaPsicologoId_ProntuarioId",
                table: "RegistrosSessao");

            migrationBuilder.DropForeignKey(
                name: "FK_RegistrosSessao_TiposAtendimento_ContaPsicologoId_TipoAtendimentoId",
                table: "RegistrosSessao");

            migrationBuilder.DropForeignKey(
                name: "FK_RegistrosSessao_Usuarios_ContaPsicologoId_CriadoPorUsuarioId",
                table: "RegistrosSessao");

            migrationBuilder.DropForeignKey(
                name: "FK_RetificacoesRegistroSessao_RegistrosSessao_ContaPsicologoId_RegistroSessaoId",
                table: "RetificacoesRegistroSessao");

            migrationBuilder.DropForeignKey(
                name: "FK_RetificacoesRegistroSessao_Usuarios_ContaPsicologoId_UsuarioId",
                table: "RetificacoesRegistroSessao");

            migrationBuilder.DropForeignKey(
                name: "FK_SessoesBot_ConversasWhatsApp_ContaPsicologoId_ConversaWhatsAppId",
                table: "SessoesBot");

            migrationBuilder.DropForeignKey(
                name: "FK_SessoesBot_Pacientes_ContaPsicologoId_PacienteId",
                table: "SessoesBot");

            migrationBuilder.DropForeignKey(
                name: "FK_VersoesDocumentoProntuario_DocumentosProntuario_ContaPsicologoId_DocumentoProntuarioId",
                table: "VersoesDocumentoProntuario");

            migrationBuilder.DropForeignKey(
                name: "FK_VersoesDocumentoProntuario_Usuarios_ContaPsicologoId_CriadoPorUsuarioId",
                table: "VersoesDocumentoProntuario");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_VersoesDocumentoProntuario_ContaPsicologoId_Id",
                table: "VersoesDocumentoProntuario");

            migrationBuilder.DropIndex(
                name: "IX_VersoesDocumentoProntuario_ContaPsicologoId_CriadoPorUsuarioId",
                table: "VersoesDocumentoProntuario");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Usuarios_ContaPsicologoId_Id",
                table: "Usuarios");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_TiposAtendimento_ContaPsicologoId_Id",
                table: "TiposAtendimento");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_SessoesBot_ContaPsicologoId_Id",
                table: "SessoesBot");

            migrationBuilder.DropIndex(
                name: "IX_SessoesBot_ContaPsicologoId_PacienteId",
                table: "SessoesBot");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_RetificacoesRegistroSessao_ContaPsicologoId_Id",
                table: "RetificacoesRegistroSessao");

            migrationBuilder.DropIndex(
                name: "IX_RetificacoesRegistroSessao_ContaPsicologoId_RegistroSessaoId",
                table: "RetificacoesRegistroSessao");

            migrationBuilder.DropIndex(
                name: "IX_RetificacoesRegistroSessao_ContaPsicologoId_UsuarioId",
                table: "RetificacoesRegistroSessao");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_RegistrosSessao_ContaPsicologoId_Id",
                table: "RegistrosSessao");

            migrationBuilder.DropIndex(
                name: "IX_RegistrosSessao_ContaPsicologoId_CriadoPorUsuarioId",
                table: "RegistrosSessao");

            migrationBuilder.DropIndex(
                name: "IX_RegistrosSessao_ContaPsicologoId_TipoAtendimentoId",
                table: "RegistrosSessao");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_ProtocolosEntregaDocumento_ContaPsicologoId_Id",
                table: "ProtocolosEntregaDocumento");

            migrationBuilder.DropIndex(
                name: "IX_ProtocolosEntregaDocumento_ContaPsicologoId_RegistradoPorUsuarioId",
                table: "ProtocolosEntregaDocumento");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Prontuarios_ContaPsicologoId_Id",
                table: "Prontuarios");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Pagamentos_ContaPsicologoId_Id",
                table: "Pagamentos");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Pacientes_ContaPsicologoId_Id",
                table: "Pacientes");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Notificacoes_ContaPsicologoId_Id",
                table: "Notificacoes");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_ModelosMensagem_ContaPsicologoId_Id",
                table: "ModelosMensagem");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_ModelosDocumentoPsicologico_ContaPsicologoId_Id",
                table: "ModelosDocumentoPsicologico");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_MensagensWhatsApp_ContaPsicologoId_Id",
                table: "MensagensWhatsApp");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_LogsAuditoria_ContaPsicologoId_Id",
                table: "LogsAuditoria");

            migrationBuilder.DropIndex(
                name: "IX_LogsAuditoria_ContaPsicologoId_UsuarioId",
                table: "LogsAuditoria");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_ListaEspera_ContaPsicologoId_Id",
                table: "ListaEspera");

            migrationBuilder.DropIndex(
                name: "IX_ListaEspera_ContaPsicologoId_PacienteId",
                table: "ListaEspera");

            migrationBuilder.DropIndex(
                name: "IX_ListaEspera_ContaPsicologoId_TipoAtendimentoId",
                table: "ListaEspera");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Lembretes_ContaPsicologoId_Id",
                table: "Lembretes");

            migrationBuilder.DropIndex(
                name: "IX_Lembretes_ContaPsicologoId_ConsultaId",
                table: "Lembretes");

            migrationBuilder.DropIndex(
                name: "IX_Lembretes_ContaPsicologoId_ModeloMensagemId",
                table: "Lembretes");

            migrationBuilder.DropIndex(
                name: "IX_Lembretes_ContaPsicologoId_PacienteId",
                table: "Lembretes");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_IntegracoesWhatsApp_ContaPsicologoId_Id",
                table: "IntegracoesWhatsApp");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_HorariosDisponiveis_ContaPsicologoId_Id",
                table: "HorariosDisponiveis");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_HistoricosConsulta_ContaPsicologoId_Id",
                table: "HistoricosConsulta");

            migrationBuilder.DropIndex(
                name: "IX_HistoricosConsulta_ContaPsicologoId_ConsultaId",
                table: "HistoricosConsulta");

            migrationBuilder.DropIndex(
                name: "IX_HistoricosConsulta_ContaPsicologoId_UsuarioId",
                table: "HistoricosConsulta");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_FaturasAssinatura_ContaPsicologoId_Id",
                table: "FaturasAssinatura");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_EvolucoesProntuario_ContaPsicologoId_Id",
                table: "EvolucoesProntuario");

            migrationBuilder.DropIndex(
                name: "IX_EvolucoesProntuario_ContaPsicologoId_CriadoPorUsuarioId",
                table: "EvolucoesProntuario");

            migrationBuilder.DropIndex(
                name: "IX_EvolucoesProntuario_ContaPsicologoId_RegistroSessaoId",
                table: "EvolucoesProntuario");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_EventosBridgeWhatsApp_ContaPsicologoId_Id",
                table: "EventosBridgeWhatsApp");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_DocumentosProntuario_ContaPsicologoId_Id",
                table: "DocumentosProntuario");

            migrationBuilder.DropIndex(
                name: "IX_DocumentosProntuario_ContaPsicologoId_CriadoPorUsuarioId",
                table: "DocumentosProntuario");

            migrationBuilder.DropIndex(
                name: "IX_DocumentosProntuario_ContaPsicologoId_FinalizadoPorUsuarioId",
                table: "DocumentosProntuario");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_DadosProfissionaisPsicologo_ContaPsicologoId_Id",
                table: "DadosProfissionaisPsicologo");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_ConversasWhatsApp_ContaPsicologoId_Id",
                table: "ConversasWhatsApp");

            migrationBuilder.DropIndex(
                name: "IX_ConversasWhatsApp_ContaPsicologoId_PacienteId",
                table: "ConversasWhatsApp");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_ContatosPaciente_ContaPsicologoId_Id",
                table: "ContatosPaciente");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Consultas_ContaPsicologoId_Id",
                table: "Consultas");

            migrationBuilder.DropIndex(
                name: "IX_Consultas_ContaPsicologoId_TipoAtendimentoId",
                table: "Consultas");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_ConfiguracoesSegurancaConta_ContaPsicologoId_Id",
                table: "ConfiguracoesSegurancaConta");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_ConfiguracoesAtendimento_ContaPsicologoId_Id",
                table: "ConfiguracoesAtendimento");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_BloqueiosAgenda_ContaPsicologoId_Id",
                table: "BloqueiosAgenda");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_AssinaturasConta_ContaPsicologoId_Id",
                table: "AssinaturasConta");

            migrationBuilder.CreateIndex(
                name: "IX_VersoesDocumentoProntuario_CriadoPorUsuarioId",
                table: "VersoesDocumentoProntuario",
                column: "CriadoPorUsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_VersoesDocumentoProntuario_DocumentoProntuarioId",
                table: "VersoesDocumentoProntuario",
                column: "DocumentoProntuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_SessoesBot_ConversaWhatsAppId",
                table: "SessoesBot",
                column: "ConversaWhatsAppId");

            migrationBuilder.CreateIndex(
                name: "IX_SessoesBot_PacienteId",
                table: "SessoesBot",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_RetificacoesRegistroSessao_RegistroSessaoId",
                table: "RetificacoesRegistroSessao",
                column: "RegistroSessaoId");

            migrationBuilder.CreateIndex(
                name: "IX_RetificacoesRegistroSessao_UsuarioId",
                table: "RetificacoesRegistroSessao",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosSessao_ConsultaId",
                table: "RegistrosSessao",
                column: "ConsultaId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosSessao_CriadoPorUsuarioId",
                table: "RegistrosSessao",
                column: "CriadoPorUsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosSessao_PacienteId",
                table: "RegistrosSessao",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosSessao_ProntuarioId",
                table: "RegistrosSessao",
                column: "ProntuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosSessao_TipoAtendimentoId",
                table: "RegistrosSessao",
                column: "TipoAtendimentoId");

            migrationBuilder.CreateIndex(
                name: "IX_ProtocolosEntregaDocumento_DocumentoProntuarioId",
                table: "ProtocolosEntregaDocumento",
                column: "DocumentoProntuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_ProtocolosEntregaDocumento_RegistradoPorUsuarioId",
                table: "ProtocolosEntregaDocumento",
                column: "RegistradoPorUsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Prontuarios_PacienteId",
                table: "Prontuarios",
                column: "PacienteId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Pagamentos_ConsultaId",
                table: "Pagamentos",
                column: "ConsultaId");

            migrationBuilder.CreateIndex(
                name: "IX_Pagamentos_PacienteId",
                table: "Pagamentos",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_Pacientes_UsuarioId",
                table: "Pacientes",
                column: "UsuarioId",
                unique: true,
                filter: "[UsuarioId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Notificacoes_UsuarioId",
                table: "Notificacoes",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_MensagensWhatsApp_ConversaWhatsAppId",
                table: "MensagensWhatsApp",
                column: "ConversaWhatsAppId");

            migrationBuilder.CreateIndex(
                name: "IX_LogsAuditoria_UsuarioId",
                table: "LogsAuditoria",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_ListaEspera_PacienteId",
                table: "ListaEspera",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_ListaEspera_TipoAtendimentoId",
                table: "ListaEspera",
                column: "TipoAtendimentoId");

            migrationBuilder.CreateIndex(
                name: "IX_Lembretes_ConsultaId",
                table: "Lembretes",
                column: "ConsultaId");

            migrationBuilder.CreateIndex(
                name: "IX_Lembretes_ModeloMensagemId",
                table: "Lembretes",
                column: "ModeloMensagemId");

            migrationBuilder.CreateIndex(
                name: "IX_Lembretes_PacienteId",
                table: "Lembretes",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_HistoricosConsulta_ConsultaId",
                table: "HistoricosConsulta",
                column: "ConsultaId");

            migrationBuilder.CreateIndex(
                name: "IX_HistoricosConsulta_UsuarioId",
                table: "HistoricosConsulta",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_FaturasAssinatura_AssinaturaContaId",
                table: "FaturasAssinatura",
                column: "AssinaturaContaId");

            migrationBuilder.CreateIndex(
                name: "IX_EvolucoesProntuario_CriadoPorUsuarioId",
                table: "EvolucoesProntuario",
                column: "CriadoPorUsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_EvolucoesProntuario_PacienteId",
                table: "EvolucoesProntuario",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_EvolucoesProntuario_ProntuarioId",
                table: "EvolucoesProntuario",
                column: "ProntuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_EvolucoesProntuario_RegistroSessaoId",
                table: "EvolucoesProntuario",
                column: "RegistroSessaoId");

            migrationBuilder.CreateIndex(
                name: "IX_EventosBridgeWhatsApp_IntegracaoWhatsAppId",
                table: "EventosBridgeWhatsApp",
                column: "IntegracaoWhatsAppId");

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
                name: "IX_DadosProfissionaisPsicologo_UsuarioId",
                table: "DadosProfissionaisPsicologo",
                column: "UsuarioId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ConversasWhatsApp_IntegracaoWhatsAppId",
                table: "ConversasWhatsApp",
                column: "IntegracaoWhatsAppId");

            migrationBuilder.CreateIndex(
                name: "IX_ConversasWhatsApp_PacienteId",
                table: "ConversasWhatsApp",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_ContatosPaciente_PacienteId",
                table: "ContatosPaciente",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_Consultas_PacienteId",
                table: "Consultas",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_Consultas_TipoAtendimentoId",
                table: "Consultas",
                column: "TipoAtendimentoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Consultas_Pacientes_PacienteId",
                table: "Consultas",
                column: "PacienteId",
                principalTable: "Pacientes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Consultas_TiposAtendimento_TipoAtendimentoId",
                table: "Consultas",
                column: "TipoAtendimentoId",
                principalTable: "TiposAtendimento",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ContatosPaciente_Pacientes_PacienteId",
                table: "ContatosPaciente",
                column: "PacienteId",
                principalTable: "Pacientes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ConversasWhatsApp_IntegracoesWhatsApp_IntegracaoWhatsAppId",
                table: "ConversasWhatsApp",
                column: "IntegracaoWhatsAppId",
                principalTable: "IntegracoesWhatsApp",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ConversasWhatsApp_Pacientes_PacienteId",
                table: "ConversasWhatsApp",
                column: "PacienteId",
                principalTable: "Pacientes",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_DadosProfissionaisPsicologo_Usuarios_UsuarioId",
                table: "DadosProfissionaisPsicologo",
                column: "UsuarioId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DocumentosProntuario_Pacientes_PacienteId",
                table: "DocumentosProntuario",
                column: "PacienteId",
                principalTable: "Pacientes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DocumentosProntuario_Prontuarios_ProntuarioId",
                table: "DocumentosProntuario",
                column: "ProntuarioId",
                principalTable: "Prontuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DocumentosProntuario_Usuarios_CriadoPorUsuarioId",
                table: "DocumentosProntuario",
                column: "CriadoPorUsuarioId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DocumentosProntuario_Usuarios_FinalizadoPorUsuarioId",
                table: "DocumentosProntuario",
                column: "FinalizadoPorUsuarioId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EventosBridgeWhatsApp_IntegracoesWhatsApp_IntegracaoWhatsAppId",
                table: "EventosBridgeWhatsApp",
                column: "IntegracaoWhatsAppId",
                principalTable: "IntegracoesWhatsApp",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EvolucoesProntuario_Pacientes_PacienteId",
                table: "EvolucoesProntuario",
                column: "PacienteId",
                principalTable: "Pacientes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EvolucoesProntuario_Prontuarios_ProntuarioId",
                table: "EvolucoesProntuario",
                column: "ProntuarioId",
                principalTable: "Prontuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EvolucoesProntuario_RegistrosSessao_RegistroSessaoId",
                table: "EvolucoesProntuario",
                column: "RegistroSessaoId",
                principalTable: "RegistrosSessao",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_EvolucoesProntuario_Usuarios_CriadoPorUsuarioId",
                table: "EvolucoesProntuario",
                column: "CriadoPorUsuarioId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_FaturasAssinatura_AssinaturasConta_AssinaturaContaId",
                table: "FaturasAssinatura",
                column: "AssinaturaContaId",
                principalTable: "AssinaturasConta",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_HistoricosConsulta_Consultas_ConsultaId",
                table: "HistoricosConsulta",
                column: "ConsultaId",
                principalTable: "Consultas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_HistoricosConsulta_Usuarios_UsuarioId",
                table: "HistoricosConsulta",
                column: "UsuarioId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Lembretes_Consultas_ConsultaId",
                table: "Lembretes",
                column: "ConsultaId",
                principalTable: "Consultas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Lembretes_ModelosMensagem_ModeloMensagemId",
                table: "Lembretes",
                column: "ModeloMensagemId",
                principalTable: "ModelosMensagem",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Lembretes_Pacientes_PacienteId",
                table: "Lembretes",
                column: "PacienteId",
                principalTable: "Pacientes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ListaEspera_Pacientes_PacienteId",
                table: "ListaEspera",
                column: "PacienteId",
                principalTable: "Pacientes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ListaEspera_TiposAtendimento_TipoAtendimentoId",
                table: "ListaEspera",
                column: "TipoAtendimentoId",
                principalTable: "TiposAtendimento",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_LogsAuditoria_Usuarios_UsuarioId",
                table: "LogsAuditoria",
                column: "UsuarioId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_MensagensWhatsApp_ConversasWhatsApp_ConversaWhatsAppId",
                table: "MensagensWhatsApp",
                column: "ConversaWhatsAppId",
                principalTable: "ConversasWhatsApp",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notificacoes_Usuarios_UsuarioId",
                table: "Notificacoes",
                column: "UsuarioId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Pacientes_Usuarios_UsuarioId",
                table: "Pacientes",
                column: "UsuarioId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Pagamentos_Consultas_ConsultaId",
                table: "Pagamentos",
                column: "ConsultaId",
                principalTable: "Consultas",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Pagamentos_Pacientes_PacienteId",
                table: "Pagamentos",
                column: "PacienteId",
                principalTable: "Pacientes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Prontuarios_Pacientes_PacienteId",
                table: "Prontuarios",
                column: "PacienteId",
                principalTable: "Pacientes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProtocolosEntregaDocumento_DocumentosProntuario_DocumentoProntuarioId",
                table: "ProtocolosEntregaDocumento",
                column: "DocumentoProntuarioId",
                principalTable: "DocumentosProntuario",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProtocolosEntregaDocumento_Usuarios_RegistradoPorUsuarioId",
                table: "ProtocolosEntregaDocumento",
                column: "RegistradoPorUsuarioId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RegistrosSessao_Consultas_ConsultaId",
                table: "RegistrosSessao",
                column: "ConsultaId",
                principalTable: "Consultas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RegistrosSessao_Pacientes_PacienteId",
                table: "RegistrosSessao",
                column: "PacienteId",
                principalTable: "Pacientes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RegistrosSessao_Prontuarios_ProntuarioId",
                table: "RegistrosSessao",
                column: "ProntuarioId",
                principalTable: "Prontuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RegistrosSessao_TiposAtendimento_TipoAtendimentoId",
                table: "RegistrosSessao",
                column: "TipoAtendimentoId",
                principalTable: "TiposAtendimento",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RegistrosSessao_Usuarios_CriadoPorUsuarioId",
                table: "RegistrosSessao",
                column: "CriadoPorUsuarioId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RetificacoesRegistroSessao_RegistrosSessao_RegistroSessaoId",
                table: "RetificacoesRegistroSessao",
                column: "RegistroSessaoId",
                principalTable: "RegistrosSessao",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RetificacoesRegistroSessao_Usuarios_UsuarioId",
                table: "RetificacoesRegistroSessao",
                column: "UsuarioId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SessoesBot_ConversasWhatsApp_ConversaWhatsAppId",
                table: "SessoesBot",
                column: "ConversaWhatsAppId",
                principalTable: "ConversasWhatsApp",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SessoesBot_Pacientes_PacienteId",
                table: "SessoesBot",
                column: "PacienteId",
                principalTable: "Pacientes",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_VersoesDocumentoProntuario_DocumentosProntuario_DocumentoProntuarioId",
                table: "VersoesDocumentoProntuario",
                column: "DocumentoProntuarioId",
                principalTable: "DocumentosProntuario",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_VersoesDocumentoProntuario_Usuarios_CriadoPorUsuarioId",
                table: "VersoesDocumentoProntuario",
                column: "CriadoPorUsuarioId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
