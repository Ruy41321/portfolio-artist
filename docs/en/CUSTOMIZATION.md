# Customization

**English** · [Italiano](../it/CUSTOMIZZAZIONE.md)

A guide for developers who want to adapt the project: create a theme, add a field, add a language. Before you start, read `CLAUDE.md` (conventions) and `docs/PLAN.md` §3 (architecture; both in Italian).

Quick map:

| Folder | Contents |
|---|---|
| `src/collections/`, `src/globals/` | Payload schema (artworks, categories, media, messages, users, profile, settings) |
| `src/lib/` | data access (Local API + cache), SEO, JSON-LD, contact form |
| `src/themes/` | themes: contract (`types.ts`), registry (`index.ts`), options (`options.ts`), fonts (`fonts.ts`) |
| `src/app/(frontend)/[locale]/` | thin public routes that load the data and delegate to the theme |
| `src/i18n/` | languages, UI dictionaries, language negotiation |
| `src/hooks/revalidate.ts` | cache invalidation when something is saved in the admin |
| `src/migrations/` | database migrations (required for every schema change) |

---

## Creating a new theme

A theme is a folder in `src/themes/<name>/` that implements the `Theme` contract from `src/themes/types.ts`:

| Component | Receives | Role |
|---|---|---|
| `Layout` | `SiteContext` + `children`, `currentPath` | shared structure (menu, footer, language switch) |
| `HomePage` | `SiteContext` + `artworks`, `categories` | home page; usually composes the three sections |
| `AboutSection`, `WorksSection`, `ContactSection` | as above | the home page sections |
| `ArtworkPage` | `SiteContext` + `artwork`, `previous`, `next` | the `/[locale]/opere/[slug]` page |
| `PrivacyPage` | `SiteContext` | privacy page |
| `NotFoundPage` | `{ siteName }` | 404 page (client component: reads the language from the URL) |

`SiteContext` contains `locale`, `dict` (UI texts), `profile`, `settings` (Site settings) and `preview` (draft preview).

Steps:

1. **Copy the existing theme** as a starting point:
   ```bash
   cp -r src/themes/atelier-notturno src/themes/minimal
   ```
2. **Rename** the object exported by `src/themes/minimal/index.ts` (`export const minimal: Theme = { name: 'minimal', … }`) and change the CSS (`theme.css`). Always use the `--accent`, `--accent-contrast`, `--font-body` and `--font-heading` variables: they are set from *Site settings* in `src/app/(frontend)/[locale]/layout.tsx`.
3. **Register** the theme in `src/themes/index.ts`:
   ```ts
   import { minimal } from './minimal'
   const themes: Record<string, Theme> = {
     [atelierNotturno.name]: atelierNotturno,
     [minimal.name]: minimal,
   }
   ```
4. **Add the option** to `src/themes/options.ts` (`themeOptions`). It is a `select` field, so the schema changes: generate the migration
   ```bash
   pnpm payload migrate:create add_minimal_theme
   pnpm generate:types
   ```
5. Reuse the shared components in `src/components/ui/` (`ArtImage`, `Lightbox`, `LocaleSwitch`, `RichText`, `JsonLd`) and the view models in `src/lib/works.ts` (`toWorkItem`), so SEO, accessibility and the lightbox stay consistent.
6. Check: `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e` (the e2e tests use the default theme; add some for the new theme if the interaction changes).

Notes:

- Each theme's CSS is imported by the theme's `index.ts` and ends up in the bundle: use a prefix or specific selectors if several themes can coexist.
- Keep the pages static: do not use `headers()` or `cookies()` in theme components (they would make the whole site dynamic).

## Adding a field

Example: a *Series* field (localized text) for artworks.

1. **Schema** — in `src/collections/Artworks.ts` add the field with a label and a description written in plain language (a project convention; the `t()` helper takes the Italian and the English text):
   ```ts
   {
     name: 'seriesName',
     type: 'text',
     localized: true,
     label: t('Serie', 'Series'),
     admin: { description: t('Facoltativo. Il ciclo di opere a cui appartiene.', 'Optional.') },
   },
   ```
2. **Migration and types**:
   ```bash
   pnpm payload migrate:create artwork_series_name
   pnpm generate:types
   ```
   Check the file generated in `src/migrations/` and commit it together with `src/migrations/index.ts`. In production the migration is applied automatically at startup.
3. **Frontend** — the field is already part of the data (`Artwork` in `src/payload-types.ts`). Show it in the theme (e.g. `ArtworkPage.tsx`) or add it to the client view model in `src/lib/works.ts` if you need it in the grid or the lightbox.
4. **SEO** (optional) — add it to the JSON-LD in `src/lib/structured-data.ts`.
5. **Seed and tests** — update `src/seed/` if you want demo data and write a test in `tests/int/`.

The site cache is invalidated automatically when content is saved. If you add a **new collection or global** read by the site, give it `afterChange`/`afterDelete` hooks with `revalidateCollection`/`revalidateGlobal` (`src/hooks/revalidate.ts`) and a tag in `src/lib/cache-tags.ts`.

## Adding a language

Example: French (`fr`).

1. **Language code** — in `src/i18n/config.ts`:
   ```ts
   export const locales = ['it', 'en', 'fr'] as const
   export const localeLabels: Record<Locale, string> = { it: 'Italiano', en: 'English', fr: 'Français' }
   ```
2. **UI dictionary** — in `src/i18n/dictionaries.ts` create the `fr: Dictionary` object (TypeScript reports any missing key) and add it to `dictionaries`.
3. **Open Graph** — add `fr: 'fr_FR'` to `ogLocale` in `src/lib/seo.ts`.
4. **Admin** (optional) — for a French admin interface add the language to `i18n.supportedLanguages` in `src/payload.config.ts` (`import { fr } from '@payloadcms/translations/languages/fr'`).
5. **Migration** — content languages are an enum in the database:
   ```bash
   pnpm payload migrate:create add_french_locale
   pnpm generate:types
   ```
6. **Check** — `/fr` is served automatically by the `[locale]` routes, the sitemap and `hreflang` include the new language, and the proxy (`src/proxy.ts`) offers it to French browsers. Run `pnpm test` (there is a test for language negotiation) and `pnpm test:e2e`.

The artwork URL segment (`/opere/`) is the same in every language (`artworkSegment` in `src/i18n/dictionaries.ts`).
