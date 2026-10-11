#!/usr/bin/env bash
# Backup of the production site: a Postgres dump + the uploaded media, then a copy off the server.
#   bash scripts/backup.sh                 (run from the project folder on the VPS)
# Schedule it daily:  crontab -e  ->  30 3 * * * cd /opt/pentox && bash scripts/backup.sh >> backups/backup.log 2>&1
#
# Settings (environment variables, or put them in .env.prod):
#   BACKUP_DIR        where backups are kept on the server            (default: ./backups)
#   BACKUP_KEEP_DAYS  delete local backups older than this            (default: 14)
#   BACKUP_RCLONE_REMOTE  off-server copy with rclone, e.g. "gdrive:pentox-backups"      (TODO: configure `rclone config`)
#   BACKUP_SCP_TARGET     off-server copy with scp, e.g. "user@other-server:/backups/pentox/"   (needs an SSH key)
# If neither off-server setting is present the script warns loudly: a backup that lives only on the same server is
# lost together with the server.
set -euo pipefail

cd "$(dirname "$0")/.."
if [ -f .env.prod ]; then set -a; source .env.prod; set +a; fi
: "${POSTGRES_USER:?Set POSTGRES_USER (.env.prod)}"
: "${POSTGRES_DB:?Set POSTGRES_DB (.env.prod)}"

BACKUP_DIR="${BACKUP_DIR:-./backups}"
KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"
STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

compose() { docker compose --env-file .env.prod -f docker-compose.prod.yml "$@"; }

echo "==> [$STAMP] Dumping the database"
DB_FILE="$BACKUP_DIR/db-$STAMP.dump"
compose exec -T db pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom > "$DB_FILE"
[ -s "$DB_FILE" ] || { echo "Database dump is empty, stopping."; rm -f "$DB_FILE"; exit 1; }

echo "==> Archiving the media volume"
MEDIA_FILE="$BACKUP_DIR/media-$STAMP.tar.gz"
MEDIA_VOLUME="$(docker volume ls -q --filter name='_media$' | head -n 1)"
if [ -n "$MEDIA_VOLUME" ]; then
  docker run --rm -v "$MEDIA_VOLUME":/media:ro -v "$(cd "$BACKUP_DIR" && pwd)":/out alpine \
    tar czf "/out/media-$STAMP.tar.gz" -C /media .
else
  echo "WARNING: media volume not found, media not backed up."
fi

echo "==> Removing local backups older than $KEEP_DAYS days"
find "$BACKUP_DIR" -maxdepth 1 -type f \( -name 'db-*.dump' -o -name 'media-*.tar.gz' \) -mtime +"$KEEP_DAYS" -delete

echo "==> Copying off the server"
COPIED=0
if [ -n "${BACKUP_RCLONE_REMOTE:-}" ]; then
  rclone copy "$DB_FILE" "$BACKUP_RCLONE_REMOTE"
  [ -f "$MEDIA_FILE" ] && rclone copy "$MEDIA_FILE" "$BACKUP_RCLONE_REMOTE"
  COPIED=1
fi
if [ -n "${BACKUP_SCP_TARGET:-}" ]; then
  scp "$DB_FILE" ${MEDIA_FILE:+"$MEDIA_FILE"} "$BACKUP_SCP_TARGET"
  COPIED=1
fi
if [ "$COPIED" -eq 0 ]; then
  echo "WARNING: no off-server copy configured (BACKUP_RCLONE_REMOTE or BACKUP_SCP_TARGET). These backups exist only on this server."
fi

echo "Done: $DB_FILE ${MEDIA_FILE}"
