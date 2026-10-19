#!/usr/bin/env bash
# Prepara um servidor novo: gera o .env de produção com senhas aleatórias e o certificado (PFX)
# que protege as chaves de cifra. Rode uma única vez, na raiz do repositório, no próprio servidor.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -e .env ] || [ -e segredos/chaves-protecao.pfx ]; then
  echo "Já existe .env ou segredos/chaves-protecao.pfx. Nada foi alterado." >&2
  exit 1
fi

read -rp "Domínio do sistema (ex.: app.seudominio.com.br): " dominio
read -rp "E-mail para avisos do certificado HTTPS: " email_acme
read -rp "Edição do SQL Server (Express ou a chave da Standard) [Express]: " edicao
edicao=${edicao:-Express}
read -rp "Servidor SMTP: " smtp
read -rp "Porta SMTP [587]: " porta
porta=${porta:-587}
read -rp "Usuário SMTP: " smtp_usuario
read -rsp "Senha SMTP: " smtp_senha; echo
read -rp "E-mail remetente: " remetente

aleatorio() { openssl rand -hex "$1"; }
senha_certificado=$(aleatorio 24)

umask 077
mkdir -p segredos backups
openssl req -x509 -newkey rsa:3072 -sha256 -days 3650 -nodes -subj "/CN=Vinculo chaves de dados" \
  -keyout segredos/chave.pem -out segredos/certificado.pem
openssl pkcs12 -export -inkey segredos/chave.pem -in segredos/certificado.pem \
  -out segredos/chaves-protecao.pfx -passout "pass:$senha_certificado"
rm -f segredos/chave.pem segredos/certificado.pem
# A API roda sem root dentro do contêiner: o arquivo precisa ser legível, a pasta continua fechada.
chmod 644 segredos/chaves-protecao.pfx

cat > .env <<EOF
DOMINIO=$dominio
EMAIL_ACME=$email_acme
SQL_EDICAO=$edicao

JWT_CHAVE=$(aleatorio 32)
HASH_CHAVE=$(openssl rand -base64 32)
SQL_SENHA=Vc!$(aleatorio 12)Aa1
REDIS_SENHA=$(aleatorio 16)
TDE_SENHA_CHAVE_MESTRA=Tm!$(aleatorio 12)Aa1
TDE_SENHA_BACKUP=Tb!$(aleatorio 12)Aa1
CERTIFICADO_CHAVES_SENHA=$senha_certificado

Email__ServidorSmtp=$smtp
Email__Porta=$porta
Email__UsarSsl=false
Email__Usuario=$smtp_usuario
Email__Senha=$smtp_senha
Email__EmailRemetente=$remetente

BACKUP_INTERVALO_HORAS=6
BACKUP_RETENCAO_DIAS=14
EOF

echo
echo "Pronto: .env e segredos/chaves-protecao.pfx criados."
echo "Guarde uma cópia dos dois num cofre fora deste servidor. Sem eles, os backups não podem ser lidos."
