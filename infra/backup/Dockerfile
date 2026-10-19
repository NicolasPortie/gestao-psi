# Mesma imagem do banco (traz o sqlcmd) mais o redis-cli para exportar o chaveiro.
FROM mcr.microsoft.com/mssql/server:2022-latest
USER root
RUN apt-get update \
 && apt-get install -y --no-install-recommends redis-tools \
 && rm -rf /var/lib/apt/lists/*
COPY backup.sh /usr/local/bin/backup.sh
RUN sed -i 's/\r$//' /usr/local/bin/backup.sh && chmod 755 /usr/local/bin/backup.sh
ENTRYPOINT ["/usr/local/bin/backup.sh"]
