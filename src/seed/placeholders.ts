import sharp from 'sharp'

/**
 * Abstract placeholder "artworks" rendered as SVG and rasterized with sharp.
 * Inspired by design/drafts/shared/placeholders.css. Used only by the demo seed.
 */

type Painter = (w: number, h: number) => string

const grain = (w: number, h: number) => `
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.10 0"/></filter>
  <rect width="${w}" height="${h}" filter="url(#grain)"/>`

const wedges = (w: number, h: number, cx: number, cy: number, colors: string[], start = 0) => {
  const r = Math.hypot(w, h)
  const step = (Math.PI * 2) / colors.length
  return colors
    .map((color, i) => {
      const a1 = start + i * step
      const a2 = a1 + step + 0.01
      const x1 = cx + r * Math.cos(a1)
      const y1 = cy + r * Math.sin(a1)
      const x2 = cx + r * Math.cos(a2)
      const y2 = cy + r * Math.sin(a2)
      return `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z" fill="${color}"/>`
    })
    .join('')
}

const painters: Painter[] = [
  (w, h) => `<defs><linearGradient id="g" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#1d3557"/><stop offset="0.6" stop-color="#457b9d"/><stop offset="1" stop-color="#a8dadc"/></linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/><circle cx="${w * 0.3}" cy="${h * 0.35}" r="${Math.min(w, h) * 0.18}" fill="#f2b134"/>`,
  (w, h) =>
    `<rect width="${w / 3}" height="${h}" fill="#e63946"/><rect x="${w / 3}" width="${w / 3}" height="${h}" fill="#f1faee"/><rect x="${(2 * w) / 3}" width="${w / 3}" height="${h}" fill="#1d3557"/>`,
  (w, h) =>
    `<rect width="${w}" height="${h}" fill="#264653"/><ellipse cx="${w * 0.7}" cy="${h * 0.8}" rx="${w * 0.35}" ry="${h * 0.3}" fill="#2a9d8f"/><circle cx="${w * 0.25}" cy="${h * 0.25}" r="${Math.min(w, h) * 0.2}" fill="#e9c46a"/>`,
  (w, h) => wedges(w, h, w / 2, h / 2, ['#f4a261', '#e76f51', '#2a9d8f', '#264653'], Math.PI / 4),
  (w, h) =>
    `<rect width="${w}" height="${h * 0.55}" fill="#fefae0"/><rect y="${h * 0.55}" width="${w}" height="${h * 0.15}" fill="#606c38"/><rect y="${h * 0.7}" width="${w}" height="${h * 0.3}" fill="#283618"/>`,
  (
    w,
    h,
  ) => `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6d6875"/><stop offset="1" stop-color="#b5838d"/></linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/><circle cx="${w / 2}" cy="${h * 1.2}" r="${Math.max(w, h) * 0.6}" fill="#ffb4a2"/>`,
  (w, h) => {
    const stripes: string[] = []
    for (let x = -h; x < w + h; x += 30) {
      stripes.push(`<rect x="${x}" y="${-h}" width="14" height="${h * 3}" fill="#0b090a"/>`)
      stripes.push(`<rect x="${x + 22}" y="${-h}" width="8" height="${h * 3}" fill="#ba181b"/>`)
    }
    return `<rect width="${w}" height="${h}" fill="#e5e5e5"/><g transform="rotate(25 ${w / 2} ${h / 2})">${stripes.join('')}</g>`
  },
  (
    w,
    h,
  ) => `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a2d2ff"/><stop offset="0.5" stop-color="#bde0fe"/><stop offset="1" stop-color="#ffafcc"/></linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/><circle cx="${w * 0.6}" cy="${h * 0.55}" r="${Math.min(w, h) * 0.3}" fill="#cdb4db"/><circle cx="${w * 0.35}" cy="${h * 0.4}" r="${Math.min(w, h) * 0.08}" fill="#fff"/>`,
  (
    w,
    h,
  ) => `<polygon points="0,0 ${w},0 0,${h}" fill="#003049"/><polygon points="${w},0 ${w},${h} 0,${h}" fill="#fcbf49"/>
    <line x1="0" y1="0" x2="${w}" y2="${h}" stroke="#d62828" stroke-width="${Math.min(w, h) * 0.05}"/>`,
  (w, h) =>
    `<rect width="${w}" height="${h}" fill="#faedcd"/><ellipse cx="${w * 0.2}" cy="${h * 0.9}" rx="${w * 0.45}" ry="${h * 0.4}" fill="#ccd5ae"/><ellipse cx="${w * 0.85}" cy="${h * 0.1}" rx="${w * 0.4}" ry="${h * 0.35}" fill="#d4a373"/>`,
  (
    w,
    h,
  ) => `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e5e5e5"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/><circle cx="${w * 0.7}" cy="${h * 0.4}" r="${Math.min(w, h) * 0.15}" fill="#fca311"/><rect y="${h * 0.7}" width="${w}" height="${h * 0.3}" fill="#14213d"/>`,
  (w, h) => wedges(w, h, w * 0.3, h * 0.7, ['#3a0ca3', '#7209b7', '#f72585', '#4cc9f0'], 3.5),
]

const portrait: Painter = (
  w,
  h,
) => `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8e2d6"/><stop offset="1" stop-color="#cfc6b8"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/><ellipse cx="${w / 2}" cy="${h * 0.95}" rx="${w * 0.42}" ry="${h * 0.42}" fill="#3d405b"/><ellipse cx="${w / 2}" cy="${h * 0.38}" rx="${w * 0.17}" ry="${h * 0.17}" fill="#c9a27e"/>`

export const ratios = {
  port: [4, 5],
  land: [4, 3],
  sq: [1, 1],
  tall: [2, 3],
  wide: [16, 9],
} as const
export type Ratio = keyof typeof ratios

function render(painter: Painter, width: number, height: number): Promise<Buffer> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    ${painter(width, height)}${grain(width, height)}</svg>`
  return sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toBuffer()
}

export function renderArtwork(index: number, ratio: Ratio, longSide = 1600): Promise<Buffer> {
  const [rw, rh] = ratios[ratio]
  const width = rw >= rh ? longSide : Math.round((longSide * rw) / rh)
  const height = rw >= rh ? Math.round((longSide * rh) / rw) : longSide
  return render(painters[index % painters.length], width, height)
}

export function renderPortrait(): Promise<Buffer> {
  return render(portrait, 900, 1200)
}
