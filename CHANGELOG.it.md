# Changelog

[English](CHANGELOG.md) · **Italiano**

Tutte le modifiche rilevanti del progetto. Formato basato su [Keep a Changelog](https://keepachangelog.com/it/1.1.0/), versioni secondo [Semantic Versioning](https://semver.org/lang/it/).

## [Non rilasciato]

### Documentazione
- Documentazione completa anche in inglese: `README.md` (inglese, principale) e `README.it.md`, guide in `docs/en/` e `docs/it/`, screenshot del pannello e del sito in entrambe le lingue (`docs/images/en`, `docs/images/it`).
- Istruzioni per Windows e spiegazione dell'immagine su GitHub Container Registry.

## [1.0.0] — 2026-10-12

Prima versione pronta per la pubblicazione.

### Sito pubblico
- Tema **Atelier Notturno**: pagina unica Biografia → Opere → Contatti, sidebar fissa con voce attiva che segue lo scroll, menu mobile.
- Opere con filtri per categoria, vista **Galleria** (masonry) o **Schede** ricordata dal browser, caricamento progressivo per gallerie lunghe.
- Lightbox accessibile (tastiera, focus trap, swipe) che aggiorna l'URL; pagina dedicata per ogni opera.
- Italiano e inglese con URL `/it` e `/en`, scelta automatica della lingua, fallback all'italiano.
- Form contatti con validazione, honeypot, limite per IP, salvataggio nel pannello ed email opzionale via SMTP.
- SEO: metadata e Open Graph per pagina, `hreflang`, sitemap multilingua, `robots.txt`, JSON-LD `Person` e `VisualArtwork`.
- Pagine privacy, 404 ed errore nello stile del tema; stato vuoto per il primo avvio; statistiche opzionali senza cookie (Plausible, Umami).

### Pannello di amministrazione
- Payload CMS 3 in italiano (e inglese) su `/admin` con pagina di benvenuto, pulsanti per le azioni frequenti e avvisi guidati.
- Opere con bozze, anteprima, più immagini, ordinamento drag & drop e creazione rapida da un'immagine; categorie ordinabili con avviso prima dell'eliminazione.
- Caricamento di più immagini insieme, punto focale, segnaposto sfocato automatico.
- Profilo dell'artista (biografia, ritratto, curriculum, CV in PDF, social) e impostazioni del sito (colore, caratteri, logo, SEO, prezzi, privacy).
- Branding del pannello con logo o nome dell'artista; rich text con toolbar essenziale.

### Produzione
- Immagine Docker multi-stage standalone, utente non-root, migrazioni del database all'avvio, healthcheck `/api/health`.
- `compose.prod.yml` con PostgreSQL non esposto e backup giornalieri di database e immagini con retention; script `setup.sh`, `backup.sh`, `restore.sh`.
- Header di sicurezza (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`), cache per i media, supporto a reverse proxy esterni.
- Workflow CI (lint, typecheck, test, e2e, audit, Docker build, compose smoke) e release multi-arch su GHCR ai tag `v*`; Dependabot.

### Qualità
- Test unitari e di integrazione (Vitest + Local API), e2e e accessibilità (Playwright + axe).
- Lighthouse mobile ≥ 94 in tutte le categorie con i dati demo e con 200 opere.

[1.0.0]: https://github.com/ruy41321/portfolio-artist/releases/tag/v1.0.0
