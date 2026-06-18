namespace GestaoPsi.Api.Services.Seguranca;

public interface IProtecaoDadosService
{
    string Proteger(string valor);
    string HashDeterministico(string valor);
    string HashToken(string token);
    string GerarTokenSeguro();
}
