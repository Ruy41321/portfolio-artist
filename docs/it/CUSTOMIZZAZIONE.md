# Customizzazione

[English](../en/CUSTOMIZATION.md) · **Italiano**

Guida per sviluppatori che vogliono adattare il progetto: creare un tema, aggiungere un campo, aggiungere una lingua. Prima di iniziare leggi `CLAUDE.md` (convenzioni) e `docs/PLAN.md` §3 (architettura).

Mappa veloce:

| Cartella | Contenuto |
|---|---|
| `src/collections/`, `src/globals/` | schema Payload (opere, categorie, media, messaggi, utenti, profilo, impostazioni) |
| `src/lib/` | accesso ai dati (Local API + cache), SEO, JSON-LD, form contatti |
| `src/themes/` | temi: contratto (`types.ts`), registro (`index.ts`), opzioni (`options.ts`), font (`fonts.ts`) |
| `src/app/(frontend)/[locale]/` | route pubbliche sottili che caricano i dati e delegano al tema |
| `src/i18n/` | lingue, dizionari dell'interfaccia, negoziazione della lingua |
| `src/hooks/revalidate.ts` | invalidazione della cache quando si salva nel pannello |
| `src/migrations/` | migrazioni del database (obbligatorie per ogni modifica di schema) |

---

## Creare un nuovo tema

Un tema è una cartella in `src/themes/<nome>/` che implementa il contratto `Theme` di `src/themes/types.ts`:

| Componente | Riceve | Ruolo |
|---|---|---|
| `Layout` | `SiteContext` + `children`, `currentPath` | struttura comune (menu, footer, selettore lingua) |
| `HomePage` | `SiteContext` + `artworks`, `categories` | pagina principale; di solito compone le tre sezioni |
| `AboutSection`, `WorksSection`, `ContactSection` | come sopra | le sezioni della home |
| `ArtworkPage` | `SiteContext` + `artwork`, `previous`, `next` | pagina `/[locale]/opere/[slug]` |
| `PrivacyPage` | `SiteContext` | pagina privacy |
| `NotFoundPage` | `{ siteName }` | pagina 404 (componente client: legge la lingua dall'URL) |

`SiteContext` contiene `locale`, `dict` (testi dell'interfaccia), `profile`, `settings` (Impostazioni del sito) e `preview` (anteprima delle bozze).

Passi:

1. **Copia il tema esistente** come punto di partenza:
   ```bash
   cp -r src/themes/atelier-notturno src/themes/minimal
   ```
2. **Rinomina** l'oggetto esportato in `src/themes/minimal/index.ts` (`export const minimal: Theme = { name: 'minimal', … }`) e cambia il CSS (`theme.css`). Usa sempre le variabili `--accent`, `--accent-contrast`, `--font-body`, `--font-heading`: vengono impostate da *Impostazioni del sito* in `src/app/(frontend)/[locale]/layout.tsx`.
3. **Registra** il tema in `src/themes/index.ts`:
   ```ts
   import { minimal } from './minimal'
   const themes: Record<string, Theme> = {
     [atelierNotturno.name]: atelierNotturno,
     [minimal.name]: minimal,
   }
   ```
4. **Aggiungi l'opzione** in `src/themes/options.ts` (`themeOptions`). È un campo `select`, quindi cambia lo schema: genera la migrazione
   ```bash
   pnpm payload migrate:create add_minimal_theme
   pnpm generate:types
   ```
5. Riusa i componenti condivisi di `src/components/ui/` (`ArtImage`, `Lightbox`, `LocaleSwitch`, `RichText`, `JsonLd`) e i modelli di `src/lib/works.ts` (`toWorkItem`), così SEO, accessibilità e lightbox restano coerenti.
6. Verifica: `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e` (gli e2e usano il tema predefinito; aggiungine per il nuovo tema se cambia l'interazione).

Note:

- Il CSS di ogni tema è importato da `index.ts` del tema e viene incluso nel bundle: usa un prefisso o selettori specifici se più temi possono convivere.
- Mantieni le pagine statiche: non usare `headers()` o `cookies()` nei componenti del tema (renderebbero dinamico tutto il sito).

## Aggiungere un campo

Esempio: un campo *Serie* (testo localizzato) per le opere.

1. **Schema** — in `src/collections/Artworks.ts` aggiungi il campo con label e descrizione in italiano chiaro (convenzione del progetto):
   ```ts
   {
     name: 'seriesName',
     type: 'text',
     localized: true,
     label: t('Serie', 'Series'),
     admin: { description: t('Facoltativo. Il ciclo di opere a cui appartiene.', 'Optional.') },
   },
   ```
2. **Migrazione e tipi**:
   ```bash
   pnpm payload migrate:create artwork_series_name
   pnpm generate:types
   ```
   Controlla il file generato in `src/migrations/` e committalo insieme a `src/migrations/index.ts`. In produzione la migrazione si applica da sola all'avvio.
3. **Frontend** — il campo arriva già nei dati (`Artwork` in `src/payload-types.ts`). Mostralo nel tema (es. `ArtworkPage.tsx`) o aggiungilo al modello client in `src/lib/works.ts` se serve nella griglia o nel lightbox.
4. **SEO** (facoltativo) — aggiungilo al JSON-LD in `src/lib/structured-data.ts`.
5. **Seed e test** — aggiorna `src/seed/` se vuoi dati demo e scrivi un test in `tests/int/`.

La cache del sito si invalida da sola al salvataggio. Se aggiungi una **nuova collection o un nuovo global** letto dal sito, aggiungi i suoi hook `afterChange`/`afterDelete` con `revalidateCollection`/`revalidateGlobal` (`src/hooks/revalidate.ts`) e un tag in `src/lib/cache-tags.ts`.

## Aggiungere una lingua

Esempio: francese (`fr`).

1. **Codice lingua** — in `src/i18n/config.ts`:
   ```ts
   export const locales = ['it', 'en', 'fr'] as const
   export const localeLabels: Record<Locale, string> = { it: 'Italiano', en: 'English', fr: 'Français' }
   ```
2. **Dizionario dell'interfaccia** — in `src/i18n/dictionaries.ts` crea l'oggetto `fr: Dictionary` (TypeScript segnala le chiavi mancanti) e aggiungilo a `dictionaries`.
3. **Open Graph** — aggiungi `fr: 'fr_FR'` a `ogLocale` in `src/lib/seo.ts`.
4. **Pannello** (facoltativo) — per l'interfaccia admin in francese aggiungi la lingua a `i18n.supportedLanguages` in `src/payload.config.ts` (`import { fr } from '@payloadcms/translations/languages/fr'`).
5. **Migrazione** — le lingue dei contenuti sono un enum nel database:
   ```bash
   pnpm payload migrate:create add_french_locale
   pnpm generate:types
   ```
6. **Verifica** — `/fr` viene servito automaticamente dalle route `[locale]`, la sitemap e gli `hreflang` includono la nuova lingua, il proxy (`src/proxy.ts`) la propone ai browser in francese. Esegui `pnpm test` (c'è un test sulla negoziazione della lingua) e `pnpm test:e2e`.

Il segmento URL delle opere (`/opere/`) è lo stesso in tutte le lingue (`artworkSegment` in `src/i18n/dictionaries.ts`).
