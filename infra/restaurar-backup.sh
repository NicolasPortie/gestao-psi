#!/usr/bin/env bash
# Restaura um backup do banco e o chaveiro da Data Protection do mesmo momento.
# Uso, na raiz do repositório:  infra/restaurar-backup.sh Psique-AAAAMMDD-HHMM.bak
# O .bak e o protecao-dados-AAAAMMDD-HHMM.txt correspondente precisam estar em backups/banco e backups/chaves.
# Atenção: substitui o banco e o chaveiro atuais.
set -euo pipefail
cd "$(dirname "$0")/.."

COMPOSE=${COMPOSE:-docker compose -f docker-compose.yml -f docker-compose.producao.yml}
PASTA=${PASTA_BACKUPS:-./backups}
CHAVE_REDIS="Psique:protecao-dados:chaves"
SQLCMD=/opt/mssql-tools18/bin/sqlcmd

bak=$(basename "${1:?Informe o arquivo .bak (nome dentro de backups/banco)}")
carimbo=${bak#Psique-}; carimbo=${carimbo%.bak}
chaves="$PASTA/chaves/protecao-dados-$carimbo.txt"
[ -f "$PASTA/banco/$bak" ] || { echo "Não encontrei $PASTA/banco/$bak." >&2; exit 1; }
[ -f "$chaves" ] || { echo "Não encontrei $chaves. Sem o chaveiro, os dados cifrados não podem ser lidos." >&2; exit 1; }

echo "Parando a API e o backup..."
$COMPOSE stop api backup >/dev/null 2>&1 || true
$COMPOSE up -d --wait sqlserver redis

sql() { $COMPOSE exec -T sqlserver bash -c "$SQLCMD -S localhost -U sa -P \"\$MSSQL_SA_PASSWORD\" -C -b -Q \"$1\""; }

# Servidor novo com TDE: o certificado precisa existir antes do RESTORE.
if [ -f "$PASTA/chaves/PsiqueTde.cer" ]; then
  echo "Recriando o certificado do TDE..."
  $COMPOSE exec -T -u root sqlserver bash -c \
    'cp /var/opt/mssql/backup/chaves/PsiqueTde.* /var/opt/mssql/ && chown mssql /var/opt/mssql/PsiqueTde.*'
  senha_tde=$(grep '^TDE_SENHA_BACKUP=' .env | cut -d= -f2-)
  senha_mestra=$(grep '^TDE_SENHA_CHAVE_MESTRA=' .env | cut -d= -f2-)
  sql "USE master;
    IF NOT EXISTS (SELECT 1 FROM sys.symmetric_keys WHERE name = '##MS_DatabaseMasterKey##')
      CREATE MASTER KEY ENCRYPTION BY PASSWORD = '$senha_mestra';
    IF NOT EXISTS (SELECT 1 FROM sys.certificates WHERE name = 'PsiqueTde')
      CREATE CERTIFICATE PsiqueTde FROM FILE = '/var/opt/mssql/PsiqueTde.cer'
        WITH PRIVATE KEY (FILE = '/var/opt/mssql/PsiqueTde.pvk', DECRYPTION BY PASSWORD = '$senha_tde');"
fi

echo "Restaurando o banco a partir de $bak..."
sql "IF DB_ID('Psique') IS NOT NULL ALTER DATABASE [Psique] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
  RESTORE DATABASE [Psique] FROM DISK = N'/var/opt/mssql/backup/banco/$bak' WITH REPLACE, CHECKSUM;
  ALTER DATABASE [Psique] SET MULTI_USER;"

echo "Restaurando o chaveiro..."
$COMPOSE exec -T redis redis-cli DEL "$CHAVE_REDIS" >/dev/null
$COMPOSE exec -T redis sh -c \
  "while IFS= read -r linha; do [ -n \"\$linha\" ] && redis-cli RPUSH '$CHAVE_REDIS' \"\$linha\" >/dev/null; done; redis-cli LLEN '$CHAVE_REDIS'" \
  < "$chaves"

echo "Subindo o sistema..."
$COMPOSE up -d
echo "Restauração concluída."
