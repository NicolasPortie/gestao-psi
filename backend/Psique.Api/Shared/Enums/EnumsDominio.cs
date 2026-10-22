namespace Psique.Api.Shared.Enums;

public enum StatusContaPsicologo
{
    Ativa = 1,
    Inativa = 2,
    Bloqueada = 3,
    Cancelada = 4
}

public enum StatusPlanoSaas
{
    Ativo = 1,
    Inativo = 2,
    Arquivado = 3
}

public enum CicloAssinatura
{
    Mensal = 1,
    Anual = 2
}

public enum StatusAssinaturaConta
{
    Teste = 1,
    Ativa = 2,
    PastDue = 3,
    Cancelada = 4,
    Suspensa = 5
}

public enum StatusFaturaAssinatura
{
    Aberta = 1,
    Paga = 2,
    Vencida = 3,
    Cancelada = 4,
    Reembolsada = 5
}

public enum PerfilUsuario
{
    Psicologo = 1,
    Recepcionista = 2,
    Paciente = 3,
    Administrador = 4,
    /// <summary>Equipe com perfil de acesso criado pela conta; as permissões vêm do <c>PerfilAcesso</c>.</summary>
    Personalizado = 5
}

public enum StatusUsuario
{
    Ativo = 1,
    Inativo = 2,
    Bloqueado = 3,
    Pendente = 4
}

public enum StatusPaciente
{
    Ativo = 1,
    Inativo = 2,
    Arquivado = 3
}

public enum TipoContato
{
    Telefone = 1,
    WhatsApp = 2,
    Email = 3,
    Responsavel = 4,
    Emergencia = 5
}

public enum DiaSemana
{
    Domingo = 0,
    Segunda = 1,
    Terca = 2,
    Quarta = 3,
    Quinta = 4,
    Sexta = 5,
    Sabado = 6
}

public enum ModalidadeAtendimento
{
    Online = 1,
    Presencial = 2,
    Hibrido = 3
}

public enum StatusConsulta
{
    AguardandoConfirmacao = 1,
    Agendada = 2,
    Confirmada = 3,
    Realizada = 4,
    Cancelada = 5,
    Remarcada = 6,
    NaoCompareceu = 7
}

public enum OrigemConsulta
{
    Painel = 1,
    WhatsApp = 2,
    Chatbot = 3,
    Recepcionista = 4,
    Paciente = 5,
    Outro = 6
}

public enum StatusRegistroSessao
{
    Rascunho = 1,
    Finalizado = 2,
    Retificado = 3,
    Arquivado = 4
}

public enum StatusProntuario
{
    Ativo = 1,
    Arquivado = 2,
    Bloqueado = 3
}

public enum TipoEvolucaoProntuario
{
    ObservacaoClinica = 1,
    MarcoEvolutivo = 2,
    HipoteseClinica = 3,
    PlanoTerapeutico = 4,
    Encaminhamento = 5,
    RevisaoCaso = 6
}

public enum TipoDocumentoPsicologico
{
    Declaracao = 1,
    AtestadoPsicologico = 2,
    RelatorioPsicologico = 3,
    RelatorioMultiprofissional = 4,
    LaudoPsicologico = 5,
    ParecerPsicologico = 6,
    Encaminhamento = 7,
    ResumoAcompanhamento = 8,
    Devolutiva = 9,
    InformePsicologico = 10,
    Outro = 99
}

public enum StatusDocumentoProntuario
{
    Rascunho = 1,
    EmRevisao = 2,
    Finalizado = 3,
    Entregue = 4,
    Retificado = 5,
    Arquivado = 6,
    Cancelado = 7
}

public enum TipoEntregaDocumento
{
    Presencial = 1,
    Email = 2,
    WhatsApp = 3,
    PortalPaciente = 4,
    Outro = 99
}

public enum StatusEntregaDocumento
{
    Registrada = 1,
    Confirmada = 2,
    Cancelada = 3
}

public enum StatusPagamento
{
    Pendente = 1,
    Pago = 2,
    Cancelado = 3,
    Reembolsado = 4,
    AguardandoConfirmacao = 5
}

public enum FormaPagamento
{
    Manual = 1,
    Pix = 2,
    Cartao = 3,
    Dinheiro = 4,
    Transferencia = 5,
    Outro = 6
}

public enum CanalComunicacao
{
    WhatsApp = 1,
    Email = 2,
    Sms = 3,
    Sistema = 4,
    Telefone = 5
}

public enum TipoLembrete
{
    ConfirmacaoConsulta = 1,
    LembreteConsulta = 2,
    CancelamentoConsulta = 3,
    RemarcacaoConsulta = 4,
    PagamentoPendente = 5
}

public enum StatusLembrete
{
    Agendado = 1,
    Enviado = 2,
    Falhou = 3,
    Cancelado = 4,
    Ignorado = 5
}

public enum StatusListaEspera
{
    Aguardando = 1,
    Contatado = 2,
    Agendado = 3,
    Cancelado = 4,
    Expirado = 5
}

public enum StatusIntegracao
{
    Ativa = 1,
    Inativa = 2,
    Erro = 3,
    Pendente = 4
}

public enum StatusConversaWhatsApp
{
    Aberta = 1,
    Finalizada = 2,
    Expirada = 3,
    AtendimentoHumano = 4,
    Bloqueada = 5
}

public enum StatusSessaoBot
{
    Aberta = 1,
    Finalizada = 2,
    Expirada = 3,
    AtendimentoHumano = 4,
    Bloqueada = 5
}

public enum DirecaoMensagem
{
    Entrada = 1,
    Saida = 2
}

public enum TipoMensagemWhatsApp
{
    Texto = 1,
    Botao = 2,
    Lista = 3,
    Imagem = 4,
    Audio = 5,
    Documento = 6,
    Outro = 7
}

public enum StatusMensagemWhatsApp
{
    Recebida = 1,
    Enviada = 2,
    Entregue = 3,
    Lida = 4,
    Falhou = 5,
    Pendente = 6
}

/// <summary>Como o paciente paga: por sessão realizada ou uma mensalidade fixa.</summary>
public enum ModoCobranca
{
    PorSessao = 1,
    Mensal = 2
}
