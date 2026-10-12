# CLAUDE.md

Portfolio web generico per artisti professionisti: un sito pubblico personalizzabile e un pannello admin semplice per un artista non tecnico, distribuito con Docker. È pensato per **un artista per istanza**.

## Da leggere a inizio sessione
1. `docs/PLAN.md`: decisioni prese (§1), layout scelto (§2), architettura (§3), regole di lavoro (§4), milestone (§5).
2. `docs/PROGRESS.md`: ultima voce, cioè dove ci si è fermati e qual è il prossimo passo.
3. Lavora in **modalità autopilota** (PLAN §4): esegui tutte le milestone da M1 a M9 senza fermarti a chiedere, testando dopo ogni task e con un gate di verifica a fine milestone. Alla fine apri **una sola PR verso `main`**.
4. Un hook di Stop (`.claude/hooks/autopilot-stop.sh`) ti rimanda al lavoro finché in PLAN restano task aperti. Non disattivarlo. **A inizio sessione cloud crea il file `.claude/autopilot.on`** (escluso da git): attiva l'hook anche se l'ambiente non imposta `CLAUDE_CODE_REMOTE`. Se sei davvero bloccato, crea `docs/BLOCKED.md`.

## Stack
Next.js (App Router) + Payload CMS 3 (admin su `/admin`) · PostgreSQL 17 · TypeScript strict · pnpm · Node 24 LTS · Docker / Compose (TLS gestito esternamente) · Vitest + Playwright · GitHub Actions.

## Comandi
<!-- Aggiornare in M1 quando gli script esistono davvero -->
```bash
pnpm install
cp .env.example .env            # poi imposta PAYLOAD_SECRET
./scripts/dev-db.sh             # Postgres (Docker se c'è, altrimenti apt) + DB portfolio e portfolio_test
pnpm dev                        # http://localhost:3000 e /admin
pnpm lint && pnpm typecheck && pnpm test   # test su TEST_DATABASE_URL
pnpm format                     # Prettier
pnpm test:e2e
pnpm seed                       # dati demo
pnpm payload migrate:create <nome>
docker compose up --build       # stack completo
```
Bozze di design: `python -m http.server 5500 --directory design/drafts`.

## Convenzioni
- Codice, identificatori e commit in inglese (Conventional Commits). Testi rivolti all'utente (admin e sito) in italiano, con traduzione EN dove previsto.
- Il frontend legge i dati solo tramite funzioni in `src/lib/` che usano la Local API di Payload.
- Nessun contenuto specifico di un artista reale nel codice: tutto viene da CMS o seed.
- Ogni campo admin ha label e `admin.description` in italiano comprensibile a chi non è tecnico.
- Le modifiche allo schema richiedono una migrazione Payload (`src/migrations/`). In produzione non si usa `push`.
- Segreti solo via env; tieni `.env.example` aggiornato.
- Prima di usare un'API Payload/Next verifica la documentazione della versione installata.
- Se nella sessione non c'è Docker o Postgres, verifica tramite la CI (`gh run watch`).
- A fine milestone: spunta le checkbox in `docs/PLAN.md`, aggiungi una voce in `docs/PROGRESS.md` e aggiorna questo file se cambiano i comandi.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
