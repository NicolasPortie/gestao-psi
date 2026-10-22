namespace Psique.Api.Shared.Respostas;

public sealed record RespostaApi<T>(
    bool Sucesso,
    T? Dados,
    string? Mensagem,
    IReadOnlyCollection<string>? Erros)
{
    public static RespostaApi<T> ComSucesso(T dados, string? mensagem = null) =>
        new(true, dados, mensagem, null);

    public static RespostaApi<T> ComErro(
        string mensagem,
        IReadOnlyCollection<string>? erros = null) =>
        new(false, default, mensagem, erros);
}
