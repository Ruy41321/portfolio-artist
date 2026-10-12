# Piano di lavoro — Portfolio Artist

Piano esecutivo per portare il progetto da zero a **ready to publish**. È pensato per essere eseguito da Claude in sessioni cloud su GitHub, una milestone alla volta.

> **Come usare questo file**
> - Le milestone vanno eseguite **in ordine**. Ognuna ha i task (checkbox), una *Definition of Done* (DoD) e i comandi di verifica.
> - A fine lavoro spunta le checkbox completate **in questo file** e aggiungi una voce in [`PROGRESS.md`](PROGRESS.md).
> - Le decisioni nella sezione 1 sono **già prese**: non vanno ridiscusse senza chiedere all'utente.

---

## 1. Decisioni prese

| Tema | Decisione |
|---|---|
| Stack | **Next.js (App Router) + Payload CMS 3.x** in un'unica app TypeScript. L'admin Payload è montato su `/admin`. |
| Database | **PostgreSQL 17** (`@payloadcms/db-postgres`). In produzione usa le migrazioni Payload, mai `push`. |
| Package manager / runtime | **pnpm** (via corepack) e **Node 24 LTS**. Se Payload non supporta Node 24, scendi a Node 22 LTS e annotalo. |
| Tenancy | **Un artista per istanza.** Ogni deploy è un portfolio con dominio, DB e media propri. |
| Lingue | **IT (default) + EN.** Contenuti localizzati con la localization di Payload, route `/[locale]/…`, admin in italiano. |
| Layout | **Da scegliere tra le bozze in `design/drafts/`** → vedi §2. Il layout scelto è il *tema di default*. |
| Media | File su volume Docker locale, ridimensionati con `sharp`. Adapter S3-compatibile opzionale via env. |
| Email | SMTP opzionale. Senza SMTP i messaggi del form contatti restano consultabili nell'admin. |
| Distribuzione | Immagine Docker multi-stage (output `standalone` di Next), `compose.yml` per dev e `compose.prod.yml` (app + postgres + backup). **Niente TLS e niente reverse proxy nel progetto**: l'app espone una porta HTTP configurabile (`APP_PORT`) e il TLS è gestito dall'infrastruttura dell'host (reverse proxy esistente o pannello dell'hosting). L'app deve funzionare correttamente dietro proxy (`X-Forwarded-*`, URL pubblico da `NEXT_PUBLIC_SERVER_URL`). Immagine pubblicata su **GHCR**. |
| Qualità | ESLint + Prettier, `tsc --noEmit`, Vitest per integration e unit, Playwright per e2e, GitHub Actions CI. |

## 2. Layout scelto

**Layout scelto: D · Atelier Notturno** → riferimento: `design/drafts/d-atelier-notturno.html`

È il layout della bozza A (Atelier) con la palette scura della bozza C (Notturno). Specifiche concordate con l'utente:

- **Pagina unica (one-page)** con le sezioni in quest'ordine: **Biografia → Opere → Contatti**.
- **Sidebar fissa a sinistra** su desktop (su mobile diventa una barra in alto con menu a scomparsa):
  - in alto: nome dell'artista con puntino accento, tagline
  - menu: **Biografia, Opere, Contatti** (nessuna voce "Serie"); la voce attiva segue lo scroll
  - in basso: selettore lingua IT/EN, link social, email, copyright
- **Palette**:
  - sfondo `#0e0e0f`, superfici `#161618` / `#1f1f22`, testo `#efece6`, testo secondario `#8d8a85`, linee `#2a2a2c`
  - accento `#d7ff3a`, modificabile da SiteSettings
  - font: Inter
- **Biografia**: ritratto in bianco e nero, testo, CV con gli anni in colore accento, link facoltativo al CV in PDF.
- **Opere**:
  - **filtri per categoria** in alto ("Tutti" + le categorie gestite dall'admin, nell'ordine scelto dall'admin; una categoria senza opere pubblicate non compare)
  - **selettore di vista Galleria / Schede**:
    - *Galleria* = masonry con titolo e anno sotto l'immagine
    - *Schede* = card con immagine 4:3, titolo e anno, tecnica · misure, descrizione breve, tag (categoria + disponibilità; "Disponibile" in accento e "Venduta" in rosso tenue)
  - la vista predefinita si sceglie in SiteSettings; la scelta del visitatore viene ricordata
- **Lightbox scuro** al click su un'opera, con navigazione da tastiera e swipe. Ogni opera ha anche una pagina propria `/[locale]/opere/[slug]`, usata per SEO e condivisione: il lightbox aggiorna l'URL e un link diretto apre la pagina dell'opera.
- **Contatti**: testo introduttivo da Profile e form (nome, email, messaggio) con pulsante in colore accento.

Usa la bozza HTML come **riferimento visivo**: tipografia, spaziature, palette e interazioni vanno riprodotti fedelmente in componenti React. Non copiare l'HTML o il JS delle bozze così come sono.

---

## 3. Architettura target

```
.
├── src/
│   ├── app/
│   │   ├── (frontend)/[locale]/      # sito pubblico: home one-page (bio, opere, contatti), opere/[slug], privacy
│   │   ├── (payload)/admin/          # admin Payload (generato)
│   │   ├── (payload)/api/            # REST/GraphQL Payload (generato)
│   │   ├── sitemap.ts, robots.ts
│   │   └── api/health/route.ts       # healthcheck per Docker
│   ├── collections/                  # Users, Media, Artworks, Categories, Messages
│   ├── globals/                      # Profile, SiteSettings
│   ├── components/
│   │   ├── admin/                    # dashboard custom, guide inline
│   │   └── ui/                       # componenti condivisi (Image, Lightbox, LocaleSwitch…)
│   ├── themes/
│   │   └── <nome-tema>/              # layout, componenti e CSS del tema scelto
│   ├── i18n/                         # dizionari UI it/en e helper locale
│   ├── lib/                          # data access (Payload Local API), seo, revalidate
│   ├── migrations/                   # migrazioni Payload
│   ├── seed/                         # dati demo (opere segnaposto + profilo)
│   └── payload.config.ts
├── tests/{int,e2e}/
├── docker/                           # entrypoint.sh, backup
├── Dockerfile
├── compose.yml                       # sviluppo: app + postgres
├── compose.prod.yml                  # produzione: app + postgres + backup (TLS esterno)
├── .env.example
└── docs/                             # PLAN, PROGRESS, GUIDA-ARTISTA, DEPLOY
```

### Modello dati

**Collections**
- **Users**: solo admin, con auth Payload, `maxLoginAttempts` e `lockTime` attivi. Il primo utente si crea dalla schermata *create first user*.
- **Media**: upload di immagini (jpg, png, webp, avif) e PDF (CV). `alt` è obbligatorio e localizzato. `imageSizes` sono `thumb`, `card`, `large` e `og` (1200×630). Il focal point è attivo e il limite dimensione è configurabile.
- **Artworks** (Opere):
  - Campi: `title`*, `slug` (auto dal titolo, unico), `images` (array di Media, la prima è la copertina), `year`, `technique`*, `dimensions`, `shortDescription`* (max ~160 caratteri, mostrata nella vista Schede), `description`* (rich text semplice, mostrata nella pagina dell'opera).
  - Relazioni: `category` → Categories (una, obbligatoria).
  - Flag e stato: `featured` (bool), `availability` (disponibile / venduta / collezione privata / non in vendita), `price` (opzionale, mostrato solo se attivato in SiteSettings).
  - Opzioni collection: `versions.drafts` (bozza/pubblicato) e `orderable` (drag & drop per l'ordinamento).
- **Categories**: `name`*, `slug`, con `orderable` per il drag & drop. Sono i filtri sopra le opere. L'artista può **aggiungerle, rinominarle, riordinarle ed eliminarle** dall'admin. Se elimina una categoria che ha opere, l'admin chiede conferma e le opere restano senza categoria: compaiono solo in "Tutti" e l'admin le segnala. Il seed crea Pittura, Illustrazione, Disegno e Grafica.
- **Messages**: messaggi dal form contatti, di sola lettura per l'admin (`name`, `email`, `message`, `createdAt`, `read`).

\* = campo localizzato (it/en)

**Globals**
- **Profile**: `name`, `tagline`*, `bio`* (rich text), `statement`*, `portrait`, `cv` (array di {anno, testo*, tipo: mostra/premio/formazione}), `cvPdf`, `email`, `location`*, `socials` (array di {piattaforma, url}).
- **SiteSettings**:
  - Tema: `theme` (select tra i temi disponibili), `accentColor`, `fontPairing` (select da lista curata).
  - Brand: `logo` e `favicon`.
  - SEO: `seo` (titolo*, descrizione*, immagine OG).
  - Opzioni sito: `showPrices`, `enableContactForm` e `defaultWorksView` (galleria / schede).
  - Pagine legali: `privacy`* (rich text) e `analytics` (script facoltativo, es. Plausible; solo domain/URL, niente codice arbitrario).

### Principi
- **Il frontend legge i dati solo tramite Payload Local API**, attraverso funzioni in `src/lib/` (`getArtworks`, `getProfile`…), mai con fetch HTTP verso sé stesso.
- **Rendering statico + revalidation on-demand.** Hook `afterChange`/`afterDelete` su collections e globals chiamano `revalidateTag`/`revalidatePath`, così le pagine si aggiornano appena l'artista salva.
- **Temi.** Un tema è una cartella in `src/themes/<nome>` che esporta lo stesso contratto (`Layout`, `HomePage`, `WorksPage`, `ArtworkPage`, `AboutSection`, `WorksSection`, `ContactSection`). Le route sono sottili e delegano al tema attivo da SiteSettings. Colori e font arrivano come CSS custom properties.
- **Generico.** Nessun nome, testo o immagine di un artista reale nel codice. Tutto arriva dal CMS o dal seed demo.

---

## 4. Regole di lavoro per l'AI — modalità autopilota

Il progetto viene eseguito **in un'unica corsa autonoma, da M1 a M9, senza fermarsi a chiedere**. L'utente viene coinvolto solo alla fine.

**Ciclo di lavoro per ogni task**
1. Implementa il task.
2. Esegui subito le verifiche disponibili: `pnpm lint`, `pnpm typecheck` e i test pertinenti. Scrivi i test **insieme** al codice, non alla fine.
3. Se qualcosa fallisce, correggi prima di passare oltre. Non si accumulano errori.
4. Fai un commit (Conventional Commits) e spunta la checkbox in questo file.

**Gate di fine milestone.** Non si passa alla milestone successiva finché il gate non è verde.
- Esegui la suite completa (`pnpm lint && pnpm typecheck && pnpm test`, più `pnpm test:e2e` da M6) e `docker build .` se Docker è disponibile.
- Rileggi la DoD della milestone e verificala punto per punto **con prove concrete** (output dei comandi, risposta HTTP, screenshot Playwright). Annota le prove in `docs/PROGRESS.md`.
- Fai push del branch.

**Decisioni e blocchi**
- **Dubbi di design o implementazione**: non chiedere. Scegli l'opzione più semplice e coerente con §1–§3, annotala in `PROGRESS.md` sotto "Decisioni autonome" e prosegui.
- **Blocco reale** (manca un segreto o un servizio esterno, un'azione richiede un umano): marca il task con `[!]` e una nota, poi prosegui con il resto. Ti fermi solo se *nessun* task rimanente è eseguibile; in quel caso scrivi `docs/BLOCKED.md` con il motivo.
- I task marcati **(umano)** non sono a carico dell'AI e non bloccano la fine del lavoro.

**Ambiente**
- Postgres serve per test e dev. Se Docker c'è, usa `docker compose up -d postgres`. Altrimenti installa e avvia Postgres localmente (es. `apt-get install -y postgresql` + `service postgresql start`) tramite lo script `scripts/dev-db.sh` creato in M1, che gestisce entrambi i casi.
- La CI GitHub Actions è una verifica in più, non un sostituto dei test locali.

**Branch e consegna**
- Lavora su un unico branch (quello della sessione, oppure `develop`), con commit piccoli e frequenti e push a fine di ogni milestone.
- **Alla fine** apri **una sola PR verso `main`**. La descrizione contiene: riepilogo per milestone, decisioni autonome, task `[!]` o (umano) rimasti e istruzioni per provare il risultato. L'apertura della PR fa scattare la notifica all'utente.

**Documenti**
- A ogni milestone aggiungi una voce in `docs/PROGRESS.md` (fatto, prove, decisioni, problemi aperti) e aggiorna `CLAUDE.md` se cambiano i comandi.
- `PLAN.md` e `PROGRESS.md` sono la memoria tra un contesto e l'altro: tienili aggiornati, così dopo una compattazione o una nuova sessione si riparte senza perdere nulla.

**Altre regole**
- **Non cambiare le decisioni del §1** e non aggiungere dipendenze pesanti senza motivarlo nella PR.
- **Verifica i nomi delle API Payload** sulla documentazione ufficiale della versione installata prima di usarle (`orderable`, bulk upload, live preview…). Le API cambiano tra minor release.
- **Admin pensato per un artista non tecnico**: ogni campo ha label e `admin.description` in italiano chiaro, senza gergo tecnico.
- **Niente segreti nel repo.** Tutto passa da `.env`, con un esempio documentato in `.env.example`.

---

## 5. Milestone

### M0 — Fondamenta repository ✅
- [x] Repo GitHub privata, `.gitignore`, `.gitattributes`, `.editorconfig`
- [x] Bozze layout in `design/drafts/`
- [x] `CLAUDE.md`, `docs/PLAN.md`, `docs/PROGRESS.md`
- [ ] **Scelta del layout** (§2) (umano)

### M1 — Scaffolding app + Docker dev
- [x] Inizializza Next.js + Payload 3 (template `blank`) nella root del repo con TypeScript strict, pnpm, alias `@/`
- [x] Configura `@payloadcms/db-postgres`, `sharp` e `PAYLOAD_SECRET`/`DATABASE_URL` da env; scrivi `.env.example` commentato
- [x] Imposta `output: 'standalone'` in `next.config` e aggiungi la route `/api/health` (fa un ping al DB)
- [x] Configura ESLint (config Next) + Prettier e gli script `lint`, `format`, `typecheck`, `test`, `test:e2e`, `seed`, `generate:types`
- [x] Scrivi un `Dockerfile` multi-stage (deps → build → runner con utente non-root) e `docker/entrypoint.sh` (esegue `payload migrate`, poi avvia il server)
- [x] Prepara `compose.yml` per lo sviluppo (postgres con healthcheck e volume; app con hot reload montando il sorgente, oppure solo il DB e `pnpm dev` locale: documenta entrambe le opzioni)
- [x] Crea `scripts/dev-db.sh`, idempotente: avvia Postgres con Docker se c'è, altrimenti con un'installazione locale (apt), e crea DB e utente di sviluppo e di test. Serve per lavorare in sessioni cloud senza Docker.
- [x] Aggiungi la CI GitHub Actions `ci.yml`: install con cache pnpm, lint, typecheck, test (service postgres), `docker build`
- [x] Aggiungi un test smoke (Vitest) che avvia Payload sul DB di test e verifica che la config si carichi

**DoD:** `pnpm dev` (con il DB di `scripts/dev-db.sh`) avvia l'app; `/admin` mostra *create first user*; `/api/health` risponde 200; `docker build .` riesce (se Docker è disponibile, altrimenti tramite CI).

### M2 — Modello dati + localizzazione
- [x] Configura `localization` con `it` (default) ed `en` e fallback attivo
- [x] Imposta l'admin in italiano (`i18n.supportedLanguages` it + en, fallback it)
- [x] Crea le collections Users, Media, Artworks, Categories e Messages come da §3
- [x] Crea i globals Profile e SiteSettings come da §3
- [x] Configura l'access control: lettura pubblica solo per i documenti pubblicati; scrittura solo per gli utenti autenticati; Messages creabile dal pubblico solo tramite la server action del form
- [x] Genera i tipi con `payload generate:types` e crea la prima migrazione con `payload migrate:create initial`
- [x] Scrivi lo script di seed `pnpm seed`: profilo demo, 4 categorie e 12 opere con immagini segnaposto generate (es. con sharp, ispirate a `design/drafts/shared/placeholders.css`). Lo script deve essere idempotente.
- [x] Scrivi i test di integrazione (Vitest + Local API): creazione di un'opera, slug unico, opera in bozza non visibile al pubblico, campi localizzati; categorie: rinomina riflessa nei filtri, categoria senza opere pubblicate esclusa dai filtri, eliminazione di una categoria con opere gestita senza errori

**DoD:** il seed popola il DB; nell'admin si vedono tutte le sezioni in italiano; test verdi.

### M3 — Admin UX per artista non tecnico
- [x] Crea una dashboard custom con messaggio di benvenuto con il nome dell'artista e pulsanti grandi: *Aggiungi opera*, *Carica più immagini*, *Modifica profilo*, *Vedi il sito*, oltre al conteggio dei messaggi non letti
- [x] Organizza la navigazione admin in gruppi chiari (*Portfolio*: Opere, Categorie; *Il mio profilo*; *Messaggi*; *Impostazioni*) e nascondi ciò che non serve
- [x] Abilita il bulk upload su Media e la creazione rapida di un'opera da un'immagine
- [x] Abilita il riordino drag & drop di opere e categorie; la gestione delle categorie (aggiungi, rinomina, elimina con conferma) deve essere semplice e guidata
- [x] Attiva la live preview / pulsante *Anteprima* verso la pagina pubblica dell'opera
- [x] Riduci il rich text a una toolbar minima (grassetto, corsivo, link, elenchi, titoli h2/h3)
- [x] Aggiungi validazioni con messaggi in italiano comprensibile (es. "Aggiungi almeno un'immagine dell'opera")
- [x] Applica il branding dell'admin: logo e nome artista da SiteSettings/Profile nella login e nella nav (componenti `graphics`)

**DoD:** un utente senza competenze crea un'opera con 3 immagini e la pubblica in < 2 minuti, senza leggere documentazione (scenario coperto da un test e2e in M6).

### M4 — Frontend pubblico (tema scelto)
- [x] Crea il design system del tema: token CSS (colori, font, spaziature) da SiteSettings, font via `next/font`, reset
- [x] Implementa il contratto tema e il resolver del tema attivo (§3 Principi)
- [x] Componenti condivisi: `ArtImage` (`next/image` con sizes Payload, blur placeholder, alt), `Lightbox` accessibile (tastiera, focus trap, swipe su mobile), `LocaleSwitch`, `Nav`
- [x] Home one-page (Biografia → Opere → Contatti) come da §2, con filtri per categoria, selettore Galleria/Schede e voce di menu attiva che segue lo scroll
- [x] Pagina opera `/[locale]/opere/[slug]` e lightbox che aggiorna l'URL
- [x] Pagina privacy
- [x] Routing i18n: `/it/...` e `/en/...`; la root fa redirect in base ad `Accept-Language`; `hreflang`; dizionario UI per le stringhe fisse
- [x] Revalidation on-demand tramite hook Payload
- [x] Pagine 404 e di errore curate, coerenti col tema
- [x] Responsive da 360px a 2560px; rispetto di `prefers-reduced-motion`

**DoD:** il sito con i dati di seed riproduce fedelmente la bozza scelta su desktop e mobile; una modifica nell'admin è visibile sul sito senza rebuild.

### M5 — Contatti, SEO, legale
- [x] Form contatti (server action): validazione zod, honeypot, rate limit per IP, salvataggio in Messages, invio email se SMTP è configurato (`@payloadcms/email-nodemailer`)
- [x] Metadata per pagina con `generateMetadata`, Open Graph/Twitter con l'immagine dell'opera, canonical
- [x] `sitemap.xml` multilingua e `robots.txt`
- [x] JSON-LD `Person` per l'artista e `VisualArtwork` per ogni opera
- [x] Pagina privacy (da SiteSettings); nessun cookie di profilazione di default, quindi niente banner; analytics opzionali solo privacy-friendly

**DoD:** Lighthouse SEO ≥ 95 (via `lighthouse` CLI con Chromium di Playwright); JSON-LD valido secondo schema.org (test automatico sulla struttura); il form funziona con e senza SMTP (test di integrazione).

### M6 — Test e2e e qualità
- [x] Configura Playwright con un server su DB di test seedato
- [x] e2e pubblico: ordine delle sezioni Biografia → Opere → Contatti, filtro per categoria, cambio vista Galleria/Schede, lightbox e URL dell'opera, cambio lingua, form contatti
- [x] e2e admin: login, creazione opera con immagini, pubblicazione, verifica sul sito (scenario DoD di M3)
- [x] Test accessibilità con `@axe-core/playwright` sulle pagine principali (0 violazioni serious/critical)
- [x] Aggiungi gli e2e alla CI (job separato, artifact con trace in caso di fallimento)

**DoD:** CI verde con unit, integration ed e2e.

### M7 — Produzione Docker
- [x] `compose.prod.yml` con:
  - `app` (immagine GHCR o build locale, healthcheck, restart, porta `APP_PORT` esposta solo su `127.0.0.1` di default, configurabile)
  - `postgres` (volume, healthcheck, non esposto)
  - `backup`: dump giornaliero di Postgres e archivio del volume media, con retention configurabile
- [x] Rendi l'app compatibile con un reverse proxy esterno: `NEXT_PUBLIC_SERVER_URL` usato per URL assoluti, sitemap, OG e CORS/CSRF di Payload; header `X-Forwarded-*` rispettati
- [x] Header di sicurezza applicati dall'app (`next.config` headers): CSP compatibile con l'admin Payload, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`. HSTS resta al proxy/TLS esterno.
- [x] Cache headers corretti per `/_next/static` e media, così il proxy esterno o il CDN possono fare cache
- [x] `scripts/setup.sh`: genera `.env` con segreti casuali e chiede l'URL pubblico del sito
- [x] Script di backup e restore documentati e testati (dump → DB pulito → restore → sito identico)
- [x] Workflow `release.yml`: su tag `v*` fa build multi-arch (amd64/arm64) e push su `ghcr.io/<owner>/portfolio-artist`
- [x] Verifica che l'immagine runner sia minimale e senza devDependencies; annota la dimensione in PROGRESS

**DoD:** con Docker, `scripts/setup.sh && docker compose -f compose.prod.yml up -d` porta il sito online su `http://localhost:$APP_PORT`, con contenuti persistenti dopo `down`/`up`. Backup e restore sono verificati. Se nella sessione non c'è Docker, verifica con un job CI dedicato (`compose-smoke`) che fa `up`, curl su `/api/health` e `/it`, poi `down`.

### M8 — Documentazione
- [x] `README.md`: cos'è, screenshot (Playwright), quick start dev, deploy in 5 passi, configurazione, aggiornamento (`docker compose pull && up -d`)
- [x] `docs/DEPLOY.md`:
  - (a) server proprio con Docker dietro reverse proxy/TLS esistente, con esempi di config per nginx, Caddy e Traefik che puntano a `APP_PORT`
  - (b) Aruba: chiarisci che serve un prodotto con Docker (Cloud VPS / Cloud Server) e che l'hosting condiviso non supporta app Node/Docker
  - aggiornamenti, backup/restore, troubleshooting
- [x] `docs/GUIDA-ARTISTA.md`, in italiano semplice e con screenshot (Playwright): primo accesso, profilo, aggiungere/ordinare opere, gestire le categorie (filtri), traduzioni EN, impostazioni, messaggi
- [x] `docs/CUSTOMIZZAZIONE.md`: come creare un nuovo tema, aggiungere un campo, aggiungere una lingua

**DoD:** una persona tecnica esterna riesce a fare il deploy seguendo solo i documenti.

### M9 — Hardening e consegna
- [ ] Lighthouse mobile ≥ 90 su Performance, Accessibility, Best Practices e SEO (home, opera, bio), misurato con `lighthouse` CLI; risultati in PROGRESS
- [ ] Audit dipendenze (`pnpm audit`) senza vulnerabilità high/critical; Dependabot configurato
- [ ] Limiti upload (dimensione, tipi MIME), test di stress della galleria con 200 opere
- [ ] Verifica del flusso *first run* da DB vuoto (senza seed): il sito mostra uno stato vuoto elegante e l'admin guida l'artista
- [ ] `.dockerignore` che esclude `design/`, `docs/`, test e file di sviluppo dall'immagine
- [ ] `CHANGELOG.md` per la versione 1.0.0
- [ ] **Revisione finale**: rileggi tutte le DoD da M1 a M9 e riesegui la suite completa da zero (DB pulito → migrate → seed → test → e2e); correggi ogni regressione
- [ ] **Apri la PR finale verso `main`** con il riepilogo descritto in §4
- [ ] Merge, tag `v1.0.0` e release GHCR (umano)
- [ ] Deploy su server reale (umano)

**DoD — Ready to publish:** tutte le checkbox non (umano) di M1–M9 sono spuntate, la suite completa è verde e la PR finale è aperta.

### M10 — (Opzionale, post 1.0)
- [ ] Serie/progetti (raggruppare le opere in serie con una pagina dedicata), se richiesto
- [ ] Implementare le altre bozze come temi alternativi selezionabili da SiteSettings
- [ ] Storage media su S3/R2 (`@payloadcms/storage-s3`)
- [ ] Pagine libere (es. "Workshop", "Press") con un page builder a blocchi semplici
- [ ] Newsletter / shop esterno (link)
