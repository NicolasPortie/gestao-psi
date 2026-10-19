/*
  Cifra em repouso do banco inteiro (TDE, Transparent Data Encryption, AES-256).

  O que protege: arquivos de dados (.mdf/.ndf), log (.ldf), tempdb e todo backup gerado depois.
  Quem roubar o disco ou um .bak não lê nada sem o certificado abaixo.
  Isso soma à cifra de coluna da API (prefixo "cf1:"), que protege os dados sensíveis até do próprio DBA.

  Requer SQL Server 2019+ Standard/Enterprise/Developer, ou Azure SQL (já vem ligado).
  O LocalDB do desenvolvimento é Express e não tem TDE.

  Uso (sqlcmd, idempotente):
    sqlcmd -S <servidor> -U sa -P <senha> -C -b -i habilitar-tde.sql ^
      -v Banco=GestaoPsi SenhaChaveMestra=<forte> SenhaBackupCertificado=<forte> PastaBackupCertificado=/var/opt/mssql/chaves-tde

  OBRIGATÓRIO depois da primeira execução: copiar GestaoPsiTde.cer e GestaoPsiTde.pvk (e a senha do backup)
  para um cofre fora do servidor. Sem eles, nenhum backup pode ser restaurado em outra máquina.
*/
SET NOCOUNT ON;
USE master;

IF NOT EXISTS (SELECT 1 FROM sys.symmetric_keys WHERE name = '##MS_DatabaseMasterKey##')
BEGIN
    CREATE MASTER KEY ENCRYPTION BY PASSWORD = '$(SenhaChaveMestra)';
    PRINT 'Chave mestra criada.';
END

IF NOT EXISTS (SELECT 1 FROM sys.certificates WHERE name = 'GestaoPsiTde')
BEGIN
    CREATE CERTIFICATE GestaoPsiTde WITH SUBJECT = 'Vinculo - TDE do banco $(Banco)';
    -- O backup do certificado só é gerado na criação: ele é o que permite restaurar o banco em outro servidor.
    BACKUP CERTIFICATE GestaoPsiTde
        TO FILE = '$(PastaBackupCertificado)/GestaoPsiTde.cer'
        WITH PRIVATE KEY (
            FILE = '$(PastaBackupCertificado)/GestaoPsiTde.pvk',
            ENCRYPTION BY PASSWORD = '$(SenhaBackupCertificado)');
    PRINT 'Certificado criado e copiado para $(PastaBackupCertificado). Guarde os dois arquivos fora do servidor.';
END
GO

USE [$(Banco)];

IF NOT EXISTS (SELECT 1 FROM sys.dm_database_encryption_keys WHERE database_id = DB_ID())
BEGIN
    CREATE DATABASE ENCRYPTION KEY
        WITH ALGORITHM = AES_256
        ENCRYPTION BY SERVER CERTIFICATE GestaoPsiTde;
    PRINT 'Chave de cifra do banco criada.';
END
GO

IF (SELECT is_encrypted FROM sys.databases WHERE name = '$(Banco)') = 0
    ALTER DATABASE [$(Banco)] SET ENCRYPTION ON;
GO

-- encryption_state: 2 = cifrando, 3 = cifrado.
SELECT DB_NAME(database_id) AS Banco, encryption_state AS Estado, percent_complete AS Percentual, key_algorithm AS Algoritmo, key_length AS Bits
FROM sys.dm_database_encryption_keys
WHERE database_id = DB_ID('$(Banco)');
GO
