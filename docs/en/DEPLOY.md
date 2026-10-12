# Deploy

**English** · [Italiano](../it/DEPLOY.md)

This guide puts a portfolio online on a server with Docker. It is meant for a technical person; the artist will then only use the admin panel (see [ARTIST-GUIDE.md](ARTIST-GUIDE.md)).

**Architecture.** The `compose.prod.yml` stack has three services:

| Service | What it does | Exposed |
|---|---|---|
| `app` | public site + `/admin` panel (Next.js + Payload), applies migrations at startup | `127.0.0.1:${APP_PORT}` (HTTP) |
| `postgres` | PostgreSQL 17 database (`pgdata` volume) | no |
| `backup` | database dump and image archive every `BACKUP_INTERVAL_HOURS` hours | no |

Uploaded images live in the `media` volume. **HTTPS is not handled by the project**: it is provided by the reverse proxy or the hosting panel, which forwards requests to `http://127.0.0.1:${APP_PORT}`.

---

## Requirements

- Linux with **Docker Engine 24+** and **Docker Compose v2** (`docker compose version`).
- A domain pointing to the server and a reverse proxy with a TLS certificate (nginx, Caddy, Traefik or the hosting panel's proxy).
- 1 vCPU and 1 GB of RAM are enough; disk space depends on the uploaded images (plus backups).
- Architectures supported by the image: `amd64` and `arm64`.

## (a) Your own server with Docker behind a reverse proxy

### 1. Prepare the folder

```bash
git clone https://github.com/ruy41321/portfolio-artist.git portfolio
cd portfolio
```

Alternatively, just copy `compose.prod.yml`, `docker/backup/backup.sh` and the `scripts/` folder to the server.

### 2. Generate `.env`

```bash
./scripts/setup.sh
# or, without questions:
SITE_URL=https://www.example.com APP_PORT=3000 ./scripts/setup.sh
```

The script creates `.env` (permissions `600`) with random `PAYLOAD_SECRET` and `POSTGRES_PASSWORD`. `SITE_URL` and `APP_PORT` are only the answers to the script, not the app configuration. You can also write `.env` by hand (for example on Windows without Git Bash) starting from `.env.example`: you need at least `NEXT_PUBLIC_SERVER_URL`, `PAYLOAD_SECRET`, `POSTGRES_PASSWORD` and `APP_PORT`. For the contact form email add the `SMTP_*` variables (see `.env.example`). `NEXT_PUBLIC_SERVER_URL` must be **exactly** the public address (scheme and domain, no trailing `/`): the admin only accepts requests from there.

### 3. Start

```bash
docker compose -f compose.prod.yml up -d          # image published on GHCR
docker compose -f compose.prod.yml up -d --build  # or build from source
docker compose -f compose.prod.yml ps             # app must be "healthy"
curl -fsS http://127.0.0.1:3000/api/health        # {"status":"ok"}
```

To pin a version: `APP_IMAGE=ghcr.io/ruy41321/portfolio-artist:1.0.0` in `.env`.

**The image on GHCR.** GitHub Container Registry (`ghcr.io`) is GitHub's Docker image registry. The `release.yml` workflow builds the image (amd64 and arm64) and publishes it on every `v*` tag (e.g. `git tag v1.0.0 && git push origin v1.0.0`), tagged `1.0.0`, `1.0`, `1` and `latest`. Before the first tag the image does not exist: use `--build`. If the repository is private, so is the image: make it public from *GitHub → Packages → portfolio-artist → Package settings*, or run `docker login ghcr.io` on the server with your GitHub user and a Personal Access Token with the `read:packages` scope.

### 4. Configure the reverse proxy

Forward all the domain's traffic to `http://127.0.0.1:${APP_PORT}`, passing `Host` and the `X-Forwarded-*` headers. Allow uploads at least as large as `MAX_UPLOAD_MB` (default 20 MB).

**nginx**

```nginx
server {
    listen 443 ssl http2;
    server_name www.example.com;
    # ssl_certificate / ssl_certificate_key: your certificates (e.g. certbot)

    client_max_body_size 25m;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name www.example.com;
    return 301 https://$host$request_uri;
}
```

**Caddy** (automatic certificates)

```caddyfile
www.example.com {
    encode zstd gzip
    request_body {
        max_size 25MB
    }
    header Strict-Transport-Security "max-age=31536000; includeSubDomains"
    reverse_proxy 127.0.0.1:3000
}
```

**Traefik** (if Traefik runs in Docker on the `traefik` network): create `compose.override.yml` next to `compose.prod.yml` and start with `docker compose -f compose.prod.yml -f compose.override.yml up -d`.

```yaml
services:
  app:
    ports: !reset []
    networks: [default, traefik]
    labels:
      - traefik.enable=true
      - traefik.docker.network=traefik
      - traefik.http.routers.portfolio.rule=Host(`www.example.com`)
      - traefik.http.routers.portfolio.entrypoints=websecure
      - traefik.http.routers.portfolio.tls.certresolver=letsencrypt
      - traefik.http.services.portfolio.loadbalancer.server.port=3000
      - traefik.http.middlewares.portfolio-hsts.headers.stsSeconds=31536000
      - traefik.http.routers.portfolio.middlewares=portfolio-hsts
networks:
  traefik:
    external: true
```

If Traefik runs on the host (not in Docker), use a dynamic configuration file with `url: http://127.0.0.1:3000`.

### 5. First access

Open `https://www.example.com/admin`: the first time it shows *Create first user*. Create the artist's user (or yours, and then one for the artist from *Settings → Users*). The site shows an empty state until the first artwork is published.

## (b) Aruba

- **Shared hosting** (Linux/Windows Hosting, WordPress) does **not** allow running Node.js apps or Docker containers: it is not suitable.
- You need a product with root access and Docker: **Aruba Cloud VPS** or **Aruba Cloud Server (Cloud PRO)** with Ubuntu/Debian.
  1. Create the server (at least 1 vCPU and 2 GB RAM recommended) and install Docker: `curl -fsSL https://get.docker.com | sh`.
  2. In Aruba's DNS panel point the `A` record (and `www`) to the server's public IP.
  3. Install a reverse proxy with automatic certificates, for example Caddy (`apt install caddy`) with the Caddyfile above.
  4. Follow steps 1–5 of section (a).
- Open only ports 22, 80 and 443 on the Cloud Server firewall: the app stays on `127.0.0.1`.

## Updates

```bash
./scripts/backup.sh                                  # backup before updating
docker compose -f compose.prod.yml pull              # new image
docker compose -f compose.prod.yml up -d             # restart: migrations run by themselves
docker compose -f compose.prod.yml logs app --tail 50
```

From source: `git pull && docker compose -f compose.prod.yml up -d --build`.

## Backup and restore

The `backup` service writes to the `./backups` folder (or `BACKUP_DIR`):

- `db-YYYYMMDD-HHMMSS.dump` — PostgreSQL dump (custom format)
- `media-YYYYMMDD-HHMMSS.tar.gz` — all uploaded images and PDFs

Files older than `BACKUP_RETENTION_DAYS` days (default 14) are deleted. Regularly copy `./backups` **off the server** (rsync, rclone, provider snapshots).

```bash
./scripts/backup.sh     # immediate backup
./scripts/restore.sh backups/db-20261012-030000.dump backups/media-20261012-030000.tar.gz
```

The restore stops the app, replaces database and images and recreates the container (the page cache starts clean). The script asks for confirmation; `RESTORE_YES=1` skips it. To move the site to another server: `setup.sh` on the new server, `up -d`, copy the backup files, `restore.sh`.

## Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| `app` stays *unhealthy*, logs show `cannot connect to Postgres: password authentication failed` | The `pgdata` volume was created with another password. Restore the original password in `.env` or, on a fresh installation, `docker compose -f compose.prod.yml down -v` (deletes the data!). |
| Fields in the admin are greyed out or saving does not work | You are using an address other than `NEXT_PUBLIC_SERVER_URL` (e.g. the IP): CSRF protection blocks the requests. Use the configured domain or fix the variable and restart. |
| Links, sitemap or social previews point to `localhost` | `NEXT_PUBLIC_SERVER_URL` is not set correctly. Fix it and run `up -d`. |
| `ERROR: the media folder /app/media is not writable` | Media volume permissions: `docker compose -f compose.prod.yml run --rm -u 0 --entrypoint chown app -R 1001:1001 /app/media`. |
| Uploading large images fails with 413 | Increase `client_max_body_size` (nginx) / `max_size` (Caddy) and, if needed, `MAX_UPLOAD_MB`. |
| Contact form emails do not arrive | Check the `SMTP_*` variables and the logs (`docker compose -f compose.prod.yml logs app`, look for "mail"). Messages are still stored in *Messages* in the admin. |
| A change does not show on the site | Pages refresh when you save. If a CDN sits in front, purge its cache; otherwise `docker compose -f compose.prod.yml up -d --force-recreate app` (recreates the container and clears the page cache). |
| Port 3000 is already in use | Change `APP_PORT` in `.env` and update the reverse proxy. |

Useful logs: `docker compose -f compose.prod.yml logs -f app` and `... logs backup`.
