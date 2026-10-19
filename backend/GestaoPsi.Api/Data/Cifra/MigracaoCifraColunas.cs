using GestaoPsi.Api.Models;
using GestaoPsi.Api.Services.Seguranca;
using Microsoft.EntityFrameworkCore;

namespace GestaoPsi.Api.Data.Cifra;

/// <summary>
/// Na subida da API, cifra o que ainda estiver em texto aberto nas colunas marcadas com <see cref="CifradoAttribute"/>
/// (dados gravados antes da cifra) e preenche os hashes de busca que faltarem. Também protege o que sobrou em texto
/// nas colunas que os serviços cifram por conta própria (<see cref="ColunasDoServico"/>). Idempotente: sem pendências,
/// só lê os ids.
/// </summary>
public static class MigracaoCifraColunas
{
    private const int Lote = 200;

    // Saída da Data Protection: o cabeçalho mágico 09 F0 C9 F0 vira "CfDJ8" em Base64Url.
    private const string CabecalhoDataProtection = "CfDJ8";

    /// <summary>Colunas que os serviços cifram com <see cref="IProtecaoDadosService"/> antes de gravar.</summary>
    private static readonly (string Tabela, string[] Colunas)[] ColunasDoServico =
    [
        ("Pacientes", ["Cpf", "Telefone", "Email", "ObservacaoAdministrativa"]),
        ("ContatosPaciente", ["Valor", "Nome"]),
        ("RegistrosSessao", ["ObservacoesClinicas", "Evolucao", "Encaminhamentos"]),
        ("EvolucoesProntuario", ["Conteudo"]),
        ("DocumentosProntuario", ["ConteudoAtualJson"]),
        ("VersoesDocumentoProntuario", ["ConteudoJson"]),
        ("DadosProfissionaisPsicologo", ["Crp"]),
        ("IntegracoesWhatsApp", ["TokenCriptografado"]),
        ("MensagensWhatsApp", ["Conteudo"]),
        ("EventosBridgeWhatsApp", ["PayloadJson"]),
        ("SessoesBot", ["DadosTemporariosJson"]),
        ("LogsAuditoria", ["DadosAntesJson", "DadosDepoisJson"]),
    ];

    public static async Task<int> ExecutarAsync(AppDbContext db, ILogger logger, IProtecaoDadosService? protecao = null, CancellationToken ct = default)
    {
        if (!db.Database.IsRelational()) return 0;
        var total = protecao is null ? 0 : await ProtegerColunasDoServicoAsync(db, protecao, logger, ct);

        foreach (var tipo in db.Model.GetEntityTypes())
        {
            var tabela = tipo.GetTableName();
            var chave = tipo.FindPrimaryKey();
            if (tabela is null || chave is null || chave.Properties.Count != 1 || chave.Properties[0].ClrType != typeof(Guid)) continue;

            var colunas = tipo.GetProperties()
                .Where(propriedade => propriedade.PropertyInfo?.IsDefined(typeof(CifradoAttribute), inherit: true) == true)
                .ToArray();
            if (colunas.Length == 0) continue;

            var esquema = tipo.GetSchema() ?? "dbo";
            var colunaId = chave.Properties[0].GetColumnName();
            var condicoes = colunas.Select(propriedade =>
            {
                var coluna = propriedade.GetColumnName();
                return $"([{coluna}] IS NOT NULL AND [{coluna}] NOT LIKE '{CifraDeColuna.Prefixo}%')";
            }).ToList();
            if (tipo.ClrType == typeof(Usuario)) condicoes.Add("[EmailHash] IS NULL");
            if (tipo.ClrType == typeof(ConversaWhatsApp)) condicoes.Add("[TelefoneHash] IS NULL");

            // Nomes vêm do modelo do EF, nunca de entrada externa.
#pragma warning disable EF1002
            var pendentes = await db.Database
                .SqlQueryRaw<Guid>($"SELECT [{colunaId}] AS [Value] FROM [{esquema}].[{tabela}] WHERE {string.Join(" OR ", condicoes)}")
                .ToListAsync(ct);
#pragma warning restore EF1002
            if (pendentes.Count == 0) continue;

            foreach (var lote in pendentes.Chunk(Lote))
            {
                foreach (var id in lote)
                {
                    var entidade = await db.FindAsync(tipo.ClrType, [id], ct);
                    if (entidade is null) continue;
                    var entrada = db.Entry(entidade);
                    foreach (var propriedade in colunas) entrada.Property(propriedade.Name).IsModified = true;
                }
                await db.SaveChangesAsync(ct);
                db.ChangeTracker.Clear();
            }

            logger.LogInformation("Cifra de colunas: {Quantidade} registro(s) de {Tabela} protegidos.", pendentes.Count, tabela);
            total += pendentes.Count;
        }

        return total;
    }

    private static async Task<int> ProtegerColunasDoServicoAsync(AppDbContext db, IProtecaoDadosService protecao, ILogger logger, CancellationToken ct)
    {
        var total = 0;
        foreach (var (tabela, colunas) in ColunasDoServico)
        {
            foreach (var coluna in colunas)
            {
                // Nomes fixos acima, nunca de entrada externa.
#pragma warning disable EF1002
                var pendentes = await db.Database
                    .SqlQueryRaw<LinhaEmTexto>($"SELECT [Id], [{coluna}] AS [Valor] FROM [{tabela}] WHERE [{coluna}] IS NOT NULL AND [{coluna}] <> N'' AND [{coluna}] NOT LIKE '{CabecalhoDataProtection}%'")
                    .ToListAsync(ct);
                foreach (var linha in pendentes)
                {
                    var protegido = protecao.Proteger(linha.Valor);
                    await db.Database.ExecuteSqlRawAsync($"UPDATE [{tabela}] SET [{coluna}] = {{0}} WHERE [Id] = {{1}}", [protegido, linha.Id], ct);
                }
#pragma warning restore EF1002
                if (pendentes.Count == 0) continue;
                logger.LogInformation("Cifra de colunas: {Quantidade} valor(es) de {Tabela}.{Coluna} protegidos.", pendentes.Count, tabela, coluna);
                total += pendentes.Count;
            }
        }
        return total;
    }

    private sealed record LinhaEmTexto(Guid Id, string Valor);
}
