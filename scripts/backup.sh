#!/usr/bin/env bash
# Runs a backup right now (database + media) into ./backups (or BACKUP_DIR).
set -euo pipefail
cd "$(dirname "$0")/.."
docker compose -f compose.prod.yml exec -T backup /bin/sh /backup/backup.sh once
ls -lh "${BACKUP_DIR:-./backups}" | tail -n 4
