#!/bin/bash
# Backup periódico do banco, do certificado do TDE e do chaveiro da Data Protection.
# Sem o chaveiro, os campos cifrados do banco não podem ser lidos: os dois precisam andar juntos.
set -uo pipefail

PASTA=/backups
INTERVALO_HORAS=${BACKUP_INTERVALO_HORAS:-6}
RETENCAO_DIAS=${BACKUP_RETENCAO_DIAS:-14}
BANCO=GestaoPsi
CHAVE_REDIS="GestaoPsi:protecao-dados:chaves"
SQLCMD=/opt/mssql-tools18/bin/sqlcmd

registrar() { echo "$(date '+%Y-%m-%d %H:%M:%S') $*"; }

mkdir -p "$PASTA/banco" "$PASTA/chaves"
# O SQL Server grava o .bak como o usuário mssql (uid 10001).
chown 10001:0 "$PASTA/banco"
chmod 700 "$PASTA/chaves"

fazer_backup() {
  local carimbo arquivo destino_chaves
  carimbo=$(date +%Y%m%d-%H%M)
  arquivo="/var/opt/mssql/backup/banco/$BANCO-$carimbo.bak"

  # Sem backups de log, o modelo FULL faria o log crescer sem limite; o ponto de recuperação é o último backup.
  # Compressão não existe na edição Express: lá o backup sai sem ela.
  if ! "$SQLCMD" -S sqlserver -U sa -P "$MSSQL_SA_PASSWORD" -C -b -Q "
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM sys.databases WHERE name = N'$BANCO' AND recovery_model_desc <> N'SIMPLE')
      ALTER DATABASE [$BANCO] SET RECOVERY SIMPLE;
    DECLARE @comando nvarchar(max) = N'BACKUP DATABASE [$BANCO] TO DISK = N''$arquivo'' WITH CHECKSUM, INIT'
      + CASE WHEN CAST(SERVERPROPERTY('EngineEdition') AS int) = 4 THEN N'' ELSE N', COMPRESSION' END;
    EXEC (@comando);
    RESTORE VERIFYONLY FROM DISK = N'$arquivo' WITH CHECKSUM;"; then
    registrar "ERRO: o backup do banco falhou."
    return 1
  fi

  destino_chaves="$PASTA/chaves/protecao-dados-$carimbo.txt"
  # Cada chave é uma linha de XML, já cifrada pelo certificado da API.
  if ! REDISCLI_AUTH="$REDIS_SENHA" redis-cli -h redis --raw LRANGE "$CHAVE_REDIS" 0 -1 > "$destino_chaves"; then
    registrar "ERRO: o chaveiro da Data Protection não foi exportado."
    rm -f "$destino_chaves"
    return 1
  fi
  if grep -q '<key ' "$destino_chaves"; then
    chmod 600 "$destino_chaves"
  else
    registrar "AVISO: o chaveiro ainda está vazio; a API cria a primeira chave ao subir."
    rm -f "$destino_chaves"
  fi

  # O certificado do TDE só é gerado uma vez; sem ele nenhum .bak cifrado abre em outro servidor.
  if [ -d /mssql-dados/chaves-tde ]; then
    cp -n /mssql-dados/chaves-tde/* "$PASTA/chaves/" 2>/dev/null
  fi

  find "$PASTA/banco" -name "$BANCO-*.bak" -mtime +"$RETENCAO_DIAS" -delete
  find "$PASTA/chaves" -name 'protecao-dados-*.txt' -mtime +"$RETENCAO_DIAS" -delete
  registrar "Backup concluído: $(basename "$arquivo")."
}

registrar "Backup a cada ${INTERVALO_HORAS} h, com retenção de ${RETENCAO_DIAS} dias."
while true; do
  fazer_backup
  sleep $((INTERVALO_HORAS * 3600))
done
