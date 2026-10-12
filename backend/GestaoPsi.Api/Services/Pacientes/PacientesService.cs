using GestaoPsi.Api.Data;
using GestaoPsi.Api.DTOs.Pacientes;
using GestaoPsi.Api.Models;
using GestaoPsi.Api.Services.Seguranca;
using GestaoPsi.Api.Shared.Enums;
using GestaoPsi.Api.Shared.Excecoes;
using Microsoft.EntityFrameworkCore;

namespace GestaoPsi.Api.Services.Pacientes;

public sealed class PacientesService(
    AppDbContext dbContext,
    IProtecaoDadosService protecaoDados,
    IAuditoriaService auditoria)
    : IPacientesService
{
    public async Task<PacientesListagemResponse> ListarAsync(
        Guid usuarioId,
        Guid contaPsicologoId,
        ListarPacientesRequest request,
        CancellationToken cancellationToken)
    {
        await ValidarUsuarioDaContaAsync(usuarioId, contaPsicologoId, cancellationToken);

        var pagina = Math.Max(1, request.Pagina);
        var tamanhoPagina = Math.Clamp(request.TamanhoPagina, 5, 100);
        var busca = request.Busca?.Trim();
        var buscaNormalizada = NormalizarBusca(busca);
        var buscaHash = string.IsNullOrWhiteSpace(buscaNormalizada)
            ? null
            : protecaoDados.HashDeterministico(buscaNormalizada);

        var consulta = dbContext.Pacientes
            .AsNoTracking()
            .Where(paciente => paciente.ContaPsicologoId == contaPsicologoId);

        if (request.Status.HasValue)
        {
            consulta = consulta.Where(paciente => paciente.Status == request.Status.Value);
        }

        if (!string.IsNullOrWhiteSpace(busca))
        {
            consulta = consulta.Where(paciente =>
                paciente.NomeCompleto.Contains(busca) ||
                (buscaHash != null &&
                    (paciente.CpfHash == buscaHash ||
                     paciente.Contatos.Any(contato => contato.ValorHash == buscaHash))));
        }

        var resumo = await ObterResumoAsync(contaPsicologoId, cancellationToken);
        var total = await consulta.CountAsync(cancellationToken);

        var pacientes = await consulta
            .OrderBy(paciente => paciente.NomeCompleto)
            .Skip((pagina - 1) * tamanhoPagina)
            .Take(tamanhoPagina)
            .Include(paciente => paciente.Contatos)
            .ToListAsync(cancellationToken);

        var consultasPorPaciente = await ObterConsultasResumoAsync(
            contaPsicologoId,
            pacientes.Select(paciente => paciente.Id).ToArray(),
            cancellationToken);

        var itens = pacientes
            .Select(paciente => MapearLista(
                paciente,
                consultasPorPaciente.GetValueOrDefault(paciente.Id)))
            .ToArray();

        return new PacientesListagemResponse(
            itens,
            resumo,
            total,
            pagina,
            tamanhoPagina);
    }

    public async Task<PacienteDetalheResponse> ObterPorIdAsync(
        Guid contaPsicologoId,
        Guid pacienteId,
        CancellationToken cancellationToken)
    {
        var paciente = await ObterPacienteAsync(
            contaPsicologoId,
            pacienteId,
            rastrear: false,
            incluirContatos: true,
            cancellationToken);
        var consultas = await ObterConsultasResumoAsync(
            contaPsicologoId,
            [paciente.Id],
            cancellationToken);

        return MapearDetalhe(paciente, consultas.GetValueOrDefault(paciente.Id));
    }

    public async Task<PacienteDetalheResponse> CriarAsync(
        Guid usuarioId,
        Guid contaPsicologoId,
        CriarPacienteRequest request,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken)
    {
        await ValidarUsuarioDaContaAsync(usuarioId, contaPsicologoId, cancellationToken);

        var dados = NormalizarRequest(request);
        await ValidarDadosPacienteAsync(contaPsicologoId, null, dados, cancellationToken);

        var paciente = new Paciente
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = contaPsicologoId,
            NomeCompleto = dados.NomeCompleto,
            DataNascimento = dados.DataNascimento,
            Cpf = ProtegerOpcional(dados.Cpf),
            CpfHash = HashOpcional(dados.Cpf),
            Telefone = ProtegerOpcional(dados.Telefone),
            Email = ProtegerOpcional(dados.Email),
            ObservacaoAdministrativa = ProtegerOpcional(dados.ObservacaoAdministrativa),
            Status = StatusPaciente.Ativo,
            CriadoEm = DateTimeOffset.UtcNow
        };

        DefinirContatos(paciente, dados);

        var prontuario = new Prontuario
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = contaPsicologoId,
            PacienteId = paciente.Id,
            Status = StatusProntuario.Ativo,
            CriadoEm = DateTimeOffset.UtcNow
        };

        dbContext.Pacientes.Add(paciente);
        dbContext.Prontuarios.Add(prontuario);
        RegistrarAuditoria(
            contaPsicologoId,
            usuarioId,
            "PacienteCriado",
            paciente.Id,
            $"Paciente {paciente.NomeCompleto} criado.",
            null,
            new
            {
                paciente.Id,
                paciente.NomeCompleto,
                paciente.Status,
                CpfMascarado = MascararCpf(dados.Cpf)
            },
            ip,
            userAgent);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObterPorIdAsync(contaPsicologoId, paciente.Id, cancellationToken);
    }

    public async Task<PacienteDetalheResponse> AtualizarAsync(
        Guid usuarioId,
        Guid contaPsicologoId,
        Guid pacienteId,
        AtualizarPacienteRequest request,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken)
    {
        await ValidarUsuarioDaContaAsync(usuarioId, contaPsicologoId, cancellationToken);

        var paciente = await ObterPacienteAsync(
            contaPsicologoId,
            pacienteId,
            rastrear: true,
            incluirContatos: false,
            cancellationToken);
        var dados = NormalizarRequest(request, paciente);
        await ValidarDadosPacienteAsync(contaPsicologoId, paciente.Id, dados, cancellationToken);

        var dadosAntes = CriarSnapshotAuditoria(paciente);

        paciente.NomeCompleto = dados.NomeCompleto;
        paciente.DataNascimento = dados.DataNascimento;
        paciente.Cpf = ProtegerOpcional(dados.Cpf);
        paciente.CpfHash = HashOpcional(dados.Cpf);
        paciente.Telefone = ProtegerOpcional(dados.Telefone);
        paciente.Email = ProtegerOpcional(dados.Email);
        paciente.ObservacaoAdministrativa = ProtegerOpcional(dados.ObservacaoAdministrativa);
        paciente.Status = request.Status;
        paciente.AtualizadoEm = DateTimeOffset.UtcNow;

        await using var transacao = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        await dbContext.ContatosPaciente
            .Where(contato =>
                contato.ContaPsicologoId == contaPsicologoId &&
                contato.PacienteId == paciente.Id)
            .ExecuteDeleteAsync(cancellationToken);

        dbContext.ContatosPaciente.AddRange(CriarContatos(paciente, dados));

        RegistrarAuditoria(
            contaPsicologoId,
            usuarioId,
            "PacienteAtualizado",
            paciente.Id,
            $"Paciente {paciente.NomeCompleto} atualizado.",
            dadosAntes,
            CriarSnapshotAuditoria(paciente),
            ip,
            userAgent);

        await dbContext.SaveChangesAsync(cancellationToken);
        await transacao.CommitAsync(cancellationToken);

        return await ObterPorIdAsync(contaPsicologoId, paciente.Id, cancellationToken);
    }

    public async Task<PacienteDetalheResponse> AlterarStatusAsync(
        Guid usuarioId,
        Guid contaPsicologoId,
        Guid pacienteId,
        bool ativar,
        string? ip,
        string? userAgent,
        CancellationToken cancellationToken)
    {
        await ValidarUsuarioDaContaAsync(usuarioId, contaPsicologoId, cancellationToken);

        var paciente = await ObterPacienteAsync(
            contaPsicologoId,
            pacienteId,
            rastrear: true,
            incluirContatos: true,
            cancellationToken);
        var statusAnterior = paciente.Status;
        paciente.Status = ativar ? StatusPaciente.Ativo : StatusPaciente.Inativo;
        paciente.AtualizadoEm = DateTimeOffset.UtcNow;

        RegistrarAuditoria(
            contaPsicologoId,
            usuarioId,
            ativar ? "PacienteAtivado" : "PacienteInativado",
            paciente.Id,
            $"Paciente {paciente.NomeCompleto} {(ativar ? "ativado" : "inativado")}.",
            new { Status = statusAnterior },
            new { paciente.Status },
            ip,
            userAgent);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObterPorIdAsync(contaPsicologoId, paciente.Id, cancellationToken);
    }

    private async Task<Paciente> ObterPacienteAsync(
        Guid contaPsicologoId,
        Guid pacienteId,
        bool rastrear,
        bool incluirContatos,
        CancellationToken cancellationToken)
    {
        var consulta = dbContext.Pacientes
            .Where(paciente =>
                paciente.ContaPsicologoId == contaPsicologoId &&
                paciente.Id == pacienteId);

        if (incluirContatos)
        {
            consulta = consulta.Include(paciente => paciente.Contatos);
        }

        if (!rastrear)
        {
            consulta = consulta.AsNoTracking();
        }

        return await consulta.SingleOrDefaultAsync(cancellationToken)
            ?? throw new RegraNegocioException(
                "Paciente não encontrado.",
                StatusCodes.Status404NotFound);
    }

    private async Task ValidarUsuarioDaContaAsync(
        Guid usuarioId,
        Guid contaPsicologoId,
        CancellationToken cancellationToken)
    {
        var usuarioExiste = await dbContext.Usuarios
            .AsNoTracking()
            .AnyAsync(
                usuario =>
                    usuario.Id == usuarioId &&
                    usuario.ContaPsicologoId == contaPsicologoId &&
                    usuario.Status == StatusUsuario.Ativo,
                cancellationToken);

        if (!usuarioExiste)
        {
            throw new RegraNegocioException(
                "Sessão inválida ou expirada.",
                StatusCodes.Status401Unauthorized);
        }
    }

    private async Task ValidarDadosPacienteAsync(
        Guid contaPsicologoId,
        Guid? pacienteId,
        DadosPacienteNormalizados dados,
        CancellationToken cancellationToken)
    {
        if (dados.NomeCompleto.Length < 3)
        {
            throw new RegraNegocioException("Informe o nome completo do paciente.");
        }

        if (dados.Cpf is not null && dados.Cpf.Length != 11)
        {
            throw new RegraNegocioException("Informe um CPF com 11 digitos.");
        }

        var cpfHash = HashOpcional(dados.Cpf);
        if (cpfHash is not null)
        {
            var cpfEmUso = await dbContext.Pacientes
                .AsNoTracking()
                .AnyAsync(
                    paciente =>
                        paciente.ContaPsicologoId == contaPsicologoId &&
                        paciente.CpfHash == cpfHash &&
                        (!pacienteId.HasValue || paciente.Id != pacienteId.Value),
                    cancellationToken);

            if (cpfEmUso)
            {
                throw new RegraNegocioException("Já existe um paciente com este CPF.");
            }
        }
    }

    private async Task<PacientesResumoResponse> ObterResumoAsync(
        Guid contaPsicologoId,
        CancellationToken cancellationToken)
    {
        var grupos = await dbContext.Pacientes
            .AsNoTracking()
            .Where(paciente => paciente.ContaPsicologoId == contaPsicologoId)
            .GroupBy(paciente => paciente.Status)
            .Select(grupo => new { Status = grupo.Key, Total = grupo.Count() })
            .ToListAsync(cancellationToken);

        return new PacientesResumoResponse(
            grupos.SingleOrDefault(item => item.Status == StatusPaciente.Ativo)?.Total ?? 0,
            grupos.SingleOrDefault(item => item.Status == StatusPaciente.Inativo)?.Total ?? 0,
            grupos.SingleOrDefault(item => item.Status == StatusPaciente.Arquivado)?.Total ?? 0);
    }

    private async Task<Dictionary<Guid, ConsultasPacienteResumo>> ObterConsultasResumoAsync(
        Guid contaPsicologoId,
        IReadOnlyCollection<Guid> pacientesIds,
        CancellationToken cancellationToken)
    {
        if (pacientesIds.Count == 0)
        {
            return [];
        }

        var agora = DateTimeOffset.UtcNow;
        var consultas = await dbContext.Consultas
            .AsNoTracking()
            .Where(consulta =>
                consulta.ContaPsicologoId == contaPsicologoId &&
                pacientesIds.Contains(consulta.PacienteId) &&
                consulta.Status != StatusConsulta.Cancelada &&
                consulta.Status != StatusConsulta.Remarcada)
            .Select(consulta => new
            {
                consulta.PacienteId,
                consulta.InicioEm
            })
            .ToListAsync(cancellationToken);

        return pacientesIds.ToDictionary(
            pacienteId => pacienteId,
            pacienteId =>
            {
                var consultasPaciente = consultas
                    .Where(consulta => consulta.PacienteId == pacienteId)
                    .ToArray();
                return new ConsultasPacienteResumo(
                    consultasPaciente
                        .Where(consulta => consulta.InicioEm <= agora)
                        .OrderByDescending(consulta => consulta.InicioEm)
                        .Select(consulta => consulta.InicioEm)
                        .FirstOrDefault(),
                    consultasPaciente
                        .Where(consulta => consulta.InicioEm > agora)
                        .OrderBy(consulta => consulta.InicioEm)
                        .Select(consulta => consulta.InicioEm)
                        .FirstOrDefault());
            });
    }

    private void DefinirContatos(Paciente paciente, DadosPacienteNormalizados dados)
    {
        foreach (var contato in CriarContatos(paciente, dados))
        {
            paciente.Contatos.Add(contato);
        }
    }

    private IReadOnlyCollection<ContatoPaciente> CriarContatos(
        Paciente paciente,
        DadosPacienteNormalizados dados)
    {
        var contatos = new List<ContatoPaciente>();

        AdicionarContato(contatos, paciente, TipoContato.Telefone, dados.Telefone);
        AdicionarContato(contatos, paciente, TipoContato.WhatsApp, dados.WhatsApp);
        AdicionarContato(contatos, paciente, TipoContato.Email, dados.Email);

        foreach (var contato in dados.ContatosAdicionais)
        {
            AdicionarContato(
                contatos,
                paciente,
                contato.TipoContato,
                contato.Valor,
                contato.Principal);
        }

        return contatos;
    }

    private void AdicionarContato(
        ICollection<ContatoPaciente> contatos,
        Paciente paciente,
        TipoContato tipoContato,
        string? valor,
        bool principal = true)
    {
        if (string.IsNullOrWhiteSpace(valor))
        {
            return;
        }

        contatos.Add(new ContatoPaciente
        {
            Id = Guid.NewGuid(),
            ContaPsicologoId = paciente.ContaPsicologoId,
            PacienteId = paciente.Id,
            TipoContato = tipoContato,
            Valor = protecaoDados.Proteger(valor),
            ValorHash = protecaoDados.HashDeterministico(valor),
            Principal = principal,
            CriadoEm = DateTimeOffset.UtcNow
        });
    }

    private PacienteListaResponse MapearLista(
        Paciente paciente,
        ConsultasPacienteResumo? consultas) =>
        new(
            paciente.Id,
            paciente.NomeCompleto,
            paciente.DataNascimento?.ToString("yyyy-MM-dd"),
            MascararCpf(DesprotegerOpcional(paciente.Cpf)),
            DesprotegerOpcional(paciente.Telefone),
            ObterContato(paciente, TipoContato.WhatsApp),
            DesprotegerOpcional(paciente.Email),
            paciente.Status.ToString(),
            FormatarDataConsulta(consultas?.UltimaConsulta),
            FormatarDataConsulta(consultas?.ProximaConsulta),
            paciente.CriadoEm,
            paciente.AtualizadoEm);

    private PacienteDetalheResponse MapearDetalhe(
        Paciente paciente,
        ConsultasPacienteResumo? consultas) =>
        new(
            paciente.Id,
            paciente.NomeCompleto,
            paciente.DataNascimento?.ToString("yyyy-MM-dd"),
            MascararCpf(DesprotegerOpcional(paciente.Cpf)),
            DesprotegerOpcional(paciente.Cpf),
            DesprotegerOpcional(paciente.Telefone),
            ObterContato(paciente, TipoContato.WhatsApp),
            DesprotegerOpcional(paciente.Email),
            paciente.Status.ToString(),
            DesprotegerOpcional(paciente.ObservacaoAdministrativa),
            MapearContatosAdicionais(paciente),
            FormatarDataConsulta(consultas?.UltimaConsulta),
            FormatarDataConsulta(consultas?.ProximaConsulta),
            paciente.CriadoEm,
            paciente.AtualizadoEm);

    private IReadOnlyCollection<ContatoPacienteResponse> MapearContatosAdicionais(Paciente paciente)
    {
        var telefonePrincipal = DesprotegerOpcional(paciente.Telefone);
        var emailPrincipal = DesprotegerOpcional(paciente.Email);
        var whatsAppPrincipal = ObterContato(paciente, TipoContato.WhatsApp);

        return paciente.Contatos
            .Select(contato => new
            {
                Contato = contato,
                Valor = DesprotegerOpcional(contato.Valor)
            })
            .Where(item => !ContatoEhPrincipalDoPaciente(
                item.Contato,
                item.Valor,
                telefonePrincipal,
                whatsAppPrincipal,
                emailPrincipal))
            .Select(item => new ContatoPacienteResponse(
                item.Contato.Id,
                item.Contato.TipoContato.ToString(),
                item.Valor ?? string.Empty,
                item.Contato.Principal))
            .ToArray();
    }

    private static bool ContatoEhPrincipalDoPaciente(
        ContatoPaciente contato,
        string? valor,
        string? telefonePrincipal,
        string? whatsAppPrincipal,
        string? emailPrincipal) =>
        contato.Principal &&
        contato.TipoContato switch
        {
            TipoContato.Telefone => valor == telefonePrincipal,
            TipoContato.WhatsApp => valor == whatsAppPrincipal,
            TipoContato.Email => valor == emailPrincipal,
            _ => false
        };

    private string? ObterContato(Paciente paciente, TipoContato tipoContato) =>
        paciente.Contatos
            .Where(contato => contato.TipoContato == tipoContato)
            .OrderByDescending(contato => contato.Principal)
            .Select(contato => DesprotegerOpcional(contato.Valor))
            .FirstOrDefault();

    private string? ProtegerOpcional(string? valor) =>
        string.IsNullOrWhiteSpace(valor) ? null : protecaoDados.Proteger(valor);

    private string? DesprotegerOpcional(string? valor) =>
        string.IsNullOrWhiteSpace(valor) ? null : protecaoDados.Desproteger(valor);

    private string? HashOpcional(string? valor) =>
        string.IsNullOrWhiteSpace(valor) ? null : protecaoDados.HashDeterministico(valor);

    private void RegistrarAuditoria(
        Guid contaPsicologoId,
        Guid usuarioId,
        string tipoAcao,
        Guid entidadeId,
        string descricao,
        object? dadosAntes,
        object? dadosDepois,
        string? ip,
        string? userAgent)
        => auditoria.Registrar(
            contaPsicologoId,
            usuarioId,
            tipoAcao,
            "Paciente",
            entidadeId,
            descricao,
            dadosAntes,
            dadosDepois,
            ip,
            userAgent);

    private object CriarSnapshotAuditoria(Paciente paciente) => new
    {
        paciente.Id,
        paciente.NomeCompleto,
        paciente.DataNascimento,
        CpfMascarado = MascararCpf(DesprotegerOpcional(paciente.Cpf)),
        paciente.Status
    };

    private DadosPacienteNormalizados NormalizarRequest(CriarPacienteRequest request) =>
        new(
            NormalizarTextoObrigatorio(request.NomeCompleto),
            request.DataNascimento,
            NormalizarDigitos(request.Cpf),
            NormalizarDigitos(request.Telefone),
            NormalizarDigitos(request.WhatsApp),
            NormalizarEmail(request.Email),
            NormalizarTextoOpcional(request.ObservacaoAdministrativa),
            NormalizarContatosAdicionais(request.ContatosAdicionais));

    private DadosPacienteNormalizados NormalizarRequest(AtualizarPacienteRequest request) =>
        new(
            NormalizarTextoObrigatorio(request.NomeCompleto),
            request.DataNascimento,
            NormalizarDigitos(request.Cpf),
            NormalizarDigitos(request.Telefone),
            NormalizarDigitos(request.WhatsApp),
            NormalizarEmail(request.Email),
            NormalizarTextoOpcional(request.ObservacaoAdministrativa),
            NormalizarContatosAdicionais(request.ContatosAdicionais));

    private DadosPacienteNormalizados NormalizarRequest(
        AtualizarPacienteRequest request,
        Paciente paciente)
    {
        var cpf = request.Cpf?.Contains('*') == true
            ? DesprotegerOpcional(paciente.Cpf)
            : NormalizarDigitos(request.Cpf);

        return new DadosPacienteNormalizados(
            NormalizarTextoObrigatorio(request.NomeCompleto),
            request.DataNascimento,
            cpf,
            NormalizarDigitos(request.Telefone),
            NormalizarDigitos(request.WhatsApp),
            NormalizarEmail(request.Email),
            NormalizarTextoOpcional(request.ObservacaoAdministrativa),
            NormalizarContatosAdicionais(request.ContatosAdicionais));
    }

    private static string NormalizarTextoObrigatorio(string valor) =>
        valor.Trim();

    private static string? NormalizarTextoOpcional(string? valor) =>
        string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();

    private static string? NormalizarEmail(string? valor) =>
        string.IsNullOrWhiteSpace(valor) ? null : valor.Trim().ToLowerInvariant();

    private static string? NormalizarDigitos(string? valor)
    {
        if (string.IsNullOrWhiteSpace(valor))
        {
            return null;
        }

        var digitos = new string(valor.Where(char.IsDigit).ToArray());
        return string.IsNullOrWhiteSpace(digitos) ? null : digitos;
    }

    private static string? NormalizarBusca(string? valor)
    {
        if (string.IsNullOrWhiteSpace(valor))
        {
            return null;
        }

        var email = NormalizarEmail(valor);
        var digitos = NormalizarDigitos(valor);
        return !string.IsNullOrWhiteSpace(digitos) ? digitos : email;
    }

    private static IReadOnlyCollection<ContatoPacienteNormalizado> NormalizarContatosAdicionais(
        IReadOnlyCollection<ContatoPacienteRequest>? contatos)
    {
        if (contatos is null || contatos.Count == 0)
        {
            return [];
        }

        return contatos
            .Select(contato => new ContatoPacienteNormalizado(
                contato.TipoContato,
                contato.TipoContato switch
                {
                    TipoContato.Email => NormalizarEmail(contato.Valor),
                    TipoContato.Telefone or TipoContato.WhatsApp => NormalizarDigitos(contato.Valor),
                    _ => NormalizarTextoOpcional(contato.Valor)
                },
                contato.Principal))
            .Where(contato => !string.IsNullOrWhiteSpace(contato.Valor))
            .Take(10)
            .ToArray();
    }

    private static string? MascararCpf(string? cpf)
    {
        if (string.IsNullOrWhiteSpace(cpf) || cpf.Length != 11)
        {
            return null;
        }

        return $"{cpf[..3]}.***.***-{cpf[^2..]}";
    }

    private static string? FormatarDataConsulta(DateTimeOffset? data)
    {
        if (!data.HasValue || data.Value == default)
        {
            return null;
        }

        return data.Value.ToLocalTime().ToString("yyyy-MM-ddTHH:mm:sszzz");
    }

    private sealed record DadosPacienteNormalizados(
        string NomeCompleto,
        DateOnly? DataNascimento,
        string? Cpf,
        string? Telefone,
        string? WhatsApp,
        string? Email,
        string? ObservacaoAdministrativa,
        IReadOnlyCollection<ContatoPacienteNormalizado> ContatosAdicionais);

    private sealed record ContatoPacienteNormalizado(
        TipoContato TipoContato,
        string? Valor,
        bool Principal);

    private sealed record ConsultasPacienteResumo(
        DateTimeOffset? UltimaConsulta,
        DateTimeOffset? ProximaConsulta);
}
