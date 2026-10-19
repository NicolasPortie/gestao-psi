# Implantação em produção

Este guia sobe o Vínculo num servidor próprio com HTTPS, e-mail e backup automático.
Tudo roda em Docker: `docker-compose.yml` define os serviços e `docker-compose.producao.yml`
ajusta para produção.

## O que é preciso

- **Servidor Linux** (por exemplo Ubuntu 24.04) com pelo menos 2 vCPU, 4 GB de memória e 40 GB de disco,
  com Docker e o plugin Compose instalados. O SQL Server sozinho pede 2 GB de memória.
- **Domínio** com um registro `A` apontando para o IP do servidor e as portas 80 e 443 liberadas.
  O certificado HTTPS é emitido e renovado sozinho pelo Caddy (Let's Encrypt).
- **SMTP transacional** (Amazon SES, Brevo, Resend, Google Workspace etc.). Sem e-mail não há
  confirmação de cadastro nem recuperação de senha. Na porta 587 a conexão usa STARTTLS; na 465,
  defina `Email__UsarSsl=true` no `.env`.
- **Edição do SQL Server**, informada em `SQL_EDICAO`:

  | Edição | Custo | Limite | TDE (disco do banco cifrado) |
  | --- | --- | --- | --- |
  | `Express` | gratuita | 10 GB por banco | não |
  | `Standard` (chave do produto) | licença paga | sem limite prático | sim |

  A imagem padrão sobe como Developer, que a licença proíbe em produção; por isso a variável é obrigatória.
  Nos dois casos os dados pessoais e clínicos já chegam ao banco cifrados pela API (prefixo `cf1:`).
  Com Express, ative também a cifra de disco do servidor, que a maioria dos provedores oferece.

## Primeira subida

Na raiz do repositório, no servidor:

```bash
bash infra/gerar-segredos.sh
docker compose -f docker-compose.yml -f docker-compose.producao.yml up -d --build
```

O primeiro comando pergunta domínio, e-mail e SMTP, gera senhas aleatórias no `.env` e cria
`segredos/chaves-protecao.pfx`, o certificado que cifra as chaves dos dados. O segundo constrói as
imagens, aplica as migrações, liga o TDE quando a edição permite e sobe tudo.

Confira:

```bash
docker compose -f docker-compose.yml -f docker-compose.producao.yml ps
curl https://SEU-DOMINIO/api/v1/saude
docker compose -f docker-compose.yml -f docker-compose.producao.yml logs backup
```

A saúde deve responder `{"status":"Disponivel"}` e o log do backup terminar em `Backup concluído`.
Abra `https://SEU-DOMINIO` e crie a primeira conta: o código de confirmação chega por e-mail.

## O que guardar fora do servidor

Sem estes arquivos, nenhum backup pode ser lido. Guarde-os num cofre (gerenciador de senhas ou
armazenamento cifrado), **separados** da cópia dos backups:

- `.env` (senhas, chaves de JWT e de hash, senhas do TDE);
- `segredos/chaves-protecao.pfx`;
- `backups/chaves/GestaoPsiTde.cer` e `GestaoPsiTde.pvk`, quando a edição for Standard.

## Backups

O serviço `backup` roda logo ao subir e depois a cada `BACKUP_INTERVALO_HORAS` (padrão 6 h), e guarda
`BACKUP_RETENCAO_DIAS` dias (padrão 14) em `backups/`:

- `backups/banco/GestaoPsi-AAAAMMDD-HHMM.bak`: banco completo, verificado com `RESTORE VERIFYONLY`;
- `backups/chaves/protecao-dados-AAAAMMDD-HHMM.txt`: o chaveiro da API no mesmo instante, cifrado pelo PFX.

O banco usa o modelo de recuperação simples, então o ponto de recuperação é o último backup: com o
padrão, perde-se no máximo 6 horas. Diminua o intervalo se precisar de menos.

Backup que fica só no servidor some junto com ele. Copie a pasta para fora com frequência, por exemplo
com `rclone` num agendamento do `cron`:

```bash
0 */6 * * * rclone sync /caminho/do/repositorio/backups remoto:vinculo-backups
```

## Restaurar

Coloque o `.bak` e o `.txt` de chaves do mesmo horário em `backups/banco` e `backups/chaves`, garanta que
`.env` e `segredos/chaves-protecao.pfx` são os originais, e rode:

```bash
bash infra/restaurar-backup.sh GestaoPsi-AAAAMMDD-HHMM.bak
```

O script para a API, recria o certificado do TDE quando ele existe, restaura o banco e o chaveiro e sobe
o sistema de novo. Ele substitui o banco atual. Teste a restauração num servidor separado de tempos em
tempos: backup que nunca foi restaurado não é garantia.

## Atualizar

```bash
git pull
docker compose -f docker-compose.yml -f docker-compose.producao.yml up -d --build
```

As migrações rodam antes da API. Antes de atualizar, confira que o último backup terminou bem.

## Antes de abrir para outros psicólogos

- Revise os termos de uso e a política de privacidade com assessoria jurídica. O sistema guarda dados de
  saúde, que a LGPD trata como sensíveis.
- Defina o canal de contato e o encarregado de dados, e coloque os dois na política de privacidade.
- Ao mudar os termos, aumente `Seguranca:VersaoTermosUso` e a versão em `frontend/src/app/features/legal/documento-legal.tsx`.
