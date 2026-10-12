# Imagem de build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY GestaoPsi.Api.csproj ./
RUN dotnet restore GestaoPsi.Api.csproj
COPY . ./
RUN dotnet publish GestaoPsi.Api.csproj -c Release -o /app/publish --no-restore

# Job separado de migracao: o runtime da API nao recebe SDK nem ferramentas EF.
FROM build AS bundle
RUN dotnet tool install --tool-path /tools dotnet-ef --version 10.0.9
RUN /tools/dotnet-ef migrations bundle --configuration Release --no-build --output /app/efbundle

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS migracoes
WORKDIR /app
COPY --from=bundle /app/efbundle ./efbundle
COPY --from=build /src/appsettings.json ./appsettings.json
ENTRYPOINT ["/app/efbundle"]

# Imagem de execucao
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
COPY --from=build /app/publish ./
USER $APP_UID
ENTRYPOINT ["dotnet", "GestaoPsi.Api.dll"]
