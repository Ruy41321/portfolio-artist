# Progress log

Diario delle sessioni di lavoro, dalla più recente in alto. Ogni sessione aggiunge una voce: milestone, cosa è stato fatto, decisioni prese, problemi aperti e prossimo passo.

---

## 2026-10-12 — Documentazione bilingue
- **Fatto:** `README.md` ora in inglese (principale) con `README.it.md` in italiano; guide spostate in `docs/it/` (DEPLOY, GUIDA-ARTISTA, CUSTOMIZZAZIONE) e tradotte in `docs/en/` (DEPLOY, ARTIST-GUIDE, CUSTOMIZATION); `CHANGELOG.md` (inglese) e `CHANGELOG.it.md`; ogni file ha il link all'altra lingua; ogni README punta alla documentazione della sua lingua. `scripts/screenshots.mjs` genera due set (`SHOTS_LANG=en|it`) in `docs/images/en` e `docs/images/it`, con pannello e sito nella rispettiva lingua. Aggiunte istruzioni per Windows (PowerShell) e la spiegazione dell'immagine su GHCR.
- **Correzioni emerse:** nella tabella di troubleshooting `restart app` non svuota la cache delle pagine → ora `up -d --force-recreate app`; un `|` nel codice rompeva la tabella; la descrizione inglese del campo slug citava un esempio sbagliato (lo slug deriva sempre dal titolo italiano).
- **Prove:** controllo automatico dei link relativi in README, CHANGELOG e `docs/{en,it}` → 0 link rotti; 18 screenshot per lingua verificati a campione.
- **Decisioni:** `docs/PLAN.md` e `docs/PROGRESS.md` restano in italiano (documenti di lavoro interni); regola aggiunta in `CLAUDE.md` per mantenere allineate le due lingue.

## 2026-10-12 — M9 Hardening e consegna ✅
- **Fatto:** aggiornamenti di sicurezza (next 16.3.8, sharp 0.35.5, vitest 4.1, nodemailer 10, override di undici) e step `pnpm audit --audit-level high` in CI; Dependabot (npm settimanale, Actions e Docker mensile); test sui limiti di upload (tipi vietati HTML/SVG/ZIP rifiutati, file oltre `MAX_UPLOAD_MB` rifiutato via REST); rendering progressivo della galleria (24 opere alla volta, scroll o pulsante "Mostra altre opere") e script di stress `src/seed/stress.ts`; stato vuoto di benvenuto per il primo avvio e placeholder visibili nel form; `.dockerignore` che esclude design, docs, test, script e file di sviluppo; `CHANGELOG.md` 1.0.0.
- **Prove:**
  - **Lighthouse mobile** (build di produzione, dati demo): `/it` (home con biografia) 97/100/100/100, `/it/opere/campo-destate` 95/100/100/100, `/it/privacy` 95/100/100/100, `/en` 97/100/100/100 (Performance/Accessibility/Best Practices/SEO).
  - **Stress 212 opere:** prima del rendering progressivo Performance 89 (DOM 1393 nodi); dopo **94–95** (DOM 268 nodi, LCP 2,8–3,0 s, TBT 60–70 ms). HTML 811 kB non compresso / 50 kB gzip; prima risposta 0,6 s, poi 12 ms dalla cache.
  - **Audit:** nessuna vulnerabilità high/critical tranne `braces` (GHSA-vfj7-8cjw-p6xm): nessuna versione corretta esiste, è usata solo da `sass`/`chokidar` durante la build e non è raggiungibile da input utente → ignorata esplicitamente in `pnpm.auditConfig`.
  - **First run** da DB vuoto: migrazioni all'avvio, home con "Benvenuti. Il sito è in allestimento" e "Le opere arriveranno presto", creazione del primo utente, dashboard con l'invito a compilare il profilo.
  - **Revisione finale da zero:** DB `portfolio` ricreato → `pnpm seed` (migrazioni + demo) → lint 0 problemi, typecheck ok, `pnpm test` 37/37 (11 file), `pnpm test:e2e` 20/20; `docker build` ok (376 MB / 90 MB compressa).
- **Decisioni autonome:**
  - La lingua del pannello segue il browser (italiano come fallback per lingue non supportate): un artista con browser inglese vede l'admin in inglese, può cambiarla dal proprio account.
  - Lo script locale `pnpm start` svuota la cache delle pagine (`.next/server/route-cache` in Next 16) a ogni avvio, come un container nuovo.
  - Il test e2e sul limite di upload usa `MAX_UPLOAD_MB=5` nell'ambiente di test.
- PR aperta: https://github.com/Ruy41321/portfolio-artist/pull/1
- **Restano (umano):** merge della PR, tag `v1.0.0` (avvia la release multi-arch su GHCR) e deploy sul server reale.

## 2026-10-12 — M8 Documentazione ✅
- **Fatto:** `README.md` (cos'è, screenshot, avvio rapido, deploy in 5 passi, configurazione, aggiornamento); `docs/DEPLOY.md` (architettura, server proprio con esempi nginx/Caddy/Traefik, Aruba: serve Cloud VPS/Cloud Server con Docker, l'hosting condiviso non va bene; aggiornamenti, backup/ripristino, tabella di risoluzione problemi); `docs/GUIDA-ARTISTA.md` in italiano semplice con screenshot (accesso, profilo, opere, ordinamento, categorie, traduzioni EN, impostazioni, messaggi, immagini); `docs/CUSTOMIZZAZIONE.md` (nuovo tema, nuovo campo, nuova lingua); `scripts/screenshots.mjs` rigenera i 18 screenshot in `docs/images/` (1,1 MB, JPEG).
- **Prove:** i passi di DEPLOY sono quelli eseguiti in M7 da una cartella con solo `compose.prod.yml`, `docker/backup/` e `scripts/` (setup → up → admin → backup → restore). Le etichette dell'admin citate nella guida sono verificate sulle traduzioni italiane di Payload 3.90 ("Caricamento in Blocco", "Annulla pubblicazione", "Modifica immagine"…).
- **Prossimo passo:** M9, hardening e consegna.

## 2026-10-12 — M7 Produzione Docker ✅
- **Fatto:** `compose.prod.yml` (app da GHCR o `--build`, healthcheck, restart, porta `APP_PORT` su `127.0.0.1` configurabile con `APP_BIND`; postgres non esposto con healthcheck e volume; servizio `backup` con dump `pg_dump -Fc` e archivio media ogni `BACKUP_INTERVAL_HOURS`, retention `BACKUP_RETENTION_DAYS`); `scripts/setup.sh` (genera `.env` con segreti casuali e chiede URL pubblico e porta, anche non interattivo); `scripts/backup.sh` e `scripts/restore.sh`; header di sicurezza (CSP compatibile con admin Payload, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`; HSTS lasciato al proxy); cache `public, max-age=86400, stale-while-revalidate` per i media e `minimumCacheTTL` 1 giorno per `next/image` (`/_next/static` resta immutable); dietro proxy: URL assoluti, redirect, sitemap, OG, CORS e CSRF Payload da `NEXT_PUBLIC_SERVER_URL`, cookie `Secure` se l'URL è https, IP client da `X-Forwarded-For`; `release.yml` (tag `v*` → build amd64/arm64 e push su `ghcr.io/<owner>/portfolio-artist`); job CI `compose-smoke`; `pnpm start` ora avvia il server standalone come nel container.
- **Prove (Docker locale):** `setup.sh` + `docker compose -f compose.prod.yml up -d --wait` da una cartella con solo compose e script → app *healthy*, migrazioni applicate al boot, `/it` 200 con stato vuoto, header di sicurezza presenti. Con Playwright, sull'admin di produzione: primo utente, profilo, categoria, upload e pubblicazione di un'opera senza errori CSP in console; pagina dell'opera 200 con immagine caricata. `down`/`up` → contenuti e immagini presenti. Backup → `down -v` (DB e media vuoti, pagina 404) → `restore.sh` → pagina e immagini identiche. Immagine runner: **376 MB su disco / 90 MB compressa**, `node_modules` tracciati 73 MB, nessuna devDependency (vitest, playwright, typescript, eslint assenti), utente `nextjs` (1001:1001).
- **Decisioni autonome:**
  - CSP con `script-src 'self' 'unsafe-inline' https:`: Next.js e l'admin usano script inline (i nonce renderebbero dinamiche tutte le pagine) e lo script analytics è un URL https scelto nell'admin.
  - Il progetto Compose di sviluppo si chiama `portfolio-artist-dev`: con lo stesso nome i volumi di dev e prod coincidevano.
  - Il volume `media` è creato dall'app; il backup lo monta in sola lettura su `/data/media` con `nocopy` (altrimenti l'immagine alpine lo popolava con file di root). L'entrypoint verifica che la cartella media sia scrivibile e spiega come correggerla.
  - Dopo un restore il container dell'app viene ricreato, così non resta in cache nessuna pagina precedente.
  - L'admin va usato dall'indirizzo pubblico (`NEXT_PUBLIC_SERVER_URL`): da un altro host CSRF blocca le richieste (verificato).
- **Problemi aperti:** la build multi-arch e il push su GHCR girano solo al primo tag `v*` (umano).

## 2026-10-12 — M6 Test e2e e qualità ✅
- **Fatto:** Playwright con global setup che ricrea il DB di test (drop schema → migrazioni → seed con utente admin e2e) e server di produzione (`pnpm build && pnpm start`) sulla porta 3100; e2e pubblici (redirect lingua, ordine Biografia → Opere → Contatti, filtro per categoria, Galleria/Schede ricordata, lightbox con URL e tastiera, link diretto all'opera con JSON-LD e canonical, cambio lingua, form contatti, 404, sitemap/robots); e2e admin (login, opera con 3 immagini tramite caricamento in blocco, pubblicazione e verifica sul sito; creazione rapida da immagine; bozze invisibili); accessibilità con `@axe-core/playwright` su home it/en, opera, privacy, 404 e lightbox; job CI `e2e` separato con report e trace come artifact in caso di errore.
- **Prove:** `pnpm test:e2e` 19/19 in locale. Lo scenario DoD di M3 (opera con 3 immagini pubblicata) richiede **6,5 s**. 0 violazioni axe serious/critical. In CI il primo run aveva un test dipendente dall'ordine (l'admin aggiunge un'opera): corretto confrontando con il totale iniziale.
- **Decisioni autonome:** `@playwright/test` 1.56.1; `PLAYWRIGHT_CHROMIUM_PATH` per usare un Chromium già installato; `E2E_SKIP_BUILD=1` per riusare una build; `E2E_BASE_URL` per testare un server esterno.

## 2026-10-12 — M5 Contatti, SEO, legale ✅
- **Fatto:** form contatti con server action (`src/actions/contact.ts` → `src/lib/contact.ts`): validazione zod con messaggi it/en, honeypot, rate limit per IP (in memoria, `CONTACT_RATE_LIMIT` ogni 10 min, IP da `X-Forwarded-For`), salvataggio in Messages, email all'artista solo se `SMTP_HOST` è impostato (`@payloadcms/email-nodemailer`; un errore SMTP non perde il messaggio); metadata per pagina (title, description, canonical, hreflang + x-default, Open Graph/Twitter con l'immagine `og` 1200×630 dell'opera o dell'immagine social/opera in evidenza); `sitemap.xml` multilingua con alternates e `robots.txt` (URL pubblico letto a runtime); JSON-LD `Person` (home) e `VisualArtwork` (opera) con serializzazione sicura; analytics opzionali Plausible/Umami senza cookie; pagina privacy da SiteSettings con testo di riserva.
- **Prove:** `pnpm test` 33/33 (contatti: senza SMTP salva e non invia, con SMTP invia a `profile.email` con reply-to, errore SMTP non blocca, validazione, honeypot, rate limit, form disattivato; JSON-LD: struttura schema.org di Person e VisualArtwork, escaping di `</script>`). Playwright: errori di validazione in italiano e invio riuscito con messaggio salvato nel DB. **Lighthouse mobile** (build di produzione): `/it` 95/100/100/100, `/it/opere/campo-destate` 96/100/100/100, `/it/privacy` 97/100/100/100, `/en` 97/100/100/100 (Performance/Accessibility/Best Practices/SEO).
- **Decisioni autonome:**
  - `withPayload` aggiunge `Critical-CH` a tutte le route: costringeva il browser a ricaricare la pagina (~600 ms). Gli header dei client hint ora valgono solo per `/admin`.
  - `NEXT_PUBLIC_SERVER_URL` è letto con una chiave calcolata, così il bundler non inserisce il valore di build e la stessa immagine Docker funziona con qualsiasi dominio.
  - `robots.txt` blocca `/admin` e `/api/` ma consente `/api/media/file/` (immagini indicizzabili e anteprime social).
  - `pnpm build` svuota `.next/cache/fetch-cache` (dati di una build precedente potevano sopravvivere in locale).
  - Icona di default `src/app/icon.svg` (puntino accento) e rewrite di `/favicon.ico`.
- **Prossimo passo:** M6, test e2e.

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
