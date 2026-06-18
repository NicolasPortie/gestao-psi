using GestaoPsi.Api.Shared.Excecoes;
using GestaoPsi.Api.Shared.Respostas;

namespace GestaoPsi.Api.Middlewares;

public sealed class TratamentoExcecoesMiddleware(
    RequestDelegate proximo,
    ILogger<TratamentoExcecoesMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext contexto)
    {
        try
        {
            await proximo(contexto);
        }
        catch (RegraNegocioException excecao)
        {
            contexto.Response.StatusCode = excecao.StatusCode;
            await contexto.Response.WriteAsJsonAsync(
                RespostaApi<object>.ComErro(excecao.Message));
        }
        catch (Exception excecao)
        {
            logger.LogError(excecao, "Erro não tratado ao processar a requisição.");
            contexto.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await contexto.Response.WriteAsJsonAsync(
                RespostaApi<object>.ComErro("Não foi possível concluir a operação."));
        }
    }
}
