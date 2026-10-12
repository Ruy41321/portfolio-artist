import type { Locale } from './config'

/** Fixed strings of the public site (the content itself comes from the CMS). */
const it = {
  nav: { about: 'Biografia', works: 'Opere', contact: 'Contatti', menu: 'Menu', close: 'Chiudi' },
  skipToContent: 'Vai al contenuto',
  languageSwitch: 'Lingua',
  works: {
    all: 'Tutti',
    filtersLabel: 'Filtra per categoria',
    viewLabel: 'Vista delle opere',
    gallery: 'Galleria',
    cards: 'Schede',
    empty: 'Le opere arriveranno presto.',
    emptyHint: 'Torna a trovarci: il portfolio è in preparazione.',
    noResults: 'Nessuna opera in questa categoria.',
    open: 'Apri',
  },
  availability: {
    available: 'Disponibile',
    sold: 'Venduta',
    private: 'Collezione privata',
    notForSale: 'Non in vendita',
  },
  artwork: {
    back: 'Tutte le opere',
    technique: 'Tecnica',
    dimensions: 'Misure',
    year: 'Anno',
    category: 'Categoria',
    price: 'Prezzo',
    image: 'Immagine',
    of: 'di',
    inquire: 'Chiedi informazioni su quest’opera',
    previous: 'Opera precedente',
    next: 'Opera successiva',
  },
  lightbox: {
    label: 'Visualizzazione opera',
    close: 'Chiudi',
    previous: 'Precedente',
    next: 'Successiva',
    details: 'Scheda completa',
  },
  about: { downloadCv: 'Scarica il CV (PDF)', portraitAlt: 'Ritratto di' },
  contact: {
    name: 'Nome',
    email: 'Email',
    message: 'Messaggio',
    send: 'Invia',
    sending: 'Invio…',
    sent: 'Grazie! Il messaggio è stato inviato.',
    error: 'Qualcosa non ha funzionato. Riprova tra poco.',
    rateLimited: 'Hai inviato troppi messaggi. Riprova più tardi.',
    invalid: 'Controlla i campi evidenziati.',
    nameRequired: 'Scrivi il tuo nome.',
    emailInvalid: 'Scrivi un indirizzo email valido.',
    messageRequired: 'Scrivi un messaggio (almeno 10 caratteri).',
    privacyNote: 'Inviando il messaggio accetti l’',
    privacyLink: 'informativa privacy',
    writeTo: 'Scrivimi a',
  },
  footer: { rights: 'Tutti i diritti riservati', privacy: 'Privacy' },
  privacy: {
    title: 'Informativa privacy',
    description: 'Come vengono trattati i dati personali su questo sito.',
    fallback:
      'Questo sito non usa cookie di profilazione. I dati inviati con il modulo contatti sono usati solo per rispondere al messaggio.',
  },
  notFound: {
    title: 'Pagina non trovata',
    text: 'La pagina che cerchi non esiste o è stata spostata.',
    home: 'Torna alla home',
  },
  error: {
    title: 'Qualcosa è andato storto',
    text: 'Si è verificato un errore imprevisto. Riprova tra qualche istante.',
    retry: 'Riprova',
  },
  preview: { banner: 'Anteprima: stai vedendo anche le bozze.', exit: 'Esci dall’anteprima' },
}

export type Dictionary = typeof it

const en: Dictionary = {
  nav: { about: 'Biography', works: 'Works', contact: 'Contact', menu: 'Menu', close: 'Close' },
  skipToContent: 'Skip to content',
  languageSwitch: 'Language',
  works: {
    all: 'All',
    filtersLabel: 'Filter by category',
    viewLabel: 'Works view',
    gallery: 'Gallery',
    cards: 'Cards',
    empty: 'Works are coming soon.',
    emptyHint: 'Come back soon: the portfolio is being prepared.',
    noResults: 'No works in this category.',
    open: 'Open',
  },
  availability: {
    available: 'Available',
    sold: 'Sold',
    private: 'Private collection',
    notForSale: 'Not for sale',
  },
  artwork: {
    back: 'All works',
    technique: 'Technique',
    dimensions: 'Dimensions',
    year: 'Year',
    category: 'Category',
    price: 'Price',
    image: 'Image',
    of: 'of',
    inquire: 'Ask about this work',
    previous: 'Previous work',
    next: 'Next work',
  },
  lightbox: {
    label: 'Artwork viewer',
    close: 'Close',
    previous: 'Previous',
    next: 'Next',
    details: 'Full details',
  },
  about: { downloadCv: 'Download CV (PDF)', portraitAlt: 'Portrait of' },
  contact: {
    name: 'Name',
    email: 'Email',
    message: 'Message',
    send: 'Send',
    sending: 'Sending…',
    sent: 'Thank you! Your message has been sent.',
    error: 'Something went wrong. Please try again shortly.',
    rateLimited: 'Too many messages. Please try again later.',
    invalid: 'Please check the highlighted fields.',
    nameRequired: 'Please enter your name.',
    emailInvalid: 'Please enter a valid email address.',
    messageRequired: 'Please write a message (at least 10 characters).',
    privacyNote: 'By sending this message you accept the ',
    privacyLink: 'privacy policy',
    writeTo: 'Write to',
  },
  footer: { rights: 'All rights reserved', privacy: 'Privacy' },
  privacy: {
    title: 'Privacy policy',
    description: 'How personal data is handled on this website.',
    fallback:
      'This website does not use profiling cookies. Data sent through the contact form is used only to reply to your message.',
  },
  notFound: {
    title: 'Page not found',
    text: 'The page you are looking for does not exist or has been moved.',
    home: 'Back to home',
  },
  error: {
    title: 'Something went wrong',
    text: 'An unexpected error occurred. Please try again in a moment.',
    retry: 'Try again',
  },
  preview: { banner: 'Preview: drafts are visible.', exit: 'Exit preview' },
}

const dictionaries: Record<Locale, Dictionary> = { it, en }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}

/** Localized path segment for artwork pages (kept identical in both languages). */
export const artworkSegment = 'opere'
