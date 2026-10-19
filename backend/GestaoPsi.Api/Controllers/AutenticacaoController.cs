using GestaoPsi.Api.DTOs.Autenticacao;
using GestaoPsi.Api.Services.Autenticacao;
using GestaoPsi.Api.Shared.Excecoes;
using GestaoPsi.Api.Shared.Respostas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace GestaoPsi.Api.Controllers;

[ApiController]
[Route("api/v1/autenticacao")]
public sealed class AutenticacaoController(
    IAutenticacaoService autenticacaoService,
    IWebHostEnvironment ambiente,
    IConfirmacaoEmailCadastroService confirmacaoEmail)
    : ControllerAutenticadoBase
{
    [EnableRateLimiting("sem-sessao")]
    [HttpPost("cadastro/codigo")]
    public async Task<IActionResult> SolicitarCodigo([FromBody] SolicitarCodigoCadastroRequest request, CancellationToken cancellationToken)
    {
        var resposta = await confirmacaoEmail.SolicitarAsync(request, HttpContext.Connection.RemoteIpAddress?.ToString(), cancellationToken);
        return Ok(RespostaApi<CodigoCadastroResponse>.ComSucesso(resposta));
    }

    [EnableRateLimiting("sem-sessao")]
    [HttpPost("cadastro/confirmar-email")]
    public async Task<IActionResult> ConfirmarEmail([FromBody] ConfirmarEmailCadastroRequest request, CancellationToken cancellationToken)
    {
        var resposta = await confirmacaoEmail.ConfirmarAsync(request, cancellationToken);
        return Ok(RespostaApi<EmailCadastroConfirmadoResponse>.ComSucesso(resposta));
    }

    // O limite por IP vale só onde há tentativa de adivinhar ou inundar: cadastro, login e recuperação.
    // Renovar e encerrar sessão dependem de um cookie válido e rodam a cada carregamento de página; limitá-los
    // por IP puniria vários usuários atrás do mesmo endereço (um consultório, por exemplo).
    [EnableRateLimiting("sem-sessao")]
    [HttpPost("cadastro")]
    [ProducesResponseType<RespostaApi<AutenticacaoResponse>>(StatusCodes.Status201Created)]
    public async Task<IActionResult> CriarConta(
        [FromBody] CriarContaRequest request,
        CancellationToken cancellationToken)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var resposta = await autenticacaoService.CriarContaAsync(
            request,
            ip,
            cancellationToken);
        DefinirCookieRefreshToken(resposta);

        return StatusCode(
            StatusCodes.Status201Created,
            RespostaApi<AutenticacaoResponse>.ComSucesso(
                resposta.Resposta,
                "Conta criada com sucesso."));
    }

    [EnableRateLimiting("sem-sessao")]
    [HttpPost("login")]
    [ProducesResponseType<RespostaApi<AutenticacaoResponse>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var resposta = await autenticacaoService.LoginAsync(
            request,
            ip,
            cancellationToken);
        DefinirCookieRefreshToken(resposta);

        return Ok(RespostaApi<AutenticacaoResponse>.ComSucesso(resposta.Resposta));
    }

    [EnableRateLimiting("sem-sessao")]
    [HttpPost("recuperacao-senha/solicitar")]
    [ProducesResponseType<RespostaApi<object>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> SolicitarRecuperacaoSenha(
        [FromBody] SolicitarRecuperacaoSenhaRequest request,
        CancellationToken cancellationToken)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        await autenticacaoService.SolicitarRecuperacaoSenhaAsync(
            request,
            ip,
            cancellationToken);

        return Ok(RespostaApi<object>.ComSucesso(
            new { },
            "Se o e-mail estiver cadastrado, as instruções serão enviadas."));
    }

    [EnableRateLimiting("sem-sessao")]
    [HttpPost("recuperacao-senha/redefinir")]
    [ProducesResponseType<RespostaApi<object>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> RedefinirSenha(
        [FromBody] RedefinirSenhaRequest request,
        CancellationToken cancellationToken)
    {
        await autenticacaoService.RedefinirSenhaAsync(request, cancellationToken);
        return Ok(RespostaApi<object>.ComSucesso(
            new { },
            "Senha redefinida com sucesso."));
    }

    [Authorize]
    [HttpPost("senha/alterar")]
    [ProducesResponseType<RespostaApi<AutenticacaoResponse>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> AlterarSenha(
        [FromBody] AlterarSenhaRequest request,
        CancellationToken cancellationToken)
    {
        var resposta = await autenticacaoService.AlterarSenhaAsync(
            ObterUsuarioId(),
            ObterContaPsicologoId(),
            request,
            cancellationToken);
        DefinirCookieRefreshToken(resposta);

        return Ok(RespostaApi<AutenticacaoResponse>.ComSucesso(
            resposta.Resposta,
            "Senha alterada. As outras sessões foram encerradas."));
    }

    [HttpPost("token/renovar")]
    [ProducesResponseType<RespostaApi<AutenticacaoResponse>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> RenovarToken(
        CancellationToken cancellationToken)
    {
        var refreshToken = ObterRefreshToken();
        var resposta = await autenticacaoService.RenovarTokenAsync(
            refreshToken,
            cancellationToken);
        DefinirCookieRefreshToken(resposta);

        return Ok(RespostaApi<AutenticacaoResponse>.ComSucesso(resposta.Resposta));
    }

    [HttpPost("sair")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Sair(
        CancellationToken cancellationToken)
    {
        if (Request.Cookies.TryGetValue(
                CookieRefreshToken,
                out var refreshToken) &&
            !string.IsNullOrWhiteSpace(refreshToken))
        {
            await autenticacaoService.EncerrarSessaoAsync(
                refreshToken,
                cancellationToken);
        }

        Response.Cookies.Delete(
            CookieRefreshToken,
            new CookieOptions { Path = "/" });
        return NoContent();
    }

    private const string CookieRefreshToken = "gestaopsi.refresh_token";

    private string ObterRefreshToken()
    {
        if (!Request.Cookies.TryGetValue(
                CookieRefreshToken,
                out var refreshToken) ||
            string.IsNullOrWhiteSpace(refreshToken))
        {
            throw new RegraNegocioException(
                "Sessão inválida ou expirada.",
                StatusCodes.Status401Unauthorized);
        }

        return refreshToken;
    }

    private void DefinirCookieRefreshToken(ResultadoAutenticacao resultado)
    {
        Response.Cookies.Append(
            CookieRefreshToken,
            resultado.RefreshToken,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = !ambiente.IsDevelopment() || Request.IsHttps,
                SameSite = SameSiteMode.Lax,
                Expires = resultado.RefreshTokenExpiraEm,
                Path = "/",
                IsEssential = true
            });
    }
}
