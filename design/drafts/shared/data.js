// Dati finti condivisi dalle bozze: nel prodotto finale arriveranno dal CMS (Payload).
window.ARTIST = {
  name: "Giulia Marchetti",
  tagline: { it: "Pittrice e illustratrice — Milano", en: "Painter and illustrator — Milan" },
  bio: {
    it: "Lavoro tra pittura a olio e illustrazione, esplorando il rapporto tra paesaggio e memoria. Le mie opere sono state esposte in Italia e all'estero e fanno parte di collezioni private.",
    en: "I work between oil painting and illustration, exploring the relationship between landscape and memory. My works have been exhibited in Italy and abroad and are part of private collections.",
  },
};

window.WORKS = [
  { id: 1,  art: "art-1",  ratio: "ratio-port", title: "Mattino sul lago",   year: 2025, tech: "Olio su tela",       size: "80 × 100 cm", cat: "pittura",      series: "Acque" },
  { id: 2,  art: "art-2",  ratio: "ratio-land", title: "Tricolore n.3",      year: 2024, tech: "Acrilico su tavola", size: "60 × 45 cm",  cat: "pittura",      series: "Bandiere" },
  { id: 3,  art: "art-3",  ratio: "ratio-sq",   title: "Isola",              year: 2025, tech: "Gouache su carta",   size: "30 × 30 cm",  cat: "illustrazione", series: "Acque" },
  { id: 4,  art: "art-4",  ratio: "ratio-tall", title: "Rosa dei venti",     year: 2023, tech: "Olio su lino",       size: "100 × 150 cm", cat: "pittura",     series: "Bussole" },
  { id: 5,  art: "art-5",  ratio: "ratio-wide", title: "Campo d'estate",     year: 2024, tech: "Olio su tela",       size: "160 × 90 cm", cat: "pittura",      series: "Terre" },
  { id: 6,  art: "art-6",  ratio: "ratio-port", title: "Tramonto rosa",      year: 2025, tech: "Pastello",           size: "40 × 50 cm",  cat: "disegno",      series: "Acque" },
  { id: 7,  art: "art-7",  ratio: "ratio-land", title: "Ritmo",              year: 2022, tech: "Serigrafia",         size: "70 × 50 cm",  cat: "grafica",      series: "Bandiere" },
  { id: 8,  art: "art-8",  ratio: "ratio-sq",   title: "Bolla",              year: 2025, tech: "Digitale",           size: "—",           cat: "illustrazione", series: "Sogni" },
  { id: 9,  art: "art-9",  ratio: "ratio-tall", title: "Diagonale",          year: 2023, tech: "Acrilico su tela",   size: "60 × 90 cm",  cat: "pittura",      series: "Bussole" },
  { id: 10, art: "art-10", ratio: "ratio-land", title: "Dune",               year: 2024, tech: "Acquerello",         size: "56 × 42 cm",  cat: "disegno",      series: "Terre" },
  { id: 11, art: "art-11", ratio: "ratio-port", title: "Sole basso",         year: 2025, tech: "Olio su tavola",     size: "40 × 50 cm",  cat: "pittura",      series: "Terre" },
  { id: 12, art: "art-12", ratio: "ratio-sq",   title: "Notturno elettrico", year: 2025, tech: "Digitale",           size: "—",           cat: "illustrazione", series: "Sogni" },
];

// Lightbox minimale condiviso: open(i) mostra l'opera i, frecce/ESC per navigare.
window.Lightbox = (function () {
  let el, idx = 0;
  function render() {
    const w = WORKS[idx];
    el.querySelector(".lb-img").className = "lb-img art " + w.art;
    el.querySelector(".lb-meta").innerHTML =
      `<h3>${w.title}</h3><p>${w.year}</p><p>${w.tech}</p><p>${w.size}</p><p style="margin-top:16px">Serie: ${w.series}</p>`;
  }
  function init() {
    el = document.createElement("div");
    el.className = "lb";
    el.innerHTML = `<button class="lb-close" aria-label="Chiudi">✕</button><button class="lb-prev" aria-label="Precedente">←</button>
      <div class="lb-img art"></div><div class="lb-meta"></div><button class="lb-next" aria-label="Successiva">→</button>`;
    document.body.appendChild(el);
    el.querySelector(".lb-close").onclick = close;
    el.querySelector(".lb-prev").onclick = () => step(-1);
    el.querySelector(".lb-next").onclick = () => step(1);
    el.addEventListener("click", (e) => { if (e.target === el) close(); });
    document.addEventListener("keydown", (e) => {
      if (!el.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }
  function open(i) { if (!el) init(); idx = i; render(); el.classList.add("open"); document.body.style.overflow = "hidden"; }
  function close() { el.classList.remove("open"); document.body.style.overflow = ""; }
  function step(d) { idx = (idx + d + WORKS.length) % WORKS.length; render(); }
  return { open };
})();
