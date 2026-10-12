# Progress log

Diario delle sessioni di lavoro, dalla più recente in alto. Ogni sessione aggiunge una voce: milestone, cosa è stato fatto, decisioni prese, problemi aperti e prossimo passo.

---

## 2026-10-12 — M4 Frontend pubblico (tema Atelier Notturno) ✅
- **Fatto:** contratto tema (`src/themes/types.ts`) e resolver (`getTheme` da SiteSettings); tema `atelier-notturno` con token CSS (accento e contrasto calcolati da SiteSettings, font `next/font/local`), sidebar fissa con voce attiva che segue lo scroll, menu mobile con selettore lingua, home one-page Biografia → Opere → Contatti, filtri per categoria, vista Galleria (masonry) / Schede (4:3 con focal point) ricordata in `localStorage`, lightbox accessibile (Esc/←/→, focus trap e ripristino, swipe, aggiorna l'URL a `/[locale]/opere/[slug]` e lo ripristina alla chiusura/back), pagina opera con tutte le immagini e opera precedente/successiva, pagina privacy, 404 e pagina di errore nello stile del tema, stato vuoto senza opere; routing `/it`, `/en` con `src/proxy.ts` (redirect in base ad `Accept-Language`, `Vary`), `hreflang`/canonical via metadata; dizionario UI it/en; cache dati con `unstable_cache` + tag e hook Payload (`revalidateTag(tag, { expire: 0 })` + `revalidatePath`); preview in draft mode; blur placeholder generato all'upload (nuovo campo `Media.blurDataURL`, migrazione `media_blur_placeholder`). Modulo contatti già collegato (server action, dettagli in M5).
- **Prove:** build di produzione: `/[locale]`, `/[locale]/opere/[slug]`, `/[locale]/privacy` statici (●) e `x-nextjs-cache: HIT`; modifica del profilo e del titolo di un'opera via API → visibili subito su `/it` e sulla pagina dell'opera senza rebuild. Playwright: nessun overflow orizzontale a 360/768/1280/2560 px su home, opera, privacy e 404; `scroll-behavior: auto` con `prefers-reduced-motion`; lightbox aggiorna l'URL e Esc lo ripristina. Screenshot confrontati con la bozza D (sidebar, filtri, masonry, schede con tag "Disponibile"/"Venduta", lightbox scuro). `pnpm test` 23/23.
- **Decisioni autonome:**
  - Font self-hosted da `@fontsource-variable/*` con `next/font/local` (nessuna rete durante build e runtime, niente Google Fonts).
  - Le pagine si generano alla prima richiesta (`generateStaticParams` vuoto) e poi restano in cache: `docker build` non ha bisogno del DB.
  - La 404 legge la lingua dall'URL lato client: usare `headers()` nel `not-found.tsx` rendeva dinamiche tutte le pagine. È una pagina essenziale (nome, 404, link alla home) senza sidebar.
  - Contratto tema: niente `WorksPage` separata perché il layout scelto è one-page (§2); aggiunte `PrivacyPage` e `NotFoundPage`.
  - Gli URL dei media restituiti da Payload (assoluti) vengono resi relativi per `next/image`.
- **Prossimo passo:** M5, contatti/SEO/legale.

## 2026-10-12 — M3 Admin UX per artista non tecnico ✅
- **Fatto:** pannello di benvenuto in dashboard (`beforeDashboard`) con "Ciao, {nome}!", pulsanti grandi *Aggiungi opera*, *Carica più immagini*, *Modifica profilo*, *Messaggi* (con conteggio dei non letti), *Vedi il sito*, e avvisi per opere senza categoria, bozze non pubblicate e profilo vuoto; gruppi di navigazione *Portfolio / Messaggi / Impostazioni / Il mio profilo*; link "Vedi il sito" nella nav; bulk upload di Media (nativo di Payload) con suggerimento sopra la lista; pulsante "Crea un'opera da questa immagine" nella scheda di un'immagine (endpoint `POST /api/artworks/from-media/:id` → bozza di opera); drag & drop di opere e categorie (`orderable`); box informativo nella categoria con il numero di opere collegate e cosa succede eliminandola; pulsante *Anteprima* su opere e profilo (`/api/preview` attiva il draft mode solo per utenti loggati, redirect solo verso percorsi locali); rich text ridotto a paragrafo, h2/h3, grassetto, corsivo, link, elenchi; messaggi di validazione in italiano; branding admin (logo o nome con puntino accento nella login, icona nella nav), avatar di default.
- **Prove:** lint/typecheck verdi, `pnpm test` 16/16. Screenshot Playwright: login con "● Giulia Marchetti", dashboard con i pulsanti, creazione rapida di un'opera da un'immagine (redirect alla bozza con l'immagine già inserita). `/api/preview` senza login → 401. Nessuna modifica di schema (`migrate:create` → "No schema changes").
- **Decisioni autonome:**
  - Ordine dei gruppi nella nav: Payload li ordina per prima apparizione (prima le collections, poi i globals), quindi è *Portfolio → Messaggi → Impostazioni → Il mio profilo*. La dashboard personalizzata compensa con i pulsanti in alto.
  - "Anteprima" invece della live preview side-by-side: più semplice per l'artista e non richiede hook client nelle pagine. Le pagine pubbliche leggeranno le bozze in draft mode (M4).
  - Users resta visibile in *Impostazioni* (serve per aggiungere un secondo accesso o cambiare password).
- La DoD (opera con 3 immagini pubblicata in < 2 minuti) sarà coperta dall'e2e admin in M6.
- **Prossimo passo:** M4, frontend pubblico.

## 2026-10-12 — M2 Modello dati + localizzazione ✅
- **Fatto:** localization `it` (default) + `en` con fallback; admin in italiano/inglese (`i18n.supportedLanguages`, fallback `it`); collections Artworks (bozze, `orderable`, slug unico automatico), Categories (`orderable`), Media (4 `imageSizes`, focal point, limite dimensione da `MAX_UPLOAD_MB`), Messages, Users (`maxLoginAttempts` 5, `lockTime` 10 min); globals Profile e SiteSettings; access control (pubblico: solo opere pubblicate, Messages non creabili/leggibili via API); query del frontend in `src/lib/queries.ts`; migrazione `initial`; seed idempotente (`pnpm seed`: 4 categorie, 12 opere con immagini astratte generate da SVG con sharp, profilo, impostazioni, utente admin facoltativo).
- **Prove:** `pnpm test` 14/14 verdi (artworks: creazione, slug unico, immagine obbligatoria con messaggio italiano, bozza invisibile al pubblico, campi localizzati + fallback; categories: rinomina nei filtri, ordine admin e categorie senza opere pubblicate escluse, eliminazione con opere → opere senza categoria; access; smoke). Seed eseguito due volte → 12 opere, 4 categorie, 13 media (nessun duplicato). Screenshot Playwright dell'admin: dashboard con gruppi "Portfolio / Messaggi / Impostazioni / Il mio profilo" e lista Opere in italiano con drag & drop.
- **Decisioni autonome:**
  - Campi localizzati obbligatori **solo in italiano** (validazione `requiredInDefaultLocale`): la traduzione EN resta facoltativa e il sito usa il fallback.
  - Il campo `category` è obbligatorio via validazione ma la FK è `ON DELETE SET NULL`: eliminando una categoria le opere restano senza categoria (visibili in "Tutti").
  - Aggiunti campi utili non elencati in §3: `Profile.contactIntro` (testo della sezione Contatti, previsto in §2), `SiteSettings.currency` (visibile solo con "Mostra i prezzi"), `Messages.locale`.
  - `fontPairing`: Inter, Fraunces + Inter, Space Grotesk + Inter. `analytics`: provider (Plausible/Umami), ID del sito e URL dello script, nessun codice arbitrario.
  - **Schema solo via migrazioni anche in dev** (`PAYLOAD_DB_PUSH=false` in `.env.example`): il `push` di Drizzle chiede conferme interattive e si bloccava. I test ricreano lo schema del DB di test dalle migrazioni a ogni run (`tests/globalSetup.ts`), così verificano anche le migrazioni. `pnpm seed` esegue prima `payload migrate`.
- **Prossimo passo:** M3, admin UX per l'artista.

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
