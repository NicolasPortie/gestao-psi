using Microsoft.AspNetCore.Mvc;

namespace GestaoPsi.Api.Controllers;

[ApiController]
[Route("api/v1/saude")]
public class SaudeController : ControllerBase
{
    [HttpGet]
    public IActionResult ObterStatus()
    {
        return Ok(new
        {
            status = "Disponivel",
            aplicacao = "GestaoPsi.Api"
        });
    }
}
