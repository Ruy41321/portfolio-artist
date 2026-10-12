# Portfolio Artist

Sito portfolio **generico e personalizzabile** per artisti professionisti, con un **pannello admin semplice** da cui l'artista inserisce nome, biografia, opere e serie senza competenze tecniche. Si distribuisce con **Docker** in pochi comandi.

> 🚧 **Stato:** in sviluppo. Vedi [docs/PLAN.md](docs/PLAN.md) per il piano di lavoro e [docs/PROGRESS.md](docs/PROGRESS.md) per l'avanzamento.

## Caratteristiche previste
- Sito pubblico veloce e responsive (Next.js), in italiano e inglese
- Pannello admin in italiano (Payload CMS): opere, serie, categorie, profilo, CV, impostazioni
- Temi personalizzabili (colori, font, layout)
- Form contatti, SEO completo (sitemap, Open Graph, dati strutturati)
- Deploy con Docker Compose: HTTPS automatico (Caddy) e backup giornalieri

## Bozze di layout
Le bozze sono in [`design/drafts/`](design/drafts/). Per vederle:

```bash
python -m http.server 5500 --directory design/drafts
```

Poi apri http://localhost:5500.

## Stack
Next.js · Payload CMS 3 · PostgreSQL · TypeScript · Docker · Caddy
