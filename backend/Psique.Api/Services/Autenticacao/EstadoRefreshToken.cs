namespace Psique.Api.Services.Autenticacao;

public sealed record EstadoRefreshToken(Guid UsuarioId, Guid ContaPsicologoId, int VersaoAutenticacao = 0);
