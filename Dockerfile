# syntax=docker/dockerfile:1

# ── Base ────────────────────────────────────────────────────
FROM node:24-alpine AS base
ENV NEXT_TELEMETRY_DISABLED=1 \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
WORKDIR /app

# ── Dependencies ────────────────────────────────────────────
FROM base AS deps
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
# Optional build secret `extra_ca`: extra CA certificates for builds behind a TLS-intercepting proxy
#   docker build --secret id=extra_ca,src=/path/to/ca.crt .
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    --mount=type=secret,id=extra_ca \
    if [ -f /run/secrets/extra_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/extra_ca; fi; \
    pnpm install --frozen-lockfile

# ── Build ───────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build-time placeholders: no database is reached during `next build`.
ENV NODE_ENV=production
RUN DATABASE_URL=postgres://build:build@localhost:5432/build \
    PAYLOAD_SECRET=build-time-placeholder \
    npm run build

# ── Runtime ─────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    MEDIA_DIR=/app/media

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 -G nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --chown=nextjs:nodejs docker/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN mkdir -p /app/media && chown nextjs:nodejs /app/media
VOLUME ["/app/media"]

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/api/health" >/dev/null || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
