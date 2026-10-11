# Backup of the site: a Postgres dump + the uploaded media, then an optional copy off the machine.
#   powershell -ExecutionPolicy Bypass -File scripts\backup.ps1              (local dev database container "pentox-db")
#   powershell -ExecutionPolicy Bypass -File scripts\backup.ps1 -Prod        (docker compose production stack)
# On the VPS use scripts/backup.sh instead (this script is for Windows machines, e.g. backing up the staging copy).
#
# Settings (parameters or environment variables):
#   -BackupDir / BACKUP_DIR        where backups go (default .\backups)
#   -KeepDays / BACKUP_KEEP_DAYS   delete backups older than this (default 14)
#   -OffsiteDir / BACKUP_OFFSITE_DIR   a folder on another drive / synced cloud folder (OneDrive, Google Drive...)
#   BACKUP_RCLONE_REMOTE           e.g. "gdrive:pentox-backups" (needs rclone installed and configured)   TODO
# Without an off-site setting the script warns: backups on the same machine are lost with the machine.
param(
  [switch]$Prod,
  [string]$BackupDir = $(if ($env:BACKUP_DIR) { $env:BACKUP_DIR } else { '.\backups' }),
  [int]$KeepDays = $(if ($env:BACKUP_KEEP_DAYS) { [int]$env:BACKUP_KEEP_DAYS } else { 14 }),
  [string]$OffsiteDir = $env:BACKUP_OFFSITE_DIR,
  [string]$Container = 'pentox-db'
)
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')

function Read-DotEnv($path) {
  $values = @{}
  if (Test-Path $path) {
    foreach ($line in Get-Content $path) {
      if ($line -match '^\s*([A-Z0-9_]+)\s*=\s*(.*)$') { $values[$Matches[1]] = $Matches[2].Trim('"') }
    }
  }
  return $values
}

$envFile = if ($Prod) { Read-DotEnv '.env.prod' } else { Read-DotEnv '.env' }
$dbUser = if ($envFile.POSTGRES_USER) { $envFile.POSTGRES_USER } else { 'pentox' }
$dbName = if ($envFile.POSTGRES_DB) { $envFile.POSTGRES_DB } else { 'pentox' }

New-Item -ItemType Directory -Force $BackupDir | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$dbFile = Join-Path $BackupDir "db-$stamp.dump"
$mediaFile = Join-Path $BackupDir "media-$stamp.zip"

Write-Host "==> [$stamp] Dumping the database"
# Dump inside the container into a temp file, then copy it out: piping binary data through PowerShell 5.1 corrupts it.
if ($Prod) {
  docker compose --env-file .env.prod -f docker-compose.prod.yml exec -T db sh -c "pg_dump -U $dbUser -d $dbName --format=custom -f /tmp/backup.dump"
  $dbContainer = (docker compose --env-file .env.prod -f docker-compose.prod.yml ps -q db)
} else {
  docker exec $Container sh -c "pg_dump -U $dbUser -d $dbName --format=custom -f /tmp/backup.dump"
  $dbContainer = $Container
}
if ($LASTEXITCODE -ne 0) { throw 'pg_dump failed' }
docker cp "${dbContainer}:/tmp/backup.dump" $dbFile
if ($LASTEXITCODE -ne 0) { throw 'could not copy the dump out of the container' }
docker exec $dbContainer rm -f /tmp/backup.dump | Out-Null
if ((Get-Item $dbFile).Length -eq 0) { Remove-Item $dbFile; throw 'The database dump is empty' }

Write-Host '==> Archiving media'
if (Test-Path '.\media') {
  Compress-Archive -Path '.\media\*' -DestinationPath $mediaFile -Force
} else {
  Write-Warning 'No .\media folder here: media not backed up (on the VPS the media is in a Docker volume, use backup.sh).'
  $mediaFile = $null
}

Write-Host "==> Removing backups older than $KeepDays days"
Get-ChildItem $BackupDir -File | Where-Object {
  ($_.Name -like 'db-*.dump' -or $_.Name -like 'media-*.zip') -and $_.LastWriteTime -lt (Get-Date).AddDays(-$KeepDays)
} | Remove-Item -Force

Write-Host '==> Copying off this machine'
$copied = $false
if ($OffsiteDir) {
  New-Item -ItemType Directory -Force $OffsiteDir | Out-Null
  Copy-Item $dbFile $OffsiteDir
  if ($mediaFile) { Copy-Item $mediaFile $OffsiteDir }
  $copied = $true
}
if ($env:BACKUP_RCLONE_REMOTE) {
  rclone copy $dbFile $env:BACKUP_RCLONE_REMOTE
  if ($mediaFile) { rclone copy $mediaFile $env:BACKUP_RCLONE_REMOTE }
  $copied = $true
}
if (-not $copied) {
  Write-Warning 'No off-site copy configured (-OffsiteDir or BACKUP_RCLONE_REMOTE). These backups exist only on this machine.'
}

Write-Host "Done: $dbFile $mediaFile"
Write-Host "Restore the database with: docker exec -i $Container pg_restore -U $dbUser -d $dbName --clean --if-exists < file  (see docs/DEPLOY-HOSTINGER.md)"
