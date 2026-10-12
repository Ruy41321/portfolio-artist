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

mkdir -p "${MEDIA_DIR:-/app/media}"

exec node server.js
