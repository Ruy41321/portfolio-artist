# Changelog

**English** · [Italiano](CHANGELOG.it.md)

All notable changes to this project. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Documentation
- Full documentation in English too: `README.md` (English, main) and `README.it.md`, guides in `docs/en/` and `docs/it/`, admin and site screenshots in both languages (`docs/images/en`, `docs/images/it`).
- Windows instructions and an explanation of the image on GitHub Container Registry.

## [1.0.0] — 2026-10-12

First release ready for publication.

### Public site
- **Atelier Notturno** theme: one-page layout Biography → Works → Contact, fixed sidebar whose active item follows the scroll, mobile menu.
- Works with category filters, **Gallery** (masonry) or **Cards** view remembered by the browser, progressive rendering for long galleries.
- Accessible lightbox (keyboard, focus trap, swipe) that updates the URL; a dedicated page for every artwork.
- Italian and English with `/it` and `/en` URLs, automatic language choice, fallback to Italian.
- Contact form with validation, honeypot, per-IP limit, storage in the admin and optional email via SMTP.
- SEO: per-page metadata and Open Graph, `hreflang`, multilingual sitemap, `robots.txt`, `Person` and `VisualArtwork` JSON-LD.
- Privacy, 404 and error pages in the theme's style; empty state for the first run; optional cookie-less analytics (Plausible, Umami).

### Admin panel
- Payload CMS 3 in Italian (and English) at `/admin` with a welcome page, buttons for frequent tasks and guided notices.
- Artworks with drafts, preview, multiple images, drag & drop ordering and quick creation from an image; orderable categories with a notice before deletion.
- Multi-image upload, focal point, automatic blurred placeholder.
- Artist profile (biography, portrait, CV entries, PDF CV, social links) and site settings (color, fonts, logo, SEO, prices, privacy).
- Admin branding with the artist's logo or name; rich text with an essential toolbar.

### Production
- Multi-stage standalone Docker image, non-root user, database migrations at startup, `/api/health` healthcheck.
- `compose.prod.yml` with private PostgreSQL and daily database and image backups with retention; `setup.sh`, `backup.sh`, `restore.sh` scripts.
- Security headers (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`), caching for media, support for external reverse proxies.
- CI workflow (lint, typecheck, test, e2e, audit, Docker build, compose smoke) and multi-arch release to GHCR on `v*` tags; Dependabot.

### Quality
- Unit and integration tests (Vitest + Local API), e2e and accessibility tests (Playwright + axe).
- Lighthouse mobile ≥ 94 in every category with the demo data and with 200 artworks.

[Unreleased]: https://github.com/ruy41321/portfolio-artist/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/ruy41321/portfolio-artist/releases/tag/v1.0.0
