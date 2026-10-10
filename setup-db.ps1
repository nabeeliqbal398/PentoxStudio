$compose = @'
services:
  db:
    image: pgvector/pgvector:pg17
    container_name: pentox-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: pentox
      POSTGRES_PASSWORD: pentox_dev_pass
      POSTGRES_DB: pentox
    ports:
      - "127.0.0.1:5432:5432"
    volumes:
      - pentox_pgdata:/var/lib/postgresql/data
volumes:
  pentox_pgdata:
'@
$composePath = Join-Path $PSScriptRoot "docker-compose.yml"
if (Test-Path $composePath) {
  Write-Host "docker-compose.yml exists, skipping"
} else {
  [IO.File]::WriteAllText($composePath, $compose)
}
Set-Location $PSScriptRoot
docker compose up -d
Write-Host "Waiting for Postgres to start..."
Start-Sleep -Seconds 8
docker exec pentox-db psql -U pentox -d pentox -c "SELECT version();"
docker exec pentox-db psql -U pentox -d pentox -c "CREATE EXTENSION IF NOT EXISTS vector;"
docker exec pentox-db psql -U pentox -d pentox -c "SELECT extname, extversion FROM pg_extension;"
Write-Host "DONE - DATABASE_URL=postgres://pentox:pentox_dev_pass@localhost:5432/pentox" -ForegroundColor Green
