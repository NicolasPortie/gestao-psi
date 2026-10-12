namespace GestaoPsi.Api.Services.Comunicacao;

public interface IModeloMensagemTemplateService
{
    IReadOnlyCollection<(string Chave, string Descricao)> ListarVariaveisPermitidas();
    void ValidarConteudo(string? conteudo, string? assunto = null);
    string Renderizar(string template, IReadOnlyDictionary<string, string?> valores);
    string RenderizarAssunto(string? assunto, IReadOnlyDictionary<string, string?> valores);
}
