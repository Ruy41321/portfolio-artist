# Deploy

[English](../en/DEPLOY.md) · **Italiano**

Questa guida porta online un portfolio su un server con Docker. È pensata per una persona tecnica; l'artista userà poi solo il pannello (vedi [GUIDA-ARTISTA.md](GUIDA-ARTISTA.md)).

**Architettura.** Lo stack `compose.prod.yml` contiene tre servizi:

| Servizio | Cosa fa | Esposto |
|---|---|---|
| `app` | sito pubblico + pannello `/admin` (Next.js + Payload), applica le migrazioni all'avvio | `127.0.0.1:${APP_PORT}` (HTTP) |
| `postgres` | database PostgreSQL 17 (volume `pgdata`) | no |
| `backup` | dump del database e archivio delle immagini ogni `BACKUP_INTERVAL_HOURS` ore | no |

Le immagini caricate stanno nel volume `media`. **HTTPS non è gestito dal progetto**: lo fornisce il reverse proxy o il pannello dell'hosting, che inoltra le richieste a `http://127.0.0.1:${APP_PORT}`.

---

## Requisiti

- Linux con **Docker Engine 24+** e **Docker Compose v2** (`docker compose version`).
- Un dominio che punta al server e un reverse proxy con certificato TLS (nginx, Caddy, Traefik o il proxy del pannello di hosting).
- 1 vCPU e 1 GB di RAM bastano; spazio disco secondo le immagini caricate (più i backup).
- Architetture supportate dall'immagine: `amd64` e `arm64`.

## (a) Server proprio con Docker dietro un reverse proxy

### 1. Prepara la cartella

```bash
git clone https://github.com/ruy41321/portfolio-artist.git portfolio
cd portfolio
```

In alternativa basta copiare sul server `compose.prod.yml`, `docker/backup/backup.sh` e la cartella `scripts/`.

### 2. Genera `.env`

```bash
./scripts/setup.sh
# oppure, senza domande:
SITE_URL=https://www.esempio.it APP_PORT=3000 ./scripts/setup.sh
```

Lo script crea `.env` (permessi `600`) con `PAYLOAD_SECRET` e `POSTGRES_PASSWORD` casuali. Le variabili `SITE_URL` e `APP_PORT` sono solo le risposte allo script, non la configurazione dell'app. Puoi anche scrivere `.env` a mano (per esempio su Windows senza Git Bash) partendo da `.env.example`: servono almeno `NEXT_PUBLIC_SERVER_URL`, `PAYLOAD_SECRET`, `POSTGRES_PASSWORD` e `APP_PORT`. Per l'email del form contatti aggiungi le variabili `SMTP_*` (vedi `.env.example`). `NEXT_PUBLIC_SERVER_URL` deve essere **esattamente** l'indirizzo pubblico (schema e dominio, senza `/` finale): il pannello accetta richieste solo da lì.

### 3. Avvia

```bash
docker compose -f compose.prod.yml up -d          # immagine pubblicata su GHCR
docker compose -f compose.prod.yml up -d --build  # oppure build dal sorgente
docker compose -f compose.prod.yml ps             # app deve risultare "healthy"
curl -fsS http://127.0.0.1:3000/api/health        # {"status":"ok"}
```

Per fissare una versione: `APP_IMAGE=ghcr.io/ruy41321/portfolio-artist:1.0.0` in `.env`.

**L'immagine su GHCR.** GitHub Container Registry (`ghcr.io`) è l'archivio di immagini Docker di GitHub. Il workflow `release.yml` costruisce l'immagine (amd64 e arm64) e la pubblica a ogni tag `v*` (es. `git tag v1.0.0 && git push origin v1.0.0`), con i tag `1.0.0`, `1.0`, `1` e `latest`. Prima del primo tag l'immagine non esiste: usa `--build`. Se il repository è privato lo è anche l'immagine: rendila pubblica da *GitHub → Packages → portfolio-artist → Package settings*, oppure esegui sul server `docker login ghcr.io` con il tuo utente GitHub e un Personal Access Token con permesso `read:packages`.

### 4. Configura il reverse proxy

Inoltra tutto il traffico del dominio a `http://127.0.0.1:${APP_PORT}` passando `Host` e gli header `X-Forwarded-*`. Consenti upload grandi almeno quanto `MAX_UPLOAD_MB` (default 20 MB).

**nginx**

```nginx
server {
    listen 443 ssl http2;
    server_name www.esempio.it;
    # ssl_certificate / ssl_certificate_key: i tuoi certificati (es. certbot)

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
    server_name www.esempio.it;
    return 301 https://$host$request_uri;
}
```

**Caddy** (certificati automatici)

```caddyfile
www.esempio.it {
    encode zstd gzip
    request_body {
        max_size 25MB
    }
    header Strict-Transport-Security "max-age=31536000; includeSubDomains"
    reverse_proxy 127.0.0.1:3000
}
```

**Traefik** (se Traefik gira in Docker sulla rete `traefik`): crea `compose.override.yml` accanto a `compose.prod.yml` e avvia con `docker compose -f compose.prod.yml -f compose.override.yml up -d`.

```yaml
services:
  app:
    ports: !reset []
    networks: [default, traefik]
    labels:
      - traefik.enable=true
      - traefik.docker.network=traefik
      - traefik.http.routers.portfolio.rule=Host(`www.esempio.it`)
      - traefik.http.routers.portfolio.entrypoints=websecure
      - traefik.http.routers.portfolio.tls.certresolver=letsencrypt
      - traefik.http.services.portfolio.loadbalancer.server.port=3000
      - traefik.http.middlewares.portfolio-hsts.headers.stsSeconds=31536000
      - traefik.http.routers.portfolio.middlewares=portfolio-hsts
networks:
  traefik:
    external: true
```

Se Traefik gira sull'host (non in Docker), usa un file di configurazione dinamica con `url: http://127.0.0.1:3000`.

### 5. Primo accesso

Apri `https://www.esempio.it/admin`: la prima volta compare *Crea il primo utente*. Crea l'utente dell'artista (o il tuo, e poi uno per l'artista da *Impostazioni → Utenti*). Il sito mostra uno stato vuoto finché non viene pubblicata la prima opera.

## (b) Aruba

- L'**hosting condiviso** (Hosting Linux/Windows, WordPress) **non** permette di eseguire applicazioni Node.js o container Docker: non è adatto.
- Serve un prodotto con accesso root e Docker: **Aruba Cloud VPS** o **Aruba Cloud Server (Cloud PRO)** con Ubuntu/Debian.
  1. Crea il server (consigliato almeno 1 vCPU, 2 GB RAM) e installa Docker: `curl -fsSL https://get.docker.com | sh`.
  2. Nel pannello DNS di Aruba punta il record `A` (e `www`) all'IP pubblico del server.
  3. Installa un reverse proxy con certificati automatici, per esempio Caddy (`apt install caddy`) con il Caddyfile sopra.
  4. Segui i passi 1–5 della sezione (a).
- Apri sul firewall del Cloud Server solo le porte 22, 80 e 443: l'app resta su `127.0.0.1`.

## Aggiornamenti

```bash
./scripts/backup.sh                                  # backup prima di aggiornare
docker compose -f compose.prod.yml pull              # nuova immagine
docker compose -f compose.prod.yml up -d             # riavvio: le migrazioni partono da sole
docker compose -f compose.prod.yml logs app --tail 50
```

Con il sorgente: `git pull && docker compose -f compose.prod.yml up -d --build`.

## Backup e ripristino

Il servizio `backup` crea nella cartella `./backups` (o `BACKUP_DIR`):

- `db-AAAAMMGG-HHMMSS.dump` — dump PostgreSQL (formato custom)
- `media-AAAAMMGG-HHMMSS.tar.gz` — tutte le immagini e i PDF caricati

I file più vecchi di `BACKUP_RETENTION_DAYS` giorni (default 14) vengono eliminati. Copia periodicamente `./backups` **fuori dal server** (rsync, rclone, snapshot del provider).

```bash
./scripts/backup.sh     # backup immediato
./scripts/restore.sh backups/db-20261012-030000.dump backups/media-20261012-030000.tar.gz
```

Il ripristino ferma l'app, sostituisce database e immagini e ricrea il container (la cache delle pagine riparte pulita). Lo script chiede conferma; `RESTORE_YES=1` la salta. Per spostare il sito su un altro server: `setup.sh` sul nuovo server, `up -d`, copia dei file di backup, `restore.sh`.

## Risoluzione dei problemi

| Sintomo | Causa probabile e soluzione |
|---|---|
| `app` resta *unhealthy*, nei log `cannot connect to Postgres: password authentication failed` | Il volume `pgdata` è stato creato con un'altra password. Ripristina la password originale in `.env` oppure, su un'installazione nuova, `docker compose -f compose.prod.yml down -v` (cancella i dati!). |
| Nel pannello i campi sono grigi o il salvataggio non funziona | Stai usando un indirizzo diverso da `NEXT_PUBLIC_SERVER_URL` (es. l'IP): la protezione CSRF blocca le richieste. Usa il dominio configurato oppure correggi la variabile e riavvia. |
| Link, sitemap o anteprime social puntano a `localhost` | `NEXT_PUBLIC_SERVER_URL` non è impostato correttamente. Correggilo e `up -d`. |
| `ERROR: the media folder /app/media is not writable` | Permessi del volume media: `docker compose -f compose.prod.yml run --rm -u 0 --entrypoint chown app -R 1001:1001 /app/media`. |
| Upload di immagini grandi fallisce con 413 | Aumenta `client_max_body_size` (nginx) / `max_size` (Caddy) e, se serve, `MAX_UPLOAD_MB`. |
| Le email del form non arrivano | Controlla le variabili `SMTP_*` e i log (`docker compose -f compose.prod.yml logs app`, cerca "mail"). I messaggi restano comunque in *Messaggi* nel pannello. |
| Una modifica non compare sul sito | Le pagine si aggiornano al salvataggio. Se hai una CDN davanti, svuotane la cache; altrimenti `docker compose -f compose.prod.yml up -d --force-recreate app` (ricrea il container e svuota la cache delle pagine). |
| La porta 3000 è già occupata | Cambia `APP_PORT` in `.env` e aggiorna il reverse proxy. |

Log utili: `docker compose -f compose.prod.yml logs -f app` e `... logs backup`.
