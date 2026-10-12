#!/bin/sh
# Container entrypoint: checks the environment, then starts the Next.js standalone server.
# Database migrations are applied by Payload at boot (see src/instrumentation.ts).
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set" >&2
  exit 1
fi
if [ -z "${PAYLOAD_SECRET:-}" ]; then
  echo "ERROR: PAYLOAD_SECRET is not set" >&2
  exit 1
fi

MEDIA_DIR=${MEDIA_DIR:-/app/media}
mkdir -p "$MEDIA_DIR"
if ! touch "$MEDIA_DIR/.write-test" 2>/dev/null; then
  echo "ERROR: the media folder $MEDIA_DIR is not writable by user $(id -u)." >&2
  echo "Fix it with: docker compose run --rm -u 0 --entrypoint chown app -R 1001:1001 $MEDIA_DIR" >&2
  exit 1
fi
rm -f "$MEDIA_DIR/.write-test"

exec node server.js
