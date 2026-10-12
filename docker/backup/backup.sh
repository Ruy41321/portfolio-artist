#!/bin/sh
# Backups of the database (pg_dump, custom format) and of the media volume (tar.gz).
#   backup.sh once   → one backup now
#   backup.sh loop   → one backup now, then every BACKUP_INTERVAL_HOURS
# Files older than BACKUP_RETENTION_DAYS are deleted from /backups.
set -eu

BACKUP_DIR=/backups
INTERVAL_HOURS=${BACKUP_INTERVAL_HOURS:-24}
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-14}

run_backup() {
  stamp=$(date -u +%Y%m%d-%H%M%S)
  mkdir -p "$BACKUP_DIR"
  echo "[backup] $stamp: dumping database"
  pg_dump --format=custom --no-owner --file="$BACKUP_DIR/db-$stamp.dump.tmp"
  mv "$BACKUP_DIR/db-$stamp.dump.tmp" "$BACKUP_DIR/db-$stamp.dump"
  echo "[backup] $stamp: archiving media"
  tar -czf "$BACKUP_DIR/media-$stamp.tar.gz.tmp" -C /data/media .
  mv "$BACKUP_DIR/media-$stamp.tar.gz.tmp" "$BACKUP_DIR/media-$stamp.tar.gz"
  find "$BACKUP_DIR" -maxdepth 1 -type f \( -name 'db-*.dump' -o -name 'media-*.tar.gz' \) \
    -mtime +"$RETENTION_DAYS" -print -delete
  echo "[backup] $stamp: done"
}

case "${1:-once}" in
  once) run_backup ;;
  loop)
    until pg_isready -q; do sleep 2; done
    while true; do
      run_backup || echo "[backup] FAILED" >&2
      sleep $((INTERVAL_HOURS * 3600))
    done
    ;;
  *) echo "usage: backup.sh once|loop" >&2; exit 2 ;;
esac
