using Psique.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace Psique.Api.Controllers;

[ApiController]
[Route("api/v1/saude")]
public class SaudeController(
    AppDbContext db,
    IConfiguration configuracao,
    IServiceProvider servicos,
    IWebHostEnvironment ambiente) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> ObterStatus(CancellationToken ct)
    {
        var bancoOk = await db.Database.CanConnectAsync(ct);

        var conexaoRedis = configuracao.GetConnectionString("Redis");
        string modoRedis;
        bool redisOk;
        if (string.IsNullOrWhiteSpace(conexaoRedis))
        {
            modoRedis = ambiente.IsDevelopment() ? "memoria-desenvolvimento" : "nao-configurado";
            redisOk = ambiente.IsDevelopment();
        }
        else
        {
            modoRedis = "redis";
            try
            {
                var multiplexer = servicos.GetService(typeof(IConnectionMultiplexer)) as IConnectionMultiplexer;
                if (multiplexer is null)
                {
                    redisOk = false;
                }
                else
                {
                    await multiplexer.GetDatabase().PingAsync();
                    redisOk = multiplexer.IsConnected;
                }
            }
            catch
            {
                redisOk = false;
            }
        }

        var status = bancoOk && redisOk ? "Disponivel" : "Indisponivel";
        // Endpoint anônimo: fora de Development devolve só o veredito, sem detalhar a infraestrutura.
        object resposta = ambiente.IsDevelopment()
            ? new
            {
                status,
                aplicacao = "Psique.Api",
                bancoDados = bancoOk ? "ok" : "falha",
                redis = redisOk ? "ok" : "falha",
                modoRedis
            }
            : new { status };

        return bancoOk && redisOk ? Ok(resposta) : StatusCode(StatusCodes.Status503ServiceUnavailable, resposta);
    }
}
