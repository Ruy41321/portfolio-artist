import type { Ratio } from './placeholders'

/** Demo content for a fictional artist. Nothing here refers to a real person. */

export const demoProfile = {
  name: 'Giulia Marchetti',
  email: 'studio@example.com',
  tagline: { it: 'Pittrice e illustratrice — Milano', en: 'Painter and illustrator — Milan' },
  location: { it: 'Milano, Italia', en: 'Milan, Italy' },
  bio: {
    it: [
      'Lavoro tra pittura a olio e illustrazione, esplorando il rapporto tra paesaggio e memoria.',
      'Le mie opere sono state esposte in Italia e all’estero e fanno parte di collezioni private.',
    ],
    en: [
      'I work between oil painting and illustration, exploring the relationship between landscape and memory.',
      'My works have been exhibited in Italy and abroad and are part of private collections.',
    ],
  },
  statement: {
    it: 'Dipingo la luce delle prime ore, quando i luoghi non hanno ancora deciso cosa diventare.',
    en: 'I paint the early light, when places have not yet decided what to become.',
  },
  contactIntro: {
    it: 'Per commissioni, disponibilità delle opere o collaborazioni scrivimi qui.',
    en: 'For commissions, availability of works or collaborations, write to me here.',
  },
  cv: [
    {
      year: '2025',
      type: 'exhibition',
      it: '“Acque”, personale — Galleria Esempio, Milano',
      en: '“Acque”, solo show — Galleria Esempio, Milan',
    },
    {
      year: '2024',
      type: 'award',
      it: 'Premio Arti Visive, finalista — Torino',
      en: 'Visual Arts Prize, finalist — Turin',
    },
    {
      year: '2023',
      type: 'exhibition',
      it: '“Bussole”, collettiva — Spazio Nove, Bologna',
      en: '“Bussole”, group show — Spazio Nove, Bologna',
    },
    {
      year: '2021',
      type: 'education',
      it: 'Diploma in Pittura — Accademia di Belle Arti',
      en: 'Diploma in Painting — Academy of Fine Arts',
    },
  ] as const,
  socials: [
    { platform: 'instagram', url: 'https://instagram.com/example' },
    { platform: 'behance', url: 'https://www.behance.net/example' },
  ] as const,
}

export const demoCategories = [
  { slug: 'pittura', it: 'Pittura', en: 'Painting' },
  { slug: 'illustrazione', it: 'Illustrazione', en: 'Illustration' },
  { slug: 'disegno', it: 'Disegno', en: 'Drawing' },
  { slug: 'grafica', it: 'Grafica', en: 'Printmaking' },
] as const

type DemoArtwork = {
  slug: string
  title: { it: string; en: string }
  year: number
  technique: { it: string; en: string }
  dimensions?: string
  category: (typeof demoCategories)[number]['slug']
  ratio: Ratio
  availability: 'available' | 'sold' | 'private' | 'notForSale'
  price?: number
  featured?: boolean
  series: keyof typeof seriesText
}

export const seriesText = {
  acque: {
    it: 'Dalla serie sul colore dell’acqua nelle prime ore del giorno.',
    en: 'From the series on the colour of water in the early hours of the day.',
  },
  terre: {
    it: 'Paesaggio ridotto a fasce di colore e luce.',
    en: 'Landscape reduced to bands of colour and light.',
  },
  bussole: {
    it: 'Geometrie che orientano: movimento e direzione.',
    en: 'Geometries that orient: movement and direction.',
  },
  bandiere: {
    it: 'Ritmi e campiture piatte, tra segno e simbolo.',
    en: 'Rhythms and flat fields of colour, between sign and symbol.',
  },
  sogni: {
    it: 'Illustrazione digitale nata di notte, tra visione e diario.',
    en: 'Digital illustration born at night, between vision and diary.',
  },
} as const

const oil = { it: 'Olio su tela', en: 'Oil on canvas' }
const digital = { it: 'Digitale', en: 'Digital' }

export const demoArtworks: DemoArtwork[] = [
  {
    slug: 'mattino-sul-lago',
    title: { it: 'Mattino sul lago', en: 'Morning on the lake' },
    year: 2025,
    technique: oil,
    dimensions: '80 × 100 cm',
    category: 'pittura',
    ratio: 'port',
    availability: 'available',
    price: 2400,
    featured: true,
    series: 'acque',
  },
  {
    slug: 'tricolore-n-3',
    title: { it: 'Tricolore n.3', en: 'Tricolour no.3' },
    year: 2024,
    technique: { it: 'Acrilico su tavola', en: 'Acrylic on panel' },
    dimensions: '60 × 45 cm',
    category: 'pittura',
    ratio: 'land',
    availability: 'sold',
    series: 'bandiere',
  },
  {
    slug: 'isola',
    title: { it: 'Isola', en: 'Island' },
    year: 2025,
    technique: { it: 'Gouache su carta', en: 'Gouache on paper' },
    dimensions: '30 × 30 cm',
    category: 'illustrazione',
    ratio: 'sq',
    availability: 'available',
    price: 650,
    series: 'acque',
  },
  {
    slug: 'rosa-dei-venti',
    title: { it: 'Rosa dei venti', en: 'Compass rose' },
    year: 2023,
    technique: { it: 'Olio su lino', en: 'Oil on linen' },
    dimensions: '100 × 150 cm',
    category: 'pittura',
    ratio: 'tall',
    availability: 'private',
    series: 'bussole',
  },
  {
    slug: 'campo-destate',
    title: { it: 'Campo d’estate', en: 'Summer field' },
    year: 2024,
    technique: oil,
    dimensions: '160 × 90 cm',
    category: 'pittura',
    ratio: 'wide',
    availability: 'available',
    price: 3800,
    featured: true,
    series: 'terre',
  },
  {
    slug: 'tramonto-rosa',
    title: { it: 'Tramonto rosa', en: 'Pink sunset' },
    year: 2025,
    technique: { it: 'Pastello', en: 'Pastel' },
    dimensions: '40 × 50 cm',
    category: 'disegno',
    ratio: 'port',
    availability: 'sold',
    series: 'acque',
  },
  {
    slug: 'ritmo',
    title: { it: 'Ritmo', en: 'Rhythm' },
    year: 2022,
    technique: { it: 'Serigrafia', en: 'Screen print' },
    dimensions: '70 × 50 cm',
    category: 'grafica',
    ratio: 'land',
    availability: 'available',
    price: 380,
    series: 'bandiere',
  },
  {
    slug: 'bolla',
    title: { it: 'Bolla', en: 'Bubble' },
    year: 2025,
    technique: digital,
    category: 'illustrazione',
    ratio: 'sq',
    availability: 'notForSale',
    series: 'sogni',
  },
  {
    slug: 'diagonale',
    title: { it: 'Diagonale', en: 'Diagonal' },
    year: 2023,
    technique: { it: 'Acrilico su tela', en: 'Acrylic on canvas' },
    dimensions: '60 × 90 cm',
    category: 'pittura',
    ratio: 'tall',
    availability: 'private',
    series: 'bussole',
  },
  {
    slug: 'dune',
    title: { it: 'Dune', en: 'Dunes' },
    year: 2024,
    technique: { it: 'Acquerello', en: 'Watercolour' },
    dimensions: '56 × 42 cm',
    category: 'disegno',
    ratio: 'land',
    availability: 'available',
    price: 520,
    series: 'terre',
  },
  {
    slug: 'sole-basso',
    title: { it: 'Sole basso', en: 'Low sun' },
    year: 2025,
    technique: { it: 'Olio su tavola', en: 'Oil on panel' },
    dimensions: '40 × 50 cm',
    category: 'pittura',
    ratio: 'port',
    availability: 'sold',
    series: 'terre',
  },
  {
    slug: 'notturno-elettrico',
    title: { it: 'Notturno elettrico', en: 'Electric nocturne' },
    year: 2025,
    technique: digital,
    category: 'illustrazione',
    ratio: 'sq',
    availability: 'available',
    price: 240,
    series: 'sogni',
  },
]

export const demoPrivacy = {
  it: [
    'Questo sito non usa cookie di profilazione né strumenti di tracciamento pubblicitario.',
    'Se mi scrivi tramite il modulo contatti, il tuo nome, la tua email e il messaggio vengono conservati solo per risponderti e non vengono ceduti a terzi.',
    'Puoi chiedere in qualsiasi momento la cancellazione dei tuoi dati scrivendo all’indirizzo indicato nella sezione Contatti.',
  ],
  en: [
    'This website does not use profiling cookies or advertising trackers.',
    'If you write to me through the contact form, your name, email and message are kept only to reply to you and are never shared with third parties.',
    'You can ask for your data to be deleted at any time by writing to the address shown in the Contact section.',
  ],
}
