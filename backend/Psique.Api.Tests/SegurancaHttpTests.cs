using Psique.Api.Middlewares;
using Microsoft.AspNetCore.Http;

namespace Psique.Api.Tests;

public sealed class SegurancaHttpTests
{
    [Fact]
    public async Task CabecalhosSeguranca_DeveImpedirCacheEmbutirEInterpretarComoOutroTipo()
    {
        var contexto = new DefaultHttpContext();
        var proximoFoiChamado = false;
        var middleware = new CabecalhosSegurancaMiddleware(_ =>
        {
            proximoFoiChamado = true;
            return Task.CompletedTask;
        });

        await middleware.InvokeAsync(contexto);

        var cabecalhos = contexto.Response.Headers;
        Assert.True(proximoFoiChamado);
        Assert.Equal("nosniff", cabecalhos["X-Content-Type-Options"]);
        Assert.Equal("DENY", cabecalhos["X-Frame-Options"]);
        Assert.Equal("no-referrer", cabecalhos["Referrer-Policy"]);
        Assert.Equal("no-store", cabecalhos["Cache-Control"]);
        Assert.Contains("frame-ancestors 'none'", cabecalhos["Content-Security-Policy"].ToString());
    }
}
