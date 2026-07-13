using System.Text;
using System.Text.Json.Serialization;
using GestaoPsi.Api.Configuracoes;
using GestaoPsi.Api.Data;
using GestaoPsi.Api.Middlewares;
using GestaoPsi.Api.Models;
using GestaoPsi.Api.Services.Autenticacao;
using GestaoPsi.Api.Services.Agenda;
using GestaoPsi.Api.Services.Comunicacao;
using GestaoPsi.Api.Services.Consultas;
using GestaoPsi.Api.Services.Painel;
using GestaoPsi.Api.Services.Pagamentos;
using GestaoPsi.Api.Services.Pacientes;
using GestaoPsi.Api.Services.Seguranca;
using GestaoPsi.Api.Services.Sessoes;
using GestaoPsi.Api.Shared.Enums;
using GestaoPsi.Api.Shared.Respostas;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddOptions<JwtConfiguracao>()
    .Bind(builder.Configuration.GetSection(JwtConfiguracao.Secao))
    .Validate(
        configuracao => !string.IsNullOrWhiteSpace(configuracao.Emissor),
        "Emissor JWT obrigatorio.")
    .Validate(
        configuracao => !string.IsNullOrWhiteSpace(configuracao.Audiencia),
        "Audiencia JWT obrigatoria.")
    .Validate(
        configuracao => configuracao.Chave.Length >= 32,
        "A chave JWT deve ter ao menos 32 caracteres.")
    .ValidateOnStart();

builder.Services
    .AddOptions<SegurancaConfiguracao>()
    .Bind(builder.Configuration.GetSection(SegurancaConfiguracao.Secao))
    .Validate(
        configuracao =>
            Convert.TryFromBase64String(
                configuracao.ChaveHashDados,
                new Span<byte>(new byte[64]),
                out var bytes) &&
            bytes >= 32,
        "A chave de hash de dados deve ser Base64 com ao menos 32 bytes.")
    .Validate(
        configuracao =>
            configuracao.MaximoTentativasLogin > 0 &&
            configuracao.DuracaoBloqueioLoginMinutos > 0 &&
            configuracao.MaximoSolicitacoesRecuperacao > 0 &&
            configuracao.MaximoCadastrosPorHora > 0 &&
            configuracao.DuracaoTokenRecuperacaoMinutos > 0,
        "Os limites e tempos de seguranca devem ser maiores que zero.")
    .Validate(
        configuracao => !string.IsNullOrWhiteSpace(configuracao.VersaoTermosUso),
        "A versao dos termos de uso e obrigatoria.")
    .ValidateOnStart();

builder.Services.Configure<RedisConfiguracao>(
    builder.Configuration.GetSection(RedisConfiguracao.Secao));
builder.Services.Configure<EmailConfiguracao>(
    builder.Configuration.GetSection(EmailConfiguracao.Secao));

var dataProtection = builder.Services
    .AddDataProtection()
    .SetApplicationName("GestaoPsi");
var conexaoRedis = builder.Configuration.GetConnectionString("Redis");

if (!string.IsNullOrWhiteSpace(conexaoRedis))
{
    var redis = await ConnectionMultiplexer.ConnectAsync(conexaoRedis);

    builder.Services.AddSingleton<IConnectionMultiplexer>(redis);
    builder.Services.AddStackExchangeRedisCache(opcoes =>
    {
        opcoes.ConnectionMultiplexerFactory = () =>
            Task.FromResult<IConnectionMultiplexer>(redis);
    });
    builder.Services.AddScoped<IEstadoAutenticacao, EstadoAutenticacaoRedis>();
    dataProtection.PersistKeysToStackExchangeRedis(
        redis,
        "GestaoPsi:protecao-dados:chaves");
}
else if (builder.Environment.IsDevelopment())
{
    var diretorioChaves = Path.Combine(
        builder.Environment.ContentRootPath,
        ".gestaopsi-dev",
        "data-protection-keys");

    Directory.CreateDirectory(diretorioChaves);
    builder.Services.AddDistributedMemoryCache();
    builder.Services.AddSingleton<IEstadoAutenticacao, EstadoAutenticacaoMemoria>();
    dataProtection.PersistKeysToFileSystem(new DirectoryInfo(diretorioChaves));
}
else
{
    throw new InvalidOperationException("ConnectionStrings:Redis nao configurada.");
}

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.Configure<ApiBehaviorOptions>(opcoes =>
{
    opcoes.InvalidModelStateResponseFactory = contexto =>
    {
        var erros = contexto.ModelState.Values
            .SelectMany(valor => valor.Errors)
            .Select(erro => erro.ErrorMessage)
            .Where(mensagem => !string.IsNullOrWhiteSpace(mensagem))
            .ToArray();

        return new BadRequestObjectResult(
            RespostaApi<object>.ComErro("Dados invalidos.", erros));
    };
});

builder.Services.AddDbContext<AppDbContext>(opcoes =>
    opcoes.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddOpenApi();

var jwt = builder.Configuration
    .GetSection(JwtConfiguracao.Secao)
    .Get<JwtConfiguracao>()
    ?? throw new InvalidOperationException("Configuracao JWT nao encontrada.");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opcoes =>
    {
        opcoes.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwt.Emissor,
            ValidateAudience = true,
            ValidAudience = jwt.Audiencia,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwt.Chave)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });
builder.Services.AddAuthorization(opcoes =>
{
    opcoes.AddPolicy("GestaoAdministrativa", politica => politica.RequireRole(
        PerfilUsuario.Psicologo.ToString(),
        PerfilUsuario.Recepcionista.ToString(),
        PerfilUsuario.Administrador.ToString()));
    opcoes.AddPolicy("AcessoClinico", politica => politica.RequireRole(
        PerfilUsuario.Psicologo.ToString()));
    opcoes.AddPolicy("Auditoria", politica => politica.RequireRole(
        PerfilUsuario.Psicologo.ToString(),
        PerfilUsuario.Administrador.ToString()));
});

builder.Services.AddCors(opcoes =>
{
    var origensFrontend = builder.Configuration
        .GetSection("Frontend:OrigensPermitidas")
        .Get<string[]>()
        ?? [builder.Configuration["Frontend:UrlBase"] ?? "http://localhost:4200"];

    opcoes.AddPolicy("FrontendGestaoPsi", politica =>
        politica
            .WithOrigins(origensFrontend)
            .AllowCredentials()
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddScoped<IPasswordHasher<Usuario>, PasswordHasher<Usuario>>();
builder.Services.AddScoped<IAutenticacaoService, AutenticacaoService>();
builder.Services.AddScoped<IPainelService, PainelService>();
builder.Services.AddScoped<IPacientesService, PacientesService>();
builder.Services.AddScoped<IProtecaoDadosService, ProtecaoDadosService>();
builder.Services.AddScoped<IAuditoriaService, AuditoriaService>();
builder.Services.AddScoped<IAutorizacaoContaService, AutorizacaoContaService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IEmailTransacionalService, EmailTransacionalService>();
builder.Services.AddScoped<IAgendaService, AgendaService>();
builder.Services.AddScoped<IConsultasService, ConsultasService>();
builder.Services.AddScoped<ISessoesService, SessoesService>();
builder.Services.AddScoped<IPagamentosService, PagamentosService>();

var app = builder.Build();

app.UseMiddleware<TratamentoExcecoesMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseCors("FrontendGestaoPsi");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
