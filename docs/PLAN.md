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
| Distribuzione | Immagine Docker multi-stage (output `standalone` di Next), `compose.yml` per dev e `compose.prod.yml` con **Caddy** (HTTPS automatico) e backup. Immagine pubblicata su **GHCR**. |
| Qualità | ESLint + Prettier, `tsc --noEmit`, Vitest per integration e unit, Playwright per e2e, GitHub Actions CI. |

## 2. Layout scelto

**Layout scelto: _DA DEFINIRE_** (A · Atelier / B · Editoriale / C · Notturno)

Le bozze sono in `design/drafts/`. Per vederle: `python -m http.server 5500 --directory design/drafts`, poi apri http://localhost:5500.

Quando l'utente sceglie:
1. Sostituisci *DA DEFINIRE* con il layout scelto e le eventuali modifiche richieste (es. "B, ma con i filtri di A").
2. Usa la bozza HTML come **riferimento visivo**: tipografia, spaziature, palette e interazioni vanno riprodotti fedelmente in componenti React. Non copiare l'HTML o il JS delle bozze così come sono.

---

## 3. Architettura target

```
.
├── src/
│   ├── app/
│   │   ├── (frontend)/[locale]/      # sito pubblico: home, opere, opera/[slug], serie/[slug], bio, contatti
│   │   ├── (payload)/admin/          # admin Payload (generato)
│   │   ├── (payload)/api/            # REST/GraphQL Payload (generato)
│   │   ├── sitemap.ts, robots.ts
│   │   └── api/health/route.ts       # healthcheck per Docker
│   ├── collections/                  # Users, Media, Artworks, Series, Categories, Messages
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
├── docker/                           # Caddyfile, entrypoint.sh, backup
├── Dockerfile
├── compose.yml                       # sviluppo: app + postgres
├── compose.prod.yml                  # produzione: app + postgres + caddy + backup
├── .env.example
└── docs/                             # PLAN, PROGRESS, GUIDA-ARTISTA, DEPLOY
```

### Modello dati

**Collections**
- **Users**: solo admin, con auth Payload, `maxLoginAttempts` e `lockTime` attivi. Il primo utente si crea dalla schermata *create first user*.
- **Media**: upload di immagini (jpg, png, webp, avif) e PDF (CV). `alt` è obbligatorio e localizzato. `imageSizes` sono `thumb`, `card`, `large` e `og` (1200×630). Il focal point è attivo e il limite dimensione è configurabile.
- **Artworks** (Opere):
  - Campi: `title`*, `slug` (auto dal titolo, unico), `images` (array di Media, la prima è la copertina), `year`, `technique`*, `dimensions`, `description` (rich text, campo semplice).
  - Relazioni: `series` → Series, `categories` → Categories.
  - Flag e stato: `featured` (bool), `availability` (disponibile / venduta / collezione privata / non in vendita), `price` (opzionale, mostrato solo se attivato in SiteSettings).
  - Opzioni collection: `versions.drafts` (bozza/pubblicato) e `orderable` (drag & drop per l'ordinamento).
- **Series** (Serie/Progetti): `title`*, `slug`, `description`*, `cover`, `year`, `orderable`.
- **Categories**: `name`*, `slug` (es. pittura, disegno, illustrazione).
- **Messages**: messaggi dal form contatti, di sola lettura per l'admin (`name`, `email`, `message`, `createdAt`, `read`).

\* = campo localizzato (it/en)

**Globals**
- **Profile**: `name`, `tagline`*, `bio`* (rich text), `statement`*, `portrait`, `cv` (array di {anno, testo*, tipo: mostra/premio/formazione}), `cvPdf`, `email`, `location`*, `socials` (array di {piattaforma, url}).
- **SiteSettings**:
  - Tema: `theme` (select tra i temi disponibili), `accentColor`, `fontPairing` (select da lista curata).
  - Brand: `logo` e `favicon`.
  - SEO: `seo` (titolo*, descrizione*, immagine OG).
  - Opzioni sito: `showPrices` e `enableContactForm`.
  - Pagine legali: `privacy`* (rich text) e `analytics` (script facoltativo, es. Plausible; solo domain/URL, niente codice arbitrario).

### Principi
- **Il frontend legge i dati solo tramite Payload Local API**, attraverso funzioni in `src/lib/` (`getArtworks`, `getProfile`…), mai con fetch HTTP verso sé stesso.
- **Rendering statico + revalidation on-demand.** Hook `afterChange`/`afterDelete` su collections e globals chiamano `revalidateTag`/`revalidatePath`, così le pagine si aggiornano appena l'artista salva.
- **Temi.** Un tema è una cartella in `src/themes/<nome>` che esporta lo stesso contratto (`Layout`, `HomePage`, `WorksPage`, `ArtworkPage`, `SeriesPage`, `AboutPage`, `ContactPage`). Le route sono sottili e delegano al tema attivo da SiteSettings. Colori e font arrivano come CSS custom properties.
- **Generico.** Nessun nome, testo o immagine di un artista reale nel codice. Tutto arriva dal CMS o dal seed demo.

---

## 4. Regole di lavoro per l'AI

1. **Un branch e una PR per milestone**, con nome `feat/mN-descrizione`. Usa Conventional Commits. Se la PR precedente non è ancora mergiata, parti dal suo branch e indicalo nella descrizione della PR.
2. **Prima di aprire la PR** devono passare `pnpm lint`, `pnpm typecheck`, `pnpm test` e, da M6 in poi, `pnpm test:e2e`. La CI deve essere verde.
3. **Se nella sessione cloud non c'è Docker o Postgres**: fai push del branch e verifica tramite GitHub Actions (`gh run watch`). La CI ha un service Postgres ed è la fonte di verità.
4. **Aggiorna i documenti a ogni milestone**: spunta le checkbox qui, aggiungi una voce in `docs/PROGRESS.md` (cosa è stato fatto, decisioni, problemi aperti) e aggiorna `CLAUDE.md` se cambiano i comandi.
5. **Non cambiare le decisioni del §1** e non aggiungere dipendenze pesanti senza motivarlo nella PR.
6. **Verifica i nomi delle API Payload** sulla documentazione ufficiale della versione installata prima di usarle (`orderable`, bulk upload, live preview…). Le API cambiano tra minor release.
7. **Admin pensato per un artista non tecnico**: ogni campo ha label e `admin.description` in italiano chiaro, senza gergo tecnico.
8. **Niente segreti nel repo.** Tutto passa da `.env`, con un esempio documentato in `.env.example`.

---

## 5. Milestone

### M0 — Fondamenta repository ✅
- [x] Repo GitHub privata, `.gitignore`, `.gitattributes`, `.editorconfig`
- [x] Bozze layout in `design/drafts/`
- [x] `CLAUDE.md`, `docs/PLAN.md`, `docs/PROGRESS.md`
- [ ] **Scelta del layout da parte dell'utente** (§2)

### M1 — Scaffolding app + Docker dev
- [ ] Inizializza Next.js + Payload 3 (template `blank`) nella root del repo con TypeScript strict, pnpm, alias `@/`
- [ ] Configura `@payloadcms/db-postgres`, `sharp` e `PAYLOAD_SECRET`/`DATABASE_URL` da env; scrivi `.env.example` commentato
- [ ] Imposta `output: 'standalone'` in `next.config` e aggiungi la route `/api/health` (fa un ping al DB)
- [ ] Configura ESLint (config Next) + Prettier e gli script `lint`, `format`, `typecheck`, `test`, `test:e2e`, `seed`, `generate:types`
- [ ] Scrivi un `Dockerfile` multi-stage (deps → build → runner con utente non-root) e `docker/entrypoint.sh` (esegue `payload migrate`, poi avvia il server)
- [ ] Prepara `compose.yml` per lo sviluppo (postgres con healthcheck e volume; app con hot reload montando il sorgente, oppure solo il DB e `pnpm dev` locale: documenta entrambe le opzioni)
- [ ] Aggiungi la CI GitHub Actions `ci.yml`: install con cache pnpm, lint, typecheck, test (service postgres), `docker build`

**DoD:** `docker compose up` avvia l'app; `/admin` mostra *create first user*; `/api/health` risponde 200; CI verde.

### M2 — Modello dati + localizzazione
- [ ] Configura `localization` con `it` (default) ed `en` e fallback attivo
- [ ] Imposta l'admin in italiano (`i18n.supportedLanguages` it + en, fallback it)
- [ ] Crea le collections Users, Media, Artworks, Series, Categories e Messages come da §3
- [ ] Crea i globals Profile e SiteSettings come da §3
- [ ] Configura l'access control: lettura pubblica solo per i documenti pubblicati; scrittura solo per gli utenti autenticati; Messages creabile dal pubblico solo tramite la server action del form
- [ ] Genera i tipi con `payload generate:types` e crea la prima migrazione con `payload migrate:create initial`
- [ ] Scrivi lo script di seed `pnpm seed`: profilo demo, 3 serie, 4 categorie e 12 opere con immagini segnaposto generate (es. con sharp, ispirate a `design/drafts/shared/placeholders.css`). Lo script deve essere idempotente.
- [ ] Scrivi i test di integrazione (Vitest + Local API): creazione di un'opera, slug unico, opera in bozza non visibile al pubblico, campi localizzati

**DoD:** il seed popola il DB; nell'admin si vedono tutte le sezioni in italiano; test verdi.

### M3 — Admin UX per artista non tecnico
- [ ] Crea una dashboard custom con messaggio di benvenuto con il nome dell'artista e pulsanti grandi: *Aggiungi opera*, *Carica più immagini*, *Modifica profilo*, *Vedi il sito*, oltre al conteggio dei messaggi non letti
- [ ] Organizza la navigazione admin in gruppi chiari (*Portfolio*: Opere, Serie, Categorie; *Il mio profilo*; *Messaggi*; *Impostazioni*) e nascondi ciò che non serve
- [ ] Abilita il bulk upload su Media e la creazione rapida di un'opera da un'immagine
- [ ] Abilita il riordino drag & drop di opere e serie
- [ ] Attiva la live preview / pulsante *Anteprima* verso la pagina pubblica dell'opera
- [ ] Riduci il rich text a una toolbar minima (grassetto, corsivo, link, elenchi, titoli h2/h3)
- [ ] Aggiungi validazioni con messaggi in italiano comprensibile (es. "Aggiungi almeno un'immagine dell'opera")
- [ ] Applica il branding dell'admin: logo e nome artista da SiteSettings/Profile nella login e nella nav (componenti `graphics`)

**DoD:** un utente senza competenze crea un'opera con 3 immagini e la pubblica in < 2 minuti, senza leggere documentazione (scenario coperto da un test e2e in M6).

### M4 — Frontend pubblico (tema scelto)
- [ ] Crea il design system del tema: token CSS (colori, font, spaziature) da SiteSettings, font via `next/font`, reset
- [ ] Implementa il contratto tema e il resolver del tema attivo (§3 Principi)
- [ ] Componenti condivisi: `ArtImage` (`next/image` con sizes Payload, blur placeholder, alt), `Lightbox` accessibile (tastiera, focus trap, swipe su mobile), `LocaleSwitch`, `Nav`
- [ ] Pagine: Home, Opere (con filtri per categoria/serie se previsti dal layout), Opera `[slug]`, Serie `[slug]`, Bio/About (con CV), Contatti
- [ ] Routing i18n: `/it/...` e `/en/...`; la root fa redirect in base ad `Accept-Language`; `hreflang`; dizionario UI per le stringhe fisse
- [ ] Revalidation on-demand tramite hook Payload
- [ ] Pagine 404 e di errore curate, coerenti col tema
- [ ] Responsive da 360px a 2560px; rispetto di `prefers-reduced-motion`

**DoD:** il sito con i dati di seed riproduce fedelmente la bozza scelta su desktop e mobile; una modifica nell'admin è visibile sul sito senza rebuild.

### M5 — Contatti, SEO, legale
- [ ] Form contatti (server action): validazione zod, honeypot, rate limit per IP, salvataggio in Messages, invio email se SMTP è configurato (`@payloadcms/email-nodemailer`)
- [ ] Metadata per pagina con `generateMetadata`, Open Graph/Twitter con l'immagine dell'opera, canonical
- [ ] `sitemap.xml` multilingua e `robots.txt`
- [ ] JSON-LD `Person` per l'artista e `VisualArtwork` per ogni opera
- [ ] Pagina privacy (da SiteSettings); nessun cookie di profilazione di default, quindi niente banner; analytics opzionali solo privacy-friendly

**DoD:** Lighthouse SEO ≥ 95; validatore Rich Results senza errori; il form funziona con e senza SMTP.

### M6 — Test e2e e qualità
- [ ] Configura Playwright con un server su DB di test seedato
- [ ] e2e pubblico: navigazione home → opera → lightbox, cambio lingua, form contatti
- [ ] e2e admin: login, creazione opera con immagini, pubblicazione, verifica sul sito (scenario DoD di M3)
- [ ] Test accessibilità con `@axe-core/playwright` sulle pagine principali (0 violazioni serious/critical)
- [ ] Aggiungi gli e2e alla CI (job separato, artifact con trace in caso di fallimento)

**DoD:** CI verde con unit, integration ed e2e.

### M7 — Produzione Docker
- [ ] `compose.prod.yml` con:
  - `app` (immagine GHCR, healthcheck, restart)
  - `postgres` (volume, healthcheck, non esposto)
  - `caddy` (HTTPS automatico, compressione, header di sicurezza, cache lunga per `/_next/static` e media)
  - `backup`: dump giornaliero di Postgres e archivio del volume media, con retention configurabile
- [ ] `docker/Caddyfile` parametrizzato con `DOMAIN` ed email ACME
- [ ] `scripts/setup.sh`: genera `.env` con segreti casuali e chiede dominio ed email
- [ ] Script di restore documentato e testato
- [ ] Header di sicurezza: CSP compatibile con l'admin Payload, HSTS, `X-Content-Type-Options`, `Referrer-Policy`
- [ ] Workflow `release.yml`: su tag `v*` fa build multi-arch (amd64/arm64) e push su `ghcr.io/<owner>/portfolio-artist`
- [ ] Verifica che l'immagine runner sia minimale e senza devDependencies; la dimensione va riportata nella PR

**DoD:** su una VM pulita con Docker, `scripts/setup.sh && docker compose -f compose.prod.yml up -d` porta il sito online in HTTPS; backup e restore verificati.

### M8 — Documentazione
- [ ] `README.md`: cos'è, screenshot, quick start dev, deploy in 5 passi, configurazione, aggiornamento (`docker compose pull && up -d`)
- [ ] `docs/DEPLOY.md`: VPS (requisiti, DNS, firewall), aggiornamenti, backup/restore, troubleshooting
- [ ] `docs/GUIDA-ARTISTA.md`, in italiano semplice e con screenshot: primo accesso, profilo, aggiungere/ordinare opere, serie, traduzioni EN, impostazioni, messaggi
- [ ] `docs/CUSTOMIZZAZIONE.md`: come creare un nuovo tema, aggiungere un campo, aggiungere una lingua

**DoD:** una persona tecnica esterna riesce a fare il deploy seguendo solo i documenti.

### M9 — Hardening e release 1.0
- [ ] Lighthouse mobile ≥ 90 su Performance, Accessibility, Best Practices e SEO (home, opera, bio)
- [ ] Audit dipendenze (`pnpm audit`); Dependabot/Renovate configurato
- [ ] Limiti upload (dimensione, tipi MIME), test di stress della galleria con 200 opere
- [ ] Verifica del flusso *first run* da DB vuoto (senza seed): il sito mostra uno stato vuoto elegante e l'admin guida l'artista
- [ ] Rimozione/esclusione di `design/drafts` dall'immagine Docker (`.dockerignore`)
- [ ] `CHANGELOG.md`, tag `v1.0.0`, release GitHub con immagine GHCR

**DoD — Ready to publish:** tutte le checkbox di M1–M9 sono spuntate, la CI è verde, l'immagine `v1.0.0` è su GHCR e il deploy è testato su un server reale.

### M10 — (Opzionale, post 1.0)
- [ ] Implementare le altre bozze come temi alternativi selezionabili da SiteSettings
- [ ] Storage media su S3/R2 (`@payloadcms/storage-s3`)
- [ ] Pagine libere (es. "Workshop", "Press") con un page builder a blocchi semplici
- [ ] Newsletter / shop esterno (link)
