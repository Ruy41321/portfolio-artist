# Progress log

Diario delle sessioni di lavoro, dalla più recente in alto. Ogni sessione aggiunge una voce: milestone, cosa è stato fatto, decisioni prese, problemi aperti e prossimo passo.

---

## 2026-10-12 — M0 Fondamenta
- Repo inizializzata e pubblicata su GitHub come repo privata.
- Prese le decisioni di stack: Next.js + Payload 3, Postgres, pnpm, un artista per istanza, IT+EN, Docker (vedi `PLAN.md` §1).
- Create tre bozze di layout in `design/drafts/`: A Atelier, B Editoriale, C Notturno.
- **Prossimo passo:** avviare l'autopilota da M1.
- Aggiornamento: rimosso Caddy/HTTPS (il TLS è gestito dall'host o dal reverse proxy esistente) e introdotta la modalità autopilota (PLAN §4) con lo Stop hook.
- Layout scelto: **D · Atelier Notturno** (A + palette di C). Pagina unica Biografia → Opere → Contatti; tolte le Serie (spostate in M10); categorie/filtri gestibili dall'admin; vista Galleria/Schede. Dettagli in `PLAN.md` §2.
