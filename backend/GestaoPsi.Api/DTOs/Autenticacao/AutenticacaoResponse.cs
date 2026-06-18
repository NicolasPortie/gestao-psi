namespace GestaoPsi.Api.DTOs.Autenticacao;

public sealed record AutenticacaoResponse(
    string AccessToken,
    DateTimeOffset ExpiraEm,
    UsuarioAutenticadoResponse Usuario);

public sealed record UsuarioAutenticadoResponse(
    Guid Id,
    string NomeCompleto,
    string Email,
    string Perfil);
