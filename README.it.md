# Portfolio Artist

[English](README.md) · **Italiano**

Sito portfolio **generico e personalizzabile** per artisti professionisti, con un **pannello di amministrazione semplice** da cui l'artista gestisce biografia, opere, categorie e messaggi senza competenze tecniche. Un'installazione = un artista, distribuita con **Docker**.

![Il sito pubblico con il tema Atelier Notturno](docs/images/it/site-home.jpg)

| Galleria | Schede | Lightbox |
|---|---|---|
| ![Vista galleria](docs/images/it/site-gallery.jpg) | ![Vista schede](docs/images/it/site-cards.jpg) | ![Lightbox](docs/images/it/site-lightbox.jpg) |

| Pannello: benvenuto | Pannello: modifica di un'opera | Mobile |
|---|---|---|
| ![Dashboard admin](docs/images/it/admin-dashboard.jpg) | ![Modifica opera](docs/images/it/admin-artwork-edit.jpg) | ![Sito su mobile](docs/images/it/site-mobile.jpg) |

## Cosa offre

- **Sito one-page** (Biografia → Opere → Contatti) con il tema *Atelier Notturno*: sidebar fissa, filtri per categoria, vista Galleria o Schede, lightbox con tastiera e swipe, pagina dedicata per ogni opera.
- **Italiano e inglese**: contenuti traducibili dal pannello, URL `/it/…` e `/en/…`, lingua scelta in base al browser.
- **Pannello in italiano o inglese secondo il browser** (Payload CMS su `/admin`): pulsanti grandi per le azioni frequenti, caricamento di più immagini insieme, ordinamento con drag & drop, bozze e anteprima, messaggi dal form contatti.
- **Personalizzazione** da *Impostazioni del sito*: colore principale, caratteri, logo, icona, vista predefinita delle opere, prezzi, modulo contatti, testi SEO, privacy, statistiche senza cookie (Plausible/Umami).
- **SEO**: metadata e Open Graph per pagina, `hreflang`, sitemap multilingua, `robots.txt`, dati strutturati `Person` e `VisualArtwork`. Lighthouse mobile ≥ 95 in tutte le categorie con i dati demo.
- **Produzione**: immagine Docker standalone non-root, migrazioni automatiche all'avvio, backup giornalieri di database e immagini, header di sicurezza. Il TLS resta al tuo reverse proxy.

## Avvio rapido (sviluppo)

Servono Node 24, pnpm (via `corepack enable`) e Docker (oppure PostgreSQL locale).

```bash
git clone https://github.com/Ruy41321/portfolio-artist.git
cd portfolio-artist
pnpm install
cp .env.example .env        # imposta PAYLOAD_SECRET (openssl rand -hex 32)
./scripts/dev-db.sh         # avvia PostgreSQL e crea i database portfolio e portfolio_test
pnpm seed                   # migrazioni + dati demo (imposta SEED_ADMIN_EMAIL/PASSWORD per un utente demo)
pnpm dev                    # http://localhost:3000 e http://localhost:3000/admin
```

Senza `SEED_ADMIN_*` il primo accesso a `/admin` chiede di creare l'utente.

**Su Windows** usa PowerShell (servono Docker Desktop e Node 24; `corepack enable` va eseguito una volta in un PowerShell da amministratore, in alternativa `npm install -g pnpm@10`). Al posto di `cp` usa `Copy-Item .env.example .env` e al posto di `./scripts/dev-db.sh` usa `docker compose up -d postgres`: al primo avvio crea sia `portfolio` sia `portfolio_test`. Gli script `.sh` (setup, backup, restore) richiedono Git Bash o WSL.

Verifiche:

```bash
pnpm lint && pnpm typecheck && pnpm test   # unit + integrazione (DB di test)
pnpm test:e2e                              # Playwright su build di produzione
```

## Deploy in 5 passi

Su un server con Docker e un reverse proxy che gestisce HTTPS (dettagli ed esempi in [docs/it/DEPLOY.md](docs/it/DEPLOY.md)):

1. Copia sul server `compose.prod.yml`, la cartella `docker/backup/` e la cartella `scripts/` (oppure clona il repository).
2. Genera la configurazione: `./scripts/setup.sh` (chiede l'indirizzo pubblico e la porta locale, crea `.env` con segreti casuali).
3. Avvia: `docker compose -f compose.prod.yml up -d` (usa l'immagine `ghcr.io/ruy41321/portfolio-artist`, pubblicata su GitHub Container Registry a ogni tag `v*`; aggiungi `--build` per costruirla dal sorgente).
4. Configura il reverse proxy verso `http://127.0.0.1:APP_PORT` (esempi per nginx, Caddy e Traefik in DEPLOY.md).
5. Apri `https://tuo-dominio/admin`, crea l'utente dell'artista e consegna la [guida per l'artista](docs/it/GUIDA-ARTISTA.md).

## Configurazione

Tutte le variabili sono documentate in [`.env.example`](.env.example). Le principali:

| Variabile | Descrizione |
|---|---|
| `NEXT_PUBLIC_SERVER_URL` | Indirizzo pubblico del sito, senza `/` finale (URL assoluti, sitemap, Open Graph, CSRF). Letto all'avvio: la stessa immagine va bene per qualsiasi dominio. |
| `PAYLOAD_SECRET` | Segreto lungo e casuale per le sessioni. |
| `DATABASE_URL` / `POSTGRES_*` | Connessione a PostgreSQL (in produzione composta da `POSTGRES_*`). |
| `APP_PORT`, `APP_BIND` | Porta e interfaccia su cui l'app ascolta (default `127.0.0.1:3000`). |
| `MAX_UPLOAD_MB` | Dimensione massima dei file caricati. |
| `SMTP_*`, `CONTACT_EMAIL_TO` | Email facoltativa per il form contatti; senza SMTP i messaggi restano nel pannello. |
| `BACKUP_INTERVAL_HOURS`, `BACKUP_RETENTION_DAYS`, `BACKUP_DIR` | Frequenza, durata e cartella dei backup. |

## Aggiornamento

```bash
docker compose -f compose.prod.yml pull
docker compose -f compose.prod.yml up -d
```

Le migrazioni del database vengono applicate automaticamente all'avvio. Prima di aggiornare conviene fare un backup: `./scripts/backup.sh`.

## Documentazione

- [docs/it/DEPLOY.md](docs/it/DEPLOY.md) — installazione su server, reverse proxy, Aruba, backup e ripristino, risoluzione problemi
- [docs/it/GUIDA-ARTISTA.md](docs/it/GUIDA-ARTISTA.md) — guida al pannello per l'artista
- [docs/it/CUSTOMIZZAZIONE.md](docs/it/CUSTOMIZZAZIONE.md) — nuovi temi, nuovi campi, nuove lingue
- [docs/PLAN.md](docs/PLAN.md) e [docs/PROGRESS.md](docs/PROGRESS.md) — piano e diario di sviluppo
- [CHANGELOG.it.md](CHANGELOG.it.md)

Le bozze di layout originali sono in [`design/drafts/`](design/drafts/) (`python -m http.server 5500 --directory design/drafts`).

## Stack

Next.js 16 (App Router) · Payload CMS 3 · PostgreSQL 17 · TypeScript strict · pnpm · Node 24 · Docker Compose · Vitest · Playwright · GitHub Actions
