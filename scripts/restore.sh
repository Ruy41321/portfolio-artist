#!/usr/bin/env bash
# Restores a backup made by the backup service.
#   ./scripts/restore.sh backups/db-YYYYMMDD-HHMMSS.dump [backups/media-YYYYMMDD-HHMMSS.tar.gz]
# The app is stopped during the restore and started again at the end.
set -euo pipefail
cd "$(dirname "$0")/.."

DB_DUMP=${1:?usage: restore.sh <db-dump> [media-archive]}
MEDIA_ARCHIVE=${2:-}
COMPOSE="docker compose -f compose.prod.yml"

[[ -f "$DB_DUMP" ]] || { echo "Database dump not found: $DB_DUMP" >&2; exit 1; }
[[ -z "$MEDIA_ARCHIVE" || -f "$MEDIA_ARCHIVE" ]] || { echo "Media archive not found: $MEDIA_ARCHIVE" >&2; exit 1; }

echo "This replaces the current database${MEDIA_ARCHIVE:+ and media} with the backup."
if [[ "${RESTORE_YES:-}" != "1" ]]; then
  read -r -p "Continue? [y/N] " answer
  [[ "$answer" =~ ^[yY]$ ]] || exit 1
fi

$COMPOSE stop app
$COMPOSE up -d postgres
$COMPOSE exec -T postgres sh -c 'until pg_isready -q -U "$POSTGRES_USER"; do sleep 1; done'

echo "Restoring database…"
$COMPOSE exec -T postgres sh -c 'psql -q -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "drop schema public cascade; create schema public;"'
$COMPOSE exec -T postgres sh -c 'pg_restore --no-owner --exit-on-error -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < "$DB_DUMP"

if [[ -n "$MEDIA_ARCHIVE" ]]; then
  echo "Restoring media…"
  $COMPOSE run --rm --no-deps -T --entrypoint sh -v "$(realpath "$MEDIA_ARCHIVE"):/restore/media.tar.gz:ro" \
    -u 0 app -c 'find /app/media -mindepth 1 -delete && tar -xzf /restore/media.tar.gz -C /app/media && chown -R 1001:1001 /app/media'
fi

# Recreate the container so that no page cached before the restore is served.
$COMPOSE up -d --force-recreate app
echo "Restore complete."
