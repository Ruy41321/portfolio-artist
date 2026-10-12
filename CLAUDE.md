# CLAUDE.md

Portfolio web generico per artisti professionisti: un sito pubblico personalizzabile e un pannello admin semplice per un artista non tecnico, distribuito con Docker. È pensato per **un artista per istanza**.

## Da leggere a inizio sessione
1. `docs/PLAN.md`: decisioni prese (§1), layout scelto (§2), architettura (§3), regole di lavoro (§4), milestone (§5).
2. `docs/PROGRESS.md`: ultima voce, cioè dove ci si è fermati e qual è il prossimo passo.
3. Lavora sulla **prima milestone non completata**. Un branch e una PR per milestone.

## Stack
Next.js (App Router) + Payload CMS 3 (admin su `/admin`) · PostgreSQL 17 · TypeScript strict · pnpm · Node 24 LTS · Docker / Compose / Caddy · Vitest + Playwright · GitHub Actions.

## Comandi
<!-- Aggiornare in M1 quando gli script esistono davvero -->
```bash
pnpm install
docker compose up -d postgres   # solo DB, poi:
pnpm dev                        # http://localhost:3000 e /admin
pnpm lint && pnpm typecheck && pnpm test
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
