#!/usr/bin/env bash
# Starts a PostgreSQL instance for development and tests, idempotently.
#
# - If Docker is available, it runs the `postgres` service from compose.yml.
# - Otherwise it uses a local PostgreSQL installation (installing it with apt if missing).
#
# In both cases it ensures the `portfolio` role and the `portfolio` / `portfolio_test`
# databases exist. Connection strings:
#   postgres://portfolio:portfolio@localhost:5432/portfolio
#   postgres://portfolio:portfolio@localhost:5432/portfolio_test
set -euo pipefail
cd "$(dirname "$0")/.."

DB_USER=${POSTGRES_USER:-portfolio}
DB_PASSWORD=${POSTGRES_PASSWORD:-portfolio}
DB_NAME=${POSTGRES_DB:-portfolio}
TEST_DB_NAME=${DB_NAME}_test
FORCE_LOCAL=${DEV_DB_LOCAL:-}

wait_ready() {
  for _ in $(seq 1 60); do
    if "$@" >/dev/null 2>&1; then return 0; fi
    sleep 1
  done
  echo "PostgreSQL did not become ready in time" >&2
  return 1
}

if [[ -z "$FORCE_LOCAL" ]] && command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  echo "Starting PostgreSQL with Docker…"
  docker compose up -d postgres
  wait_ready docker compose exec -T postgres pg_isready -U "$DB_USER" -d "$DB_NAME"
  docker compose exec -T postgres psql -U "$DB_USER" -d postgres -tc \
    "SELECT 1 FROM pg_database WHERE datname = '$TEST_DB_NAME'" | grep -q 1 ||
    docker compose exec -T postgres psql -U "$DB_USER" -d postgres -c "CREATE DATABASE \"$TEST_DB_NAME\" OWNER \"$DB_USER\""
else
  echo "Docker not available: using a local PostgreSQL installation…"
  SUDO=""
  [[ $(id -u) -ne 0 ]] && SUDO="sudo"
  if ! command -v pg_ctlcluster >/dev/null 2>&1 && ! command -v pg_ctl >/dev/null 2>&1; then
    $SUDO apt-get update -y
    $SUDO apt-get install -y postgresql
  fi
  $SUDO service postgresql start
  as_postgres() { $SUDO -u postgres "$@" 2>/dev/null || su postgres -c "$(printf '%q ' "$@")"; }
  wait_ready as_postgres pg_isready
  as_postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname = '$DB_USER'" | grep -q 1 ||
    as_postgres psql -c "CREATE ROLE \"$DB_USER\" LOGIN CREATEDB PASSWORD '$DB_PASSWORD'"
  for db in "$DB_NAME" "$TEST_DB_NAME"; do
    as_postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = '$db'" | grep -q 1 ||
      as_postgres psql -c "CREATE DATABASE \"$db\" OWNER \"$DB_USER\""
  done
fi

echo "PostgreSQL ready:"
echo "  DATABASE_URL=postgres://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
echo "  TEST_DATABASE_URL=postgres://$DB_USER:$DB_PASSWORD@localhost:5432/$TEST_DB_NAME"
