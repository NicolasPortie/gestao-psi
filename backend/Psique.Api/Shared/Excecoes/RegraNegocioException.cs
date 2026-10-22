namespace Psique.Api.Shared.Excecoes;

public sealed class RegraNegocioException(
    string mensagem,
    int statusCode = StatusCodes.Status400BadRequest)
    : Exception(mensagem)
{
    public int StatusCode { get; } = statusCode;
}
