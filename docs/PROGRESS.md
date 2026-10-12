# Progress log

Diario delle sessioni di lavoro, dalla più recente in alto. Ogni sessione aggiunge una voce: milestone, cosa è stato fatto, decisioni prese, problemi aperti e prossimo passo.

---

## 2026-10-12 — M1 Scaffolding app + Docker dev ✅
- **Fatto:** Next.js 16.3 + Payload 3.90 (template `blank`) nella root, Postgres adapter, sharp, config da env; `output: 'standalone'`; `/api/health` (ping al DB con `select 1`); ESLint flat config (next + prettier), Prettier, script `lint`/`format`/`typecheck`/`test`/`test:e2e`/`seed`/`generate:types`; Dockerfile multi-stage con utente non-root; `docker/entrypoint.sh`; `compose.yml` (solo DB, oppure `--profile app` con hot reload); `scripts/dev-db.sh`; CI `ci.yml`; test smoke Vitest.
- **Prove:** `pnpm lint && pnpm typecheck && pnpm test` verdi (smoke 1/1). Con `pnpm dev`: `GET /api/health` → `200 {"status":"ok"}`; `/admin` reindirizza a `/admin/create-first-user` (verificato con Playwright). `docker build` riuscito (364 MB su disco, 88 MB compressa); il container avviato risponde 200 su health e logga "No migrations to run".
- **Decisioni autonome:**
  - **Node 24** confermato (Payload 3.90 richiede `>=20.9`). pnpm fissato a 10.34.7 tramite `packageManager`.
  - **Migrazioni al boot** invece di `payload migrate` nell'entrypoint: l'output `standalone` non contiene né la CLI di Payload né `tsx`. Si usa `prodMigrations` del Postgres adapter, attivato in `src/instrumentation.ts` all'avvio del server, prima che serva richieste. L'entrypoint verifica le env e avvia `server.js`.
  - Rimosso `libc6-compat` (non serve con i binari musl di sharp). Il Dockerfile accetta un secret di build facoltativo `extra_ca` per build dietro un proxy TLS (usato in questa sessione).
  - Gli integration test usano il DB `portfolio_test` (`TEST_DATABASE_URL`) con `push` dello schema; in produzione solo migrazioni.
  - `@playwright/test` fissato a 1.56.1 (compatibile con il Chromium preinstallato); variabile facoltativa `PLAYWRIGHT_CHROMIUM_PATH`.
  - Next 16.3 aggiunge da solo a `CLAUDE.md` un blocco "nextjs-agent-rules" (docs in `node_modules/next/dist/docs/`): lasciato com'è.
- **Ambiente della sessione cloud:** `dockerd` avviato a mano; immagini Docker Hub prese da `mirror.gcr.io` (rate limit 429); build con `docker build --network host --secret id=extra_ca,src=/root/.ccr/ca-bundle.crt .`.
- **Prossimo passo:** M2, modello dati e localizzazione.

## 2026-10-12 — M0 Fondamenta
- Repo inizializzata e pubblicata su GitHub come repo privata.
- Prese le decisioni di stack: Next.js + Payload 3, Postgres, pnpm, un artista per istanza, IT+EN, Docker (vedi `PLAN.md` §1).
- Create tre bozze di layout in `design/drafts/`: A Atelier, B Editoriale, C Notturno.
- **Prossimo passo:** avviare l'autopilota da M1.
- Aggiornamento: rimosso Caddy/HTTPS (il TLS è gestito dall'host o dal reverse proxy esistente) e introdotta la modalità autopilota (PLAN §4) con lo Stop hook.
- Layout scelto: **D · Atelier Notturno** (A + palette di C). Pagina unica Biografia → Opere → Contatti; tolte le Serie (spostate in M10); categorie/filtri gestibili dall'admin; vista Galleria/Schede. Dettagli in `PLAN.md` §2.
